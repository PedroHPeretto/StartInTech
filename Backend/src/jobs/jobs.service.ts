import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import {
  JobSortBy,
  type GetJobsQueryDto,
  type JobListingDto,
  type PaginatedJobsResponseDto,
} from '@startintech/shared';
import * as Sentry from '@sentry/nestjs';
import { ProfilesService } from '../profiles/profiles.service.js';
import { ResumesService } from '../resumes/resumes.service.js';
import { AdzunaJobAdapter } from './adzuna-job.adapter.js';
import { JobMatchingService } from './job-matching.service.js';
import {
  JOBS_REPOSITORY,
  type JobListingRecord,
  type JobsRepository,
  type ListJobsFilterParams,
} from './jobs.repository.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

interface EnrichedJobListing extends JobListingDto {
  sortCreatedAt: Date;
}

@Injectable()
export class JobsService {
  constructor(
    private readonly profiles: ProfilesService,
    private readonly resumes: ResumesService,
    private readonly matching: JobMatchingService,
    private readonly adzuna: AdzunaJobAdapter,
    @Inject(JOBS_REPOSITORY)
    private readonly jobs: JobsRepository,
  ) {}

  async listJobs(
    userId: string,
    query: GetJobsQueryDto,
  ): Promise<PaginatedJobsResponseDto> {
    const profile = await this.profiles.getByUserId(userId);
    const page = query.page ?? DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const filter: ListJobsFilterParams = {
      careerTrackId: profile.careerTrack.id,
      workplaceType: query.workplaceType,
      search: query.search,
    };

    let listings = await this.jobs.findAllForListing(filter);
    const requiredRows = page * limit;
    const isFullyCovered = listings.length >= requiredRows;

    if (!isFullyCovered) {
      try {
        const adzunaListings = await this.adzuna.searchJobs({
          careerTrackName: profile.careerTrack.name,
          careerTrackSlug: profile.careerTrack.slug,
          page: 1,
        });
        await this.jobs.upsertMany(profile.careerTrack.id, adzunaListings);
        listings = await this.jobs.findAllForListing(filter);
      } catch (error) {
        Sentry.captureException(error);
        const cachedCount = await this.jobs.countActiveByCareerTrack(
          profile.careerTrack.id,
        );
        if (cachedCount === 0) {
          throw new BadGatewayException('Jobs provider unavailable');
        }
      }
    }

    const { hasResumeAnalyzed, presentSkillIds } =
      await this.resumes.findLatestPresentSkills(userId);
    const presentSkillIdSet = new Set(presentSkillIds);

    let enriched = listings.map((listing) =>
      this.enrichListing(listing, hasResumeAnalyzed, presentSkillIdSet),
    );

    if (query.onlyHighCompatibility) {
      enriched = enriched.filter(
        (listing) => listing.match?.isHighCompatibility === true,
      );
    }

    enriched = this.sortListings(enriched, query.sortBy);
    const total = enriched.length;
    const start = (page - 1) * limit;
    const pageItems = enriched
      .slice(start, start + limit)
      .map(({ sortCreatedAt: _sortCreatedAt, ...listing }) => listing);

    return this.toPaginatedResponse(pageItems, total, page, limit);
  }

  private enrichListing(
    listing: JobListingRecord,
    hasResumeAnalyzed: boolean,
    presentSkillIds: ReadonlySet<string>,
  ): EnrichedJobListing {
    const requirements = listing.requirements.map((requirement) => ({
      id: requirement.id,
      name: requirement.name,
      isMandatory: requirement.isMandatory,
    }));

    return {
      id: listing.id,
      title: listing.title,
      company: listing.company,
      location: listing.location,
      workplaceType: listing.workplaceType,
      description: listing.description,
      applicationUrl: listing.applicationUrl,
      careerTrack: listing.careerTrack,
      requirements,
      match: hasResumeAnalyzed
        ? this.matching.calculateMatch(listing.requirements, presentSkillIds)
        : null,
      sortCreatedAt: listing.createdAt,
    };
  }

  private sortListings(
    listings: EnrichedJobListing[],
    sortBy?: JobSortBy,
  ): EnrichedJobListing[] {
    const sorted = [...listings];

    if (sortBy === JobSortBy.NEWEST) {
      sorted.sort((left, right) => {
        const byDate =
          right.sortCreatedAt.getTime() - left.sortCreatedAt.getTime();
        if (byDate !== 0) {
          return byDate;
        }
        return left.title.localeCompare(right.title, 'pt-BR');
      });
      return sorted;
    }

    if (sortBy === JobSortBy.MATCH_SCORE) {
      sorted.sort((left, right) => {
        const leftScore = left.match?.score ?? -1;
        const rightScore = right.match?.score ?? -1;
        if (rightScore !== leftScore) {
          return rightScore - leftScore;
        }
        return left.title.localeCompare(right.title, 'pt-BR');
      });
      return sorted;
    }

    sorted.sort((left, right) =>
      left.title.localeCompare(right.title, 'pt-BR'),
    );
    return sorted;
  }

  private toPaginatedResponse(
    items: JobListingDto[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedJobsResponseDto {
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: totalPages > 0 && page < totalPages,
      },
    };
  }
}

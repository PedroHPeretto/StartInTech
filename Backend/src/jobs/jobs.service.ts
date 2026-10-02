import {
  BadGatewayException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type {
  GetJobsQueryDto,
  PaginatedJobsResponseDto,
} from '@startintech/shared';
import * as Sentry from '@sentry/nestjs';
import { ProfilesService } from '../profiles/profiles.service.js';
import { AdzunaJobAdapter } from './adzuna-job.adapter.js';
import {
  JOBS_REPOSITORY,
  type JobsRepository,
  type ListJobsParams,
} from './jobs.repository.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@Injectable()
export class JobsService {
  constructor(
    private readonly profiles: ProfilesService,
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
    const params: ListJobsParams = {
      careerTrackId: profile.careerTrack.id,
      workplaceType: query.workplaceType,
      search: query.search,
      page,
      limit,
    };

    let result = await this.jobs.findPaginated(params);
    const requiredRows = page * limit;
    const isFullyCovered = result.total >= requiredRows;

    if (!isFullyCovered) {
      try {
        const listings = await this.adzuna.searchJobs({
          careerTrackName: profile.careerTrack.name,
          careerTrackSlug: profile.careerTrack.slug,
          page: 1,
        });
        await this.jobs.upsertMany(profile.careerTrack.id, listings);
        result = await this.jobs.findPaginated(params);
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

    return this.toPaginatedResponse(result.items, result.total, page, limit);
  }

  private toPaginatedResponse(
    items: PaginatedJobsResponseDto['items'],
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

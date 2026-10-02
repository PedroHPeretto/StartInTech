import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOpportunity } from './job-opportunity.entity.js';
import type {
  JobListingRecord,
  JobsRepository,
  ListJobsParams,
  ListJobsResult,
} from './jobs.repository.js';
import type { AdzunaJobListingInput } from './adzuna-job.adapter.js';

@Injectable()
export class TypeOrmJobsRepository implements JobsRepository {
  constructor(
    @InjectRepository(JobOpportunity)
    private readonly jobs: Repository<JobOpportunity>,
  ) {}

  async countActiveByCareerTrack(careerTrackId: string): Promise<number> {
    return this.jobs.count({
      where: {
        careerTrack: { id: careerTrackId },
        isActive: true,
      },
    });
  }

  async findPaginated(params: ListJobsParams): Promise<ListJobsResult> {
    const qb = this.jobs
      .createQueryBuilder('job')
      .innerJoinAndSelect('job.careerTrack', 'careerTrack')
      .where('job.is_active = true')
      .andWhere('careerTrack.id = :careerTrackId', {
        careerTrackId: params.careerTrackId,
      });

    if (params.workplaceType) {
      qb.andWhere('job.workplace_type = :workplaceType', {
        workplaceType: params.workplaceType,
      });
    }

    if (params.search?.trim()) {
      qb.andWhere('(job.title ILIKE :search OR job.company ILIKE :search)', {
        search: `%${params.search.trim()}%`,
      });
    }

    const total = await qb.getCount();

    const rows = await qb
      .orderBy('job.title', 'ASC')
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getMany();

    return {
      total,
      items: rows.map((row) => this.toRecord(row)),
    };
  }

  async upsertMany(
    careerTrackId: string,
    listings: AdzunaJobListingInput[],
  ): Promise<void> {
    if (listings.length === 0) {
      return;
    }

    await this.jobs.manager.transaction(async (manager) => {
      for (const listing of listings) {
        await manager.query(
          `
            INSERT INTO "job_opportunities" (
              "title",
              "company",
              "location",
              "workplace_type",
              "career_track_id",
              "description",
              "application_url",
              "is_active"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            ON CONFLICT ("application_url") DO UPDATE SET
              "title" = EXCLUDED."title",
              "company" = EXCLUDED."company",
              "location" = EXCLUDED."location",
              "workplace_type" = EXCLUDED."workplace_type",
              "description" = EXCLUDED."description",
              "is_active" = true
          `,
          [
            listing.title,
            listing.company,
            listing.location,
            listing.workplaceType,
            careerTrackId,
            listing.description,
            listing.applicationUrl,
          ],
        );
      }
    });
  }

  private toRecord(job: JobOpportunity): JobListingRecord {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      workplaceType: job.workplaceType,
      description: job.description,
      applicationUrl: job.applicationUrl,
      careerTrack: {
        id: job.careerTrack.id,
        name: job.careerTrack.name,
      },
    };
  }
}

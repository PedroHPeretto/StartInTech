import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOpportunity } from './job-opportunity.entity.js';
import type {
  JobListingRecord,
  JobsRepository,
  ListJobsFilterParams,
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

  async findAllForListing(
    params: ListJobsFilterParams,
  ): Promise<JobListingRecord[]> {
    const qb = this.jobs
      .createQueryBuilder('job')
      .innerJoinAndSelect('job.careerTrack', 'careerTrack')
      .leftJoinAndSelect('job.jobSkills', 'jobSkill')
      .leftJoinAndSelect('jobSkill.skill', 'skill')
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

    const rows = await qb.orderBy('job.title', 'ASC').getMany();

    return rows.map((row) => this.toRecord(row));
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
              "is_active",
              "created_at"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, true, now())
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
    const requirements = (job.jobSkills ?? [])
      .map((jobSkill) => ({
        id: jobSkill.skill.id,
        name: jobSkill.skill.name,
        isMandatory: jobSkill.isMandatory,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      workplaceType: job.workplaceType,
      description: job.description,
      applicationUrl: job.applicationUrl,
      createdAt: job.createdAt,
      careerTrack: {
        id: job.careerTrack.id,
        name: job.careerTrack.name,
      },
      requirements,
    };
  }
}

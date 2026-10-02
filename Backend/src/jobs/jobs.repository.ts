import type { WorkplaceType } from '@startintech/shared';
import type { AdzunaJobListingInput } from './adzuna-job.adapter.js';

export interface JobSkillRequirement {
  id: string;
  name: string;
  isMandatory: boolean;
}

export interface JobListingRecord {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: WorkplaceType;
  description: string;
  applicationUrl: string;
  createdAt: Date;
  careerTrack: {
    id: string;
    name: string;
  };
  requirements: JobSkillRequirement[];
}

export interface ListJobsFilterParams {
  careerTrackId: string;
  workplaceType?: WorkplaceType;
  search?: string;
}

export interface JobsRepository {
  countActiveByCareerTrack(careerTrackId: string): Promise<number>;
  findAllForListing(params: ListJobsFilterParams): Promise<JobListingRecord[]>;
  upsertMany(
    careerTrackId: string,
    listings: AdzunaJobListingInput[],
  ): Promise<void>;
}

export const JOBS_REPOSITORY = Symbol('JOBS_REPOSITORY');

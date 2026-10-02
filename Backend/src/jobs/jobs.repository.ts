import type { WorkplaceType } from '@startintech/shared';
import type { AdzunaJobListingInput } from './adzuna-job.adapter.js';

export interface JobListingRecord {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: WorkplaceType;
  description: string;
  applicationUrl: string;
  careerTrack: {
    id: string;
    name: string;
  };
}

export interface ListJobsParams {
  careerTrackId: string;
  workplaceType?: WorkplaceType;
  search?: string;
  page: number;
  limit: number;
}

export interface ListJobsResult {
  items: JobListingRecord[];
  total: number;
}

export interface JobsRepository {
  countActiveByCareerTrack(careerTrackId: string): Promise<number>;
  findPaginated(params: ListJobsParams): Promise<ListJobsResult>;
  upsertMany(
    careerTrackId: string,
    listings: AdzunaJobListingInput[],
  ): Promise<void>;
}

export const JOBS_REPOSITORY = Symbol('JOBS_REPOSITORY');

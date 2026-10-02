import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { ProfileCompletionReaderPort } from './auth.ports.js';

const MISSING_RELATION_CODE = '42P01';

@Injectable()
export class ProfileCompletionReader implements ProfileCompletionReaderPort {
  constructor(private readonly dataSource: DataSource) {}

  async isProfileComplete(userId: string): Promise<boolean> {
    try {
      const rows: Array<{ career_track_id: string | null }> =
        await this.dataSource.query(
          `SELECT career_track_id FROM profiles WHERE user_id = $1 LIMIT 1`,
          [userId],
        );
      if (rows.length === 0) {
        return false;
      }
      return rows[0].career_track_id != null;
    } catch (error) {
      if (this.isMissingProfilesTable(error)) {
        return false;
      }
      throw error;
    }
  }

  private isMissingProfilesTable(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const code = (error as { code?: string }).code;
    return code === MISSING_RELATION_CODE;
  }
}

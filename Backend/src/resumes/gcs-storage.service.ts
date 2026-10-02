import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RESUME_MAX_FILE_SIZE_BYTES,
  RESUME_UPLOAD_URL_EXPIRES_IN_SECONDS,
  type ResumeUploadFileType,
} from '@startintech/shared';

export interface SignedUploadUrlParams {
  fileKey: string;
  contentType: ResumeUploadFileType;
  fileSizeBytes: number;
}

export interface SignedUploadUrlResult {
  uploadUrl: string;
  expiresInSeconds: number;
}

@Injectable()
export class GcsStorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly config: ConfigService) {
    this.storage = new Storage();
    const bucket =
      this.config.get<string>('GCS_PRIVATE_BUCKET')?.trim() ??
      process.env.GCS_PRIVATE_BUCKET?.trim() ??
      '';
    if (!bucket) {
      throw new Error('GCS_PRIVATE_BUCKET configuration is required');
    }
    this.bucketName = bucket;
  }

  async createSignedUploadUrl(
    params: SignedUploadUrlParams,
  ): Promise<SignedUploadUrlResult> {
    const file = this.storage.bucket(this.bucketName).file(params.fileKey);
    const expiresAt = Date.now() + RESUME_UPLOAD_URL_EXPIRES_IN_SECONDS * 1000;

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresAt,
      contentType: params.contentType,
      extensionHeaders: {
        'x-goog-content-length-range': `1,${RESUME_MAX_FILE_SIZE_BYTES}`,
      },
    });

    return {
      uploadUrl,
      expiresInSeconds: RESUME_UPLOAD_URL_EXPIRES_IN_SECONDS,
    };
  }

  async objectExists(fileKey: string): Promise<boolean> {
    const file = this.storage.bucket(this.bucketName).file(fileKey);
    const [exists] = await file.exists();
    return exists;
  }

  buildFileUrl(fileKey: string): string {
    return `gs://${this.bucketName}/${fileKey}`;
  }
}

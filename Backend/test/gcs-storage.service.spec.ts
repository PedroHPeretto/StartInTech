import {
  RESUME_MAX_FILE_SIZE_BYTES,
  RESUME_UPLOAD_URL_EXPIRES_IN_SECONDS,
} from '@startintech/shared';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GcsStorageService } from '../src/resumes/gcs-storage.service.js';

const getSignedUrl = vi.fn();
const exists = vi.fn();

vi.mock('@google-cloud/storage', () => {
  class MockStorage {
    bucket() {
      return {
        file: () => ({
          getSignedUrl,
          exists,
        }),
      };
    }
  }
  return { Storage: MockStorage };
});

describe('GcsStorageService', () => {
  beforeEach(() => {
    getSignedUrl.mockReset();
    exists.mockReset();
    process.env.GCS_PRIVATE_BUCKET = 'test-private-bucket';
  });

  it('signs a V4 PUT URL with content type and content-length range', async () => {
    getSignedUrl.mockResolvedValue(['https://signed.example/upload']);
    const service = new GcsStorageService(
      new ConfigService({ GCS_PRIVATE_BUCKET: 'test-private-bucket' }),
    );

    const result = await service.createSignedUploadUrl({
      fileKey: 'resumes/user/file.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: 1024,
    });

    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        version: 'v4',
        action: 'write',
        contentType: 'application/pdf',
        extensionHeaders: {
          'x-goog-content-length-range': `1,${RESUME_MAX_FILE_SIZE_BYTES}`,
        },
      }),
    );
    const call = getSignedUrl.mock.calls[0]?.[0] as { expires: number };
    const expirySeconds = Math.round((call.expires - Date.now()) / 1000);
    expect(expirySeconds).toBeGreaterThanOrEqual(
      RESUME_UPLOAD_URL_EXPIRES_IN_SECONDS - 2,
    );
    expect(expirySeconds).toBeLessThanOrEqual(
      RESUME_UPLOAD_URL_EXPIRES_IN_SECONDS + 2,
    );
    expect(result).toEqual({
      uploadUrl: 'https://signed.example/upload',
      expiresInSeconds: RESUME_UPLOAD_URL_EXPIRES_IN_SECONDS,
    });
  });

  it('throws an error when GCS_PRIVATE_BUCKET is not configured', () => {
    delete process.env.GCS_PRIVATE_BUCKET;
    expect(() => new GcsStorageService(new ConfigService({}))).toThrow(
      'GCS_PRIVATE_BUCKET configuration is required',
    );
  });

  it('throws an error when GCS_PRIVATE_BUCKET is empty or whitespace', () => {
    delete process.env.GCS_PRIVATE_BUCKET;
    expect(
      () =>
        new GcsStorageService(new ConfigService({ GCS_PRIVATE_BUCKET: '   ' })),
    ).toThrow('GCS_PRIVATE_BUCKET configuration is required');
  });
});

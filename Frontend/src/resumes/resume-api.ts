import type {
  GenerateUploadUrlDto,
  ResumeSubmissionResponseDto,
  SkillsExtractionResponseDto,
  SubmitResumeDto,
  UploadUrlResponseDto,
} from '@startintech/shared';
import {
  RESUME_MAX_FILE_SIZE_BYTES,
  ResumeSubmissionMode,
} from '@startintech/shared';
import { apiClient } from '@/lib/api-client';

export async function requestResumeUploadUrl(
  body: GenerateUploadUrlDto,
): Promise<UploadUrlResponseDto> {
  const { data } = await apiClient.post<UploadUrlResponseDto>(
    '/api/v1/resumes/upload-url',
    body,
  );
  return data;
}

export async function submitResume(
  body: SubmitResumeDto,
): Promise<ResumeSubmissionResponseDto> {
  const { data } = await apiClient.post<ResumeSubmissionResponseDto>(
    '/api/v1/resumes/submit',
    body,
  );
  return data;
}

export async function extractResumeSkills(
  resumeId: string,
): Promise<SkillsExtractionResponseDto> {
  const { data } = await apiClient.post<SkillsExtractionResponseDto>(
    `/api/v1/resumes/${resumeId}/extract-skills`,
    {},
  );
  return data;
}

function resolveFileType(file: File): GenerateUploadUrlDto['fileType'] {
  if (file.type === 'application/pdf') {
    return 'application/pdf';
  }
  return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

export async function uploadFileToGcs(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', resolveFileType(file));
    xhr.setRequestHeader(
      'x-goog-content-length-range',
      `1,${RESUME_MAX_FILE_SIZE_BYTES}`,
    );

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error(`GCS upload failed with status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error('GCS upload failed'));
    xhr.send(file);
  });
}

export async function submitResumeFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<ResumeSubmissionResponseDto> {
  const uploadMeta = await requestResumeUploadUrl({
    fileName: file.name,
    fileType: resolveFileType(file),
    fileSizeBytes: file.size,
  });

  await uploadFileToGcs(uploadMeta.uploadUrl, file, onProgress);

  return submitResume({
    mode: ResumeSubmissionMode.FILE_UPLOAD,
    fileKey: uploadMeta.fileKey,
  });
}

export { ResumeSubmissionMode, RESUME_RAW_TEXT_MAX_LENGTH, RESUME_RAW_TEXT_MIN_LENGTH } from '@startintech/shared';

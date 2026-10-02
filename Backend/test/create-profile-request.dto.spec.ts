import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { SeniorityLevel } from '@startintech/shared';
import { describe, expect, it } from 'vitest';
import { CreateProfileRequestDto } from '../src/profiles/dto/create-profile-request.dto.js';

const pipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});

const validBody = {
  fullName: 'Ana Silva',
  careerTrackId: '11111111-1111-4111-8111-111111111111',
  seniorityLevel: SeniorityLevel.JUNIOR,
};

function parseBody(body: object): Promise<CreateProfileRequestDto> {
  return pipe.transform(body, {
    type: 'body',
    metatype: CreateProfileRequestDto,
    data: '',
  });
}

describe('CreateProfileRequestDto', () => {
  it('accepts a profile body and a null bio', async () => {
    await expect(parseBody(validBody)).resolves.toMatchObject(validBody);
    await expect(parseBody({ ...validBody, bio: null })).resolves.toMatchObject(
      {
        ...validBody,
        bio: null,
      },
    );
  });

  it('rejects userId and any other unknown property', async () => {
    await expect(
      parseBody({
        ...validBody,
        userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a short name, a non-uuid career, an unknown seniority, and a long bio', async () => {
    await expect(
      parseBody({ ...validBody, fullName: 'An' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      parseBody({ ...validBody, careerTrackId: 'software-development' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      parseBody({ ...validBody, seniorityLevel: 'SENIOR' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      parseBody({ ...validBody, bio: 'a'.repeat(501) }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

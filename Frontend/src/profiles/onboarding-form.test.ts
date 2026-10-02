import { SeniorityLevel } from '@startintech/shared';
import { describe, expect, it } from 'vitest';
import {
  buildCreateProfileDto,
  resolveProfileRequestFailure,
  validateOnboardingForm,
  type OnboardingFormValues,
} from '@/profiles/onboarding-form';

const validValues: OnboardingFormValues = {
  fullName: '  Ana Silva  ',
  careerTrackId: '11111111-1111-4111-8111-111111111111',
  seniorityLevel: SeniorityLevel.INTERNSHIP,
  bio: '  Estudante de computação  ',
};

describe('buildCreateProfileDto', () => {
  it('sends the trimmed profile without a user id', () => {
    const dto = buildCreateProfileDto(validValues);

    expect(dto).toEqual({
      fullName: 'Ana Silva',
      careerTrackId: '11111111-1111-4111-8111-111111111111',
      seniorityLevel: SeniorityLevel.INTERNSHIP,
      bio: 'Estudante de computação',
    });
    expect(dto).not.toHaveProperty('userId');
  });

  it('sends null when the bio is blank', () => {
    const dto = buildCreateProfileDto({ ...validValues, bio: '   ' });

    expect(dto?.bio).toBeNull();
  });

  it('does not build a payload when the name is too short', () => {
    expect(
      buildCreateProfileDto({ ...validValues, fullName: 'An' }),
    ).toBeNull();
  });
});

describe('validateOnboardingForm', () => {
  it('requires a career and a seniority choice', () => {
    expect(
      validateOnboardingForm({
        fullName: 'Ana Silva',
        careerTrackId: '',
        seniorityLevel: '',
        bio: '',
      }),
    ).toEqual({
      careerTrackId: 'Selecione uma carreira.',
      seniorityLevel: 'Selecione Estágio ou Júnior.',
    });
  });

  it('rejects a bio longer than 500 characters', () => {
    expect(
      validateOnboardingForm({
        ...validValues,
        bio: 'a'.repeat(501),
      }).bio,
    ).toBe('A biografia deve ter no máximo 500 caracteres.');
  });
});

describe('resolveProfileRequestFailure', () => {
  it.each([
    [
      400,
      'Os dados informados são inválidos. Revise o nome, a carreira e a senioridade.',
      false,
    ],
    [401, 'Sua sessão expirou. Entre novamente.', true],
    [404, 'A carreira selecionada não foi encontrada.', false],
    [409, 'Você já possui um perfil cadastrado.', false],
  ] as const)(
    'maps HTTP %s without clearing the session except for 401',
    (status, message, clearSession) => {
      expect(resolveProfileRequestFailure({ response: { status } })).toEqual({
        message,
        clearSession,
      });
    },
  );

  it('keeps the session when the request fails without a status', () => {
    expect(resolveProfileRequestFailure(new Error('offline'))).toEqual({
      message: 'Não foi possível salvar o perfil. Tente novamente.',
      clearSession: false,
    });
  });
});

import { SeniorityLevel, type CreateProfileDto } from '@startintech/shared';

export interface OnboardingFormValues {
  fullName: string;
  careerTrackId: string;
  seniorityLevel: SeniorityLevel | '';
  bio: string;
}

export interface OnboardingFieldErrors {
  fullName?: string;
  careerTrackId?: string;
  seniorityLevel?: string;
  bio?: string;
}

export interface ProfileRequestFailure {
  message: string;
  clearSession: boolean;
}

const FULL_NAME_REQUIRED = 'Informe seu nome completo.';
const FULL_NAME_TOO_SHORT = 'O nome completo deve ter pelo menos 3 caracteres.';
const FULL_NAME_TOO_LONG = 'O nome completo deve ter no máximo 120 caracteres.';
const CAREER_REQUIRED = 'Selecione uma carreira.';
const SENIORITY_REQUIRED = 'Selecione Estágio ou Júnior.';
const BIO_TOO_LONG = 'A biografia deve ter no máximo 500 caracteres.';

const INVALID_PROFILE =
  'Os dados informados são inválidos. Revise o nome, a carreira e a senioridade.';
const SESSION_EXPIRED = 'Sua sessão expirou. Entre novamente.';
const CAREER_NOT_FOUND = 'A carreira selecionada não foi encontrada.';
const PROFILE_CONFLICT = 'Você já possui um perfil cadastrado.';
const PROFILE_SAVE_FAILED =
  'Não foi possível salvar o perfil. Tente novamente.';

function isSeniorityLevel(value: string): value is SeniorityLevel {
  return value === SeniorityLevel.INTERNSHIP || value === SeniorityLevel.JUNIOR;
}

export function validateOnboardingForm(
  values: OnboardingFormValues,
): OnboardingFieldErrors {
  const errors: OnboardingFieldErrors = {};
  const fullName = values.fullName.trim();

  if (!fullName) {
    errors.fullName = FULL_NAME_REQUIRED;
  } else if (fullName.length < 3) {
    errors.fullName = FULL_NAME_TOO_SHORT;
  } else if (fullName.length > 120) {
    errors.fullName = FULL_NAME_TOO_LONG;
  }

  if (!values.careerTrackId) {
    errors.careerTrackId = CAREER_REQUIRED;
  }

  if (!isSeniorityLevel(values.seniorityLevel)) {
    errors.seniorityLevel = SENIORITY_REQUIRED;
  }

  if (values.bio.length > 500) {
    errors.bio = BIO_TOO_LONG;
  }

  return errors;
}

export function hasOnboardingErrors(errors: OnboardingFieldErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}

export function buildCreateProfileDto(
  values: OnboardingFormValues,
): CreateProfileDto | null {
  if (hasOnboardingErrors(validateOnboardingForm(values))) {
    return null;
  }

  if (!isSeniorityLevel(values.seniorityLevel)) {
    return null;
  }

  const bio = values.bio.trim();

  return {
    fullName: values.fullName.trim(),
    careerTrackId: values.careerTrackId,
    seniorityLevel: values.seniorityLevel,
    bio: bio.length > 0 ? bio : null,
  };
}

function readHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined;
  }

  const response = error.response;
  if (
    typeof response !== 'object' ||
    response === null ||
    !('status' in response)
  ) {
    return undefined;
  }

  return typeof response.status === 'number' ? response.status : undefined;
}

export function resolveProfileRequestFailure(
  error: unknown,
): ProfileRequestFailure {
  switch (readHttpStatus(error)) {
    case 400:
      return { message: INVALID_PROFILE, clearSession: false };
    case 401:
      return { message: SESSION_EXPIRED, clearSession: true };
    case 404:
      return { message: CAREER_NOT_FOUND, clearSession: false };
    case 409:
      return { message: PROFILE_CONFLICT, clearSession: false };
    default:
      return { message: PROFILE_SAVE_FAILED, clearSession: false };
  }
}

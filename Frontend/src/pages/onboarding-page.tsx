import {
  SeniorityLevel,
  type CareerTrackResponseDto,
} from '@startintech/shared';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { useAuth } from '@/auth/use-auth';
import { BrandHeader } from '@/components/brand/brand-header';
import { CareerCard } from '@/components/cards/career-card';
import { Button } from '@/components/ui/button';
import { CareerTrackIcon } from '@/profiles/career-track-icon';
import {
  buildCreateProfileDto,
  hasOnboardingErrors,
  resolveProfileRequestFailure,
  validateOnboardingForm,
  type OnboardingFieldErrors,
} from '@/profiles/onboarding-form';
import { createProfile, listCareerTracks } from '@/profiles/profile-api';

const SENIORITY_OPTIONS = [
  { value: SeniorityLevel.INTERNSHIP, label: 'Estágio' },
  { value: SeniorityLevel.JUNIOR, label: 'Júnior' },
] as const;

const fieldClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-sans text-sm text-brand-midnight shadow-2xs outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { completeProfile, clearSession } = useAuth();
  const submitLock = useRef(false);
  const [tracks, setTracks] = useState<CareerTrackResponseDto[]>([]);
  const [tracksStatus, setTracksStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [tracksRequestId, setTracksRequestId] = useState(0);
  const [fullName, setFullName] = useState('');
  const [careerTrackId, setCareerTrackId] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState<SeniorityLevel | ''>('');
  const [bio, setBio] = useState('');
  const [fieldErrors, setFieldErrors] = useState<OnboardingFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    listCareerTracks(controller.signal)
      .then((careerTracks) => {
        if (controller.signal.aborted) {
          return;
        }
        setTracks(careerTracks);
        setTracksStatus('ready');
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setTracksStatus('error');
      });

    return () => controller.abort();
  }, [tracksRequestId]);

  const retryTracks = () => {
    setTracksStatus('loading');
    setTracksRequestId((current) => current + 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLock.current) {
      return;
    }

    const values = { fullName, careerTrackId, seniorityLevel, bio };
    const errors = validateOnboardingForm(values);
    setFieldErrors(errors);
    setSubmitError(null);

    const payload = buildCreateProfileDto(values);
    if (!payload || hasOnboardingErrors(errors)) {
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);

    try {
      const profile = await createProfile(payload);
      flushSync(() => {
        completeProfile(profile);
      });
      await navigate({ to: '/dashboard' });
    } catch (error) {
      const failure = resolveProfileRequestFailure(error);
      setSubmitError(failure.message);
      if (failure.clearSession) {
        clearSession();
      }
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const tracksReady = tracksStatus === 'ready' && tracks.length > 0;

  return (
    <main className="min-h-screen bg-brand-light-gray px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex justify-center">
          <BrandHeader href={undefined} showTagline />
        </div>

        <h1 className="text-center font-heading text-2xl font-bold text-brand-midnight">
          Onboarding
        </h1>
        <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
          Conte seu nome, sua senioridade e a carreira que você quer seguir.
        </p>

        <form className="mt-8 space-y-6" noValidate onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block font-sans text-sm font-semibold text-brand-midnight"
            >
              Nome completo
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              maxLength={120}
              value={fullName}
              disabled={isSubmitting}
              aria-invalid={fieldErrors.fullName ? true : undefined}
              aria-describedby={
                fieldErrors.fullName ? 'fullName-error' : undefined
              }
              onChange={(event) => {
                setFullName(event.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  fullName: undefined,
                }));
              }}
              className={fieldClassName}
            />
            <FieldError id="fullName-error" message={fieldErrors.fullName} />
          </div>

          <fieldset disabled={isSubmitting}>
            <legend className="mb-1.5 font-sans text-sm font-semibold text-brand-midnight">
              Senioridade
            </legend>
            <div
              className="grid grid-cols-2 gap-3"
              role="radiogroup"
              aria-label="Senioridade"
            >
              {SENIORITY_OPTIONS.map((option) => {
                const selected = seniorityLevel === option.value;
                return (
                  <label
                    key={option.value}
                    className={
                      selected
                        ? 'flex cursor-pointer items-center gap-3 rounded-xl border-2 border-brand-blue bg-sky-50 px-4 py-3 font-sans text-sm font-semibold text-brand-blue'
                        : 'flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-sans text-sm font-semibold text-brand-midnight hover:border-slate-300'
                    }
                  >
                    <input
                      type="radio"
                      name="seniorityLevel"
                      value={option.value}
                      checked={selected}
                      onChange={() => {
                        setSeniorityLevel(option.value);
                        setFieldErrors((current) => ({
                          ...current,
                          seniorityLevel: undefined,
                        }));
                      }}
                      className="size-4 accent-brand-blue"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
            <FieldError
              id="seniority-error"
              message={fieldErrors.seniorityLevel}
            />
          </fieldset>

          <div>
            <label
              htmlFor="bio"
              className="mb-1.5 block font-sans text-sm font-semibold text-brand-midnight"
            >
              Bio (opcional)
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={500}
              value={bio}
              disabled={isSubmitting}
              aria-invalid={fieldErrors.bio ? true : undefined}
              aria-describedby="bio-hint"
              onChange={(event) => {
                setBio(event.target.value);
                setFieldErrors((current) => ({ ...current, bio: undefined }));
              }}
              className={fieldClassName}
            />
            <p
              id="bio-hint"
              className="mt-1.5 font-sans text-xs text-muted-foreground"
            >
              {bio.length}/500
              {fieldErrors.bio ? `. ${fieldErrors.bio}` : ''}
            </p>
          </div>

          <div>
            <p
              id="career-label"
              className="mb-1.5 font-sans text-sm font-semibold text-brand-midnight"
            >
              Carreira
            </p>
            {tracksStatus === 'loading' ? (
              <p
                className="font-sans text-sm text-muted-foreground"
                role="status"
              >
                Carregando carreiras…
              </p>
            ) : null}
            {tracksStatus === 'error' ? (
              <div className="space-y-3">
                <p className="font-sans text-sm text-destructive" role="alert">
                  Não foi possível carregar as carreiras. Tente novamente.
                </p>
                <Button type="button" variant="outline" onClick={retryTracks}>
                  Tentar novamente
                </Button>
              </div>
            ) : null}
            {tracksStatus === 'ready' && tracks.length === 0 ? (
              <p className="font-sans text-sm text-muted-foreground">
                Nenhuma carreira disponível.
              </p>
            ) : null}
            {tracksReady ? (
              <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                role="group"
                aria-labelledby="career-label"
              >
                {tracks.map((track) => (
                  <CareerCard
                    key={track.id}
                    id={track.id}
                    title={track.name}
                    description={track.description}
                    icon={<CareerTrackIcon slug={track.slug} />}
                    isSelected={careerTrackId === track.id}
                    onSelect={(id) => {
                      if (isSubmitting) {
                        return;
                      }
                      setCareerTrackId(id);
                      setFieldErrors((current) => ({
                        ...current,
                        careerTrackId: undefined,
                      }));
                    }}
                  />
                ))}
              </div>
            ) : null}
            <FieldError id="career-error" message={fieldErrors.careerTrackId} />
          </div>

          {submitError ? (
            <p
              className="text-center font-sans text-sm text-destructive"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            data-testid="onboarding-submit"
            disabled={isSubmitting || !tracksReady}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Salvando…' : 'Concluir onboarding'}
          </Button>
        </form>
      </div>
    </main>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className="mt-1.5 font-sans text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}

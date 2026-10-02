import {
  RESUME_RAW_TEXT_MAX_LENGTH,
  RESUME_RAW_TEXT_MIN_LENGTH,
  ResumeSubmissionMode,
} from '@startintech/shared';
import { FileText, UploadCloud } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useMemo, useRef, useState } from 'react';
import { BrandHeader } from '@/components/brand/brand-header';
import { AlertBanner } from '@/components/feedback/alert-banner';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { UploadDropzone } from '@/components/upload/upload-dropzone';
import { submitResume, submitResumeFile } from '@/resumes/resume-api';

const fieldClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-sans text-sm text-brand-midnight shadow-2xs outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60';

type UploadTab = 'file' | 'text';

export function CurriculumUploadPage() {
  const [activeTab, setActiveTab] = useState<UploadTab>('file');
  const [rawText, setRawText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [gcsRetryFile, setGcsRetryFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [received, setReceived] = useState(false);
  const [submittedResumeId, setSubmittedResumeId] = useState<string | null>(
    null,
  );
  const submitLock = useRef(false);

  const trimmedLength = rawText.trim().length;
  const canSubmitText =
    trimmedLength >= RESUME_RAW_TEXT_MIN_LENGTH &&
    trimmedLength <= RESUME_RAW_TEXT_MAX_LENGTH;

  const tabs = useMemo(
    () => [
      {
        id: 'file',
        label: 'Enviar arquivo',
        icon: <UploadCloud size={16} />,
      },
      {
        id: 'text',
        label: 'Colar texto',
        icon: <FileText size={16} />,
      },
    ],
    [],
  );

  const handleFileSelected = async (file: File) => {
    setReceived(false);
    setSubmittedResumeId(null);
    setSubmitError(null);
    setGcsRetryFile(null);
    await uploadSelectedFile(file);
  };

  const uploadSelectedFile = async (file: File) => {
    if (submitLock.current) {
      return;
    }
    submitLock.current = true;
    setIsUploading(true);
    setUploadProgress(0);
    setSubmitError(null);
    setGcsRetryFile(null);

    try {
      const submission = await submitResumeFile(file, setUploadProgress);
      setSubmittedResumeId(submission.id);
      setReceived(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o currículo.';
      if (message.includes('403') || message.toLowerCase().includes('gcs')) {
        setGcsRetryFile(file);
        setSubmitError(
          'O link de upload expirou ou foi recusado. Solicite um novo envio.',
        );
      } else {
        setSubmitError('Não foi possível enviar o currículo. Tente novamente.');
      }
    } finally {
      submitLock.current = false;
      setIsUploading(false);
    }
  };

  const retryGcsUpload = () => {
    if (gcsRetryFile) {
      void uploadSelectedFile(gcsRetryFile);
    }
  };

  const handleTextSubmit = async () => {
    if (!canSubmitText || submitLock.current) {
      return;
    }
    submitLock.current = true;
    setIsSubmittingText(true);
    setSubmitError(null);
    setReceived(false);
    setSubmittedResumeId(null);

    try {
      const submission = await submitResume({
        mode: ResumeSubmissionMode.RAW_TEXT,
        rawText: rawText.trim(),
      });
      setSubmittedResumeId(submission.id);
      setReceived(true);
    } catch {
      setSubmitError('Não foi possível enviar o texto. Tente novamente.');
    } finally {
      submitLock.current = false;
      setIsSubmittingText(false);
    }
  };

  return (
    <main className="flex-1 bg-brand-light-gray px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex justify-center">
          <BrandHeader href={undefined} showTagline />
        </div>

        <h1 className="text-center font-heading text-2xl font-bold text-brand-midnight">
          Enviar currículo
        </h1>
        <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
          Faça upload do seu PDF ou DOCX, ou cole o texto do currículo para
          iniciarmos a análise.
        </p>

        {received ? (
          <section
            className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center"
            data-testid="resume-received"
          >
            <h2 className="font-heading text-lg font-bold text-brand-midnight">
              Currículo recebido
            </h2>
            <p className="mt-2 font-sans text-sm text-slate-600">
              Seu currículo foi recebido. Continue para extrair competências e
              identificar gaps da sua trilha.
            </p>
            {submittedResumeId ? (
              <Link
                to="/curriculum/analysis/$id"
                params={{ id: submittedResumeId }}
                className="mt-6 inline-flex"
                data-testid="curriculum-analysis-link"
              >
                <span className="inline-flex h-9 items-center justify-center rounded-4xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80">
                  Ir para análise de competências
                </span>
              </Link>
            ) : null}
          </section>
        ) : (
          <div className="mt-8 space-y-6">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as UploadTab)}
            />

            {activeTab === 'file' ? (
              <div className="space-y-4">
                <UploadDropzone
                  onFileSelect={(file) => {
                    void handleFileSelected(file);
                  }}
                  isLoading={isUploading}
                  error={submitError ?? undefined}
                />

                {isUploading ? (
                  <div className="space-y-2">
                    <div className="flex justify-between font-sans text-xs text-muted-foreground">
                      <span>Enviando arquivo…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                      role="progressbar"
                      aria-valuenow={uploadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-brand-blue transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                {gcsRetryFile ? (
                  <AlertBanner
                    variant="warning"
                    message={submitError ?? 'Falha no upload para o storage.'}
                    actionLabel="Tentar novamente"
                    onAction={retryGcsUpload}
                  />
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <label
                  htmlFor="resume-raw-text"
                  className="block font-sans text-sm font-semibold text-brand-midnight"
                >
                  Texto do currículo
                </label>
                <textarea
                  id="resume-raw-text"
                  rows={12}
                  value={rawText}
                  disabled={isSubmittingText}
                  onChange={(event) => setRawText(event.target.value)}
                  className={fieldClassName}
                  data-testid="resume-raw-text"
                />
                <p
                  className="font-sans text-xs text-muted-foreground"
                  data-testid="resume-char-count"
                >
                  {trimmedLength}/{RESUME_RAW_TEXT_MAX_LENGTH} caracteres
                  (mínimo {RESUME_RAW_TEXT_MIN_LENGTH})
                </p>
                {submitError ? (
                  <p
                    className="font-sans text-sm text-destructive"
                    role="alert"
                  >
                    {submitError}
                  </p>
                ) : null}
                <Button
                  type="button"
                  className="w-full"
                  disabled={!canSubmitText || isSubmittingText}
                  onClick={() => void handleTextSubmit()}
                  data-testid="resume-text-submit"
                >
                  {isSubmittingText ? 'Enviando…' : 'Enviar texto'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

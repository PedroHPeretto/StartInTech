import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function UploadDropzone({
  onFileSelect,
  acceptedFormats = ['.pdf', '.docx'],
  maxSizeMB = 5,
  isLoading = false,
  error,
  className,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayError = error ?? localError;

  const validateAndSelect = (file: File) => {
    setLocalError(null);

    // Validate size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setLocalError(`O arquivo ultrapassa o limite de ${maxSizeMB}MB.`);
      return;
    }

    // Validate extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFormats.includes(extension)) {
      setLocalError(
        `Formato inválido. Aceitamos apenas ${acceptedFormats.join(', ')}.`,
      );
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndSelect(file);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        validateAndSelect(file);
      }
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 text-center transition-all select-none',
        isDragOver
          ? 'border-brand-blue bg-sky-50/70 scale-[1.005]'
          : 'border-slate-300 bg-white hover:border-brand-blue/50 hover:bg-slate-50/40',
        displayError && 'border-rose-300 bg-rose-50/30',
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="upload-dropzone"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleInputChange}
        className="hidden"
        data-testid="upload-dropzone-input"
      />

      {/* Selected file state */}
      {selectedFile ? (
        <div
          className="flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"
          data-testid="upload-dropzone-file-preview"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-brand-emerald">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-800 truncate max-w-[220px]">
                {selectedFile.name}
              </span>
              <span className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-black/5 hover:text-slate-700"
            aria-label="Remover arquivo"
            data-testid="upload-dropzone-remove-btn"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        /* Empty / Drop state */
        <>
          <div
            className={cn(
              'flex size-16 items-center justify-center rounded-2xl transition-transform',
              isDragOver
                ? 'scale-110 bg-sky-100 text-brand-blue'
                : 'bg-sky-50 text-brand-blue',
            )}
            data-testid="upload-dropzone-icon"
          >
            <UploadCloud size={32} />
          </div>

          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="font-heading text-base font-bold text-brand-midnight">
              Arraste e solte seu currículo aqui
            </h3>
            <p className="text-xs font-sans text-slate-500">
              Formatos aceitos:{' '}
              {acceptedFormats
                .map((f) => f.replace('.', '').toUpperCase())
                .join(', ')}{' '}
              até {maxSizeMB}MB
            </p>
          </div>

          <Button
            type="button"
            variant="default"
            size="default"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="font-semibold text-xs mt-2"
            data-testid="upload-dropzone-browse-btn"
          >
            <FileText size={16} />
            <span>Selecionar arquivo</span>
          </Button>
        </>
      )}

      {/* Error feedback */}
      {displayError && (
        <div
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-1"
          data-testid="upload-dropzone-error"
        >
          <AlertCircle size={14} />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

import { useCallback, useId, useRef } from 'react';
import { FormField } from './form_field';
import './form_file_picker.scss';

export interface FilePickerFile {
  name: string;
  size: number;
  type: string;
}

interface FormFilePickerProps {
  label: string;
  value: FilePickerFile[];
  onChange: (files: FilePickerFile[]) => void;
  allowMultiple?: boolean;
  accept?: string;
  description?: string;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKey(file: FilePickerFile): string {
  return `${file.name}:${file.size}:${file.type}`;
}

export function FormFilePicker({
  label,
  value,
  onChange,
  allowMultiple = false,
  accept,
  description,
  error,
}: FormFilePickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      const picked: FilePickerFile[] = Array.from(fileList).map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }));

      if (allowMultiple) {
        const existingKeys = new Set(value.map(fileKey));
        const deduped = picked.filter(f => !existingKeys.has(fileKey(f)));
        onChange([
          ...value,
          ...deduped,
        ]);
      } else {
        onChange(picked.slice(0, 1));
      }

      e.target.value = '';
    },
    [
      value,
      onChange,
      allowMultiple,
    ],
  );

  const removeFile = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [
      value,
      onChange,
    ],
  );

  const handleBrowseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      htmlFor={id}
    >
      <div className="form-file-picker">
        <input
          id={id}
          ref={inputRef}
          className="form-file-picker__native-input"
          type="file"
          multiple={allowMultiple}
          accept={accept}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          tabIndex={-1}
        />
        {value.length > 0 && (
          <div
            className="form-file-picker__files"
            role="list"
            aria-label="Selected files"
          >
            {value.map((file, i) => (
              <span
                key={fileKey(file)}
                className="form-file-picker__pill"
                role="listitem"
              >
                <svg
                  className="form-file-picker__pill-icon"
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4 1.5h5.586a1 1 0 0 1 .707.293l2.414 2.414a1 1 0 0 1 .293.707V13.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M9.5 1.5V4a.5.5 0 0 0 .5.5h2.5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="form-file-picker__pill-name">{file.name}</span>
                <span className="form-file-picker__pill-size">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  className="form-file-picker__pill-remove"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${file.name}`}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path
                      d="M1 1L7 7M7 1L1 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <button
          type="button"
          className="form-file-picker__browse"
          onClick={handleBrowseClick}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {value.length === 0
            ? 'Choose File'
            : allowMultiple
              ? 'Add More'
              : 'Replace File'}
        </button>
      </div>
    </FormField>
  );
}

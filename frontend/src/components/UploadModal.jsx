import {
  File,
  Info,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import api from "../api/client";

import "./UploadModal.css";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ACCEPTED_FILES = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".txt",
  ".csv",
  ".zip",
  ".docx",
  ".xlsx",
  ".pptx",
].join(",");

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

export default function UploadModal({
  open,
  onClose,
  onUploaded,
}) {
  const inputRef =
    useRef(null);

  const [
    file,
    setFile,
  ] = useState(null);

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    dragActive,
    setDragActive,
  ] = useState(false);

  if (!open) {
    return null;
  }

  function selectFile(
    selectedFile
  ) {
    if (!selectedFile) {
      return;
    }

    setError("");

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setFile(null);

      setError(
        "File is too large. Maximum file size is 10 MB."
      );

      return;
    }

    if (
      !ALLOWED_TYPES.includes(
        selectedFile.type
      )
    ) {
      setFile(null);

      setError(
        "Unsupported file format. Please choose JPG, PNG, WEBP, PDF, TXT, CSV, ZIP, DOCX, XLSX or PPTX."
      );

      return;
    }

    setFile(selectedFile);
  }

  function handleDrop(
    event
  ) {
    event.preventDefault();

    setDragActive(false);

    selectFile(
      event.dataTransfer
        .files?.[0]
    );
  }

  function clearSelectedFile() {
    if (loading) {
      return;
    }

    setFile(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  }

  function resetAndClose() {
    if (loading) {
      return;
    }

    setFile(null);
    setDescription("");
    setError("");
    setDragActive(false);

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }

    onClose();
  }

  async function handleUpload() {
    if (!file) {
      setError(
        "Choose a file before uploading."
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    if (description.trim()) {
      formData.append(
        "description",
        description.trim()
      );
    }

    try {
      setLoading(true);
      setError("");

      await api.post(
        "/api/files",
        formData
      );

      setFile(null);
      setDescription("");

      if (inputRef.current) {
        inputRef.current.value =
          "";
      }

      if (onUploaded) {
        await onUploaded();
      }

      onClose();
    } catch (requestError) {
      setError(
        requestError
          ?.response?.data
          ?.message ||
          "Unable to upload file."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="upload-modal-backdrop"
      onMouseDown={
        resetAndClose
      }
    >
      <section
        className="upload-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="upload-modal-header">
          <div className="upload-modal-heading-wrap">
            <div className="upload-modal-heading-icon">
              <UploadCloud
                size={20}
              />
            </div>

            <div>
              <span className="upload-modal-kicker">
                Azure Blob Storage
              </span>

              <h2
                id="upload-modal-title"
              >
                Upload file
              </h2>

              <p>
                Add a file to your
                secure AzureDrop
                workspace.
              </p>
            </div>
          </div>

          <button
            className="upload-modal-close"
            type="button"
            onClick={
              resetAndClose
            }
            disabled={loading}
            aria-label="Close upload window"
          >
            <X size={18} />
          </button>
        </header>

        <div className="upload-storage-note">
          <div className="upload-storage-note-icon">
            <ShieldCheck
              size={17}
            />
          </div>

          <div>
            <strong>
              Secure storage routing
            </strong>

            <p>
              AzureDrop stores this upload in your private Azure Blob Storage container.
            </p>
          </div>
        </div>

        <div
          className={`upload-dropzone ${
            dragActive
              ? "active"
              : ""
          } ${
            file
              ? "has-file"
              : ""
          }`}
          onDragEnter={(
            event
          ) => {
            event.preventDefault();

            if (!loading) {
              setDragActive(
                true
              );
            }
          }}
          onDragOver={(
            event
          ) => {
            event.preventDefault();

            if (!loading) {
              setDragActive(
                true
              );
            }
          }}
          onDragLeave={(
            event
          ) => {
            event.preventDefault();

            setDragActive(
              false
            );
          }}
          onDrop={(
            event
          ) => {
            if (!loading) {
              handleDrop(
                event
              );
            }
          }}
          onClick={() => {
            if (!loading) {
              inputRef.current?.click();
            }
          }}
        >
          <input
            ref={inputRef}
            hidden
            type="file"
            accept={
              ACCEPTED_FILES
            }
            disabled={loading}
            onChange={(
              event
            ) =>
              selectFile(
                event.target
                  .files?.[0]
              )
            }
          />

          <div className="upload-dropzone-icon">
            <UploadCloud
              size={27}
            />
          </div>

          <strong>
            Drop your file here
          </strong>

          <p>
            or click anywhere in this
            area to browse your device
          </p>

          <div className="upload-format-row">
            <span>
              JPG
            </span>

            <span>
              PNG
            </span>

            <span>
              WEBP
            </span>

            <span>
              PDF
            </span>

            <span>
              DOCX
            </span>

            <span>
              XLSX
            </span>

            <span>
              + more
            </span>
          </div>

          <small>
            Maximum file size:
            <strong>
              {" "}
              10 MB
            </strong>
          </small>
        </div>

        {file && (
          <div className="upload-selected-file">
            <div className="upload-selected-file-icon">
              <File
                size={19}
              />
            </div>

            <div className="upload-selected-file-copy">
              <span>
                Selected file
              </span>

              <strong
                title={
                  file.name
                }
              >
                {file.name}
              </strong>

              <small>
                {formatSize(
                  file.size
                )}

                {file.type
                  ? ` • ${file.type}`
                  : ""}
              </small>
            </div>

            <button
              type="button"
              onClick={(
                event
              ) => {
                event.stopPropagation();

                clearSelectedFile();
              }}
              disabled={loading}
              aria-label="Remove selected file"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <label className="upload-description">
          <div className="upload-description-heading">
            <span>
              Description
            </span>

            <small>
              Optional
            </small>
          </div>

          <textarea
            rows="3"
            maxLength={500}
            value={
              description
            }
            onChange={(
              event
            ) =>
              setDescription(
                event.target
                  .value
              )
            }
            placeholder="Add a short description for this file..."
            disabled={loading}
          />

          <div className="upload-description-footer">
            <span>
              Useful for identifying
              files later.
            </span>

            <span>
              {
                description.length
              }
              /500
            </span>
          </div>
        </label>

        {error && (
          <div
            className="upload-error-banner"
            role="alert"
          >
            <Info
              size={17}
            />

            <span>
              {error}
            </span>

            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() =>
                setError("")
              }
            >
              <X size={15} />
            </button>
          </div>
        )}

        <footer className="upload-modal-actions">
          <button
            type="button"
            className="upload-secondary-button"
            onClick={
              resetAndClose
            }
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="upload-primary-button"
            onClick={
              handleUpload
            }
            disabled={
              loading ||
              !file
            }
          >
            {loading ? (
              <>
                <Loader2
                  className="upload-spinner"
                  size={18}
                />

                Uploading…
              </>
            ) : (
              <>
                <UploadCloud
                  size={18}
                />

                Upload file
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}
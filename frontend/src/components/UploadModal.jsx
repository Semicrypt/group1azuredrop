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
    files,
    setFiles,
  ] = useState([]);

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState({
    current: 0,
    total: 0,
  });

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

  function validateFile(
    selectedFile
  ) {
    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      return `${selectedFile.name}: file is larger than 10 MB.`;
    }

    if (
      !ALLOWED_TYPES.includes(
        selectedFile.type
      )
    ) {
      return `${selectedFile.name}: unsupported file format.`;
    }

    return null;
  }

  function selectFiles(
    selectedFiles
  ) {
    const incoming =
      Array.from(
        selectedFiles || []
      );

    if (!incoming.length) {
      return;
    }

    const accepted = [];
    const rejected = [];

    incoming.forEach(
      (selectedFile) => {
        const validationError =
          validateFile(
            selectedFile
          );

        if (validationError) {
          rejected.push(
            validationError
          );
        } else {
          accepted.push(
            selectedFile
          );
        }
      }
    );

    setFiles(accepted);

    if (rejected.length) {
      setError(
        `${rejected.length} file${
          rejected.length === 1
            ? " was"
            : "s were"
        } skipped: ${rejected.join(
          " "
        )}`
      );
    } else {
      setError("");
    }

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  }

  function handleDrop(
    event
  ) {
    event.preventDefault();

    setDragActive(false);

    selectFiles(
      event.dataTransfer.files
    );
  }

  function removeSelectedFile(
    index
  ) {
    if (loading) {
      return;
    }

    setFiles(
      (currentFiles) =>
        currentFiles.filter(
          (_, fileIndex) =>
            fileIndex !== index
        )
    );

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

    setFiles([]);

    setUploadProgress({
      current: 0,
      total: 0,
    });

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
    if (!files.length) {
      setError(
        "Choose at least one file before uploading."
      );

      return;
    }

    const totalFiles =
      files.length;

    const failedUploads = [];

    let successfulUploads = 0;

    try {
      setLoading(true);
      setError("");

      setUploadProgress({
        current: 0,
        total: totalFiles,
      });

      for (
        let index = 0;
        index < totalFiles;
        index += 1
      ) {
        const currentFile =
          files[index];

        setUploadProgress({
          current: index + 1,
          total: totalFiles,
        });

        const formData =
          new FormData();

        formData.append(
          "file",
          currentFile
        );

        if (
          description.trim()
        ) {
          formData.append(
            "description",
            description.trim()
          );
        }

        try {
          await api.post(
            "/api/files",
            formData
          );

          successfulUploads += 1;
        } catch (
          requestError
        ) {
          failedUploads.push({
            file: currentFile,

            message:
              requestError
                ?.response
                ?.data
                ?.message ||
              "Upload failed.",
          });
        }
      }

      if (
        successfulUploads > 0 &&
        onUploaded
      ) {
        await onUploaded();
      }

      if (
        failedUploads.length === 0
      ) {
        setFiles([]);
        setDescription("");

        if (
          inputRef.current
        ) {
          inputRef.current.value =
            "";
        }

        onClose();

        return;
      }

      setFiles(
        failedUploads.map(
          (failure) =>
            failure.file
        )
      );

      const failedNames =
        failedUploads
          .map(
            (failure) =>
              `${failure.file.name}: ${failure.message}`
          )
          .join(" ");

      setError(
        `${successfulUploads} of ${totalFiles} file${
          totalFiles === 1
            ? ""
            : "s"
        } uploaded successfully. ` +
          `${failedUploads.length} failed. ${failedNames}`
      );
    } finally {
      setLoading(false);

      setUploadProgress({
        current: 0,
        total: 0,
      });
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
            files.length > 0
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
            multiple
            accept={
              ACCEPTED_FILES
            }
            disabled={loading}
            onChange={(
              event
            ) =>
              selectFiles(
                event.target.files
              )
            }
          />

          <div className="upload-dropzone-icon">
            <UploadCloud
              size={27}
            />
          </div>

          <strong>
            Drop your files here
          </strong>

          <p>
            or click anywhere in this
            area to select one or more
            files
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

        {files.length > 0 && (
          <>
            {files.map(
              (
                selectedFile,
                index
              ) => (
                <div
                  className="upload-selected-file"
                  key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}-${index}`}
                >
                  <div className="upload-selected-file-icon">
                    <File
                      size={19}
                    />
                  </div>

                  <div className="upload-selected-file-copy">
                    <span>
                      {files.length === 1
                        ? "Selected file"
                        : `Selected file ${
                            index + 1
                          } of ${
                            files.length
                          }`}
                    </span>

                    <strong
                      title={
                        selectedFile.name
                      }
                    >
                      {
                        selectedFile.name
                      }
                    </strong>

                    <small>
                      {formatSize(
                        selectedFile.size
                      )}

                      {selectedFile.type
                        ? ` • ${selectedFile.type}`
                        : ""}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      removeSelectedFile(
                        index
                      );
                    }}
                    disabled={loading}
                    aria-label={`Remove ${selectedFile.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              )
            )}
          </>
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
            placeholder={
              files.length > 1
                ? "Add a description for these files..."
                : "Add a short description for this file..."
            }
            disabled={loading}
          />

          <div className="upload-description-footer">
            <span>
              {files.length > 1
                ? "This description will be applied to all selected files."
                : "Useful for identifying files later."}
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
              files.length === 0
            }
          >
            {loading ? (
              <>
                <Loader2
                  className="upload-spinner"
                  size={18}
                />

                {uploadProgress.total > 1
                  ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}…`
                  : "Uploading…"}
              </>
            ) : (
              <>
                <UploadCloud
                  size={18}
                />

                {files.length > 1
                  ? `Upload ${files.length} files`
                  : "Upload file"}
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}
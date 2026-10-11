import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  CircleAlert,
  Cloud,
  Database,
  FileText,
  HardDrive,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

import "./AzureStorage.css";

function formatSize(bytes) {
  const value =
    Number(bytes || 0);

  if (value < 1024) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  if (
    value <
    1024 *
      1024 *
      1024
  ) {
    return `${(
      value /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    value /
    (1024 *
      1024 *
      1024)
  ).toFixed(1)} GB`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function AzureStorage() {
  const navigate =
    useNavigate();

  const [
    files,
    setFiles,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    healthStatus,
    setHealthStatus,
  ] = useState("checking");

  const loadHealth =
    useCallback(
      async () => {
        setHealthStatus(
          "checking"
        );

        try {
          const response =
            await api.get(
              "/health"
            );

          const data =
            response.data;

          const healthy =
            data?.success === true &&
            data?.status ===
              "healthy" &&
            data?.database ===
              "healthy" &&
            data?.storage ===
              "healthy";

          setHealthStatus(
            healthy
              ? "healthy"
              : "unhealthy"
          );
        } catch {
          setHealthStatus(
            "unhealthy"
          );
        }
      },
      []
    );

  const loadStorage =
    useCallback(
      async (
        manual = false
      ) => {
        if (manual) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }

        setError("");

        try {
          const [
            response,
          ] =
            await Promise.all([
              api.get(
                "/api/files"
              ),
              loadHealth(),
            ]);

          setFiles(
            response.data?.data
              ?.files || []
          );
        } catch (
          requestError
        ) {
          setError(
            requestError.response
              ?.data?.message ||
              "Unable to load AzureDrop storage information."
          );
        } finally {
          setLoading(false);
          setRefreshing(
            false
          );
        }
      },
      [loadHealth]
    );

  useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  const totalSize =
    useMemo(
      () =>
        files.reduce(
          (
            sum,
            file
          ) =>
            sum +
            Number(
              file.size_bytes ||
                0
            ),
          0
        ),
      [files]
    );

  const recentFiles =
    useMemo(
      () =>
        [...files]
          .sort(
            (
              a,
              b
            ) =>
              new Date(
                b.uploaded_at
              ).getTime() -
              new Date(
                a.uploaded_at
              ).getTime()
          )
          .slice(
            0,
            5
          ),
      [files]
    );

  const healthTopbarText =
    healthStatus ===
    "healthy"
      ? "Azure Blob ready"
      : healthStatus ===
          "checking"
        ? "Checking services"
        : "Storage unavailable";

  const healthDetailText =
    healthStatus ===
    "healthy"
      ? "Storage healthy"
      : healthStatus ===
          "checking"
        ? "Checking storage"
        : "Storage unavailable";

  const providerIconClass =
    healthStatus ===
    "healthy"
      ? "green"
      : healthStatus ===
          "checking"
        ? "cream"
        : "copper";

  if (loading) {
    return (
      <div className="azure-storage-loading">
        <div className="azure-loading-mark">
          <Cloud
            size={28}
          />
        </div>

        <strong>
          Preparing AzureDrop
        </strong>

        <span>
          Connecting to your
          storage workspace…
        </span>
      </div>
    );
  }

  return (
    <div className="azure-storage-page">
      <aside className="azure-storage-sidebar">
        <div
          className="azure-storage-brand"
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
        >
          <div className="azure-brand-mark">
            <Cloud
              size={22}
            />
          </div>

          <div>
            <strong>
              Azure
              <span>
                Drop
              </span>
            </strong>

            <small>
              Cloud Storage
            </small>
          </div>
        </div>

        <nav>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            <HardDrive
              size={18}
            />
            Overview
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            <FileText
              size={18}
            />
            Files
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/shared"
              )
            }
          >
            <Sparkles
              size={18}
            />
            Shared
          </button>

          <button
            className="active"
            type="button"
          >
            <Boxes
              size={18}
            />
            Storage
          </button>
        </nav>

        <div className="azure-sidebar-security">
          <ShieldCheck
            size={19}
          />

          <div>
            <strong>
              Protected storage
            </strong>

            <span>
              Private by default
            </span>
          </div>
        </div>
      </aside>

      <main className="azure-storage-content">
        <header className="azure-storage-topbar">
          <button
            className="azure-back-button"
            type="button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            <ArrowLeft
              size={17}
            />
            Dashboard
          </button>

          <div className="azure-topbar-actions">
            <div
              className={`azure-service-status ${healthStatus}`}
            >
              <span />

              {healthTopbarText}
            </div>

            <button
              className="azure-refresh-button"
              type="button"
              disabled={
                refreshing
              }
              onClick={() =>
                loadStorage(
                  true
                )
              }
              aria-label="Refresh storage"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "spinning"
                    : ""
                }
              />
            </button>
          </div>
        </header>

        <section className="azure-storage-hero">
          <div className="azure-hero-glow" />

          <div className="azure-storage-hero-copy">
            <div className="azure-storage-eyebrow">
              <Cloud
                size={15}
              />
              AZURE STORAGE
            </div>

            <h1>
              Storage built for
              <span>
                {" "}
                secure movement.
              </span>
            </h1>

            <p>
              AzureDrop keeps your
              files private in Azure
              Blob Storage while
              PostgreSQL maintains
              searchable file metadata
              and controlled sharing
              records.
            </p>

            <div className="azure-hero-actions">
              <button
                className="azure-primary-button"
                type="button"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                <UploadCloud
                  size={18}
                />
                Upload a file
              </button>

              <div className="azure-encryption-note">
                <LockKeyhole
                  size={16}
                />
                Private container
                access
              </div>
            </div>
          </div>

          <div className="azure-architecture-card">
            <div className="azure-architecture-title">
              Storage flow
            </div>

            <div className="azure-flow-item">
              <span className="azure-flow-icon">
                <UploadCloud
                  size={19}
                />
              </span>

              <div>
                <strong>
                  AzureDrop API
                </strong>

                <small>
                  Authenticated uploads
                </small>
              </div>
            </div>

            <div className="azure-flow-line" />

            <div className="azure-flow-item">
              <span className="azure-flow-icon rust">
                <Cloud
                  size={19}
                />
              </span>

              <div>
                <strong>
                  Azure Blob Storage
                </strong>

                <small>
                  Private file objects
                </small>
              </div>
            </div>

            <div className="azure-flow-line" />

            <div className="azure-flow-item">
              <span className="azure-flow-icon cream">
                <Database
                  size={19}
                />
              </span>

              <div>
                <strong>
                  PostgreSQL
                </strong>

                <small>
                  Metadata & sharing
                </small>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="azure-storage-error">
            {error}
          </div>
        )}

        <section className="azure-stat-grid">
          <article>
            <div className="azure-stat-icon">
              <FileText
                size={21}
              />
            </div>

            <div>
              <span>
                Total files
              </span>

              <strong>
                {files.length}
              </strong>

              <small>
                Stored objects
              </small>
            </div>
          </article>

          <article>
            <div className="azure-stat-icon copper">
              <HardDrive
                size={21}
              />
            </div>

            <div>
              <span>
                Storage used
              </span>

              <strong>
                {formatSize(
                  totalSize
                )}
              </strong>

              <small>
                Across your files
              </small>
            </div>
          </article>

          <article>
            <div className="azure-stat-icon cream">
              <Boxes
                size={21}
              />
            </div>

            <div>
              <span>
                Container
              </span>

              <strong className="azure-container-name">
                azuredrop-files
              </strong>

              <small>
                Blob destination
              </small>
            </div>
          </article>

          <article>
            <div
              className={`azure-stat-icon ${providerIconClass}`}
            >
              {healthStatus ===
              "healthy" ? (
                <CheckCircle2
                  size={21}
                />
              ) : healthStatus ===
                "checking" ? (
                <RefreshCw
                  size={21}
                  className="spinning"
                />
              ) : (
                <CircleAlert
                  size={21}
                />
              )}
            </div>

            <div>
              <span>
                Provider
              </span>

              <strong>
                Azure Blob
              </strong>

              <small>
                {
                  healthDetailText
                }
              </small>
            </div>
          </article>
        </section>

        <section className="azure-storage-grid">
          <article className="azure-main-panel">
            <div className="azure-panel-heading">
              <div>
                <span>
                  STORAGE OBJECTS
                </span>

                <h2>
                  Recent files
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                View all
              </button>
            </div>

            {recentFiles.length ===
            0 ? (
              <div className="azure-empty-state">
                <div>
                  <UploadCloud
                    size={26}
                  />
                </div>

                <h3>
                  Your storage is
                  empty
                </h3>

                <p>
                  Upload your first
                  file to populate
                  Azure Blob Storage.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/dashboard"
                    )
                  }
                >
                  Go to dashboard
                </button>
              </div>
            ) : (
              <div className="azure-file-list">
                {recentFiles.map(
                  (file) => (
                    <div
                      className="azure-file-row"
                      key={
                        file.id
                      }
                    >
                      <div className="azure-file-symbol">
                        <FileText
                          size={19}
                        />
                      </div>

                      <div className="azure-file-info">
                        <strong>
                          {
                            file.original_name
                          }
                        </strong>

                        <span>
                          {file.category ||
                            "file"}{" "}
                          ·{" "}
                          {formatSize(
                            file.size_bytes
                          )}
                        </span>
                      </div>

                      <div className="azure-file-provider">
                        Azure Blob
                      </div>

                      <time>
                        {formatDate(
                          file.uploaded_at
                        )}
                      </time>
                    </div>
                  )
                )}
              </div>
            )}
          </article>

          <aside className="azure-security-panel">
            <div className="azure-security-icon">
              <ShieldCheck
                size={24}
              />
            </div>

            <span>
              SECURITY MODEL
            </span>

            <h2>
              Private by design.
            </h2>

            <p>
              AzureDrop does not
              expose blobs publicly.
              Downloads use
              short-lived signed
              access URLs generated
              only after
              authorization.
            </p>

            <ul>
              <li>
                <CheckCircle2
                  size={16}
                />
                JWT-protected API
              </li>

              <li>
                <CheckCircle2
                  size={16}
                />
                Private Blob
                container
              </li>

              <li>
                <CheckCircle2
                  size={16}
                />
                Temporary SAS
                downloads
              </li>

              <li>
                <CheckCircle2
                  size={16}
                />
                PostgreSQL metadata
              </li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}
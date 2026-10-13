import {
  Boxes,
  Cloud,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  HardDrive,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
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

import FileDetailsModal from "../components/FileDetailsModal";
import UploadModal from "../components/UploadModal";

import "./Dashboard.css";

const CATEGORIES = [
  "all",
  "documents",
  "images",
  "spreadsheets",
  "archives",
  "text",
  "other",
];

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
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function getFileIcon(category) {
  switch (
    String(
      category || ""
    ).toLowerCase()
  ) {
    case "images":
      return FileImage;

    case "spreadsheets":
      return FileSpreadsheet;

    case "archives":
      return FileArchive;

    case "documents":
    case "text":
      return FileText;

    default:
      return File;
  }
}

export default function Dashboard() {
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

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("all");

  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    selectedFileIds,
    setSelectedFileIds,
  ] = useState([]);

  const [
    bulkDeleting,
    setBulkDeleting,
  ] = useState(false);

  const [
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
  ] = useState(false);

  const [
    bulkDeleteProgress,
    setBulkDeleteProgress,
  ] = useState({
    current: 0,
    total: 0,
  });

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "azuredrop_user"
        )
      );
    } catch {
      return null;
    }
  }, []);

  const logout =
    useCallback(() => {
      localStorage.removeItem(
        "azuredrop_token"
      );

      localStorage.removeItem(
        "azuredrop_user"
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }, [navigate]);

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

  const loadFiles =
    useCallback(
      async ({
        quiet = false,
      } = {}) => {
        if (!quiet) {
          setError("");
        }

        try {
          const response =
            await api.get(
              "/api/files"
            );

          setFiles(
            response.data?.data
              ?.files || []
          );
        } catch (
          requestError
        ) {
          if (
            requestError.response
              ?.status === 401
          ) {
            logout();
            return;
          }

          throw requestError;
        }
      },
      [logout]
    );

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response =
          await api.get(
            "/api/files"
          );

        if (!active) {
          return;
        }

        setFiles(
          response.data?.data
            ?.files || []
        );
      } catch (
        requestError
      ) {
        if (!active) {
          return;
        }

        if (
          requestError.response
            ?.status === 401
        ) {
          logout();
          return;
        }

        setError(
          requestError.response
            ?.data?.message ||
            "Unable to load your AzureDrop workspace."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [logout]);

  const refreshWorkspace =
    useCallback(async () => {
      setRefreshing(true);
      setError("");

      try {
        await Promise.all([
          loadFiles({
            quiet: true,
          }),
          loadHealth(),
        ]);
      } catch (
        requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to refresh your workspace."
        );
      } finally {
        setRefreshing(false);
      }
    }, [
      loadFiles,
      loadHealth,
    ]);

  const handleUploaded =
    useCallback(async () => {
      setUploadOpen(false);

      try {
        await loadFiles({
          quiet: true,
        });
      } catch {
        setError(
          "File uploaded, but the workspace could not be refreshed."
        );
      }
    }, [loadFiles]);

  const handleDeleted =
    useCallback(async () => {
      const deletedFileId =
        selectedFile?.id;

      setSelectedFile(null);

      if (deletedFileId) {
        setSelectedFileIds(
          (current) =>
            current.filter(
              (id) =>
                id !== deletedFileId
            )
        );
      }

      try {
        await loadFiles({
          quiet: true,
        });
      } catch {
        setError(
          "File deleted, but the workspace could not be refreshed."
        );
      }
    }, [
      loadFiles,
      selectedFile?.id,
    ]);

  const filteredFiles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return files.filter(
        (file) => {
          const name =
            String(
              file.original_name ||
                ""
            ).toLowerCase();

          const matchesSearch =
            !query ||
            name.includes(query);

          const matchesCategory =
            category === "all" ||
            file.category ===
              category;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      files,
      search,
      category,
    ]);

  const visibleFileIds =
    useMemo(
      () =>
        filteredFiles.map(
          (file) =>
            file.id
        ),
      [filteredFiles]
    );

  const selectedCount =
    selectedFileIds.length;

  const allVisibleSelected =
    visibleFileIds.length > 0 &&
    visibleFileIds.every(
      (id) =>
        selectedFileIds.includes(
          id
        )
    );

  function toggleFileSelection(
    fileId,
    event
  ) {
    event.stopPropagation();

    if (bulkDeleting) {
      return;
    }

    setBulkDeleteConfirm(false);

    setSelectedFileIds(
      (current) =>
        current.includes(fileId)
          ? current.filter(
              (id) =>
                id !== fileId
            )
          : [
              ...current,
              fileId,
            ]
    );
  }

  function toggleSelectAllVisible() {
    if (bulkDeleting) {
      return;
    }

    setBulkDeleteConfirm(false);

    setSelectedFileIds(
      (current) => {
        if (allVisibleSelected) {
          return current.filter(
            (id) =>
              !visibleFileIds.includes(
                id
              )
          );
        }

        return Array.from(
          new Set([
            ...current,
            ...visibleFileIds,
          ])
        );
      }
    );
  }

  function clearFileSelection() {
    if (bulkDeleting) {
      return;
    }

    setSelectedFileIds([]);
    setBulkDeleteConfirm(false);
  }

  async function handleBulkDelete() {
    if (
      bulkDeleting ||
      selectedFileIds.length === 0
    ) {
      return;
    }

    if (!bulkDeleteConfirm) {
      setBulkDeleteConfirm(true);
      return;
    }

    const idsToDelete = [
      ...selectedFileIds,
    ];

    const failedIds = [];

    let successfulDeletes = 0;

    try {
      setBulkDeleting(true);
      setError("");

      setBulkDeleteProgress({
        current: 0,
        total: idsToDelete.length,
      });

      for (
        let index = 0;
        index < idsToDelete.length;
        index += 1
      ) {
        const fileId =
          idsToDelete[index];

        setBulkDeleteProgress({
          current: index + 1,
          total: idsToDelete.length,
        });

        try {
          await api.delete(
            `/api/files/${fileId}`
          );

          successfulDeletes += 1;
        } catch {
          failedIds.push(
            fileId
          );
        }
      }

      setSelectedFileIds(
        failedIds
      );

      setBulkDeleteConfirm(
        false
      );

      try {
        await loadFiles({
          quiet: true,
        });
      } catch {
        setError(
          "Files were deleted, but the workspace could not be refreshed."
        );

        return;
      }

      if (
        failedIds.length > 0
      ) {
        setError(
          `${successfulDeletes} of ${idsToDelete.length} files deleted successfully. ` +
            `${failedIds.length} failed and remain selected.`
        );
      }
    } finally {
      setBulkDeleting(false);

      setBulkDeleteProgress({
        current: 0,
        total: 0,
      });
    }
  }

  const totalSize =
    useMemo(
      () =>
        files.reduce(
          (total, file) =>
            total +
            Number(
              file.size_bytes ||
                0
            ),
          0
        ),
      [files]
    );

  const categoryCount =
    useMemo(
      () =>
        new Set(
          files
            .map(
              (file) =>
                file.category
            )
            .filter(Boolean)
        ).size,
      [files]
    );

  const recentUpload =
    useMemo(() => {
      if (!files.length) {
        return null;
      }

      return [...files].sort(
        (a, b) =>
          new Date(
            b.uploaded_at
          ).getTime() -
          new Date(
            a.uploaded_at
          ).getTime()
      )[0];
    }, [files]);

  const firstName =
    user?.name
      ?.trim()
      ?.split(/\s+/)[0] ||
    "there";

  const healthTopbarText =
    healthStatus === "healthy"
      ? "Blob Storage ready"
      : healthStatus ===
          "checking"
        ? "Checking services"
        : "Storage unavailable";

  const healthShortText =
    healthStatus === "healthy"
      ? "Healthy"
      : healthStatus ===
          "checking"
        ? "Checking"
        : "Unavailable";

  if (loading) {
    return (
      <div className="az-dashboard-loading">
        <div className="az-loading-logo">
          <Cloud size={28} />
        </div>

        <strong>
          Loading AzureDrop
        </strong>

        <span>
          Preparing your secure
          workspace…
        </span>
      </div>
    );
  }

  return (
    <div className="az-dashboard">
      <aside
        className={`az-sidebar ${
          mobileMenuOpen
            ? "open"
            : ""
        }`}
      >
        <div className="az-sidebar-brand">
          <div className="az-brand-icon">
            <Cloud size={22} />
          </div>

          <div>
            <strong>
              Azure
              <span>
                Drop
              </span>
            </strong>

            <small>
              Cloud workspace
            </small>
          </div>
        </div>

        <button
          className="az-mobile-close"
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              false
            )
          }
        >
          <X size={20} />
        </button>

        <nav className="az-sidebar-nav">
          <button
            className="active"
            type="button"
          >
            <HardDrive
              size={18}
            />
            Overview
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(
                false
              );

              document
                .getElementById(
                  "files"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }}
          >
            <FolderOpen
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
            <Share2 size={18} />
            Shared
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/storage"
              )
            }
          >
            <Boxes size={18} />
            Storage
          </button>
        </nav>

        <div className="az-sidebar-bottom">
          <div className="az-security-card">
            <ShieldCheck
              size={20}
            />

            <div>
              <strong>
                Secure workspace
              </strong>

              <span>
                Azure Blob enabled
              </span>
            </div>
          </div>

          <button
            className="az-logout-button"
            type="button"
            onClick={logout}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          className="az-sidebar-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setMobileMenuOpen(
              false
            )
          }
        />
      )}

      <main className="az-main">
        <header className="az-topbar">
          <button
            className="az-menu-button"
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                true
              )
            }
          >
            <Menu size={21} />
          </button>

          <div className="az-topbar-title">
            <span>
              WORKSPACE
            </span>

            <strong>
              Overview
            </strong>
          </div>

          <div className="az-topbar-actions">
            <div
              className={`az-system-status ${healthStatus}`}
            >
              <span />

              {healthTopbarText}
            </div>

            <button
              className="az-refresh"
              type="button"
              disabled={refreshing}
              onClick={
                refreshWorkspace
              }
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "az-spin"
                    : ""
                }
              />
            </button>

            <div className="az-user-avatar">
              {firstName
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <section className="az-welcome">
          <div>
            <span className="az-eyebrow">
              AZUREDROP
            </span>

            <h1>
              Good to see you,
              <span>
                {" "}
                {firstName}.
              </span>
            </h1>

            <p>
              Securely upload,
              organize and share
              files backed by Azure
              Blob Storage.
            </p>
          </div>

          <button
            className="az-upload-primary"
            type="button"
            onClick={() =>
              setUploadOpen(true)
            }
          >
            <UploadCloud
              size={19}
            />
            Upload file
          </button>
        </section>

        {error && (
          <div className="az-error-banner">
            {error}
          </div>
        )}

        <section className="az-stats">
          <article>
            <div className="az-stat-icon rust">
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
                Azure Blob objects
              </small>
            </div>
          </article>

          <article>
            <div className="az-stat-icon copper">
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
                Across all files
              </small>
            </div>
          </article>

          <article>
            <div className="az-stat-icon cream">
              <FolderOpen
                size={21}
              />
            </div>

            <div>
              <span>
                Categories
              </span>

              <strong>
                {categoryCount}
              </strong>

              <small>
                File groups
              </small>
            </div>
          </article>

          <article>
            <div className="az-stat-icon green">
              <Cloud size={21} />
            </div>

            <div>
              <span>
                Storage
              </span>

              <strong>
                Azure Blob
              </strong>

              <small>
                Private container
              </small>
            </div>
          </article>
        </section>

        <section className="az-dashboard-grid">
          <article className="az-storage-summary">
            <div className="az-card-heading">
              <div>
                <span>
                  STORAGE
                </span>

                <h2>
                  Azure Blob
                  workspace
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/storage"
                  )
                }
              >
                View storage
              </button>
            </div>

            <div className="az-storage-visual">
              <div className="az-storage-orb">
                <Cloud size={32} />
              </div>

              <div>
                <strong>
                  azuredrop-files
                </strong>

                <span>
                  Private Blob
                  container
                </span>
              </div>

              <div
                className={`az-storage-health ${healthStatus}`}
              >
                <span />

                {healthShortText}
              </div>
            </div>

            <div className="az-storage-details">
              <div>
                <span>
                  Provider
                </span>

                <strong>
                  Azure Blob Storage
                </strong>
              </div>

              <div>
                <span>
                  Access
                </span>

                <strong>
                  Private
                </strong>
              </div>

              <div>
                <span>
                  Downloads
                </span>

                <strong>
                  Temporary SAS
                </strong>
              </div>

              <div>
                <span>
                  Metadata
                </span>

                <strong>
                  PostgreSQL
                </strong>
              </div>
            </div>
          </article>

          <article className="az-activity-card">
            <div className="az-card-heading">
              <div>
                <span>
                  ACTIVITY
                </span>

                <h2>
                  Latest upload
                </h2>
              </div>
            </div>

            {recentUpload ? (
              <div className="az-latest-file">
                <div className="az-latest-icon">
                  <FileText
                    size={23}
                  />
                </div>

                <strong>
                  {
                    recentUpload.original_name
                  }
                </strong>

                <span>
                  {formatSize(
                    recentUpload.size_bytes
                  )}
                  {" · "}
                  {recentUpload.category ||
                    "file"}
                </span>

                <small>
                  Uploaded{" "}
                  {formatDate(
                    recentUpload.uploaded_at
                  )}
                </small>
              </div>
            ) : (
              <div className="az-no-activity">
                <UploadCloud
                  size={25}
                />

                <strong>
                  No uploads yet
                </strong>

                <span>
                  Your latest file
                  will appear here.
                </span>
              </div>
            )}
          </article>
        </section>

        <section
          className="az-files-section"
          id="files"
        >
          <div className="az-files-heading">
            <div>
              <span>
                YOUR FILES
              </span>

              <h2>
                File library
              </h2>

              <p>
                {filteredFiles.length}{" "}
                {filteredFiles.length ===
                1
                  ? "file"
                  : "files"}{" "}
                shown
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setUploadOpen(
                  true
                )
              }
            >
              <UploadCloud
                size={17}
              />
              Upload
            </button>
          </div>

          <div className="az-file-toolbar">
            <div className="az-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search files..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
              />
            </div>

            <div className="az-category-tabs">
              {CATEGORIES.map(
                (item) => (
                  <button
                    className={
                      category ===
                      item
                        ? "active"
                        : ""
                    }
                    key={item}
                    type="button"
                    onClick={() =>
                      setCategory(
                        item
                      )
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredFiles.length > 0 && (
            <div className="az-bulk-toolbar">
              <div className="az-bulk-selection-actions">
                <label className="az-bulk-select-all">
                  <input
                    type="checkbox"
                    checked={
                      allVisibleSelected
                    }
                    onChange={
                      toggleSelectAllVisible
                    }
                    disabled={
                      bulkDeleting
                    }
                  />

                  <span>
                    {allVisibleSelected
                      ? "Deselect visible"
                      : "Select all visible"}
                  </span>
                </label>

                {selectedCount > 0 && (
                  <span className="az-selected-count">
                    {selectedCount} selected
                  </span>
                )}

                {selectedCount > 0 && (
                  <button
                    type="button"
                    className="az-clear-selection"
                    onClick={
                      clearFileSelection
                    }
                    disabled={
                      bulkDeleting
                    }
                  >
                    Clear
                  </button>
                )}
              </div>

              {selectedCount > 0 && (
                <div className="az-bulk-delete-actions">
                  {bulkDeleteConfirm && (
                    <span className="az-bulk-delete-warning">
                      Delete {selectedCount} selected file{
                        selectedCount === 1
                          ? ""
                          : "s"
                      }? This cannot be undone.
                    </span>
                  )}

                  {bulkDeleteConfirm && (
                    <button
                      type="button"
                      className="az-bulk-cancel-button"
                      onClick={() =>
                        setBulkDeleteConfirm(
                          false
                        )
                      }
                      disabled={
                        bulkDeleting
                      }
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="button"
                    className={`az-bulk-delete-button ${
                      bulkDeleteConfirm
                        ? "confirming"
                        : ""
                    }`}
                    onClick={
                      handleBulkDelete
                    }
                    disabled={
                      bulkDeleting
                    }
                  >
                    <Trash2 size={15} />

                    {bulkDeleting
                      ? `Deleting ${bulkDeleteProgress.current} of ${bulkDeleteProgress.total}…`
                      : bulkDeleteConfirm
                        ? `Confirm delete ${selectedCount}`
                        : "Delete selected"}
                  </button>
                </div>
              )}
            </div>
          )}

          {filteredFiles.length ===
          0 ? (
            <div className="az-empty-files">
              <div>
                <UploadCloud
                  size={28}
                />
              </div>

              <h3>
                {files.length
                  ? "No matching files"
                  : "Your file library is empty"}
              </h3>

              <p>
                {files.length
                  ? "Try another search or category."
                  : "Upload your first file and AzureDrop will store it securely in Blob Storage."}
              </p>

              {!files.length && (
                <button
                  type="button"
                  onClick={() =>
                    setUploadOpen(
                      true
                    )
                  }
                >
                  Upload first file
                </button>
              )}
            </div>
          ) : (
            <div className="az-file-table">
              <div className="az-file-table-head">
                <span
                  className="az-file-select-head"
                  aria-hidden="true"
                />

                <span>
                  Name
                </span>

                <span>
                  Category
                </span>

                <span>
                  Size
                </span>

                <span>
                  Storage
                </span>

                <span>
                  Uploaded
                </span>
              </div>

              {filteredFiles.map(
                (file) => {
                  const Icon =
                    getFileIcon(
                      file.category
                    );

                  return (
                    <div
                      className={`az-file-row ${
                        selectedFileIds.includes(
                          file.id
                        )
                          ? "selected"
                          : ""
                      }`}
                      key={file.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setSelectedFile(
                          file
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key ===
                            " "
                        ) {
                          event.preventDefault();

                          setSelectedFile(
                            file
                          );
                        }
                      }}
                    >
                      <span
                        className="az-file-select-cell"
                        onClick={(
                          event
                        ) =>
                          event.stopPropagation()
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            selectedFileIds.includes(
                              file.id
                            )
                          }
                          onChange={(
                            event
                          ) =>
                            toggleFileSelection(
                              file.id,
                              event
                            )
                          }
                          disabled={
                            bulkDeleting
                          }
                          aria-label={`Select ${file.original_name}`}
                        />
                      </span>

                      <span className="az-file-name-cell">
                        <span className="az-file-type-icon">
                          <Icon
                            size={19}
                          />
                        </span>

                        <span>
                          <strong>
                            {
                              file.original_name
                            }
                          </strong>

                          <small>
                            {file.mime_type ||
                              "File"}
                          </small>
                        </span>
                      </span>

                      <span className="az-category-badge">
                        {file.category ||
                          "other"}
                      </span>

                      <span>
                        {formatSize(
                          file.size_bytes
                        )}
                      </span>

                      <span className="az-provider-badge">
                        Azure Blob
                      </span>

                      <span>
                        {formatDate(
                          file.uploaded_at
                        )}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>

      <UploadModal
        open={uploadOpen}
        onClose={() =>
          setUploadOpen(false)
        }
        onUploaded={
          handleUploaded
        }
      />

      <FileDetailsModal
        file={selectedFile}
        open={Boolean(
          selectedFile
        )}
        onClose={() =>
          setSelectedFile(null)
        }
        onDeleted={
          handleDeleted
        }
      />
    </div>
  );
}
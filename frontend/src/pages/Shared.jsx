import {
  Boxes,
  ChevronRight,
  Clock,
  Cloud,
  ExternalLink,
  FileText,
  Files,
  Link2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Trash2,
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

import "./Shared.css";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function getTimeRemaining(value) {
  if (!value) {
    return "Unknown expiry";
  }

  const expiry =
    new Date(value).getTime();

  const now = Date.now();

  if (
    Number.isNaN(expiry)
  ) {
    return "Unknown expiry";
  }

  const difference =
    expiry - now;

  if (difference <= 0) {
    return "Expired";
  }

  const minutes =
    Math.floor(
      difference /
        (1000 * 60)
    );

  if (minutes < 60) {
    return `${minutes} min remaining`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} hr${
      hours === 1
        ? ""
        : "s"
    } remaining`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days} day${
    days === 1
      ? ""
      : "s"
  } remaining`;
}

function isExpired(share) {
  if (!share?.expires_at) {
    return false;
  }

  return (
    new Date(
      share.expires_at
    ).getTime() <=
    Date.now()
  );
}

function isExpiringSoon(
  share
) {
  if (
    !share?.expires_at ||
    isExpired(share)
  ) {
    return false;
  }

  const expiry =
    new Date(
      share.expires_at
    ).getTime();

  return (
    expiry - Date.now() <=
    24 * 60 * 60 * 1000
  );
}

export default function Shared() {
  const navigate =
    useNavigate();

  const [
    sharedItems,
    setSharedItems,
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
    revokingId,
    setRevokingId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("active");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
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

  const fetchSharedItems =
    useCallback(async () => {
      const filesResponse =
        await api.get(
          "/api/files"
        );

      const files =
        filesResponse
          ?.data?.data
          ?.files || [];

      if (!files.length) {
        return [];
      }

      const results =
        await Promise.allSettled(
          files.map(
            async (file) => {
              const response =
                await api.get(
                  `/api/files/${file.id}/shares`
                );

              const shares =
                response
                  ?.data?.data
                  ?.shares || [];

              return shares.map(
                (share) => ({
                  ...share,
                  file,
                })
              );
            }
          )
        );

      return results
        .filter(
          (result) =>
            result.status ===
            "fulfilled"
        )
        .flatMap(
          (result) =>
            result.value
        )
        .sort(
          (first, second) =>
            new Date(
              first.expires_at ||
                0
            ).getTime() -
            new Date(
              second.expires_at ||
                0
            ).getTime()
        );
    }, []);

  const loadSharedItems =
    useCallback(
      async ({
        quiet = false,
      } = {}) => {
        if (!quiet) {
          setError("");
        }

        try {
          const items =
            await fetchSharedItems();

          setSharedItems(items);
        } catch (
          requestError
        ) {
          if (
            requestError
              ?.response
              ?.status === 401
          ) {
            logout();
            return;
          }

          throw requestError;
        }
      },
      [
        fetchSharedItems,
        logout,
      ]
    );

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const items =
          await fetchSharedItems();

        if (active) {
          setSharedItems(items);
        }
      } catch (
        requestError
      ) {
        if (
          requestError
            ?.response
            ?.status === 401
        ) {
          logout();
          return;
        }

        if (active) {
          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
              "Unable to load your shared files."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, [
    fetchSharedItems,
    logout,
  ]);

  async function refreshSharedItems() {
    setRefreshing(true);

    try {
      await loadSharedItems();
    } catch (
      requestError
    ) {
      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
          "Unable to refresh shared files."
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function revokeShare(
    item
  ) {
    if (
      !window.confirm(
        `Revoke the share link for "${item.file.original_name}"?`
      )
    ) {
      return;
    }

    try {
      setRevokingId(
        item.id
      );

      setError("");

      await api.delete(
        `/api/files/${item.file.id}/share/${item.id}`
      );

      setSharedItems(
        (current) =>
          current.filter(
            (share) =>
              share.id !==
              item.id
          )
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
          "Unable to revoke this share link."
      );
    } finally {
      setRevokingId("");
    }
  }

  const activeItems =
    useMemo(
      () =>
        sharedItems.filter(
          (item) =>
            !isExpired(item)
        ),
      [sharedItems]
    );

  const expiredItems =
    useMemo(
      () =>
        sharedItems.filter(
          isExpired
        ),
      [sharedItems]
    );

  const activeFileCount =
    useMemo(
      () =>
        new Set(
          activeItems.map(
            (item) =>
              item.file.id
          )
        ).size,
      [activeItems]
    );

  const expiringSoonCount =
    useMemo(
      () =>
        activeItems.filter(
          isExpiringSoon
        ).length,
      [activeItems]
    );

  const filteredItems =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return sharedItems.filter(
        (item) => {
          const expired =
            isExpired(item);

          const matchesFilter =
            filter === "all" ||
            (
              filter ===
                "active" &&
              !expired
            ) ||
            (
              filter ===
                "expired" &&
              expired
            );

          const matchesSearch =
            !term ||
            String(
              item.file
                ?.original_name ||
                ""
            )
              .toLowerCase()
              .includes(term);

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [
      sharedItems,
      search,
      filter,
    ]);

  const firstName =
    user?.name
      ?.trim()
      ?.split(/\s+/)[0] ||
    "User";

  return (
    <main className="az-shared-page">
      <aside
        className={`az-shared-sidebar ${
          mobileSidebarOpen
            ? "open"
            : ""
        }`}
      >
        <div>
          <div className="az-shared-brand">
            <span>
              <Cloud size={21} />
            </span>

            <div>
              <strong>
                Azure
                <em>
                  Drop
                </em>
              </strong>

              <small>
                Cloud workspace
              </small>
            </div>
          </div>

          <button
            className="az-shared-close"
            type="button"
            aria-label="Close navigation"
            onClick={() =>
              setMobileSidebarOpen(
                false
              )
            }
          >
            <X size={19} />
          </button>

          <nav>
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
              className="active"
              type="button"
            >
              <Share2 size={18} />

              Shared

              {activeItems.length >
                0 && (
                <small>
                  {
                    activeItems.length
                  }
                </small>
              )}
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
        </div>

        <div className="az-shared-sidebar-bottom">
          <div className="az-shared-user">
            <span>
              {firstName
                .charAt(0)
                .toUpperCase()}
            </span>

            <div>
              <strong>
                {user?.name ||
                  "AzureDrop User"}
              </strong>

              <small>
                {user?.email || ""}
              </small>
            </div>
          </div>

          <button
            className="az-shared-logout"
            type="button"
            onClick={logout}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <button
          className="az-shared-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setMobileSidebarOpen(
              false
            )
          }
        />
      )}

      <section className="az-shared-content">
        <header className="az-shared-mobile-header">
          <div className="az-shared-mobile-brand">
            <Cloud size={20} />
            AzureDrop
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileSidebarOpen(
                true
              )
            }
          >
            <Menu size={21} />
          </button>
        </header>

        <div className="az-shared-inner">
          <header className="az-shared-header">
            <div>
              <span>
                SECURE SHARING
              </span>

              <h1>
                Shared files
              </h1>

              <p>
                Manage active and
                expired temporary file
                links from one secure
                workspace.
              </p>
            </div>

            <div className="az-shared-header-actions">
              <button
                className="refresh"
                type="button"
                disabled={refreshing}
                onClick={
                  refreshSharedItems
                }
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "az-shared-spin"
                      : ""
                  }
                />
              </button>

              <button
                className="primary"
                type="button"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                <Files size={17} />
                My files
              </button>
            </div>
          </header>

          {error && (
            <div className="az-shared-error">
              <ShieldCheck
                size={17}
              />

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                <X size={14} />
              </button>
            </div>
          )}

          <section className="az-shared-stats">
            <article>
              <div className="rust">
                <Link2 size={20} />
              </div>

              <span>
                Active links
              </span>

              <strong>
                {activeItems.length}
              </strong>

              <small>
                Accessible now
              </small>
            </article>

            <article>
              <div className="copper">
                <Files size={20} />
              </div>

              <span>
                Shared files
              </span>

              <strong>
                {activeFileCount}
              </strong>

              <small>
                Unique files
              </small>
            </article>

            <article>
              <div className="amber">
                <Clock size={20} />
              </div>

              <span>
                Expiring soon
              </span>

              <strong>
                {expiringSoonCount}
              </strong>

              <small>
                Within 24 hours
              </small>
            </article>

            <article>
              <div className="muted">
                <ShieldCheck
                  size={20}
                />
              </div>

              <span>
                Expired
              </span>

              <strong>
                {expiredItems.length}
              </strong>

              <small>
                No longer accessible
              </small>
            </article>
          </section>

          <section className="az-shared-security">
            <div>
              <ShieldCheck
                size={20}
              />
            </div>

            <div>
              <strong>
                Private by default
              </strong>

              <p>
                AzureDrop stores only
                the secure hash of each
                share token. Public
                links expire
                automatically and do
                not make the underlying
                Blob container public.
              </p>
            </div>
          </section>

          <section className="az-shared-panel">
            <div className="az-shared-toolbar">
              <div>
                <span>
                  LINK MANAGER
                </span>

                <h2>
                  Sharing activity
                </h2>

                <p>
                  Review temporary
                  access to your files.
                </p>
              </div>

              <div className="az-shared-controls">
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="active">
                    Active links
                  </option>

                  <option value="expired">
                    Expired links
                  </option>

                  <option value="all">
                    All links
                  </option>
                </select>

                <div className="az-shared-search">
                  <Search size={16} />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search shared files..."
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="az-shared-empty">
                <span className="az-shared-loader" />

                <h3>
                  Loading share links
                </h3>

                <p>
                  Checking AzureDrop
                  sharing activity…
                </p>
              </div>
            ) : filteredItems.length ===
              0 ? (
              <div className="az-shared-empty">
                <div>
                  <Share2
                    size={27}
                  />
                </div>

                <h3>
                  {search
                    ? "No matching shared files"
                    : filter ===
                        "expired"
                      ? "No expired links"
                      : "No active share links"}
                </h3>

                <p>
                  {search
                    ? "Try a different file name."
                    : filter ===
                        "expired"
                      ? "Expired sharing links will appear here."
                      : "Open a file from your dashboard and create a temporary link to share it securely."}
                </p>

                {filter !==
                  "expired" && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/dashboard"
                      )
                    }
                  >
                    <Files
                      size={17}
                    />

                    Browse files
                  </button>
                )}
              </div>
            ) : (
              <div className="az-shared-list">
                {filteredItems.map(
                  (item) => {
                    const expired =
                      isExpired(item);

                    const expiringSoon =
                      isExpiringSoon(
                        item
                      );

                    return (
                      <article
                        className={`az-share-item ${
                          expired
                            ? "expired"
                            : ""
                        }`}
                        key={item.id}
                      >
                        <div className="az-share-file">
                          <div>
                            <FileText
                              size={19}
                            />
                          </div>

                          <span>
                            <strong>
                              {
                                item.file
                                  .original_name
                              }
                            </strong>

                            <small>
                              {item.file
                                .category ||
                                "file"}
                              {" · "}
                              Azure Blob
                            </small>
                          </span>
                        </div>

                        <div className="az-share-date">
                          <span>
                            Expires
                          </span>

                          <strong>
                            {formatDate(
                              item.expires_at
                            )}
                          </strong>

                          <small
                            className={
                              expired
                                ? "expired"
                                : expiringSoon
                                  ? "warning"
                                  : ""
                            }
                          >
                            {getTimeRemaining(
                              item.expires_at
                            )}
                          </small>
                        </div>

                        <div className="az-share-date">
                          <span>
                            Created
                          </span>

                          <strong>
                            {formatDate(
                              item.created_at
                            )}
                          </strong>
                        </div>

                        <span
                          className={`az-share-status ${
                            expired
                              ? "expired"
                              : "active"
                          }`}
                        >
                          {expired
                            ? "Expired"
                            : "Active"}
                        </span>

                        <div className="az-share-actions">
                          <button
                            className="manage"
                            type="button"
                            onClick={() =>
                              setSelectedFile(
                                item.file
                              )
                            }
                          >
                            <ExternalLink
                              size={14}
                            />

                            Manage

                            <ChevronRight
                              size={14}
                            />
                          </button>

                          <button
                            className="revoke"
                            type="button"
                            disabled={
                              revokingId ===
                              item.id
                            }
                            onClick={() =>
                              revokeShare(
                                item
                              )
                            }
                          >
                            <Trash2
                              size={14}
                            />

                            {revokingId ===
                            item.id
                              ? "Revoking…"
                              : "Revoke"}
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </section>

      {selectedFile && (
        <FileDetailsModal
          key={selectedFile.id}
          open
          file={selectedFile}
          onClose={() =>
            setSelectedFile(null)
          }
          onDeleted={async () => {
            setSelectedFile(null);
            await refreshSharedItems();
          }}
        />
      )}
    </main>
  );
}
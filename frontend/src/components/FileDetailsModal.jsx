import {

  Check,

  Clock3,

  Copy,

  Download,

  FileText,

  HardDrive,

  Info,

  Link2,

  Loader2,

  Share2,

  ShieldCheck,

  Trash2,

  X,

} from "lucide-react";



import {

  useEffect,

  useState,

} from "react";



import api from "../api/client";



import "./FileDetailsModal.css";



const EXPIRY_OPTIONS = [

  {

    label: "15 minutes",

    value: 15,

  },

  {

    label: "30 minutes",

    value: 30,

  },

  {

    label: "1 hour",

    value: 60,

  },

  {

    label: "6 hours",

    value: 360,

  },

  {

    label: "24 hours",

    value: 1440,

  },

  {

    label: "7 days",

    value: 10080,

  },

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



  return date.toLocaleString();

}



function isShareExpired(

  share

) {

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



export default function FileDetailsModal({

  file,

  open,

  onClose,

  onDeleted,

}) {

  const [

    metadata,

    setMetadata,

  ] = useState(null);



  const [

    shares,

    setShares,

  ] = useState([]);



  const [

    expiry,

    setExpiry,

  ] = useState(60);



  const [

    loading,

    setLoading,

  ] = useState(true);



  const [

    sharesLoading,

    setSharesLoading,

  ] = useState(true);



  const [

    downloading,

    setDownloading,

  ] = useState(false);



  const [

    shareCreating,

    setShareCreating,

  ] = useState(false);



  const [

    revokingId,

    setRevokingId,

  ] = useState("");



  const [

    deleting,

    setDeleting,

  ] = useState(false);



  const [

    error,

    setError,

  ] = useState("");



  const [

    shareUrl,

    setShareUrl,

  ] = useState("");



  const [

    copied,

    setCopied,

  ] = useState(false);



  const [

    confirmDelete,

    setConfirmDelete,

  ] = useState(false);



  useEffect(() => {

    if (

      !open ||

      !file?.id

    ) {

      return undefined;

    }



    let active = true;



    setLoading(true);

    setSharesLoading(true);

    setMetadata(null);

    setShares([]);

    setError("");

    setShareUrl("");

    setCopied(false);

    setConfirmDelete(false);



    async function loadInitialData() {

      try {

        const [

          metadataResponse,

          sharesResponse,

        ] = await Promise.all([

          api.get(

            `/api/files/${file.id}`

          ),



          api.get(

            `/api/files/${file.id}/shares`

          ),

        ]);



        if (!active) {

          return;

        }



        setMetadata(

          metadataResponse

            ?.data?.data

            ?.file || file

        );



        setShares(

          sharesResponse

            ?.data?.data

            ?.shares || []

        );

      } catch (

        requestError

      ) {

        if (!active) {

          return;

        }



        setError(

          requestError

            ?.response?.data

            ?.message ||

            "Unable to load file details."

        );

      } finally {

        if (active) {

          setLoading(false);

          setSharesLoading(false);

        }

      }

    }



    loadInitialData();



    return () => {

      active = false;

    };

  }, [

    open,

    file,

  ]);



  const currentFile =

    metadata || file;



  const storageLabel =

    "Azure Blob Storage";



  if (

    !open ||

    !file

  ) {

    return null;

  }



  async function refreshShares() {

    try {

      setSharesLoading(true);



      const response =

        await api.get(

          `/api/files/${file.id}/shares`

        );



      setShares(

        response

          ?.data?.data

          ?.shares || []

      );

    } catch (

      requestError

    ) {

      setError(

        requestError

          ?.response?.data

          ?.message ||

          "Unable to load share links."

      );

    } finally {

      setSharesLoading(false);

    }

  }



  async function handleDownload() {

    try {

      setDownloading(true);

      setError("");



      const response =

        await api.get(

          `/api/files/${file.id}/download`

        );



      const url =

        response

          ?.data?.data

          ?.downloadUrl;



      if (!url) {

        throw new Error(

          "Download URL was not returned."

        );

      }



      const anchor =

        document.createElement(

          "a"

        );



      anchor.href = url;



      anchor.rel =

        "noopener noreferrer";



      document.body.appendChild(

        anchor

      );



      anchor.click();



      anchor.remove();

    } catch (

      requestError

    ) {

      setError(

        requestError

          ?.response?.data

          ?.message ||

          "Unable to download file."

      );

    } finally {

      setDownloading(false);

    }

  }



  async function handleCreateShare() {

    try {

      setShareCreating(true);

      setError("");

      setCopied(false);



      const response =

        await api.post(

          `/api/files/${file.id}/share`,

          {

            expiresInMinutes:

              Number(expiry),

          }

        );



      const createdShare =

        response

          ?.data?.data

          ?.share;



      if (

        !createdShare

          ?.shareUrl

      ) {

        throw new Error(

          "Share URL was not returned."

        );

      }



      setShareUrl(

        createdShare.shareUrl

      );



      await refreshShares();

    } catch (

      requestError

    ) {

      setError(

        requestError

          ?.response?.data

          ?.message ||

          "Unable to create share link."

      );

    } finally {

      setShareCreating(false);

    }

  }



  async function handleCopy(

    value

  ) {

    try {

      setError("");



      if (

        window.isSecureContext &&

        navigator.clipboard?.writeText

      ) {

        await navigator.clipboard

          .writeText(value);

      } else {

        const textarea =

          document.createElement(

            "textarea"

          );



        textarea.value = value;



        textarea.setAttribute(

          "readonly",

          ""

        );



        textarea.style.position =

          "fixed";



        textarea.style.opacity =

          "0";



        textarea.style.pointerEvents =

          "none";



        document.body.appendChild(

          textarea

        );



        textarea.focus();

        textarea.select();



        const copiedSuccessfully =

          document.execCommand(

            "copy"

          );



        document.body.removeChild(

          textarea

        );



        if (!copiedSuccessfully) {

          throw new Error(

            "Copy command failed"

          );

        }

      }



      setCopied(true);



      window.setTimeout(

        () =>

          setCopied(false),

        1800

      );

    } catch {

      setError(

        "Unable to copy the link automatically. Please select and copy it manually."

      );

    }

  }



  async function handleRevoke(

    shareId

  ) {

    try {

      setRevokingId(

        shareId

      );



      setError("");



      await api.delete(

        `/api/files/${file.id}/share/${shareId}`

      );



      await refreshShares();



      setShareUrl("");

    } catch (

      requestError

    ) {

      setError(

        requestError

          ?.response?.data

          ?.message ||

          "Unable to revoke share link."

      );

    } finally {

      setRevokingId("");

    }

  }



  async function handleDelete() {

    if (!confirmDelete) {

      setConfirmDelete(true);



      return;

    }



    try {

      setDeleting(true);

      setError("");



      await api.delete(

        `/api/files/${file.id}`

      );



      if (onDeleted) {

        await onDeleted();

      }



      onClose();

    } catch (

      requestError

    ) {

      setError(

        requestError

          ?.response?.data

          ?.message ||

          "Unable to delete file."

      );



      setConfirmDelete(false);

    } finally {

      setDeleting(false);

    }

  }



  const busy =

    deleting ||

    downloading ||

    shareCreating;



  return (

    <div

      className="file-details-backdrop"

      onMouseDown={() => {

        if (!busy) {

          onClose();

        }

      }}

    >

      <section

        className="file-details-modal"

        role="dialog"

        aria-modal="true"

        aria-labelledby="file-details-title"

        onMouseDown={(

          event

        ) =>

          event.stopPropagation()

        }

      >

        <header className="file-details-header">

          <div className="file-details-title">

            <div className="file-details-icon">

              <FileText

                size={21}

              />

            </div>



            <div>

              <span className="file-details-kicker">

                File details

              </span>



              <h2

                id="file-details-title"

                title={

                  currentFile

                    ?.original_name

                }

              >

                {

                  currentFile

                    ?.original_name

                }

              </h2>

            </div>

          </div>



          <button

            type="button"

            className="file-details-close"

            onClick={onClose}

            disabled={busy}

            aria-label="Close file details"

          >

            <X size={18} />

          </button>

        </header>



        {error && (

          <div

            className="file-details-error"

            role="alert"

          >

            <Info size={16} />



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

              <X size={14} />

            </button>

          </div>

        )}



        {loading ? (

          <div className="file-details-loading">

            <Loader2

              className="file-details-spin"

              size={21}

            />



            <span>

              Loading file details…

            </span>

          </div>

        ) : (

          <>

            <section className="file-details-storage-card">

              <div className="file-details-storage-icon">

                <HardDrive

                  size={18}

                />

              </div>



              <div>

                <span>

                  Storage location

                </span>



                <strong>

                  {storageLabel}

                </strong>



                <p>

                  Stored securely in

                  your private Azure

                  Blob Storage

                  container.

                </p>

              </div>



              <ShieldCheck

                className="file-details-storage-shield"

                size={18}

              />

            </section>



            <section className="file-details-metadata-grid">

              <article>

                <span>

                  Type

                </span>



                <strong>

                  {currentFile

                    ?.mime_type ||

                    "Unknown"}

                </strong>

              </article>



              <article>

                <span>

                  Category

                </span>



                <strong className="file-details-category">

                  {currentFile

                    ?.category ||

                    "Other"}

                </strong>

              </article>



              <article>

                <span>

                  Size

                </span>



                <strong>

                  {formatSize(

                    currentFile

                      ?.size_bytes

                  )}

                </strong>

              </article>



              <article>

                <span>

                  Uploaded

                </span>



                <strong>

                  {formatDate(

                    currentFile

                      ?.uploaded_at

                  )}

                </strong>

              </article>

            </section>



            {currentFile

              ?.description && (

              <section className="file-details-description">

                <span>

                  Description

                </span>



                <p>

                  {

                    currentFile

                      .description

                  }

                </p>

              </section>

            )}

          </>

        )}



        <section className="file-details-primary-actions">

          <button

            type="button"

            className="file-details-download-button"

            onClick={

              handleDownload

            }

            disabled={

              downloading ||

              loading

            }

          >

            {downloading ? (

              <>

                <Loader2

                  className="file-details-spin"

                  size={17}

                />



                Preparing…

              </>

            ) : (

              <>

                <Download

                  size={17}

                />



                Download

              </>

            )}

          </button>



          <button

            type="button"

            className={`file-details-delete-button ${

              confirmDelete

                ? "confirm"

                : ""

            }`}

            onClick={

              handleDelete

            }

            disabled={

              deleting ||

              loading

            }

          >

            {deleting ? (

              <>

                <Loader2

                  className="file-details-spin"

                  size={17}

                />



                Deleting…

              </>

            ) : (

              <>

                <Trash2

                  size={17}

                />



                {confirmDelete

                  ? "Confirm delete"

                  : "Delete"}

              </>

            )}

          </button>

        </section>



        {confirmDelete && (

          <div className="file-details-delete-warning">

            <div>

              <Info

                size={16}

              />

            </div>



            <p>

              This permanently

              removes the file from

              AzureDrop metadata and

              Azure Blob Storage.

            </p>



            <button

              type="button"

              onClick={() =>

                setConfirmDelete(

                  false

                )

              }

              disabled={deleting}

            >

              Cancel

            </button>

          </div>

        )}



        <div className="file-details-divider" />



        <section className="file-details-sharing">

          <div className="file-details-sharing-heading">

            <div>

              <span>

                Temporary sharing

              </span>



              <h3>

                Share this file

              </h3>

            </div>



            <div className="file-details-share-icon">

              <Share2

                size={19}

              />

            </div>

          </div>



          <p className="file-details-sharing-description">

            Create an expiring public

            link. Recipients can

            download the file without

            signing in to AzureDrop.

          </p>



          <div className="file-details-share-create">

            <label>

              <span>

                Link expires in

              </span>



              <select

                value={expiry}

                onChange={(

                  event

                ) =>

                  setExpiry(

                    Number(

                      event

                        .target

                        .value

                    )

                  )

                }

                disabled={

                  shareCreating

                }

              >

                {EXPIRY_OPTIONS.map(

                  (option) => (

                    <option

                      key={

                        option.value

                      }

                      value={

                        option.value

                      }

                    >

                      {

                        option.label

                      }

                    </option>

                  )

                )}

              </select>

            </label>



            <button

              type="button"

              onClick={

                handleCreateShare

              }

              disabled={

                shareCreating ||

                loading

              }

            >

              {shareCreating ? (

                <>

                  <Loader2

                    className="file-details-spin"

                    size={17}

                  />



                  Creating…

                </>

              ) : (

                <>

                  <Link2

                    size={17}

                  />



                  Create link

                </>

              )}

            </button>

          </div>



          {shareUrl && (

            <div className="file-details-generated-share">

              <div>

                <span>

                  New share link

                </span>



                <p

                  title={

                    shareUrl

                  }

                >

                  {shareUrl}

                </p>

              </div>



              <button

                type="button"

                onClick={() =>

                  handleCopy(

                    shareUrl

                  )

                }

                aria-label="Copy share link"

              >

                {copied ? (

                  <Check

                    size={17}

                  />

                ) : (

                  <Copy

                    size={17}

                  />

                )}

              </button>

            </div>

          )}



          <div className="file-details-existing-shares">

            <div className="file-details-existing-heading">

              <div>

                <strong>

                  Existing links

                </strong>



                <span>

                  Previously created

                  temporary links.

                </span>

              </div>



              <small>

                {shares.length}

              </small>

            </div>



            {sharesLoading ? (

              <div className="file-details-share-state">

                <Loader2

                  className="file-details-spin"

                  size={16}

                />



                Loading links…

              </div>

            ) : shares.length ===

              0 ? (

              <div className="file-details-share-state">

                <Link2

                  size={16}

                />



                No share links have

                been created yet.

              </div>

            ) : (

              <div className="file-details-share-list">

                {shares.map(

                  (share) => {

                    const expired =

                      isShareExpired(

                        share

                      );



                    return (

                      <article

                        className={`file-details-share-row ${

                          expired

                            ? "expired"

                            : ""

                        }`}

                        key={

                          share.id

                        }

                      >

                        <div className="file-details-share-status-icon">

                          <Clock3

                            size={16}

                          />

                        </div>



                        <div className="file-details-share-info">

                          <strong>

                            {expired

                              ? "Expired link"

                              : "Active link"}

                          </strong>



                          <span>

                            Expires{" "}

                            {formatDate(

                              share.expires_at

                            )}

                          </span>

                        </div>



                        {!expired && (

                          <button

                            type="button"

                            className="file-details-revoke-button"

                            disabled={

                              revokingId ===

                              share.id

                            }

                            onClick={() =>

                              handleRevoke(

                                share.id

                              )

                            }

                          >

                            {revokingId ===

                            share.id

                              ? "Revoking…"

                              : "Revoke"}

                          </button>

                        )}

                      </article>

                    );

                  }

                )}

              </div>

            )}

          </div>

        </section>

      </section>

    </div>

  );

}
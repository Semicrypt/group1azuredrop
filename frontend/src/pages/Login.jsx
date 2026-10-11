import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  Database,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

import "./Auth.css";

export default function Login() {
  const navigate =
    useNavigate();

  const [
    form,
    setForm,
  ] = useState({
    email: "",
    password: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        "Enter your email and password."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await api.post(
          "/api/auth/login",
          {
            email:
              form.email
                .trim()
                .toLowerCase(),

            password:
              form.password,
          }
        );

      const token =
        response?.data?.data
          ?.token;

      const user =
        response?.data?.data
          ?.user;

      if (!token) {
        throw new Error(
          "Login response did not include an authentication token."
        );
      }

      /*
       * Temporary compatibility keys.
       * These will be renamed across the
       * whole frontend in one migration.
       */
      localStorage.setItem(
        "azuredrop_token",
        token
      );

      if (user) {
        localStorage.setItem(
          "azuredrop_user",
          JSON.stringify(
            user
          )
        );
      }

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          ?.response?.data
          ?.message ||
          "Unable to sign in. Check your email and password and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link
          className="auth-brand"
          to="/"
        >
          <span className="auth-brand-mark">
            <Cloud size={21} />
          </span>

          <span className="auth-brand-copy">
            <strong>
              Azure
              <em>
                Drop
              </em>
            </strong>

            <small>
              Secure cloud storage
            </small>
          </span>
        </Link>

        <Link
          className="auth-back"
          to="/"
        >
          <ArrowLeft
            size={16}
          />

          Back to home
        </Link>
      </header>

      <main className="auth-layout">
        <section className="auth-showcase">
          <div className="auth-showcase-glow" />

          <div className="auth-showcase-content">
            <div className="auth-kicker">
              <ShieldCheck
                size={15}
              />

              SECURE WORKSPACE
            </div>

            <h1>
              Welcome back to
              <span>
                {" "}
                AzureDrop.
              </span>
            </h1>

            <p>
              Manage private files,
              metadata and temporary
              sharing from one secure
              cloud workspace backed by
              Azure Blob Storage.
            </p>

            <div className="auth-benefits">
              <div>
                <span>
                  <Check
                    size={14}
                  />
                </span>

                <div>
                  <strong>
                    Private Blob storage
                  </strong>

                  <small>
                    Files remain private
                    and downloads use
                    temporary signed
                    access.
                  </small>
                </div>
              </div>

              <div>
                <span>
                  <Check
                    size={14}
                  />
                </span>

                <div>
                  <strong>
                    Searchable metadata
                  </strong>

                  <small>
                    PostgreSQL tracks
                    file metadata,
                    categories and
                    sharing records.
                  </small>
                </div>
              </div>

              <div>
                <span>
                  <Check
                    size={14}
                  />
                </span>

                <div>
                  <strong>
                    Expiring shares
                  </strong>

                  <small>
                    Share files safely
                    without making Blob
                    objects public.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-cloud-visual">
            <div className="auth-orbit orbit-one" />
            <div className="auth-orbit orbit-two" />

            <div className="auth-cloud-core">
              <Cloud size={35} />

              <strong>
                AzureDrop
              </strong>

              <span>
                Protected
              </span>
            </div>

            <div className="auth-service-chip blob">
              <Cloud size={15} />
              Azure Blob
            </div>

            <div className="auth-service-chip postgres">
              <Database size={15} />
              PostgreSQL
            </div>

            <div className="auth-service-chip files">
              <FileText size={15} />
              Secure files
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-form-card">
            <div className="auth-form-heading">
              <span>
                SIGN IN
              </span>

              <h2>
                Access your workspace
              </h2>

              <p>
                Enter your AzureDrop
                account credentials.
              </p>
            </div>

            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                <ShieldCheck
                  size={17}
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={
                handleSubmit
              }
            >
              <label>
                <span>
                  Email address
                </span>

                <div className="auth-input-wrap">
                  <Mail
                    size={17}
                  />

                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    required
                  />
                </div>
              </label>

              <label>
                <span>
                  Password
                </span>

                <div className="auth-input-wrap">
                  <Lock
                    size={17}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    required
                  />

                  <button
                    className="auth-password-toggle"
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    disabled={
                      loading
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={17}
                      />
                    ) : (
                      <Eye
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </label>

              <button
                className="auth-submit"
                type="submit"
                disabled={
                  loading
                }
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="auth-spin"
                    />

                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>
                New to AzureDrop?
              </span>
            </div>

            <Link
              className="auth-secondary-action"
              to="/register"
            >
              Create an account

              <ArrowRight
                size={17}
              />
            </Link>

            <div className="auth-security-note">
              <Lock
                size={14}
              />

              <p>
                Your files remain
                private. Temporary
                signed URLs are created
                only when authorized
                access is requested.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <span>
          © 2026 AzureDrop
        </span>

        <span>
          Secure Azure file storage
        </span>
      </footer>
    </div>
  );
}
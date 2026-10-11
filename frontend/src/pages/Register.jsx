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
  User,
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

export default function Register() {
  const navigate =
    useNavigate();

  const [
    form,
    setForm,
  ] = useState({
    name: "",
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

    const name =
      form.name.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    if (
      !name ||
      !email ||
      !form.password
    ) {
      setError(
        "Complete all fields before creating your account."
      );

      return;
    }

    if (
      form.password.length <
      8
    ) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await api.post(
          "/api/auth/register",
          {
            name,
            email,
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
          "Registration response did not include an authentication token."
        );
      }

      /*
       * Temporary compatibility keys.
       * Rename globally after all
       * frontend pages are migrated.
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

      /*
       * AzureDrop has one secure
       * Azure Blob storage workflow,
       * so no separate storage-choice
       * onboarding is required.
       */
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
          "Unable to create your account. Please try again."
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

              BUILT FOR PRIVACY
            </div>

            <h1>
              Your secure
              <span>
                {" "}
                Azure workspace.
              </span>
            </h1>

            <p>
              Create your AzureDrop
              account and start storing,
              organizing and sharing
              files through a secure
              Azure-native workflow.
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
                    Azure Blob Storage
                  </strong>

                  <small>
                    Uploads are stored
                    in a private Blob
                    container.
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
                    PostgreSQL metadata
                  </strong>

                  <small>
                    Searchable metadata,
                    categories and share
                    records stay
                    organized.
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
                    Secure sharing
                  </strong>

                  <small>
                    Generate expiring
                    links without
                    exposing containers
                    publicly.
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
                Ready
              </span>
            </div>

            <div className="auth-service-chip blob">
              <Cloud size={15} />
              Blob Storage
            </div>

            <div className="auth-service-chip postgres">
              <Database size={15} />
              PostgreSQL
            </div>

            <div className="auth-service-chip files">
              <FileText size={15} />
              File sharing
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-form-card">
            <div className="auth-form-heading">
              <span>
                GET STARTED
              </span>

              <h2>
                Create your account
              </h2>

              <p>
                Set up your AzureDrop
                workspace in seconds.
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
                  Full name
                </span>

                <div className="auth-input-wrap">
                  <User
                    size={17}
                  />

                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    value={
                      form.name
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
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    minLength={8}
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

                <small className="auth-field-help">
                  Minimum 8 characters.
                </small>
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

                    Creating account…
                  </>
                ) : (
                  <>
                    Create account

                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>
            </form>

            <div className="auth-next-step">
              <span>
                <Cloud size={18} />
              </span>

              <div>
                <strong>
                  Azure storage ready
                </strong>

                <p>
                  After registration
                  you’ll enter your
                  dashboard with the
                  secure Blob workflow
                  already configured.
                </p>
              </div>
            </div>

            <div className="auth-divider">
              <span>
                Already registered?
              </span>
            </div>

            <Link
              className="auth-secondary-action"
              to="/login"
            >
              Sign in instead

              <ArrowRight
                size={17}
              />
            </Link>

            <div className="auth-security-note">
              <Lock
                size={14}
              />

              <p>
                Files remain private
                and are accessed through
                authenticated or
                temporary signed
                requests.
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
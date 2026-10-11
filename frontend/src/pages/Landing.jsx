import {
  ArrowRight,
  Check,
  ChevronRight,
  Cloud,
  Database,
  FileSearch,
  Files,
  HardDrive,
  LockKeyhole,
  Menu,
  Server,
  Share2,
  ShieldCheck,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import "./Landing.css";

const features = [
  {
    icon: UploadCloud,
    title: "Secure file uploads",
    description:
      "Upload supported documents, images, spreadsheets, archives and text files through an authenticated workflow.",
  },
  {
    icon: Cloud,
    title: "Azure Blob Storage",
    description:
      "Files are stored as private Azure Blob objects instead of being exposed through public storage URLs.",
  },
  {
    icon: FileSearch,
    title: "Search & categories",
    description:
      "Find files quickly using searchable metadata and automatic categories maintained alongside every upload.",
  },
  {
    icon: Share2,
    title: "Temporary sharing",
    description:
      "Create expiring share links while keeping the underlying Azure Blob container private.",
  },
  {
    icon: Database,
    title: "PostgreSQL metadata",
    description:
      "File records, descriptions, categories, users and temporary share data stay organized in PostgreSQL.",
  },
  {
    icon: ShieldCheck,
    title: "Security by design",
    description:
      "JWT authentication, private storage and short-lived access URLs keep the application workflow controlled.",
  },
];

const architecture = [
  {
    label: "Frontend",
    value: "React + Vite",
  },
  {
    label: "API",
    value: "Node.js + Express",
  },
  {
    label: "Database",
    value: "PostgreSQL",
  },
  {
    label: "Storage",
    value: "Azure Blob Storage",
  },
  {
    label: "Deployment",
    value: "Docker + Nginx",
  },
  {
    label: "Automation",
    value: "GitHub Actions",
  },
];

const securityItems = [
  "Authenticated file operations",
  "Private Azure Blob container",
  "Short-lived signed downloads",
  "Expiring public share links",
];

export default function Landing() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="azure-landing">
      <header className="azure-landing-header">
        <div className="azure-landing-container azure-nav">
          <Link
            className="azure-landing-brand"
            to="/"
            aria-label="AzureDrop home"
          >
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
                Secure cloud storage
              </small>
            </div>
          </Link>

          <nav className="azure-desktop-nav">
            <a href="#features">
              Features
            </a>

            <a href="#security">
              Security
            </a>

            <a href="#architecture">
              Architecture
            </a>

            <a href="#workflow">
              Workflow
            </a>
          </nav>

          <div className="azure-nav-actions">
            <Link
              className="azure-nav-login"
              to="/login"
            >
              Sign in
            </Link>

            <Link
              className="azure-nav-register"
              to="/register"
            >
              Create account

              <ArrowRight
                size={16}
              />
            </Link>

            <button
              className="azure-mobile-toggle"
              type="button"
              aria-label="Open navigation"
              onClick={() =>
                setMobileMenuOpen(
                  (current) =>
                    !current
                )
              }
            >
              {mobileMenuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="azure-mobile-menu">
            <a
              href="#features"
              onClick={closeMenu}
            >
              Features
            </a>

            <a
              href="#security"
              onClick={closeMenu}
            >
              Security
            </a>

            <a
              href="#architecture"
              onClick={closeMenu}
            >
              Architecture
            </a>

            <a
              href="#workflow"
              onClick={closeMenu}
            >
              Workflow
            </a>

            <Link
              to="/login"
              onClick={closeMenu}
            >
              Sign in
            </Link>

            <Link
              className="primary"
              to="/register"
              onClick={closeMenu}
            >
              Create account
            </Link>
          </div>
        )}
      </header>

      <main>
        <section className="azure-hero">
          <div className="azure-hero-grid" />
          <div className="azure-hero-glow one" />
          <div className="azure-hero-glow two" />

          <div className="azure-landing-container azure-hero-layout">
            <div className="azure-hero-copy">
              <div className="azure-hero-kicker">
                <Zap size={14} />

                AZURE-NATIVE FILE STORAGE
              </div>

              <h1>
                Secure files.
                <br />

                <span>
                  Simple sharing.
                </span>

                <br />

                Built for Azure.
              </h1>

              <p>
                AzureDrop is a secure
                cloud file platform for
                uploading, organizing,
                searching and sharing
                files through Azure Blob
                Storage and PostgreSQL.
              </p>

              <div className="azure-hero-actions">
                <Link
                  className="azure-primary-button"
                  to="/register"
                >
                  Start with AzureDrop

                  <ArrowRight
                    size={18}
                  />
                </Link>

                <a
                  className="azure-secondary-button"
                  href="#architecture"
                >
                  View architecture

                  <ChevronRight
                    size={17}
                  />
                </a>
              </div>

              <div className="azure-trust-row">
                <span>
                  <Check size={14} />
                  Private by default
                </span>

                <span>
                  <Check size={14} />
                  Expiring shares
                </span>

                <span>
                  <Check size={14} />
                  Azure Blob backed
                </span>
              </div>
            </div>

            <div className="azure-hero-platform">
              <div className="azure-platform-header">
                <div>
                  <span>
                    LIVE ARCHITECTURE
                  </span>

                  <strong>
                    AzureDrop platform
                  </strong>
                </div>

                <div className="azure-platform-status">
                  <span />
                  Ready
                </div>
              </div>

              <div className="azure-platform-flow">
                <div className="azure-flow-node user">
                  <div>
                    <Files size={20} />
                  </div>

                  <span>
                    User
                  </span>

                  <small>
                    Upload / search / share
                  </small>
                </div>

                <div className="azure-flow-connector">
                  <span />
                </div>

                <div className="azure-flow-node api">
                  <div>
                    <Server size={20} />
                  </div>

                  <span>
                    AzureDrop API
                  </span>

                  <small>
                    Node.js + Express
                  </small>
                </div>

                <div className="azure-flow-branches">
                  <div />

                  <span />

                  <div />
                </div>

                <div className="azure-flow-destinations">
                  <div>
                    <span className="icon blob">
                      <Cloud size={19} />
                    </span>

                    <strong>
                      Blob Storage
                    </strong>

                    <small>
                      Private files
                    </small>
                  </div>

                  <div>
                    <span className="icon database">
                      <Database
                        size={19}
                      />
                    </span>

                    <strong>
                      PostgreSQL
                    </strong>

                    <small>
                      Metadata
                    </small>
                  </div>
                </div>
              </div>

              <div className="azure-platform-footer">
                <span>
                  <ShieldCheck
                    size={15}
                  />
                  Authenticated
                </span>

                <span>
                  <LockKeyhole
                    size={15}
                  />
                  Private storage
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="azure-proof-strip">
          <div className="azure-landing-container azure-proof-grid">
            <div>
              <strong>
                Azure
              </strong>

              <span>
                Cloud platform
              </span>
            </div>

            <div>
              <strong>
                Blob
              </strong>

              <span>
                Object storage
              </span>
            </div>

            <div>
              <strong>
                PostgreSQL
              </strong>

              <span>
                Metadata layer
              </span>
            </div>

            <div>
              <strong>
                Docker
              </strong>

              <span>
                Containerized
              </span>
            </div>

            <div>
              <strong>
                GitHub
              </strong>

              <span>
                CI/CD workflow
              </span>
            </div>
          </div>
        </section>

        <section
          className="azure-section azure-features"
          id="features"
        >
          <div className="azure-landing-container">
            <div className="azure-section-heading centered">
              <span>
                PLATFORM FEATURES
              </span>

              <h2>
                Everything needed for
                secure file management.
              </h2>

              <p>
                AzureDrop combines
                storage, metadata,
                search and controlled
                sharing without turning
                cloud storage into a
                public file server.
              </p>
            </div>

            <div className="azure-feature-grid">
              {features.map(
                (feature) => {
                  const Icon =
                    feature.icon;

                  return (
                    <article
                      key={
                        feature.title
                      }
                    >
                      <div>
                        <Icon
                          size={21}
                        />
                      </div>

                      <h3>
                        {
                          feature.title
                        }
                      </h3>

                      <p>
                        {
                          feature.description
                        }
                      </p>
                    </article>
                  );
                }
              )}
            </div>
          </div>
        </section>

        <section
          className="azure-section azure-workflow-section"
          id="workflow"
        >
          <div className="azure-landing-container azure-workflow-layout">
            <div className="azure-workflow-copy">
              <span>
                FILE WORKFLOW
              </span>

              <h2>
                From upload to secure
                sharing.
              </h2>

              <p>
                Every file passes
                through an authenticated
                application workflow,
                with its binary content
                and metadata handled
                separately.
              </p>

              <div className="azure-workflow-points">
                <div>
                  <span>
                    01
                  </span>

                  <div>
                    <strong>
                      Authenticate
                    </strong>

                    <p>
                      Sign in before
                      accessing private
                      file operations.
                    </p>
                  </div>
                </div>

                <div>
                  <span>
                    02
                  </span>

                  <div>
                    <strong>
                      Upload
                    </strong>

                    <p>
                      Validated files are
                      stored in Azure
                      Blob Storage.
                    </p>
                  </div>
                </div>

                <div>
                  <span>
                    03
                  </span>

                  <div>
                    <strong>
                      Organize
                    </strong>

                    <p>
                      Metadata and
                      categories are
                      recorded in
                      PostgreSQL.
                    </p>
                  </div>
                </div>

                <div>
                  <span>
                    04
                  </span>

                  <div>
                    <strong>
                      Share
                    </strong>

                    <p>
                      Generate temporary
                      links when external
                      access is needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="azure-workflow-card">
              <div className="azure-workflow-card-header">
                <div>
                  <Cloud size={20} />
                </div>

                <span>
                  AzureDrop
                  <small>
                    File lifecycle
                  </small>
                </span>
              </div>

              <div className="azure-lifecycle">
                <div>
                  <UploadCloud
                    size={18}
                  />

                  <span>
                    Upload
                  </span>
                </div>

                <i />

                <div>
                  <HardDrive
                    size={18}
                  />

                  <span>
                    Store
                  </span>
                </div>

                <i />

                <div>
                  <FileSearch
                    size={18}
                  />

                  <span>
                    Find
                  </span>
                </div>

                <i />

                <div>
                  <Share2
                    size={18}
                  />

                  <span>
                    Share
                  </span>
                </div>
              </div>

              <div className="azure-workflow-storage">
                <div>
                  <Cloud size={17} />

                  <span>
                    <strong>
                      Azure Blob
                    </strong>

                    Private objects
                  </span>
                </div>

                <div>
                  <Database size={17} />

                  <span>
                    <strong>
                      PostgreSQL
                    </strong>

                    File metadata
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="azure-section azure-security-section"
          id="security"
        >
          <div className="azure-landing-container azure-security-layout">
            <div className="azure-security-card">
              <div className="azure-security-shield">
                <ShieldCheck
                  size={42}
                />
              </div>

              <strong>
                Private by design
              </strong>

              <span>
                Controlled access
              </span>

              <div className="azure-security-rings one" />
              <div className="azure-security-rings two" />
            </div>

            <div className="azure-security-copy">
              <span>
                SECURITY MODEL
              </span>

              <h2>
                Storage should not need
                to be public to be
                useful.
              </h2>

              <p>
                AzureDrop keeps Blob
                objects private and
                exposes access only
                through authenticated
                application actions or
                time-limited share
                workflows.
              </p>

              <div className="azure-security-list">
                {securityItems.map(
                  (item) => (
                    <div key={item}>
                      <Check
                        size={15}
                      />

                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          className="azure-section azure-architecture-section"
          id="architecture"
        >
          <div className="azure-landing-container">
            <div className="azure-section-heading">
              <span>
                SYSTEM ARCHITECTURE
              </span>

              <h2>
                Built as a complete
                cloud and DevOps
                project.
              </h2>

              <p>
                The application combines
                frontend, API, database,
                cloud storage,
                containerization and
                deployment automation.
              </p>
            </div>

            <div className="azure-architecture-grid">
              {architecture.map(
                (item) => (
                  <article
                    key={
                      item.label
                    }
                  >
                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {item.value}
                    </strong>
                  </article>
                )
              )}
            </div>

            <div className="azure-deployment-note">
              <Server size={20} />

              <div>
                <strong>
                  Production deployment
                  target
                </strong>

                <p>
                  Azure VM → Node.js API
                  → Azure Blob Storage +
                  PostgreSQL, fronted by
                  Nginx and automated
                  through GitHub Actions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="azure-final-cta">
          <div className="azure-final-glow" />

          <div className="azure-landing-container azure-final-layout">
            <div>
              <span>
                AZUREDROP
              </span>

              <h2>
                Your files deserve a
                better cloud workflow.
              </h2>

              <p>
                Upload, organize,
                download and share from
                one secure Azure-backed
                workspace.
              </p>
            </div>

            <div>
              <Link
                to="/register"
              >
                Create your account

                <ArrowRight
                  size={18}
                />
              </Link>

              <Link
                to="/login"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="azure-landing-footer">
        <div className="azure-landing-container azure-footer-layout">
          <div className="azure-footer-brand">
            <span>
              <Cloud size={19} />
            </span>

            <strong>
              Azure
              <em>
                Drop
              </em>
            </strong>
          </div>

          <nav>
            <a href="#features">
              Features
            </a>

            <a href="#security">
              Security
            </a>

            <a href="#architecture">
              Architecture
            </a>
          </nav>

          <span>
            © 2026 AzureDrop
          </span>
        </div>
      </footer>
    </div>
  );
}
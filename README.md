# AzureDrop — Secure Cloud Storage Platform

[![AzureDrop CI/CD](https://github.com/Semicrypt/azuredrop/actions/workflows/ci.yml/badge.svg)](https://github.com/Semicrypt/azuredrop/actions/workflows/ci.yml)

AzureDrop is a secure cloud file-storage platform built as a Cloud/DevOps capstone project. It combines a React frontend, Node.js/Express API, PostgreSQL metadata storage, Azure Blob-compatible object storage, Docker, Terraform, GitHub Actions CI/CD, Nginx, HTTPS, and Kubernetes.

The application supports authenticated file management, private storage, temporary public sharing, health monitoring, automated deployment, and persistent local/cloud environments.

> **Architecture note:** Microsoft Azure is the intended production target. The Azure infrastructure is defined and validated with Terraform. Because Azure subscription/free-credit access was unavailable during the capstone, the live demonstration environment is hosted on AWS EC2 while retaining Azure Blob-compatible storage through Azurite. This distinction is intentional and documented throughout the project.

## Live Demo

**Production:** https://13.48.161.78

**Health endpoint:** https://13.48.161.78/health

The live environment is served over HTTPS through Nginx and is automatically deployed from `main` by GitHub Actions using GitHub OIDC, AWS IAM, and AWS Systems Manager.

> The demonstration host may be stopped after the capstone to control cloud costs.

---

## Architecture

![AzureDrop Architecture](docs/architecture/azuredrop-architecture.png)

### Target Azure architecture

```text
Users / Browser
      |
    HTTPS
      |
      v
   Azure VM
      |
     Nginx
   /       \
React      Node.js / Express API
              |             |
              v             v
      Azure Blob Storage  PostgreSQL
```

The intended Azure deployment consists of:

- **Azure VM** running the containerized application stack.
- **Nginx** as the public reverse proxy and HTTPS entry point.
- **React + Vite** frontend.
- **Node.js + Express** backend API.
- **Azure Blob Storage** for private file/object storage.
- **PostgreSQL** for users, file metadata, and share-link metadata.
- **Managed Identity / secure credentials** for storage access.
- **Terraform** for infrastructure provisioning.

### Live demonstration architecture

The live demo uses the following equivalent deployment path:

```text
Internet
   |
 HTTPS
   |
AWS Elastic IP
   |
AWS EC2
   |
Docker Compose
   |
Nginx
 |     \
 |      Node.js API ---- PostgreSQL
 |             |
React          +-------- Azurite
```

AWS provides the compute host only. The application continues to use the Azure Storage SDK and Azure Blob-compatible APIs; **Azurite** provides the Blob Storage implementation in the demo environment.

---

## Core Features

- User registration and authentication with JWT.
- Secure login and protected application routes.
- File upload and download.
- File type and size validation.
- Automatic file categorization.
- File search and filtering.
- Private Blob storage.
- File metadata stored in PostgreSQL.
- Temporary public file-sharing links.
- Configurable link expiration.
- Share-link revocation.
- File deletion from both metadata and object storage.
- Application, database, and storage health monitoring.
- Persistent PostgreSQL and Blob data volumes.
- Responsive Azure-inspired frontend.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Node.js, Express |
| Authentication | JWT |
| Database | PostgreSQL 17 |
| Object Storage | Azure Blob Storage SDK / Azurite |
| Reverse Proxy | Nginx |
| Containers | Docker, Docker Compose |
| Infrastructure as Code | Terraform |
| CI/CD | GitHub Actions |
| Cloud target | Microsoft Azure |
| Live demo compute | AWS EC2 |
| CD authentication | GitHub OIDC → AWS IAM |
| Remote deployment | AWS Systems Manager |
| HTTPS | Let's Encrypt |
| Orchestration | Kubernetes / Minikube |

---

## Repository Structure

```text
azuredrop/
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── jest.config.js
│
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── docs/
│   └── architecture/
│       └── azuredrop-architecture.png
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── kubernetes/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.example.yaml
│   ├── postgres.yaml
│   ├── azurite.yaml
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── frontend-nginx.conf
│   └── kustomization.yaml
│
├── scripts/
│   └── deploy-production.sh
│
├── terraform/
│   ├── azure/
│   └── aws/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .env.production.example
└── README.md
```

---

## Application Design

### Frontend

The frontend is built with React and Vite and provides the user-facing AzureDrop workspace. Major capabilities include:

- Authentication screens.
- Dashboard overview.
- File library.
- Upload workflow.
- Search and category filtering.
- File details and metadata.
- Temporary sharing.
- Download and delete operations.
- Storage-health presentation.

In production, the compiled frontend is served by Nginx.

### Backend API

The backend is built with Node.js and Express. It handles:

- User authentication.
- File metadata.
- File upload orchestration.
- Azure Blob operations.
- Download URL generation.
- Temporary share-link creation and revocation.
- File deletion.
- Health checks.

The backend validates its required environment configuration at startup and fails fast when production settings are incomplete.

### PostgreSQL

PostgreSQL stores application metadata rather than binary file data. The schema includes:

- `users`
- `files`
- `share_links`

The database is persistent in both Docker Compose and Kubernetes environments.

### Azure Blob / Azurite

Binary files are stored separately from PostgreSQL.

- **Target Azure environment:** Azure Blob Storage.
- **Local development:** Azurite.
- **AWS live demo:** Azurite running privately inside the Docker network.

The application uses the Azure Storage SDK in all environments.

---

## Security Design

AzureDrop applies several security controls across the application and deployment pipeline:

- JWT-based authenticated access.
- Private Blob container design.
- File-size and file-type validation.
- Temporary, expiring share URLs.
- Revocable public share links.
- HTTPS for the public production endpoint.
- HTTP-to-HTTPS redirect through Nginx.
- Let's Encrypt certificate renewal using ACME webroot validation.
- Production secrets excluded from Git.
- Terraform state, `.tfvars`, and production `.env` files excluded from source control.
- PostgreSQL, backend, and Azurite ports are not publicly exposed in production.
- EC2 SSH access is restricted by security-group CIDR.
- GitHub Actions does not store the EC2 SSH private key.
- GitHub Actions authenticates to AWS using **OIDC short-lived credentials**.
- Production deployment is executed through **AWS Systems Manager**.
- AWS deployment IAM permissions are intentionally limited to the required deployment operations.

---

## Local Development

### Prerequisites

Install:

- Node.js 22+
- npm
- Docker
- Docker Compose
- Git

### 1. Clone the repository

```bash
git clone git@github.com:Semicrypt/azuredrop.git
cd azuredrop
```

### 2. Configure local environment

```bash
cp .env.example .env
```

Review `.env` and replace any placeholder values before starting the services.

### 3. Start PostgreSQL, Azurite, and the backend

```bash
docker compose up -d --build
```

Check the services:

```bash
docker compose ps
```

The backend development endpoint is exposed on the configured local API port.

### 4. Start the frontend

```bash
cd frontend
npm ci
npm run dev
```

Use the frontend environment example if configuration is required:

```bash
cp .env.example .env
```

---

## Production Docker Deployment

AzureDrop includes a dedicated production Compose stack.

### Configure production environment

```bash
cp .env.production.example .env.production
```

Set secure values for:

- PostgreSQL password.
- JWT secret.
- public application URL.
- CORS origin.
- Blob public endpoint.
- storage credentials/configuration.

Never commit `.env.production`.

### Build and start

```bash
docker compose \
  --env-file .env.production \
  -f docker-compose.prod.yml \
  up -d --build
```

### Check status

```bash
docker compose \
  --env-file .env.production \
  -f docker-compose.prod.yml \
  ps
```

The production stack contains:

- `azuredrop-web`
- `azuredrop-api`
- `azuredrop-postgres`
- `azuredrop-azurite`
- `azuredrop-storage-init`

---

## Health Monitoring

AzureDrop exposes:

```text
GET /health
```

A successful response includes the health of the API, PostgreSQL, and Blob storage:

```json
{
  "success": true,
  "status": "healthy",
  "service": "azuredrop-api",
  "database": "healthy",
  "storage": "healthy",
  "storageProvider": "azure_blob"
}
```

Production check:

```bash
curl -sS https://13.48.161.78/health | jq .
```

Health checks are also used by Docker, Kubernetes, and the CI/CD deployment gate.

---

## CI/CD Pipeline

Workflow:

```text
Feature Branch
      |
Pull Request
      |
      +---- Backend Tests
      |
      +---- Frontend Lint + Build
      |
      v
Merge to main
      |
GitHub Actions
      |
GitHub OIDC
      |
AWS IAM Deployment Role
      |
AWS Systems Manager
      |
EC2 Deployment
      |
Docker Compose Build / Up
      |
Health Verification
```

### Pull requests

Pull requests into `main` run:

1. Backend dependency installation.
2. PostgreSQL service initialization.
3. Azurite initialization.
4. Database migrations.
5. Backend automated tests.
6. Frontend lint.
7. Frontend production build.

Production deployment is intentionally skipped on pull-request events.

### Pushes to `main`

After CI succeeds, the production job:

1. Requests a GitHub OIDC token.
2. Assumes the dedicated AWS IAM deployment role.
3. Sends an AWS SSM command to the AzureDrop EC2 instance.
4. Updates the server checkout to the latest `main` commit.
5. Builds the production Docker images.
6. Runs the Docker Compose production stack.
7. Waits for application health.
8. Verifies the public HTTPS `/health` endpoint.
9. Fails the workflow if production is unhealthy.

No permanent AWS access keys or EC2 private SSH key are required by GitHub Actions.

---

## HTTPS

Production traffic is encrypted with a publicly trusted Let's Encrypt certificate for the static Elastic IP.

```text
HTTP :80
  |
  +---- /.well-known/acme-challenge/ → Certbot webroot
  |
  +---- all other traffic → 301 HTTPS redirect

HTTPS :443
  |
  +---- React frontend
  +---- /api/   → Node.js backend
  +---- /blob/  → Blob storage proxy
  +---- /health → application health endpoint
```

The certificate uses automated renewal and reloads the running Nginx container after successful renewal.

---

## Terraform

### Azure target infrastructure

The `terraform/azure` configuration defines the intended Azure environment, including:

- Resource Group.
- Virtual Network.
- Application subnet.
- PostgreSQL subnet.
- Network Security Group.
- Linux VM.
- Static public IP.
- Storage Account.
- Private Blob container.
- System-assigned Managed Identity.
- Storage Blob Data Contributor RBAC assignment.
- PostgreSQL Flexible Server.
- PostgreSQL database.
- Private DNS configuration.

Validate it with:

```bash
cd terraform/azure
terraform init
terraform fmt -check
terraform validate
terraform plan
```

The Azure configuration is the **target architecture** and was validated locally. It was not applied during the capstone because an eligible Azure subscription was unavailable.

### AWS live-demo infrastructure

The `terraform/aws` configuration provisions the live-demo infrastructure:

- VPC.
- Public subnet.
- Internet Gateway.
- Route table.
- Security Group.
- EC2 instance.
- Encrypted gp3 root disk.
- Elastic IP.
- SSH key-pair registration.
- EC2 SSM role and instance profile.
- GitHub OIDC provider.
- GitHub deployment role and policy.

> Running the AWS Terraform configuration creates billable cloud resources.

---

## Kubernetes / Minikube

AzureDrop also includes a local Kubernetes deployment for orchestration and deployment validation.

### Kubernetes resources

- Dedicated `azuredrop` namespace.
- ConfigMap.
- Secret template.
- PostgreSQL StatefulSet.
- PostgreSQL PVC.
- Azurite Deployment.
- Azurite PVC.
- Backend Deployment.
- Frontend Deployment.
- Internal Services.
- NodePort frontend Service.
- Startup probes.
- Readiness probes.
- Liveness probes.
- Resource requests and limits.

### Start Minikube

```bash
minikube start --driver=docker
```

### Build local Kubernetes images

```bash
docker build -t azuredrop-backend:k8s ./backend

docker build \
  --build-arg VITE_API_BASE_URL=/ \
  -t azuredrop-frontend:k8s \
  ./frontend
```

Load them into Minikube:

```bash
minikube image load azuredrop-backend:k8s
minikube image load azuredrop-frontend:k8s
minikube image load postgres:17-alpine
minikube image load mcr.microsoft.com/azure-storage/azurite:latest
```

### Create the namespace

```bash
kubectl apply -f kubernetes/namespace.yaml
```

### Create the database migration ConfigMap

```bash
kubectl create configmap \
  azuredrop-db-init \
  --namespace azuredrop \
  --from-file=001_initial_schema.sql=database/migrations/001_initial_schema.sql \
  --dry-run=client \
  -o yaml \
  | kubectl apply -f -
```

### Create local Kubernetes secrets

Generate values locally rather than committing real credentials:

```bash
POSTGRES_PASSWORD="$(openssl rand -hex 24)"
JWT_SECRET="$(openssl rand -hex 32)"
AZURITE_KEY='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=='

kubectl create secret generic \
  azuredrop-secrets \
  --namespace azuredrop \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=DATABASE_URL="postgresql://azuredrop:${POSTGRES_PASSWORD}@postgres:5432/azuredrop" \
  --from-literal=AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=${AZURITE_KEY};BlobEndpoint=http://azurite:10000/devstoreaccount1;" \
  --dry-run=client \
  -o yaml \
  | kubectl apply -f -

unset POSTGRES_PASSWORD JWT_SECRET AZURITE_KEY
```

### Deploy

```bash
kubectl apply -k kubernetes
```

Watch the workloads:

```bash
kubectl get pods -n azuredrop -w
```

Verify persistent storage:

```bash
kubectl get pvc -n azuredrop
```

Check application health:

```bash
MINIKUBE_IP="$(minikube ip)"

curl -sS \
  "http://${MINIKUBE_IP}:30080/health" \
  | jq .
```

Open:

```text
http://<MINIKUBE_IP>:30080
```

The tested local Minikube environment uses NodePort `30080`.

---

## Testing and Validation

### Backend tests

```bash
cd backend
npm ci
npm test -- --runInBand
```

The project has a passing backend automated test suite.

### Frontend validation

```bash
cd frontend
npm ci
npm run lint
npm run build
```

The current frontend build completes successfully. The linter may report non-blocking React `set-state-in-effect` warnings; these do not fail the build.

### Infrastructure validation

Azure Terraform:

```bash
cd terraform/azure
terraform validate
```

AWS Terraform:

```bash
cd terraform/aws
terraform validate
```

Kubernetes:

```bash
kubectl kustomize kubernetes > /tmp/azuredrop-kubernetes.yaml
kubectl apply --dry-run=client -f /tmp/azuredrop-kubernetes.yaml
```

---

## Deployment Results

The project has been validated in three environments:

| Environment | Purpose | Status |
|---|---|---|
| Docker Compose | Local application development | ✅ Validated |
| Minikube / Kubernetes | Container orchestration validation | ✅ Validated |
| AWS EC2 | Public live demonstration | ✅ Deployed |
| Azure Terraform | Target Azure infrastructure | ✅ Validated, not applied |

The public deployment has been tested for:

- Registration and login.
- File upload.
- File listing and metadata.
- Search and categories.
- Direct download.
- Temporary share-link creation.
- Public shared-file download.
- Share revocation.
- File deletion.
- Database health.
- Blob-storage health.
- HTTPS.
- Automated CI/CD deployment.

---

## DevOps Highlights

This project demonstrates practical experience with:

- Containerized multi-service application design.
- Infrastructure as Code.
- Azure architecture planning.
- AWS infrastructure provisioning.
- Secure GitHub-to-cloud federation with OIDC.
- Automated CI/CD.
- Remote server deployment through AWS SSM.
- Nginx reverse proxy configuration.
- HTTPS certificate management.
- Persistent relational and object storage.
- Kubernetes Deployments and StatefulSets.
- Kubernetes Services and NodePort networking.
- Kubernetes Secrets and ConfigMaps.
- PersistentVolumeClaims.
- Health probes and deployment health gates.
- Cloud cost-aware architecture decisions.

---

## Challenges and Solutions

### Azure subscription availability

**Challenge:** The team could not obtain usable Azure free/student credits for the live capstone deployment.

**Solution:** Azure remained the official target architecture and was fully defined with Terraform. AWS EC2 was used only as the public compute host for the demonstration, while Azurite preserved the Azure Blob API/storage model.

### Secure automated deployment

**Challenge:** GitHub-hosted runners have dynamic IP addresses, making a traditional SSH-only deployment incompatible with a tightly restricted SSH security-group rule.

**Solution:** GitHub Actions authenticates to AWS through OIDC and deploys through Systems Manager. This avoids opening SSH globally and avoids storing the EC2 private key in GitHub.

### Browser security restrictions over HTTP

**Challenge:** Modern browsers restricted clipboard access and blocked downloaded files when the production site was served over plain HTTP.

**Solution:** AzureDrop was moved to HTTPS using a publicly trusted certificate, Nginx TLS termination, HTTP-to-HTTPS redirects, and automated certificate renewal.

### Persistent data across container restarts

**Challenge:** Database and Blob data must survive container recreation.

**Solution:** Dedicated Docker volumes and Kubernetes PVCs provide persistent PostgreSQL and Azurite storage.

---

## Future Improvements

- Deploy the Terraform Azure architecture to a production Azure subscription.
- Replace Azurite with native Azure Blob Storage in the public environment.
- Use Azure Database for PostgreSQL Flexible Server for the live application.
- Add Azure Key Vault for secret management.
- Add private endpoints for Azure data services.
- Add observability with Prometheus and Grafana.
- Add centralized application logging.
- Add antivirus/malware scanning for uploaded files.
- Add object versioning and retention policies.
- Add email-based account verification and password reset.
- Add automated backups and disaster-recovery procedures.
- Introduce Kubernetes Ingress and HTTPS for the local orchestration environment.
- Add container image publishing through a registry such as GHCR or Azure Container Registry.
- Add automated Kubernetes manifest validation to CI.

---

## Project Objectives

AzureDrop was designed to demonstrate how a modern file-storage application can be engineered and operated using Cloud/DevOps practices rather than only application code.

The project objectives are to:

1. Build a functional secure file-storage platform.
2. Separate application metadata from object storage.
3. Design the application around Microsoft Azure services.
4. Containerize all major application services.
5. Define cloud infrastructure using Terraform.
6. Implement automated CI/CD.
7. Secure deployment authentication without long-lived cloud credentials.
8. Provide HTTPS for production traffic.
9. Validate container orchestration using Kubernetes.
10. Provide operational health checks and persistent storage.

---

## Team

**Group 1 — AzureDrop Capstone Project**

- **Nwachukwu Ifeanyi Divine**
- Add the remaining Group 1 member names here before final submission.

---

## Project Status

AzureDrop has completed the major application and DevOps implementation milestones:

- [x] Authentication
- [x] File upload/download
- [x] File validation
- [x] Categories and search
- [x] File metadata
- [x] Temporary share links
- [x] PostgreSQL
- [x] Azure Blob SDK / Azurite
- [x] Docker
- [x] Production Docker Compose
- [x] Nginx reverse proxy
- [x] HTTPS
- [x] Automated TLS renewal
- [x] Azure Terraform architecture
- [x] AWS Terraform live-demo infrastructure
- [x] GitHub Actions CI/CD
- [x] GitHub OIDC
- [x] AWS Systems Manager deployment
- [x] Kubernetes / Minikube
- [x] Persistent Kubernetes storage
- [x] Architecture diagram

---

## Acknowledgement

AzureDrop was developed as a practical Cloud/DevOps capstone focused on secure cloud architecture, automation, infrastructure provisioning, containerization, CI/CD, and orchestration.


# Task 5 — Deployment to Render

## 1. Overview

The Task Management application is deployed to Render using
container-based deployment (Path 2).

Both the backend and frontend are deployed using Docker images
published to GitHub Container Registry (GHCR). PostgreSQL is
provided as a managed database service by Render.

## 2. Live Application

- Frontend: https://task-manage-frontend-qov5.onrender.com
- Backend: https://task-manage-backend-x2v4.onrender.com
- Health endpoint: https://task-manage-backend-x2v4.onrender.com/api/health

## 3. Cloud Architecture

Browser
  |
  | HTTPS
  v
Frontend (React + Nginx)
  |
  | Browser API requests over HTTPS
  v
Backend (Node.js + Express)
  |
  | Internal database connection
  v
Render Managed PostgreSQL 17

All three services are hosted in Frankfurt (EU Central)
using free-tier instances.

## 4. Infrastructure Configuration

| Resource | Name | Technology |
|---|---|---|
| Frontend | task-manage-frontend | React, Nginx, Docker |
| Backend | task-manage-backend | Node.js, Express, Docker |
| Database | task-manage-db | PostgreSQL 17 |

### Database Configuration

- Database name: taskmanagement
- Database user: taskmanage_user
- Region: Frankfurt
- Connection: Internal Database URL
- External database access: Disabled
- Schema initialization: DB_SYNC=true

The application connects to PostgreSQL through Render's
private network. Database credentials are not committed
to the repository.

## 5. Backend Configuration

The backend uses the following runtime environment variables
configured in Render:

| Variable | Value |
|---|---|
| NODE_ENV | production |
| PORT | 5000 |
| DATABASE_URL | Render Internal Database URL (secret) |
| JWT_SECRET | Securely generated random secret |
| JWT_EXPIRES_IN | 7d |
| FRONTEND_URL | https://task-manage-frontend-qov5.onrender.com |
| DB_SYNC | true |

The production JWT secret was generated using OpenSSL
and is stored securely in Render.

Health check path: /api/health

No application source code changes were required for deployment.

## 6. Frontend Configuration

The frontend uses a multi-stage Docker build and serves
compiled production assets through Nginx.

The production API URL is supplied at build time using
the VITE_API_URL Docker build argument.

GitHub Actions repository variable:

PRODUCTION_API_URL=https://task-manage-backend-x2v4.onrender.com/api

No frontend runtime environment variables are required.

Health check path: /

The local Docker Compose configuration remains unchanged.

## 7. Continuous Integration and Deployment

The GitHub Actions workflow is defined in:

.github/workflows/ci.yml

The pipeline contains four dependent jobs:

1. ci
   - Install dependencies
   - Audit dependencies
   - Build backend and frontend
   - Run automated tests
   - Run lint checks

2. docker
   - Build and validate backend and frontend Docker images

3. publish
   - Publish multi-platform images to GHCR
   - Support linux/amd64 and linux/arm64
   - Apply latest, commit SHA and Git reference tags

4. deploy
   - Trigger Render deployment hooks
   - Deploy release-specific backend and frontend images
   - Execute only when a release tag beginning with v is pushed

### Workflow Triggers

| Event | CI | Docker | Publish | Deploy |
|---|---|---|---|---|
| Pull request to main | Yes | Yes | No | No |
| Push to main | Yes | Yes | Yes | No |
| Release tag push | Yes | Yes | Yes | Yes |

Deployment is dependent on successful completion of
the preceding pipeline jobs.

### GitHub Actions Configuration

Repository variable:

- PRODUCTION_API_URL

Repository secrets:

- RENDER_BACKEND_DEPLOY_HOOK
- RENDER_FRONTEND_DEPLOY_HOOK

Deployment hook URLs are sensitive credentials and must
not be exposed in source code or documentation.

## 8. Release Process

To create and deploy a future release, ensure that main
is synchronized with GitHub and all CI checks have passed.

For example, to release version v1.0.1:

    git tag -a v1.0.1 -m "Release v1.0.1"
    git push origin v1.0.1

GitHub Actions automatically builds, tests, publishes
and triggers deployment of the corresponding release images.

The deploy job uses the Render imgURL parameter to specify
the release-tagged Docker images.

A successful deployment hook request confirms that Render
accepted the request. Actual deployment completion must
be verified in the Render dashboard.

## 9. Container Registry

Backend package:
https://github.com/Samir-BK/task-manage/pkgs/container/task-manage-backend

Frontend package:
https://github.com/Samir-BK/task-manage/pkgs/container/task-manage-frontend

Both packages are publicly available.

The first automated deployment release was v1.0.0.

Release images:

    docker pull ghcr.io/samir-bk/task-manage-backend:v1.0.0
    docker pull ghcr.io/samir-bk/task-manage-frontend:v1.0.0

The published frontend images use the production API URL.
Local development should continue using Docker Compose
to build locally configured images.

## 10. Verification Results

The following checks were completed successfully:

- Backend Docker deployment
- Frontend Docker deployment
- PostgreSQL database connection
- Database schema initialization
- Public HTTPS accessibility
- Backend HTTP health checks
- Frontend HTTP health checks
- Production CORS configuration
- User registration and authentication
- Task creation, retrieval, modification and deletion
- Logout and subsequent login
- Data persistence across backend redeployment
- Release-specific Docker image publishing
- Automated backend and frontend deployments
- Post-release application functionality

The first automated release, v1.0.0, was successfully
deployed to both Render services on 26 November 2026.

Render confirmed Deploy Hook as the deployment trigger
and both services reported successful live deployments.

## 11. Implementation Evidence

CI/CD workflow:
https://github.com/Samir-BK/task-manage/blob/main/.github/workflows/ci.yml

Production frontend image publishing:
https://github.com/Samir-BK/task-manage/actions/runs/45822024671

Normal main-branch push with deployment skipped:
https://github.com/Samir-BK/task-manage/actions/runs/45827659528

Successful automated release deployment:
https://github.com/Samir-BK/task-manage/actions/runs/45828882431

Git release tag:
https://github.com/Samir-BK/task-manage/tree/v1.0.0

## 12. Challenges and Solutions

### Frontend API Configuration

The original frontend image contained a localhost API URL.
This was resolved by supplying the deployed backend URL
through a GitHub Actions repository variable and Docker
build argument.

### CORS Configuration

Render assigned unique public URLs to both web services.
The backend FRONTEND_URL environment variable was updated
to match the actual deployed frontend origin.

### Database Connectivity

The backend was configured to use the internal database
connection URL. External database access was disabled
to reduce unnecessary public exposure.

### Deployment Automation

Secure Render deployment hooks and release-tagged Docker
images were integrated into GitHub Actions to automate
production deployments without requiring manual intervention.

## 13. Limitations and Future Improvements

- Free Render web services may experience cold-start delays.
- The free PostgreSQL database expires on 26 December 2026.
- Existing health endpoints verify service responsiveness,
  rather than complete application and database readiness.
- Deployment hooks trigger deployments but do not wait
  for their completion within GitHub Actions.
- Per-client rate limiting behind Render's reverse proxy
  has not been independently verified.
- Rate-limit counters use in-memory storage.
- The application retains its original configuration
  fallbacks, making correct production environment
  configuration essential.
- Docker image tags are mutable. Digest-based deployments
  would provide stronger artifact immutability.
- Concurrent releases and coordinated rollback of both
  services are not explicitly managed by the workflow.
- Versioned database migrations and automated deployment
  smoke tests would improve production reliability.

These limitations are acceptable for the coursework scope
but should be addressed before using the application as
a long-term commercial production service.

## 14. Conclusion

The application was successfully deployed to Render using
container-based deployment and managed PostgreSQL.

Release-based CI/CD automation was implemented and verified
through the successful deployment of version v1.0.0.

The implementation satisfies the container-based deployment
requirements while preserving the original application
source code and local development configuration.

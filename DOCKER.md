# Docker Setup

## Overview

The Task Management System is containerized using Docker
and Docker Compose.

The application consists of three services:

| Service | Technology | Host Port |
|---------|------------|-----------|
| Frontend | React and Nginx | 8080 |
| Backend | Node.js 24 and Express | 5001 |
| Database | PostgreSQL 17 | Not exposed |

Both application images use multi-stage Docker builds
to separate build dependencies from production runtime
dependencies.

## Prerequisites

- Docker
- Docker Compose
- OpenSSL for generating local secrets

## Environment Configuration

From the repository root, generate a local `.env` file:

```bash
(umask 077; set -C; printf 'POSTGRES_PASSWORD=%s\nJWT_SECRET=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 64)" > .env)
```

The file contains two required environment variables:

- `POSTGRES_PASSWORD`: PostgreSQL database password.
- `JWT_SECRET`: Secret used for signing authentication tokens.

The command prevents accidental overwriting of an
existing `.env` file.

The `.env` file is excluded from Git and Docker build
contexts. Never commit credentials to the repository.

## Build and Start

From the repository root, run:

```bash
docker compose up --build -d
```

Docker Compose builds the frontend and backend images,
starts PostgreSQL, and creates the application network
and persistent database volume.

The backend waits until PostgreSQL passes its health check.

## Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:5001/api
- Health endpoint: http://localhost:5001/api/health

The frontend is served by Nginx using compiled production
assets instead of the Vite development server.

## Container Architecture

### Backend

- Multi-stage build using `node:24-slim`.
- TypeScript compiled during the build stage.
- Only production dependencies installed in the runtime stage.
- Runs as a non-root user.
- Environment variables supplied at runtime.
- Database schema included in the runtime image.

### Frontend

- Multi-stage build using `node:24-slim` and `nginx:alpine`.
- Production assets served by Nginx.
- React Router supported through Nginx SPA fallback.
- Production source maps disabled.
- API URL configured through the `VITE_API_URL` build argument.

### Database

- Uses the official `postgres:17-alpine` image.
- Accessible through the internal Docker Compose network.
- Database port is not published to the host.
- PostgreSQL readiness verified through a health check.
- Data stored in the `postgres_data` named volume.

## Useful Commands

Check container status:

```bash
docker compose ps
```

View application logs:

```bash
docker compose logs
```

Stop and remove containers while preserving database data:

```bash
docker compose down
```

Recreate containers using existing images:

```bash
docker compose up -d
```

Warning: `docker compose down -v` removes the database
volume and permanently deletes its stored data.

## Local Verification

The following functionality was successfully tested:

- Backend health endpoint.
- Frontend production asset serving.
- Nginx SPA routing fallback.
- User registration, login and logout.
- Task creation, modification and deletion.
- PostgreSQL record verification using SQL.
- Database persistence across container removal and recreation.

## Deployment Considerations

This Docker Compose configuration is intended for local
development and integration testing.

The frontend API URL is embedded at build time and must
be configured appropriately for external deployments.

Automatic database schema initialization is enabled
for local testing through `DB_SYNC=true`.

Production deployment requires appropriate secret
management, HTTPS, database access controls, migration
management and deployment-specific configuration.
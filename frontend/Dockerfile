# Stage 1: Build the frontend application
FROM node:24-slim AS builder

WORKDIR /app

# Copy dependency manifests and npm configuration
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install frontend dependencies
RUN npm ci --workspace frontend

# Copy frontend source code and build configuration
COPY frontend/src ./frontend/src
COPY frontend/index.html ./frontend/
COPY frontend/tsconfig*.json ./frontend/
COPY frontend/vite.config.ts ./frontend/

# Configure the backend API URL at build time
ARG VITE_API_URL=http://localhost:5001/api
ENV VITE_API_URL=${VITE_API_URL}

# Build production assets without source maps
RUN npm run build --workspace frontend -- --sourcemap false

# Stage 2: Serve the production frontend
FROM nginx:alpine AS runtime

# Copy production assets from the builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Replace default Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Document the HTTP port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
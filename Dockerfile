# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies
FROM base AS deps
# Reduce ECONNRESET / network flakiness: longer timeout, more retries, retry npm ci
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    (npm ci || (sleep 15 && npm ci) || (sleep 30 && npm ci))

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG APP_NAME
# validation: Print the name to be sure
RUN echo "Building app: ${APP_NAME}"

# Build the specific app
RUN npx nest build ${APP_NAME}

# 👇 Move the compiled app contents directly to dist (flattening the structure)
# This ensures main.js is at dist/main.js for all services
RUN cp -r dist/apps/${APP_NAME}/* dist/ && \
    rm -rf dist/apps

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retries 5 && \
    (npm ci --omit=dev || (sleep 15 && npm ci --omit=dev) || (sleep 30 && npm ci --omit=dev))

# 👇 Copy from dist directly (main.js will be at dist/main.js)
COPY --from=builder /app/dist ./dist

COPY --from=builder /app/libs/common/src/proto ./proto

# This command will now always find the file
CMD ["node", "dist/main.js"]
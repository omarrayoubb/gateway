# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies
FROM base AS deps
RUN npm ci

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
RUN npm ci --omit=dev

# 👇 Copy from dist directly (main.js will be at dist/main.js)
COPY --from=builder /app/dist ./dist

COPY --from=builder /app/libs/common/src/proto ./proto

# This command will now always find the file
CMD ["node", "dist/main.js"]
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

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# --- FIX IS HERE ---
# We copy the specific app's built files to a generic 'dist' folder
ARG APP_NAME
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist
# Copy proto files to a simpler path structure (/app/proto/)
COPY --from=builder /app/libs/common/src/proto ./proto
# Now we can just run main.js, regardless of the app name
CMD ["node", "dist/main.js"]
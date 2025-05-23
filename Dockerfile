# Use the official Node.js runtime as the base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if available)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments
ARG NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
# Set build-time environment variables from build arguments
ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV DATABASE_URL="postgresql://user:pass@host:5432/race"
ENV GOOGLE_CLIENT_ID="build-time-placeholder"
ENV GOOGLE_CLIENT_SECRET="build-time-placeholder"
ENV RESEND_API_KEY="build-time-placeholder"

# Generate Drizzle types
RUN pnpm run db:generate || echo "Skipping db:generate - may need database connection"

# Build the application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime environment variables that can be overridden
ENV DATABASE_URL="postgresql://user:pass@host:5432/race"
ENV GOOGLE_CLIENT_ID="your_google_client_id"
ENV GOOGLE_CLIENT_SECRET="your_google_client_secret"
ENV NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"
ENV RESEND_API_KEY="your_resend_api_key"

# Optional environment variables
ENV GITHUB_CLIENT_ID=""
ENV GITHUB_CLIENT_SECRET=""

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"] 
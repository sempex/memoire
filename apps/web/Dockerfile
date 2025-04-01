FROM --platform=linux/amd64 node:21-alpine AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
RUN addgroup --system --gid 1001 memoire
RUN adduser --system --uid 1001 captain --ingroup memoire 
RUN mkdir /app
RUN chown -R captain:memoire /app

FROM base AS builder
# Set working directory
WORKDIR /app
RUN yarn global add turbo pnpm
COPY . .
RUN turbo prune "@memoire/web" --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
RUN yarn global add pnpm
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=@memoire/web

FROM base AS runner
WORKDIR /app


COPY --from=installer --chown=captain:shiper /app/apps/web/next.config.ts .
COPY --from=installer --chown=captain:shiper /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=captain:shiper /app/apps/web/.next/standalone ./
COPY --from=installer --chown=captain:shiper /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=captain:shiper /app/apps/web/public ./apps/web/public

USER captain
CMD node apps/web/server.js

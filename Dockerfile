FROM node:20 AS build

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/web/package.json packages/web/
COPY packages/shared/package.json packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/ packages/shared/
COPY packages/web/ packages/web/

# Build web package
RUN pnpm --filter @qwerty-learner/web build

# Serve with nginx
FROM nginx:alpine
COPY packages/web/public/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/web/build /app

FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package*.json ./
RUN pnpm i
COPY . .

RUN --mount=type=cache,id=med-ai-saas-pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=app1 --prod /prod/app1

# New Stage for Exporting
FROM scratch AS export-stage
COPY --from=builder /prod/app1 /

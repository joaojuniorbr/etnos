FROM node:22-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npx turbo prune api --docker

FROM node:22-alpine AS installer
RUN apk add --no-cache libc6-compat bash openssl
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock

RUN HUSKY=0 CI=true yarn install --frozen-lockfile

FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

RUN yarn workspace api prisma:generate
RUN npx turbo build --filter=api

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/ .

EXPOSE 8080
CMD ["node", "apps/api/dist/main"]

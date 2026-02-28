FROM node:22-alpine AS builder
WORKDIR /app

COPY . .
RUN apk add --no-cache bash openssl
RUN yarn install --frozen-lockfile
RUN yarn build --filter=api...

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app ./

EXPOSE 8080
CMD ["node", "apps/api/dist/main"]
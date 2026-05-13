# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG NEXT_PUBLIC_STATION_API=http://localhost:4001
ARG NEXT_PUBLIC_BOOKING_API=http://localhost:4002
ENV NEXT_PUBLIC_STATION_API=$NEXT_PUBLIC_STATION_API
ENV NEXT_PUBLIC_BOOKING_API=$NEXT_PUBLIC_BOOKING_API

RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

RUN npm ci --only=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["npm", "start"]
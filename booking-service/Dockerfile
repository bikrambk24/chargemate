# Use official Node.js LTS Alpine image (lightweight)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source code
COPY . .

# Expose service port
EXPOSE 4002

# Docker health check (requires wget in alpine, so install it)
RUN apk add --no-cache wget

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
 CMD wget -qO- http://localhost:4002/health || exit 1

# Start the booking service
CMD ["node", "src/app.js"]

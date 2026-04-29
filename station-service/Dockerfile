# Stage 1: Build 
FROM node:18-alpine 
 
# Set working directory 
WORKDIR /app 
 
# Copy package files first to leverage Docker layer caching 
COPY package*.json ./ 
 
# Install only production dependencies 
RUN npm ci --only=production 
 
# Copy the rest of the source code 
COPY . . 
 
# Expose service port 
EXPOSE 4001 
 
# Health check for Docker and AWS load balancer 
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \ 
 CMD wget -qO- http://localhost:4001/health || exit 1 
 
# Start the service 
CMD ["node", "src/app.js"] 

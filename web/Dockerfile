FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Development stage
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Production stage
FROM base AS production
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host"]

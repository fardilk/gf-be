# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install tools needed for NestJS + Prisma during build
RUN apk add --no-cache python3 make g++ bash

# Install pnpm + nest CLI
RUN npm install -g pnpm @nestjs/cli

# Copy dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Generate prisma client
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm prisma generate

# Build NestJS using local binary
RUN pnpm exec nest build


# ---- Runtime stage ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Copy build output & node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]

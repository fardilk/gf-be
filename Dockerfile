# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm + NestJS CLI
RUN npm install -g pnpm @nestjs/cli

# copy deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# install deps
RUN pnpm install --frozen-lockfile

# copy full source
COPY . .

# generate prisma
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm prisma generate

# build nest
RUN pnpm run build


# ---- Runtime stage ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]

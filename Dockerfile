# ---- Build stage ----
FROM node:22-alpine AS builder

# kerja di dalam /app
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# copy file dependency dulu
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# install semua dependency (dev + prod)
RUN pnpm install --frozen-lockfile

# copy seluruh source code
COPY . .

# generate prisma client (with dummy DATABASE_URL)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm prisma generate

# build nest ke folder dist
RUN pnpm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm

# copy package.json (buat info/metadata)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# copy node_modules dan dist dari builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]

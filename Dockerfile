# ---- Build stage ----
FROM node:22-alpine AS builder

# kerja di dalam /app
WORKDIR /app

# copy file dependency dulu
COPY package*.json ./

# install semua dependency (dev + prod)
RUN npm ci

# copy seluruh source code
COPY . .

# build nest ke folder dist
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# copy package.json (buat info/metadata)
COPY package*.json ./

# copy node_modules dan dist dari builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]

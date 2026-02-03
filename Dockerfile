# 1) dependencies (paketleri indir)
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install



# 2) build (next build)
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) run (prod ortamda çalıştır)
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# standalone çıktısını kopyala
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
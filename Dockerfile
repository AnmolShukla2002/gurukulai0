# 1. Dependency Stage: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# 2. Builder Stage: Build the Next.js app
FROM node:20-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 3. Runner Stage: Create the final production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]

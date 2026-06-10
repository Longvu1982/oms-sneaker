FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY app/frontend/package.json ./app/frontend/
COPY app/backend/package.json ./app/backend/

RUN npm ci --include=optional

# source only — node_modules come from npm ci above, not from host
COPY app ./app

# Generate Prisma client
RUN npx prisma generate --schema=app/backend/prisma/schema.prisma

# Build backend (if using TS)
RUN npm run build -w app/backend || true

EXPOSE 6060

CMD ["npm", "run", "start", "-w", "app/backend"]
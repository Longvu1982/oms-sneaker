FROM node:22-slim

WORKDIR /app

COPY package*.json ./
COPY app/frontend/package.json ./app/frontend/
COPY app/backend/package.json ./app/backend/

RUN npm ci --include=optional

# source only — node_modules come from npm ci above, not from host
COPY app ./app

RUN npm run build -w app/frontend

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "app/frontend/dist", "-l", "5173"]

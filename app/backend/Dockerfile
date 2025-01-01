# Base image
FROM node:20-alpine3.18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 6060

RUN npx prisma generate

CMD ["npm", "run", "dev"]
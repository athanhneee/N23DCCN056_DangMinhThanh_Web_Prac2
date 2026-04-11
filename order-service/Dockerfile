FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY package.json ./

ENV NODE_ENV=production

EXPOSE 3002

CMD ["node", "src/index.js"]

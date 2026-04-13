FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate

COPY src ./src

EXPOSE 3003

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]

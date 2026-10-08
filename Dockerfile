FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

ENV PORT=7860
EXPOSE 7860

CMD ["npm", "start"]

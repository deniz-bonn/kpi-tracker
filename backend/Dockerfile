FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p data
CMD ["sh", "-c", "node src/db/migrate.js && node src/index.js"]

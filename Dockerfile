FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ ./dist/
COPY server.json ./
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/http.js"]

FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY src/ ./src/
COPY tsconfig.json ./
COPY server.json ./
RUN npm ci --ignore-scripts
RUN npx tsc
RUN npm prune --omit=dev
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/http.js"]

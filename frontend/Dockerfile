FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4173

COPY --chown=node:node package.json ./package.json
COPY --chown=node:node server.js ./server.js
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 4173

CMD ["node", "server.js"]

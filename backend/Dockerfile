FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node src ./src

ENV NODE_ENV=production
ENV PORT=5000
ENV UPLOAD_DIR=/uploads

RUN mkdir -p /uploads && chown -R node:node /uploads /app

USER node

EXPOSE 5000

CMD ["npm", "start"]

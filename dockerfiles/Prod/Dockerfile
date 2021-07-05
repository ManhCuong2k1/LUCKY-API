## Build state
FROM node:14-alpine as build

WORKDIR /app

COPY . .

RUN apk add --no-cache git \
    && yarn install \
    && yarn build-ts \
    && yarn cache clean \
    && apk del git

EXPOSE 3040
CMD ["node", "dist/server.js"]

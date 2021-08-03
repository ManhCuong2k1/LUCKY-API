FROM node:14-alpine AS build
WORKDIR /app
COPY package*.json /app/
RUN apk add --no-cache git
RUN yarn
COPY tsconfig.json /app/
COPY src /app/src/
COPY public /app/src/
RUN yarn build-ts

FROM alpine:3
RUN apk add nodejs --no-cache
WORKDIR /app
COPY --from=build /app /app/
CMD node dist/server.js

FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json /app/
RUN apk add --no-cache git
RUN yarn
COPY tsconfig.json /app/
COPY src /app/src/
RUN yarn build-ts

FROM alpine:3
RUN apk add nodejs --no-cache
WORKDIR /app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package*.json /app/
COPY --from=build /app/dist /app/dist
COPY --from=build /app/src /app/src
CMD node dist/server.js

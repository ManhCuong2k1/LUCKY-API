FROM node:15.6.0-alpine
MAINTAINER vunv vunv@30shine.com

RUN apk add --no-cache tzdata
ENV TZ Asia/Ho_Chi_Minh
RUN apk add g++ make python
WORKDIR /app
COPY package.json /app/package.json
RUN yarn install
COPY . /app
RUN yarn build-ts
EXPOSE 3000
CMD ["yarn", "start"]
FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN yarn build
COPY . .
# EXPOSE 3000
CMD [ "node", "dist/server.js" ]

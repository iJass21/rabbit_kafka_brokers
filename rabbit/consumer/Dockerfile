FROM node:12.16.1-alpine3.11

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD tail -f /dev/null
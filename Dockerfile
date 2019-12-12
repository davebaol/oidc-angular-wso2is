# Stage 1

FROM node:12.4.0-alpine as node

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./

RUN apk add --update alpine-sdk

RUN npm install

COPY . .

RUN npm run build

# Stage 2

FROM nginx:alpine

COPY --from=node /usr/src/app/dist/giotto-um-fe /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf



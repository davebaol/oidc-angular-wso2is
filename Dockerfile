# Stage 1

FROM node:12.13.1-alpine3.10 as node
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --update alpine-sdk
RUN npm install
COPY . .
RUN npm run build

# Stage 2

FROM nginx:alpine
COPY --from=node /usr/src/app/dist/oidc-angular-wso2is /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
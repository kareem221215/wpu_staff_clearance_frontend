FROM node:24-alpine AS build

WORKDIR /src

RUN npm install -g npm@12.1

RUN npm install -g @angular/cli@22

COPY package*.json ./

RUN npm ci

COPY . ./

RUN ng build wpu-staff-clearance-frontend -c production

FROM nginx:stable-alpine AS final

COPY --from=build src/dist/wpu-staff-clearance-frontend/browser  /usr/share/nginx/html

COPY /nginx.conf  /etc/nginx/conf.d/default.conf

EXPOSE 80

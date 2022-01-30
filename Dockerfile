FROM node:latest
WORKDIR /usr/app
COPY *.json ./
RUN npm install
COPY . .
EXPOSE 8080

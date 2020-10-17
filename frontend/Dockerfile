FROM node:alpine as builder
WORKDIR /app
COPY package*.json ./

RUN npm install
RUN npm install -g serve
COPY . ./
RUN npm run build
CMD ["serve", "-s", "build", "-l", "3000"]

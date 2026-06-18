FROM node:18-alpine
WORKDIR /usr/src/app/gateway-service
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]

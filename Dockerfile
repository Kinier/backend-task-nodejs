FROM node:21.3.0

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT}

CMD [ "npm", "start" ]
FROM node:14-alpine

WORKDIR /app

COPY ./package.json ./

RUN apk add --no-cache make gcc g++ python2
RUN npm install
RUN npm rebuild bcrypt --build-from-source 
RUN apk del make gcc g++ python2

COPY . ./

EXPOSE 80
CMD ["npm","run","start"]

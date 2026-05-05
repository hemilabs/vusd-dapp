FROM node:24.14.1

WORKDIR /usr/src/site

COPY . .
RUN npm rebuild

CMD ["npm", "start"]

EXPOSE 3000

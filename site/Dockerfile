FROM node:16

WORKDIR /usr/src/site

COPY . .
RUN npm rebuild

CMD ["npm", "start"]

EXPOSE 3000

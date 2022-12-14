FROM node:14-alpine
WORKDIR /app
COPY . .
RUN ["npm","run","update-deps"]
RUN yarn 
CMD ["yarn", "start"]
EXPOSE 3000
FROM node:14-alpine

RUN apk add --no-cache --update \
  git 

WORKDIR /app
COPY . .
RUN ["npm","run","update-deps"]
RUN yarn 
CMD ["yarn", "start"]
EXPOSE 3000
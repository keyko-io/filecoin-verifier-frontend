# filecoin-verifier-fronend

## Description 
This is the fil+ UI. 

Here notaries can sign dataCap requests and RKHs can approve dataCap to multisigs and clients can apply for dataCap

## Run with docker-compose
This is the best method to run the application and to work on it.

This way also the back-end is automatically started

1. install docker compose [follow the docs](https://docs.docker.com/compose/install/)
2. contact the dev team to get the .env
3. paste the .env file in root folder
4. run `docker compose up`

> Since the volume mounted is the local src folder, any change in the application triggers yarn to recompile it, that way, there is no need to rebuild the app for each change

> It may take a few minutes to start the application at the first docker compose up

## Run using yarn
To run the application with yarn, run the following commands:

```
npm run update-deps
yarn
yarn start
```

## The .env file
This file is needed to run the application, and has the following structure:

```
# CHANGE REACT_APP_NETWORKS TO Localhost IF YOU WANT OT USE TEST ENVIRONMENT OR TO Mainnet IF YOU WANT TO USE PROD ENVIRONMENT
REACT_APP_NETWORKS=Localhost
REACT_APP_MODE=dev

REACT_APP_GITHUB_GENERIC_TOKEN=

REACT_APP_LOCAL_NODE_TOKEN=
REACT_APP_MAINNET_TOKEN=
REACT_APP_X_API_KEY=
REACT_APP_SECRET_RECIEVER_ADDRESS=
REACT_APP_STATUS_ISSUE_NUMBER=

# for back-end
GITHUB_CLIENT=
GITHUB_SECRET=
```



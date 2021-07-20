# Filecoin-verifier-frontend

## Nodejs version
Please, to build this project use node version v14.17.2 

to select the version of Node use the following command ```nvm use 14```

## Quick start

```
git submodule init
git submodule update (or git submodule update --recursive --remote)
yarn
yarn run start
```

## Interact with github

In order to make the app interact with github in a local envirnment you need to use a personal github token:

create a personal token on github from here: https://github.com/settings/tokens

create a .env file and paste the following line: 
``` 
REACT_APP_GITHUB_GENERIC_TOKEN= **generated_token** 
```
add the .env file to .gitignore

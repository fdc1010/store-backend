# Store Backend

## Directory Structure
```
.
├── bin -> executable program
├── configs -> where all configs store in js file
├── handlers -> all handler for routing goes here
├── middlewares -> all middleware configuration goes here
├── models -> all sequelize models
├── node_modules -> u know lah what it is
├── public -> directory to publish it on server
├── routes -> all routes config goes here
└── storage -> all file like data, or uploaded file goes here
```

## Installation (Development)
- Clone this project
- Run `npm run install` or `yarn dev`
- Duplicate file `.env.example` to `.env`
- Fill all required environment on `.env` file
- Run `npm run dev` or `yarn dev` to execute the program

## Instalation (Production)
- Incoming with docker or pm2

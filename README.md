# Store Backend

## Directory Structure
```
.
├── bin -> executable program
├── configs -> where all configs store in js file
└── crons -> <soon>
└── email-templates -> <soon>
├── handlers -> all handler for routing goes here
├── middlewares -> all middleware configuration goes here
├── migrations -> <soon>
├── mjml -> <soon>
├── models -> all sequelize models
├── node_modules -> u know lah what it is
├── public -> directory to publish it on server
├── routes -> all routes config goes here
└── storage -> all file like data, or uploaded file goes here
└── utils -> all script files needed as utilities / helpers
└── validators -> script files for validation of entries
```

## Installation (Development)
- Clone this project
- Run `npm run install` or `yarn dev`
- Duplicate file `.env.example` to `.env`
- Fill all required environment on `.env` file
- Run `npm run dev` or `yarn dev` to execute the program

## Installation (Production)
- docker
- pm2

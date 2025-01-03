# mathgame

This is a cloud based application that allows people to play games.

Key folders:
* [api](/../../tree/master/api) - Server Rendered UI and APIs. Including Handlebars and jQuery, with Node.js
* [ops](/../../tree/master/ops) - DevOps i.e. Docker, Nginx, Certificates, and Shell scripts
* [ui](/../../tree/master/ui) - Future React App (TODO)

See: [http://mathgame.com.au](http://mathgame.com.au)

## Environment Setup
Inside the folder `ops`, copy the file `.env.example` to `.env`
Setup your variables, including DOMAIN_NAME, POSTGRES values, and CERTIFICATES (currently using [https://porkbun.com/])

Inside the folder `api`, copy the file `.env.docker` to `.env`
Setup your variables, including JWT_SECRET, GOOGLE_CLIENT_ID, MATHGAME_COOKIE, DB values, etc

## Build the API
Go to folder `api`
Run:
```
npm run build
```

## Running using Docker
Build the application:
```
docker-compose -f ops/docker-compose.yml build
```
Run the application
```
docker-compose -f ops/docker-compose.yml up -d
```

Go to:
* https://localhost:443

## Development setup
To start this for development run:
```
cd api
npm run dev
```
* Go to http://localhost:5000

## Thanks
Thanks to the following for their inspiration:
* https://www.youtube.com/watch?v=zRo2tvQpus8 - Traversy Media, thanks Brad!
* https://github.com/bradtraversy/node_passport_login
* https://github.com/microsoft/TypeScript-Node-Starter
* https://getbootstrap.com/docs/4.0/components/carousel/ - Bootstrap is awesome
* My wife and daughter for their support

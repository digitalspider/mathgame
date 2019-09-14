# This process is broken down into 2 steps
# 1) Compile and optimised version of the web app within a build container
# 2) Copy the optimised code from the build container to the destination container

## Step 1
#FROM node:11-alpine AS builder
#WORKDIR /app
# Copy the UI to the container
#COPY ./ui .
#RUN npm install
# Setup any required env variables
# Here we are taking the argument provided by the docker file and injecting it into an env var
#ARG API_URL
#ENV REACT_APP_API_URL $API_URL
# RUN npm run build


## Step 2
FROM node:11-alpine
WORKDIR /app
# Copy the API dir to the container
COPY ./api .
RUN npm install
RUN npm run build
# Copy the build from the builder container
#COPY --from=builder /app/build ./web
EXPOSE 5000

# Lets GO! 
ENTRYPOINT  ["npm", "run", "start"]
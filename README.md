# demo-api-sequelize

Demo API using Sequelize connecting to MySQL

## requirements

Node v18.x

## installation

```sh
npm i
```

## configuration

```sh
# copy sample env file
cp .env_sample.env .env
# edit .env file
```

## execution

```sh
npm run start
```

## usage

```sh
# health check
curl --location 'http://localhost:8080'
curl --location 'http://localhost:8080/health'

# list of users
curl --location 'http://localhost:8080/users'

# create a user
curl --location 'http://localhost:8080/users' \
--header 'Content-Type: application/json' \
--data '{
  "username": "haci"
}'

# update a user
curl --location --request PATCH 'http://localhost:8080/users/1' \
--header 'Content-Type: application/json' \
--data '{
  "username": "haci111"
}'
```

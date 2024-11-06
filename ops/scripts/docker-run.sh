# Local
docker run --name mathgame --publish 5000:5000 --env-file=api/.env.docker --env-file=api/.env --add-host dockerhost:172.17.0.1 mathgame

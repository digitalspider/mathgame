# Local
docker run --name mathgame --publish 5000:5000 --env-file=api/.env.docker --add-host dockerhost:172.17.0.1 mathgame

yum install psql

docker pull pstgres:11.5
docker run --name mathgame-postgres -e POSTGRES_PASSWORD=mypassword -d postgres:11.5
docker exec -it mathgame-postgres psql -U postgres

# get IP
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mathgame-postgres
172.17.0.3

psql -h 172.17.0.3 -U postgres
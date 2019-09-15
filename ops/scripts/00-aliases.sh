# This file should be in /etc/profile.d/00-aliases.sh

# UTILS
alias upgrade='sudo apt update && sudo apt -y upgrade'

# AGT Docker commands
alias mathgame='docker exec -it mathgame /bin/sh -l'
alias mathstatus='docker ps --filter "name=mathgame"'
alias mathstart='docker start mathgame'
alias mathstop='docker stop mathgame'
alias mathrestart='docker restart mathgame'
alias mathlog='docker logs -t -f mathgame'

# AGT AWS commands
alias ecrlogin='$(aws --profile mathgame ecr get-login --no-include-email --region ap-southeast-2)'
alias mathclean='docker rm -f mathgame && docker rmi X.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame'
alias mathrun='ecrlogin && docker run -d --name=mathgame --publish=80:5000 --env-file ./.env --restart unless-stopped X.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame:latest'
alias s3pull='aws --profile mathgame s3 cp s3://agt-prod/.env .'
alias s3push='aws --profile mathgame s3 cp .env s3://agt-prod/.env --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers'

# PSQL commands
alias dblogin='export PGPASSWORD="password"'
alias mathsql='dblogin && psql -h DB.ap-southeast-2.rds.amazonaws.com -U mathgame mathgame'
alias games='dblogin && echo "select * from game" | psql -h DB.ap-southeast-2.rds.amazonaws.com -U mathgame mathgame'

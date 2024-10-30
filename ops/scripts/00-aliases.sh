# This file should be in /etc/profile.d/00-aliases.sh

# UTILS
alias upgrade='sudo apt update && sudo apt -y upgrade'
#alias functions
alias psql='function _psql(){ /c/Apps/PostgreSQL/17/bin/psql.exe $*; };_psql'
doc() { docker exec -it $1 /bin/bash -l; }

# MATHGAME Docker commands
alias mathgame='docker exec -it mathgame /bin/sh -l'
alias mathstatus='docker ps --filter "name=mathgame"'
alias mathstart='docker start mathgame'
alias mathstop='docker stop mathgame'
alias mathrestart='docker restart mathgame'
alias mathlog='docker logs -t -f mathgame'

# MATHGAME AWS commands
alias ecrlogin='$(aws --profile mathgame ecr get-login --no-include-email --region ap-southeast-2)'
alias mathclean='docker rm -f mathgame && docker rmi mathgame && docker rmi 640016856401.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame'
alias mathbuild='docker build -t mathgame .'
alias mathtag='docker tag mathgame:latest 640016856401.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame:latest'
alias mathpush='ecrlogin && docker push 640016856401.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame:latest'
alias mathrun='ecrlogin && docker run -d --name=mathgame --publish=5000:5000 --env-file ./.env -v ./mathgame.com.au:/app/mathgame.com.au --restart unless-stopped 640016856401.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame:latest'
alias s3pull='aws --profile mathgame s3 cp s3://mathgame/.env .'
alias s3push='aws --profile mathgame s3 cp .env s3://mathgame/.env --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers'

# PSQL commands
alias dblogin='export PGPASSWORD="password"'
alias mathsql='dblogin && psql -h DB.ap-southeast-2.rds.amazonaws.com -U mathgame mathgame'
alias games='dblogin && echo "select * from game" | psql -h DB.ap-southeast-2.rds.amazonaws.com -U mathgame mathgame'

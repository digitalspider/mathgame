# Local
docker run --name mathgame --publish 5000:5000 mathgame

#Remote
$(aws --profile mathgame ecr get-login --no-include-email --region ap-southeast-2)
buildid=$(aws --profile mathgame ecr list-images --repository mathgame | grep imageTag | grep build | cut -f 4 -d '"' | sort -rn | head -1)
docker run -d --name=mathgame --publish=5000:5000 --publish=5443:5443 --env-file ./.env -v /home/ec2-user/mathgame.com.au:/app/mathgame.com.au --restart unless-stopped 640016856401.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame:$buildid

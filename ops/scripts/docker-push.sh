#Local
docker build ./api -t mathgame

$(aws --profile mathgame ecr get-login --no-include-email --region ap-southeast-2)
export buildid=$(aws --profile mathgame ecr list-images --repository mathgame | grep imageTag | grep build | cut -f 4 -d '"' | sort -rn | head -1)
docker tag mathgame:latest 640016856401.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame:build-12
docker push 640016856401.dkr.ecr.ap-southeast-2.amazonaws.com/mathgame:build-12

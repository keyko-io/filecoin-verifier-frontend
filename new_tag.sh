#!/bin/bash



# get latest version
CURRENT_VERSION=`git describe --abbrev=0 --tags`
# CURRENT_VERSION="v1.9.9" #should give v2.0.0
# CURRENT_VERSION="v2.9.9" #should give v3.0.0
# CURRENT_VERSION="v1.8.9" #should give v1.9.0
# CURRENT_VERSION="v1.8.8" #should give v1.8.9
# CURRENT_VERSION="v10.9.9" #should give v11.0.0
echo "Current version of filecoin-verifier-frontend is: $CURRENT_VERSION"


CURRENT_VERSION_PARTS=(${CURRENT_VERSION//[v.]/ })

VNUM1=${CURRENT_VERSION_PARTS[0]}
VNUM2=${CURRENT_VERSION_PARTS[1]}
VNUM3=${CURRENT_VERSION_PARTS[2]}



if [[ $VNUM2$VNUM3 == 99 ]]
then
    echo $VNUM1$VNUM2$VNUM3
    VNUM2=0
    VNUM3=0
    VNUM1=$((VNUM1+1))

    echo "CIAO"
elif [[ $VNUM3 == 9 ]]
then
    VNUM2=$((VNUM2+1))
    VNUM3=0
else 
    VNUM3=$((VNUM3+1))
fi

NEW_TAG="v$VNUM1.$VNUM2.$VNUM3"

echo "Updating $CURRENT_VERSION  to $NEW_TAG"
echo "Dockerhub will automatically build a new image for tag $NEW_TAG"
echo "Please, upupdate docker-compose.yml with new tag to use it in development mode"

UPDATE_TAG=`git tag $NEW_TAG -a -m "annotation"`
echo $UPDATE_TAG
PUSH_TAG=`git push --tags`
echo $PUSH_TAG







#!/bin/bash
cd "$(dirname "$0")"
if [[ $1 == 'pull' ]]
then
	git pull
fi

if [[ $1 == 'clearcache' ]]
then
	(cd images/hs && rm *)
	(cd cache && echo "{}" > cached_images.json )
fi

npm update
node src/facebot.js
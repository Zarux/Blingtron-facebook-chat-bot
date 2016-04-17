#!/bin/bash
cd "$(dirname "$0")"
if [[ $1 == 'pull' ]]
then
	git pull
fi
(cd node_modules/facebook-chat-api && npm update)
node src/facebot.js
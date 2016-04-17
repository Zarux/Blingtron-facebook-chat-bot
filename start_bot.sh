#!/bin/bash
cd "$(dirname "$0")"
if [[ $1 == 'pull' ]]
then
	git pull
fi
if [[ $1 == 'full' ]]
then
	git pull
	(cd node_modules && npm update)
	(cd node_modules && rm -rf facebook-chat-api && git clone https://github.com/Schmavery/facebook-chat-api.git)
	(cd node_modules/facebook-chat-api && rm -rf .git)
fi
(cd node_modules/facebook-chat-api && npm update)
node src/facebot.js
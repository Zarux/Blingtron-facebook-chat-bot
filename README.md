# Blingtron-facebook-chat-bot
Facebook chat bot

This was made for personal use and is in no way, shape or form meant for commercial use

Simply use ./start_bot.sh [pull || full] and type in the email and pw of the account you want to run the bot from, after loggin in with password
your session will be stored in appstate.json.

The pull in startscript will pull from this repo

The full in startscript will pull from this repo, update all node_modules and make sure the facebook-chat-api is the master branch from githubrepo

To add custom commands :

Add it to custom_commands.json with the file key being the script to be run

Look at the commands already in there

The name came from the blingtron card in HS, this was originally a stock/hs bot. 
I just kept building on it, but the name stayed the same

* Proper comments       ☐
* Proper error handling ☐
* Pretty code ☐
* Works ☑

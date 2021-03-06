var login	= require("facebook-chat-api");
var request	= require('request');
var fs		 = require("fs");
var path	 = require('path');
var strftime = require('strftime');
var unirest	= require('unirest');
var log		= require('npmlog');
var cmdM	 = require("./commands");
var uf		= require("./util_functions.js");
var readline = require('readline');

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

process.chdir(path.dirname(fs.realpathSync(__dirname)));
var loginData = {"email":"","password":""};
try{
	loginData = {appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))};
	log.info("Using appstate.json");
	doLogin(loginData);
}catch(e){
	log.info("Using email and password");
	getEmail()
}

function getEmail(){
	rl.question('Email: ', (answer) => {
		loginData.email = answer;
		getPw();
	});
}

function getPw(){
	rl.question('Password: ', (answer) => {
		loginData.password = answer;
		doLogin(loginData);
		rl.close();
	});
}

var lastCheckUsers = {}
function doLogin(loginData){
	login(loginData, function callback (err, api) {
		if(err) return console.error(err);

		var myId = api.getCurrentUserID();
		fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

		api.setOptions({
			selfListen: true,
			forceLogin:true,
			listenEvents: true,
			logLevel:"silent"
		});
		var bot_config = JSON.parse(fs.readFileSync('src/config.json', 'utf8'));
		cmdM.meta.api = api;
		cmdM.meta.admins = bot_config.admins;
		uf.metaData.meta.api = api;
		uf.metaData.meta.admins = bot_config.admins;

		log.info("Begin listening for messages");
		var listening = api.listen(function(err, event) {
			if(err){
				console.log("Listen",err);
				process.exit(1);
			}
			var chatUsers = uf.metaData.chatUsers;
			var timeNow = Math.floor(Date.now() / 1000);
			if(chatUsers[event.threadID] == undefined || lastCheckUsers[event.threadID] < timeNow - 600 ){
				lastCheckUsers[event.threadID] == undefined ? lastCheckUsers[event.threadID] = 0 : lastCheckUsers[event.threadID] = timeNow;
				api.getThreadInfo(event.threadID,function(err,info){
					if(err){
						console.log("getThreadInfo",err);
						process.exit(1);
					}
					api.getUserInfo(info.participantIDs,function(err,users){
						uf.metaData.chatUsers[event.threadID]=users;
					});
				});
			}
			switch(event.type) {
				case "message":
					var serverMsg	= "";
					var eventStrtime = strftime('%F %T', new Date(event.timestamp*1));
					api.getUserInfo(event.senderID,function(err,ret){
						if(err){
							console.log("getUserInfo",err);
							process.exit(1);
						}

						var sender = ret[event.senderID].name;
						var body	 = event.body;

						if(body==undefined && event.attachments){
							body = "Attachment";
						}
						var type = "MESG";
						if(cmdM.meta.isCommand(body)){
							type = "CMND"		
						}
						if(event.senderID == myId){
							serverMsg=uf.prettifyMessage(false,eventStrtime,"DEBUG","Command completed");
							log.info(serverMsg);
						}else{
							serverMsg=uf.prettifyMessage(type,eventStrtime,sender,body);
							console.log(serverMsg);
						}
					});
					if(!event.body)
							return;
					if(event.senderID != myId) {
						var command	 = event.body.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
						var cmd		 = command[0];
						var args		= command.slice(1,command.length);
						var arguments = parseArgs(args,cmd);
						
						if(cmdM[cmd] && cmdM[cmd].run){
							cmdM[cmd].run(event.threadID,arguments,event.senderID);
					 		api.markAsRead(event.threadID, function(err) {
								if(err) console.log(err);
							});
						}
					}
					break;
				case "event":
					var serverMsg	= "";
					var eventStrtime = strftime('%F %T');
					api.getUserInfo(event.author,function(err,ret){
						if(err){
							console.log("getUserInfo",err);
							process.exit(1);
						}
						serverMsg=uf.prettifyMessage("EVNT",eventStrtime,ret[event.author].name,event.logMessageBody);
					console.log(serverMsg);
					});
				break;
			}
		});
	});
}

function parseArgs(args,cmd){
	var arguments = {};
	var nextSpecial = false;
	arguments['special']=[];
	arguments['value']=[];
	arguments['special_value']={};
	arguments['cmd']=cmd;

	for(i in args){
		args[i] = args[i].replace(/^"(.*)"$/, '$1');
		if(args[i].indexOf("--")>-1){
			arguments['special'].push(args[i]);
			nextSpecial = args[i];
		}else{
			if(nextSpecial != false){
				arguments['special_value'][nextSpecial] = args[i];
				nextSpecial = false;
			}
			arguments['value'].push(args[i]);
		}
	}
	return arguments;
}
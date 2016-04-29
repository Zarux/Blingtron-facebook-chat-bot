var login    = require("facebook-chat-api");
var $        = require("jquery");
var request  = require('request');
var fs       = require("fs");
var path     = require('path');
var strftime = require('strftime');
var unirest  = require('unirest');
var log      = require('npmlog');
var cmdM     = require("./commands");
var uf      = require("./util_functions.js");
var readline = require('readline');
delete require.cache[require.resolve('./commands.js')];

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

process.chdir(path.dirname(fs.realpathSync(__dirname)));
var loginData;
try{
	loginData = {appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))};
	log.info("Using appstate.json");
	doLogin(loginData);
}catch(e){
	var email, pw;
	log.info("Using email and password");
	rl.question('Email: ', (answer) => {
		email = answer;
			rl.question('Password: ', (answer2) => {
				pw = answer2;
				loginData = {email: email, password: pw};
				doLogin(loginData);
				rl.close();
		});
	});	
}

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
	    var cachedConvos = JSON.parse(fs.readFileSync('cache/cached_convos.json', 'utf8'));

	    cmdM.meta.api = api;
	    cmdM.meta.admins = bot_config.admins;
	    uf.metaData.meta.api = api;
	    uf.metaData.meta.admins = bot_config.admins;

	 	log.info("Begin listening for messages");
	    var listening = api.listen(function(err, event) {
	    	//console.log(event);
	        if(err) return console.error(err);
			switch(event.type) {
			  case "message":
	  			var serverMsg    = "";
	  			var eventStrtime = strftime('%F %T', new Date(event.timestamp*1));
	  			//console.log(event);
		    	api.getUserInfo(event.senderID,function(err,ret){
		    		if(err) return console.error(err);

		    		var sender = ret[event.senderID].name;
		    		var body   = event.body;

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
			    	var command   = event.body.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
			    	var cmd       = command[0];
			    	var args      = command.slice(1,command.length);
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
			  	var serverMsg    = "";
			  	var eventStrtime = strftime('%F %T');
			  	//console.log(event);
			  	api.getUserInfo(event.author,function(err,ret){
			  		if(err) return console.error(err);
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
	arguments['special']=[];
	arguments['value']=[];
	arguments['special_value']={};
	arguments['cmd']=cmd;
	//console.log(command);
	var nextSpecial = false;
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
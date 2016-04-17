var login = require("facebook-chat-api");
var $ = require("jquery");
var request = require('request');
var fs = require("fs")
var strftime = require('strftime');
var unirest = require('unirest');
var log = require('npmlog');
var randomOrgAPIkey =  "864b48e6-6597-4cb3-9c7f-1ddb43567631";
var util = require('util');
var uf      = require("./util_functions.js");
//var api = command.metadata.api;


/*
*******************
**               **
** All commands  **
**               **
*******************
*/
/*

Command:
key       - commandname
key.desc  - Description of command
key.help  - How to user command
key.inuse - Is the command in use
key.run   - The function to run when called


*/

var command = {
	'meta' : {
		api:undefined,
		inuse:false,
		admins : []
	},
	'!help':{
		desc : "View help for a command",
		help : "!help command",
		inuse: true
	},
	'!desc':{
		desc : "Show description of command",
		help : "!desc command",
		inuse: true
	},
	'!cmnds':{
		desc : "View all commands in use",
		inuse: true
	},
	'!title':{
		desc : "Change title of groupchat",
		help : "!title \"new title\"",
		inuse: true
	},
	'!hs':{
		desc : "Send image of HearthStone card",
		help : "!hs\n\"cardname\"\n[--gold]",
		inuse: true
	},
	'!stock':{
		desc : "View stockinfo of given symbols",
		help : "!stock\n\"symbols\"\n[--pe]\n[--peg]",
		inuse: true
	},
	'!quote':{
		desc : "Sends a random message from the thread",
		help : "!quote\n[--user \"name of sender\"]\n[--img]",
		inuse: true
	},
	'!test':{
		desc : "test",
		inuse: false
	},
	'!cat':{
		desc : "Random cat picture",
		inuse : true
	},
	'!shutdown':{
		inuse: false
	},
	'!random':{
		desc : "Random command",
		inuse : true
	}
}

/*
*******************
**               **
** Util commands **
**               **
*******************
*/
command['meta'].isCommand = function(str){
	var validCommand = [];

	for(i in command){
		if(i == "meta") continue;
		if (command[i].inuse) {
			validCommand.push(i);
		}
	}
	if(!str)
		return true;
	var cmd = str.split(" ")[0];
	return validCommand.indexOf(cmd) > -1;
}

command['!help'].run = function(threadID, args){
	var api     = command.meta.api;
	var message = {"body" : ""};
	if(args.value.length > 0)
		var value   = args.value[0];
	else{
		message.body+=command[args.cmd].help;
		sendMessage(message,threadID);
		return
	}

	if(command.meta.isCommand(value)){	
		if(command[value].help){
			message.body+=command[value].help;
		}else{
			message.body+="No help for that command";
		}
	}else{
		message.body+="Not a command";
	}
	sendMessage(message,threadID);
}

command['!desc'].run = function(threadID, args){
	var api     = command.meta.api;
	var message = {"body" : ""};
	if(args.value.length > 0)
		var value   = args.value[0];
	else{
		message.body+=command[args.cmd].desc;
		sendMessage(message,threadID);
		return
	}
	if(command.meta.isCommand(value)){	
		if(command[value].desc){
			message.body+=command[value].desc;
		}else{
			message.body+="No description for that command";
		}
	}else{
		message.body+="Not a command";
	}
	sendMessage(message,threadID);
}

command['!cmnds'].run = function(threadID, args){
	var api         = command.meta.api;
	var message     = {"body" : ""};
	var allCommands = Object.keys(command);

	for(i in command){
		var cmd = i;
		if(command.meta.isCommand(cmd)){
			message.body += cmd+"\n";
		}
	}
	sendMessage(message,threadID);
}

command['!test'].run = function(threadID,args){
	var api = command.meta.api;
	var special = args['special'][args.special.indexOf("--user")];
	var specialValue = getSpecialValue(special,args);
	var message = special+" "+specialValue;
	sendMessage(message,threadID);
}



/*
*******************
**               **
** User commands **
**               **
*******************
*/

command['!title'].run = function(threadID,args){
	var api = command.meta.api;
	api.setTitle(args['value'][0], threadID, function(err, msg){
		if(err) console.log(err);
	})
}

command['!hs'].run = function(threadID,args){
	var api = command.meta.api;
	unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/"+args['value'][0]+"?collectible=1")
	.header("X-Mashape-Key", "ktuzr2dxVemshoyXK3i5Y2MBl5iMp1mTvT3jsnHBoIFIZ3K8QT")
	.end(function (result) {

		var dataCount = 0;

		function getNextData(){
			var data = result.body[dataCount];
			dataCount++;
			if(data){
				return data;
			}
			return false;
		}


		function send(){
			var data = getNextData();
			if(!data){
				sendMessage("Nothing found", threadID);
				return;
			}

			var suffix     = ".png";
			var gold       = false;
			var cardimgurl = data.img;
			var cardname   = data.name;
		  	var cardId     = data.cardId;

			if(args.special.indexOf("--gold") > -1){
				cardimgurl = data.imgGold;
				gold = true;
				suffix = "_gold.gif";
			}
		  	
		  	if(!cardimgurl){
		  		send();
		  		return;
		  	}
		  	if(data.type=='Hero' && args.special.indexOf('--hero')==-1){
		  		send();
		  		return;
		  	}
		  	
		  	//console.log(cardimgurl);
		  	var fileName = encodeURIComponent(cardname.replace(" ","_").replace(".","-"))+suffix;
			//log.info("Fetching card ",cardId, cardname);

			var mesg = false;
			//Using Blingtron 3000 as alias for the bot, GVG_119 is the Blingtron 3000 card
			if(cardId == "GVG_119"){
				if(gold)
					mesg = "I'm so shiny";
				else
					mesg = "You like what you see?";
			}	
			sendPhotoFromUrl(threadID, mesg, cardimgurl,fileName,function(){
				var errorMsg = "Could not fetch "+(gold ? "gold " : "")+"image for "+cardname;
				sendMessage(message, threadID);
			});
			
		}
		send();
	});
}

command['!stock'].run = function(threadID,args){
	var api     = command.meta.api;
	var res     = [];
	var symbols = args['value'].join("%2C");
	var url     = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance%20.quotes%20where%20symbol%20in%20(%22dummy%2C"+symbols+"%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=&"+Date.now();
	
	request(url, function(error,response, body) {
		if (!error && response.statusCode == 200) {
		    var data = JSON.parse(body);
	 	} else {
		    console.log("Got an error: ", error, ", status code: ", response.statusCode);
	  	}
		var result = data.query.results.quote;
		var count  = data.query.count;
		//console.log(count);
		for(i in result){
			if(i == 0)continue;
			if(result[i].symbol == null){
				sendMessage("No symbol", threadID);	
				return
			}
			var resObj ={
				"symbol":result[i]["symbol"],
				"change":result[i]["PercentChange"],
				"price" :result[i]["Ask"],
				"pe":result[i]['PERatio'],
				"PEG":result[i]['PEGRatio']
			}
			res.push(resObj);
		}
		var message = {body: "Stocks: \n"};
		for(i in res){
			if(res[i]['change'] == null){
				message['body'] += res[i]['symbol'].toUpperCase()+": Not found\n--------\n";
				continue; 

			}
			message['body'] += res[i]['symbol'].toUpperCase()+": \n ASK: "+res[i]['price']+"USD\n";
			message['body'] +=  " PRC: "+res[i]['change']+"\n";

			if(args['special'].indexOf('--pe') > -1){
				message['body'] += " P/E: "+res[i]['pe']+"\n";
			}
			if(args['special'].indexOf('--peg') > -1){
				message['body'] += " PEG: "+res[i]['PEG']+"\n";
			}
			message['body'] += "--------\n";
		}
		sendMessage(message, threadID);	
	});	
}

command['!quote'].run = function(threadID, args){
	var api = command.meta.api;
	api.getThreadHistory(threadID,0,100000,null,function(err, history){
		if(err) console.log(err);
		var famousQ = args.special.indexOf("--famous");
		var moviesQ = args.special.indexOf("--movies");
		if(famousQ > -1 || moviesQ > -1){
			var category;
			var random = getRandomInt(0,2);

			if(random == 1){
				category = "famous"
			}else if(random==0){
				category = "movies";
			}
			
			unirest.post("https://andruxnet-random-famous-quotes.p.mashape.com/?cat="+category)
			.header("X-Mashape-Key", "ktuzr2dxVemshoyXK3i5Y2MBl5iMp1mTvT3jsnHBoIFIZ3K8QT")
			.header("Content-Type", "application/x-www-form-urlencoded")
			.header("Accept", "application/json")
			.end(function (result) {
			  if(result.status == 200){
			  	result.body = JSON.parse(result.body);
			  	sendMessage("\""+result.body.quote+"\"\n- "+result.body.author, threadID);
			  }else{
			  	sendMessage("No quote found. Try again later", threadID);
			  }
			});
			return;
		}
		var count = [];
		fs.writeFile('./dump1.txt', JSON.stringify(history, null, 2) , 'utf-8');
		function getRandomMessage(count){
			var idx     = getRandomInt(0,history.length);
			var message = {body: ""};
			var quote   = history[idx].body;
			var msgTime = strftime('%d-%m-%Y', new Date(history[idx].timestamp*1));

			if(count.indexOf(idx) > -1){
				return false;
			}
			count.push(idx);
			//Blocked users
			if(history[idx].senderName == "Facebook User"){
				history[idx].senderName = "Anonymous";
			}
			if(count.length == history.length){
				sendMessage("Sorry, i failed to find something.",threadID);
				return true;
			}
			if (history[idx].senderID == "fbid:"+api.getCurrentUserID()){
				return false;
			}
			if(args.special.indexOf('--user') > -1){
				var user = getSpecialValue("--user",args);
				if(history[idx].senderName.toLowerCase() != user.toLowerCase()){
					return false;
				}
			}
			var attachment = history[idx].attachments;
			if((attachment.length > 0 && args['special'].indexOf('--img') == -1) || (attachment.length == 0 && args['special'].indexOf('--img') > -1)){
				return false;
			}

			if(attachment.length > 0){
				if(attachment[0].type == 'photo' && history[idx].senderID != "fbid:"+api.getCurrentUserID()){
					sendPhotoFromUrl(threadID, history[idx].senderName+"\n("+msgTime+")", attachment[0].hiresUrl,attachment[0].name+".png");
					return true;
				}else{
					return false;
				}
			}
			if((attachment.length == 0 && quote == undefined) || command.meta.isCommand(quote)){
				return false;
			}		
			message['body']+= "\""+history[idx].body+"\"\n - "+history[idx].senderName+"\n ("+msgTime+")";
			sendMessage(message,threadID);
			return true;	
		}
		for (var i = 0; i < history.length; i++) {
			var done = getRandomMessage(count);
			if(done){
				break;
			}
		}
			
	});
}

command['!cat'].run = function(threadID){
	var count = 0;
	function getCat(){
		count++;
		if(count == 100){
			sendMessage("No cat found",threadID);	
			return;
		}
		if(getRandomInt(0,2) == 1){
			sendPhotoFromUrl(threadID,null,"http://thecatapi.com/api/images/get?format=src&type=gif",(Math.random() + 1).toString(36).substring(7)+".gif",function(){
				getCat();
			})
			return;
		}
		unirest.get("https://nijikokun-random-cats.p.mashape.com/random")
		.header("X-Mashape-Key", "ktuzr2dxVemshoyXK3i5Y2MBl5iMp1mTvT3jsnHBoIFIZ3K8QT")
		.header("Accept", "application/json")
		.end(function (result) {
		  if(result.status == 200 && result.body){
		  	sendPhotoFromUrl(threadID, null, result.body.source, (Math.random() + 1).toString(36).substring(7)+".png",function(){
		  		getCat();
		  	});
		  }else{
		  	getCat();
		  }
		});
	}
	getCat();
}

command['!shutdown'].run = function(threadID, args, senderID){
	if(command.meta.admins.indexOf(senderID*1) > -1){
		process.exit()
	}
}

command['!random'].run = function(threadID,args,senderID){
	function getRandomCommand(){
		var randomCommand = Object.keys(command);
		return randomCommand[getRandomInt(0,randomCommand.length)];
	}
	function runRandomCommand(){
		var commandToRun = getRandomCommand();
		if(command.meta.isCommand(commandToRun) && ['!help','!desc','!random','!title'].indexOf(commandToRun) == -1){
			command[commandToRun].run(threadID, args);
			return
		}else{
			runRandomCommand();
			return;
		}
	}
	runRandomCommand();
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getSpecialValue(arg, args){
	var specialValue = args['special_value'][arg];
	return specialValue;
}

function sendPhotoFromUrl(threadID, msg, imgurl, fileName, error){
	var api = command.meta.api;
	var fileName = "./images/"+fileName;
	request(imgurl).on('response',function(response){
		if(response.statusCode!=200){
			var message = uf.prettifyMessage(null,strftime('%F %T'),"DEBUG","Got status "+response.statusCode);
			log.error(message);
			if(typeof(error) == "function"){
				error();
			}
			return false;
		}
	}).pipe(fs.createWriteStream(fileName)).on('close',function(){
		var message = {
 			attachment: fs.createReadStream(fileName),
 			body: ""
		};
		if(msg){
			message['body']+=msg;
		}
    	sendMessage(message, threadID);
    	fs.unlink(fileName);
    	return true;
	});
}

function sendMessage(message, threadID, error){
	var api = command.meta.api;
	api.sendMessage(message, threadID,function(err, info){
		if(err){
			var message = uf.prettifyMessage(null,strftime('%F %T'),"DEBUG","Error when sending message: "+err.errorDescription);
			log.error(message);
			if(typeof(error) == "function"){
				error();
			}
		}
	});
}

module.exports = command;
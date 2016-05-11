var uf      = require("../src/util_functions.js");
var unirest = require('unirest');
var strftime = require('strftime');
var command = require("../src/commands.js");
var fs = require("fs");
module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	api.getThreadHistory(threadID,0,100000,null,function(err, history){
		if(err) console.log(err);
		getQuote(history,threadID, args, senderId);
	});	
}

function getQuote(history,threadID, args, senderId){
	var api = uf.metaData.meta.api;
	var famousQ = args.special.indexOf("--famous");
	var moviesQ = args.special.indexOf("--movies");
	if(famousQ > -1 || moviesQ > -1){
		var category;
		var random = uf.getRandomInt(0,2);

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
		  	uf.sendMessage("\""+result.body.quote+"\"\n- "+result.body.author, threadID);
		  }else{
		  	uf.sendMessage("No quote found. Try again later", threadID);
		  }
		});
		return;
	}
	var count = [];
	//fs.writeFile('./dump1.txt', JSON.stringify(history, null, 2) , 'utf-8');
	function getRandomMessage(count,user){
		var idx     = uf.getRandomInt(0,history.length);
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
			uf.sendMessage("Sorry, i failed to find something.",threadID);
			return true;
		}
		if (history[idx].senderID == "fbid:"+api.getCurrentUserID()){
			return false;
		}
		if(args.special.indexOf('--user') > -1){
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
				uf.sendPhotoFromUrl(threadID, history[idx].senderName+"\n("+msgTime+")", attachment[0].hiresUrl,attachment[0].name+".png");
				return true;
			}else{
				return false;
			}
		}
		if((attachment.length == 0 && quote == undefined) || command.meta.isCommand(quote)){
			return false;
		}		
		message['body']+= "\""+history[idx].body+"\"\n - "+history[idx].senderName+"\n ("+msgTime+")";
		uf.sendMessage(message,threadID);
		return true;	
	}
	var user = uf.getSpecialValue("--user",args);
	var user = uf.findMostLikelyName(threadID,user);
	if(!user){
		uf.sendMessage("Could not find that user",threadID);
		return true;
	}else if(typeof user != "string" && user.length>1){
		var msg ="";
		for(i in user){
			msg+=user+"\n";
		}
		uf.sendMessage("More than one user found\n"+msg,threadID);
		return true;
	}
	for (var i = 0; i < history.length; i++) {
		var done = getRandomMessage(count,user);
		if(done){
			break;
		}
	}
}
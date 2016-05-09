var login = require("facebook-chat-api");
var $ = require("jquery");
var request = require('request');
var fs = require("fs")
var strftime = require('strftime');
var unirest = require('unirest');
var log = require('npmlog');

var command = {
	meta :{
		api: null,
		admins:[]
	},
	cachedConvos:null,
	chatUsers:{}
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function isInArray(haystack,needle){
	return haystack.indexOf(needle) > -1;
}


function prettifyMessage(type,time,sender,mesg){
	var message="";
	var nameLength = 20;
	var nameWidth = sender.length;
	var spacesToAdd = nameLength-sender.length;
	var doDot = spacesToAdd < 0;
	if(type){
		message+=type;
		message+=" ";
	}
	message+="["+time+"]";
	if (doDot) {
		sender = sender.slice(0,nameLength);
		sender = sender.replaceAt(sender.length-3,".");
		sender = sender.replaceAt(sender.length-2,".");
		sender = sender.replaceAt(sender.length-1,".");
	}
	message+="["+sender+"]";
	for (var i = 0; i < spacesToAdd; i++) {
		message+=" ";
	}
	message+=": ";
	message+=mesg;

	return message;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getSpecialValue(arg, args){
	var specialValue = args['special_value'][arg];
	return specialValue;
}

function sendPhotoFromUrl(threadID, msg, imgurl, fileName, error,keep){
	var api = command.meta.api;
	var fileName = "./images/"+fileName;
	request(imgurl).on('response',function(response){
		if(response.statusCode!=200){
			var message = prettifyMessage(null,strftime('%F %T'),"DEBUG","Got status "+response.statusCode);
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
    	if(keep == undefined || keep!=true)
    		fs.unlink(fileName);
    	return true;
	});
}

function sendMessage(message, threadID, error){
	var api = command.meta.api;
	api.sendMessage(message, threadID,function(err, info){
		if(err){
			var message = prettifyMessage(null,strftime('%F %T'),"DEBUG","Error when sending message: "+err.errorDescription);
			log.error(message);
			if(typeof(error) == "function"){
				error();
			}
		}
	});
}

function getFilesize(filename) {
	try{
		var stats = fs.statSync(filename);
		var fileSizeInBytes = stats["size"]
		return fileSizeInBytes
	}catch(e){
		return 0;
	}
}

module.exports = {
	prettifyMessage  : prettifyMessage,
	isInArray        : isInArray,
	getRandomInt     : getRandomInt,
	getSpecialValue  : getSpecialValue,
	sendPhotoFromUrl : sendPhotoFromUrl,
	sendMessage      : sendMessage,
	metaData         : command,
	getFilesize      : getFilesize
}
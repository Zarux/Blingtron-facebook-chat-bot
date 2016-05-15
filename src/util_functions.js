var login = require("facebook-chat-api");
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


function getEditDistance(a, b){
  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }
  return matrix[b.length][a.length];
};

function findMostLikelyName(threadID,name){
	if(name == undefined || name == "" || !name){
		return 2;
	}
	var users = command.chatUsers[threadID];
	if(users == undefined){
		return name
	}
	var justNames = [];
	var likelyUsers = [];
	var name = name.toLowerCase();

	for(id in users){
		var cur = users[id];
		var name_user = cur.name.toLowerCase();
		justNames.push(name_user);
	}
	if(justNames.indexOf(name.toLowerCase()) > -1){
		return name;
	}
	for(i in justNames){
		var name_user = justNames[i].toLowerCase();
		var name_user_split = name_user.split(" ");
		var name_split = name.split(" ");
		var allbreak = false;
		for(i in name_user_split){
			for(j in name_split){
				if(name_user_split[i]==name_split[j]){
					likelyUsers.push(name_user);
					allbreak = true;
					break;
				}
			}
			if(allbreak){
				break;
			}
		}
	}
	var unique_users = likelyUsers.filter(function onlyUnique(value, index, self) { 
    	return self.indexOf(value) == index;
	});

	if(unique_users.length == 1){
		return unique_users[0];
	}else if(unique_users.length == 0){
		var lowest_edit_dist = 1024;
		var likelyUser = false;
		for(i in justNames){
			var cur_edit_dist = getEditDistance(name,justNames[i]);
			cur_edit_dist = cur_edit_dist/justNames[i].length;
			if(cur_edit_dist<lowest_edit_dist){
				lowest_edit_dist = cur_edit_dist;
				likelyUser=justNames[i];
			}
		}
		return likelyUser;
	}

	return unique_users;
}


module.exports = {
	prettifyMessage   : prettifyMessage,
	isInArray         : isInArray,
	getRandomInt      : getRandomInt,
	getSpecialValue   : getSpecialValue,
	sendPhotoFromUrl  : sendPhotoFromUrl,
	sendMessage       : sendMessage,
	metaData          : command,
	getFilesize       : getFilesize,
	findMostLikelyName: findMostLikelyName
}
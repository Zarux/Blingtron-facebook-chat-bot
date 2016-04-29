var login = require("facebook-chat-api");
var $ = require("jquery");
var request = require('request');
var fs = require("fs")
var strftime = require('strftime');
var unirest = require('unirest');
var log = require('npmlog');
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
		uf.sendMessage(message,threadID);
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
	uf.sendMessage(message,threadID);
}

command['!desc'].run = function(threadID, args){
	var api     = command.meta.api;
	var message = {"body" : ""};
	if(args.value.length > 0)
		var value   = args.value[0];
	else{
		message.body+=command[args.cmd].desc;
		uf.sendMessage(message,threadID);
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
	uf.sendMessage(message,threadID);
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
	uf.sendMessage(message,threadID);
}


/*
*******************
**               **
** User commands **
**               **
*******************
*/

var custom_commands = JSON.parse(fs.readFileSync('src/custom_commands.json', 'utf8'));

for(cmd in custom_commands){
	command[cmd]={};
	cm = command[cmd];
	if(custom_commands[cmd].help)
		cm.help = custom_commands[cmd].help;
	if(custom_commands[cmd].desc)
		cm.desc = custom_commands[cmd].desc;
	if(custom_commands[cmd].inuse != undefined)
		cm.inuse = custom_commands[cmd].inuse;
	else
		cm.inuse = true;
	if(custom_commands[cmd].file){
		cm.run=function(threadID,args,senderID){
			try{
				var doRun = require("../custom_commands/"+custom_commands[args.cmd].file);
				doRun(threadID,args,senderID);
			}catch(e){
				var message = uf.prettifyMessage(null,strftime('%F %T'),"DEBUG",e.message);
				log.error(message);
			}
		}
	}
}
module.exports = command;

var uf      = require("../src/util_functions.js");
var command = require("../src/commands.js");

module.exports=function(threadID, args, senderId){
	function getRandomCommand(){
		var randomCommand = Object.keys(command);
		return randomCommand[uf.getRandomInt(0,randomCommand.length)];
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
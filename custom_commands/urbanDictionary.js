var uf      = require("../src/util_functions.js");
var request = require("request");


module.exports = function(threadID, args, senderId){

	var term = "";
	if(args.value.length>0){
		term = args.value[0];
	}else{
		console.log(args);
		return;
	}
	var urban = require('urban');
	var def = urban(term);

	def.first(function(data) {
		var message = ""
	    message+=data.word.capitalizeFirstLetter()+"\n\n";
	    message+=data.definition.capitalizeFirstLetter()+"\n\n";
	    if(data.example){
	    	message+=data.example.capitalizeFirstLetter();
	    }
	    uf.sendMessage(message,threadID);
	});
}

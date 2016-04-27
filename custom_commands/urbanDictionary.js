var uf      = require("../src/util_functions.js");
var request = require("request");
var urban = require('urban');


module.exports = function(threadID, args, senderId){

	var term = "";
	var def;
	if(args.value.length>0){
		term = args.value[0];
		var def = urban(term);
	}else{
		def = urban.random();
	}

	def.first(function(data) {
		if(!data){
			uf.sendMessage("Nothing found",threadID);
		}
		var message = ""
	    message+=data.word.capitalizeFirstLetter()+"\n\n";
	    message+=data.definition.capitalizeFirstLetter()+"\n\n";
	    if(data.example){
	    	message+=data.example.capitalizeFirstLetter();
	    }
	    uf.sendMessage(message,threadID);
	});
}

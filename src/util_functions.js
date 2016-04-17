
String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
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

module.exports = {
	prettifyMessage : prettifyMessage,
	isInArray       : isInArray
}
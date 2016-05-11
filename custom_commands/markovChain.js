var uf      = require("../src/util_functions.js");
var MarkovChain = require('markovchain');
module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	api.getThreadHistory(threadID,0,100000,null,function(error,history){
		if (error) console.log(error);
		getChain(history,threadID, args, senderId);
	});
}
function getChain(history,threadID, args, senderId){
	var api = uf.metaData.meta.api;
	var historyString = "";
	var user;
	var useUser = false;
	var myId = api.getCurrentUserID();
	if(args.special.indexOf('--user') > -1){
		var user = uf.getSpecialValue("--user",args).toLowerCase();
		if(user!=undefined){
			useUser = true;
		}
		var user = uf.findMostLikelyName(threadID,user);
		if(!user){
			uf.sendMessage("Could not find that user",threadID);
			return true;
		}else if(typeof user != "string" && user.length>1){
			uf.sendMessage("More than one user found\n"+user,threadID);
			return true;
		}
	}
	for(msg in history){
		if(history[msg].senderID != "fbid:"+myId && history[msg].body!=undefined && history[msg].type=="message"){
			if(useUser && history[msg].senderName.toLowerCase()!=user)
				continue;
			historyString+=history[msg].body.toLowerCase().capitalizeFirstLetter()+"\n";
		}
	}
	function useUpperCase(wordList) {
		var tmpList = Object.keys(wordList).filter(function(word) {
			return word[0] >= 'A' && word[0] <= 'Z'
		})
		return tmpList[~~(Math.random()*tmpList.length)]
	}
	function useRandom(wordList) {
		var tmpList = Object.keys(wordList);
		return tmpList[~~(Math.random()*tmpList.length)]
	} 
	var quotes = new MarkovChain(historyString);
	var start = useUpperCase;
	if(args.special.indexOf('--rand') > -1){
		start = useRandom;
	}
	if(args.value.length>0 && !useUser){
		start = args.value[0];
	}
	uf.sendMessage(quotes.start(start).end(25).process(),threadID);
}
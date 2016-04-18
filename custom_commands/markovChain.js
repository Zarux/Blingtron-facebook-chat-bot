var uf      = require("../src/util_functions.js");
var MarkovChain = require('markovchain');
module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	var myId = api.getCurrentUserID();
	api.getThreadHistory(threadID,0,100000,null,function(error,history){
		if (error) return
		var historyString = "";
		for(msg in history){
			if(history[msg].senderID != "fbid:"+myId && history[msg].body!=undefined && history[msg].type=="message"){
				historyString+=history[msg].body+"\n";
			}
		}
		var useUpperCase = function(wordList) {
		  var tmpList = Object.keys(wordList).filter(function(word) {
		    return word[0] >= 'A' && word[0] <= 'Z'
		  })
		  return tmpList[~~(Math.random()*tmpList.length)]
		}
		var quotes = new MarkovChain(historyString)
		var randomLength = uf.getRandomInt(5,100);

		uf.sendMessage(quotes.start(useUpperCase).end().process(),threadID);
	});
}
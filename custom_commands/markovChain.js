var uf      = require("../src/util_functions.js");
var MarkovChain = require('markovchain');
module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	var myId = api.getCurrentUserID();
	api.getThreadHistory(threadID,0,100000,null,function(error,history){
		if (error) return
		var historyString = "";
		var user;
		var useUser = false;
		if(args.special.indexOf('--user') > -1){
			var user = uf.getSpecialValue("--user",args);
			if(user!=undefined){
				useUser = true;
			}
		}
		for(msg in history){
			if(history[msg].senderID != "fbid:"+myId && history[msg].body!=undefined && history[msg].type=="message"){
				if(useUser && history[msg].senderName!=user)
					continue;
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

		var start = useUpperCase;
		if(args.value.length>0 && !useUser){
			start = args.value[0];
		}

		uf.sendMessage(quotes.start(start).end().process(),threadID);
	});
}
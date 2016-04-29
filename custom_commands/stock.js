var uf      = require("../src/util_functions.js");
var request = require('request');
module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	var res     = [];
	var symbols = args['value'].join("%2C");
	var url     = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance%20.quotes%20where%20symbol%20in%20(%22dummy%2C"+symbols+"%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=&"+Date.now();
	
	request(url, function(error,response, body) {
		if (!error && response.statusCode == 200) {
		    var data = JSON.parse(body);
	 	} else {
		    console.log("Got an error: ", error, ", status code: ", response.statusCode);
	  	}
		var result = data.query.results.quote;
		var count  = data.query.count;
		//console.log(count);
		for(i in result){
			if(i == 0)continue;
			if(result[i].symbol == null){
				uf.sendMessage("No symbol", threadID);	
				return
			}
			var resObj ={
				"symbol":result[i]["symbol"],
				"change":result[i]["PercentChange"],
				"price" :result[i]["Ask"],
				"pe":result[i]['PERatio'],
				"PEG":result[i]['PEGRatio']
			}
			res.push(resObj);
		}
		var message = {body: "Stocks: \n"};
		for(i in res){
			if(res[i]['change'] == null){
				message['body'] += res[i]['symbol'].toUpperCase()+": Not found\n--------\n";
				continue; 

			}
			message['body'] += res[i]['symbol'].toUpperCase()+": \n ASK: "+res[i]['price']+"USD\n";
			message['body'] +=  " PRC: "+res[i]['change']+"\n";

			if(args['special'].indexOf('--pe') > -1){
				message['body'] += " P/E: "+res[i]['pe']+"\n";
			}
			if(args['special'].indexOf('--peg') > -1){
				message['body'] += " PEG: "+res[i]['PEG']+"\n";
			}
			message['body'] += "--------\n";
		}
		uf.sendMessage(message, threadID);	
	});	
}
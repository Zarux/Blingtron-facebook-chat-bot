var uf      = require("../src/util_functions.js");
var request = require("request");


module.exports = function(threadID, args, senderId){

	var term = "";
	if(args.value.length>0){
		term = args.value[0];
		term.replace(" ","+");
	}else{
		console.log(args);
		return;
	}
	var message = ""
	var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.urbandictionary.com%2Fdefine.php%3Fterm%3D"+term+"%22%20\
	and%20(xpath%3D'%2F%2F*%5B%40id%3D%22content%22%5D%2Fdiv%5B1%5D%2Fdiv%5B2%5D%2Fa'%20\
	or%20xpath%3D'%2F%2F*%5B%40id%3D%22content%22%5D%2Fdiv%5B1%5D%2Fdiv%5B3%5D'%20\
	or%20xpath%3D'%2F%2F*%5B%40id%3D%22content%22%5D%2Fdiv%5B1%5D%2Fdiv%5B4%5D')&format=json"
	request(url, function(error,response, body) {
		if (!error && response.statusCode == 200) {
		    var data = JSON.parse(body);
	 	} else {
		    console.log("Got an error: ", error, ", status code: ", response);
	  	}
		var result = data.query.results;
		var count  = data.query.count;
		if(count == 0){
			uf.sendMessage("Nothing found",threadID);
		}

		if(result.a[0].class=="word" && result.a[0].content){
			message+=result.a[0].content.capitalizeFirstLetter()+"";
		}else{
			message+="";
		}

		if(result.div[0].class=="meaning" && result.div[0].content){
			message+=result.div[0].content.capitalizeFirstLetter().replace("&#39;","'")+"";
		}else{
			message+="";
		}

		if(result.div[1].class=="example" && result.div[1].content){
			message+=result.div[1].content.capitalizeFirstLetter().replace("&#39;","'")+"";
		}else{
			message+="";
		}
		uf.sendMessage(message, threadID);	
	});	

	
}

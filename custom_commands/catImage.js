var uf      = require("../src/util_functions.js");
var unirest = require('unirest');
module.exports=function(threadID, args, senderId){
	var count = 0;
	function getCat(){
		count++;
		if(count == 100){
			uf.sendMessage("No cat found",threadID);	
			return;
		}
		if(uf.getRandomInt(0,2) == 1){
			uf.sendPhotoFromUrl(threadID,null,"http://thecatapi.com/api/images/get?format=src&type=gif",(Math.random() + 1).toString(36).substring(7)+".gif",function(){
				getCat();
			})
			return;
		}
		unirest.get("https://nijikokun-random-cats.p.mashape.com/random")
		.header("X-Mashape-Key", "ktuzr2dxVemshoyXK3i5Y2MBl5iMp1mTvT3jsnHBoIFIZ3K8QT")
		.header("Accept", "application/json")
		.end(function (result) {
		  if(result.status == 200 && result.body){
		  	uf.sendPhotoFromUrl(threadID, null, result.body.source, (Math.random() + 1).toString(36).substring(7)+".png",function(){
		  		getCat();
		  	});
		  }else{
		  	getCat();
		  }
		});
	}
	getCat();
}
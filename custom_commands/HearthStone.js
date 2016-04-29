var uf      = require("../src/util_functions.js");
var unirest = require('unirest');
var fs = require("fs");

module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	var cachedImages = JSON.parse(fs.readFileSync('cache/cached_images.json', 'utf8'));
	unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/"+args['value'][0]+"?collectible=1")
	.header("X-Mashape-Key", "ktuzr2dxVemshoyXK3i5Y2MBl5iMp1mTvT3jsnHBoIFIZ3K8QT")
	.end(function (result) {

		var dataCount = 0;

		function getNextData(){
			var data = result.body[dataCount];
			dataCount++;
			if(data){
				return data;
			}
			return false;
		}
		function send(){
			var data = getNextData();
			if(!data){
				uf.sendMessage("Nothing found", threadID);
				return;
			}

			var suffix     = ".png";
			var gold       = false;
			var cardimgurl = data.img;
			var cardname   = data.name;
		  	var cardId     = data.cardId;

			if(args.special.indexOf("--gold") > -1){
				cardimgurl = data.imgGold;
				gold = true;
				suffix = ".gif";
				cardId = cardId+"_g";
			}
		  	
		  	if(!cardimgurl){
		  		send();
		  		return;
		  	}
		  	if(data.type=='Hero' && args.special.indexOf('--hero')==-1){
		  		send();
		  		return;
		  	}
		  	var fileName = "hs/"+cardId+suffix;
		  	if(cachedImages[cardId] != undefined && uf.getFilesize("images/"+cachedImages[cardId])>1){
		  		var message = {
		 			attachment: fs.createReadStream("images/"+fileName),
		 			body: ""
				};
				uf.sendMessage(message, threadID);
		  	}else{  	
			  	cachedImages[cardId] = fileName;
			  	fs.writeFile('cache/cached_images.json', JSON.stringify(cachedImages));
				uf.sendPhotoFromUrl(threadID, false, cardimgurl,fileName,function(){
					var errorMsg = "Could not fetch "+(gold ? "gold " : "")+"image for "+cardname;
					uf.sendMessage(errorMsg, threadID);
				},true); 		
		  	}			
		}
		send();
	});
}
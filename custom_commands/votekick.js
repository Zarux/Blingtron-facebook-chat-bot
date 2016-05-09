var uf      = require("../src/util_functions.js");
//Spaghetti code below VVVV
var kickData={}

module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	var userKick = senderId;
	var userKickedId;
	var userKicked;
	if(kickData[threadID] == undefined){
		kickData[threadID] = {}
	}
	if(args.special.indexOf("--user") > -1){
		if(args.special_value.length==0){
			uf.sendMessage(threadID,"No user specified");
			return;
		}

		var threadUsers = uf.metaData.chatUsers[threadID];
		user_kicked = uf.getSpecialValue("--user",args);
		for(id in threadUsers){
			if(threadUsers[id].name.toLowerCase() == user_kicked.toLowerCase()){
				userKickedId = id;
				userKicked = threadUsers[id].name;

				if(kickData[threadID][userKickedId] == undefined){
					kickData[threadID][userKickedId] = {votes:[],name:""}
				}
				kickData[threadID][userKickedId].name = userKicked;

				if(kickData[threadID][userKickedId].votes.indexOf(senderId) == -1){

					kickData[threadID][userKickedId].votes.push(senderId);

					var voteSize = Object.keys(threadUsers).length-1;
					uf.sendMessage("Registered vote for "+userKicked+"\n"+kickData[threadID][userKickedId].votes.length+"/"+Math.round(voteSize/2),threadID);

					if(kickData[threadID][userKickedId].votes.length >= Math.round(voteSize/2)){

						api.removeUserFromGroup(userKickedId,threadID,function(err){
							if(err)console.log(err);
						});
						
					}
				}
				return
			}
		}
		uf.sendMessage("User not found",threadID);
	}
}

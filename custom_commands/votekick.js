var uf      = require("../src/util_functions.js");
//Spaghetti code below VVVV
var kickData={}

module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	var userKick = senderId;
	var userKickedId;
	var userKicked;
	var threadUsers = uf.metaData.chatUsers[threadID];
	var myId = api.getCurrentUserID();
	var voteSize = Object.keys(threadUsers).length-1;
	if(kickData[threadID] == undefined){
		kickData[threadID] = {}
	}
	if(args.special.indexOf("--votes") > -1){
		var msg = "";
		for(i in kickData[threadID]){
			var cur = kickData[threadID];
			msg+=cur[i].name+" "+cur[i].votes.length+"/"+voteSize+"\n";
		}
		if(msg==""){
			uf.sendMessage("No votes registered",threadID);			
		}else{
			uf.sendMessage(msg,threadID);
		}
		return
	}



	if(args.special.indexOf("--user") > -1){
		if(args.special_value.length==0){
			uf.sendMessage(threadID,"No user specified");
			return;
		}
		user_kicked = uf.getSpecialValue("--user",args);
		for(id in threadUsers){
			if(threadUsers[id].name.toLowerCase() == user_kicked.toLowerCase()){
				userKickedId = id;
				if(myId == id){
					uf.sendMessage("beep boop. Does not compute. Beep boop",threadID);
					return
				}
				userKicked = threadUsers[id].name;



				if(kickData[threadID][userKickedId] == undefined){
					kickData[threadID][userKickedId] = {votes:[],name:""}
				}
				var cur = kickData[threadID][userKickedId];
				cur.name = userKicked;

				if(args.special.indexOf("--forgive") > -1){
					if(cur.votes.indexOf(senderId) > -1){
						cur.votes.splice(cur.votes.indexOf(senderId),1);
						uf.sendMessage("Registered forgive for:\n"+userKicked+"\n"+cur.votes.length+"/"+Math.round(voteSize/2),threadID);
					}else{
						uf.sendMessage("You have not voted to kick that user",threadID);
					}
					return;
				}

				if(cur.votes.indexOf(senderId) == -1){

					cur.votes.push(senderId);

					uf.sendMessage("Registered vote for:\n"+userKicked+"\n"+cur.votes.length+"/"+Math.round(voteSize/2),threadID);

					if(cur.votes.length >= Math.round(voteSize/2)){

						api.removeUserFromGroup(userKickedId,threadID,function(err){
							if(err)console.log(err);
							cur.votes = []
						});
						
					}
				}else{
					uf.sendMessage("You have already voted to kick:\n"+userKicked,threadID);
				}
				return
			}
		}
		uf.sendMessage("User not found",threadID);
	}
}
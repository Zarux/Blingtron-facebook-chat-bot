var uf      = require("../src/util_functions.js");

module.exports=function(threadID, args, senderId){
	var api = uf.metaData.meta.api;
	api.setTitle(args.value[0], threadID, function(err, msg){
		if(err) console.log(err);
	})
}
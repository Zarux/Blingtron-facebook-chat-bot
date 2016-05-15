
## Util functions
Most of it is self-explanatory, but here are the most used ones

#### metaData
Object containg metadata relevant for the bot,
```javascript
meta :{
		api: the api returned by login,
		admins: admins for the group, add in config file
	},
	cachedConvos: not in use,
	chatUsers: userinfo about users in chat
}
```

#### prettifyMessage(type,time,sender,mesg)
Creates a pretty message to print for logging
MESG [2016-05-14 19:32:48][User Sent]      : Testmessage

#### getSpecialValue(arg,args)
Gets the value after a special argument passed to the bot e.g getSpecialValue("--user",args) will get the user passed to the bot

#### sendPhotoFromUrl(threadID,msg,imgurl,fileNae,error,keep)
Send photo from url, msg is an optional string to send with,
if keep == true it will keep the image, if not it will save it, send and then unlink it
error is a function that can be run if sending fails

#### sendMessage(message,threadID,error)
Simplified sending message

#### findMostLikelyName(threadID,name)
Will go through the list of users and find the name that resembles the most.
First it checks if there is a matching name, if not it will compare all parts of the name.
If still no match it will check for the closest using levenshtein distance.


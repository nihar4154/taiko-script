const cron = require("node-cron");
let shell = require("shelljs");

cron.schedule("*/5 * * * *", function(){
	
	console.log("Scheduler running: "+new Date());
	
	if(shell.exec("npm test").code !== 0){
		console.log("Something wrong");
	}

});

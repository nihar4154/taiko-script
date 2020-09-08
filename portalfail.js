const cron = require("node-cron");
let shell = require("shelljs");

cron.schedule("*/1 * * * *", function(){
	
	console.log("Scheduler running: "+new Date());
	
	if(shell.exec("npm portalerror").code !== 0){
		console.log("Something wrong");
	}

});

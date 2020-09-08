const cron = require("node-cron");
let shell = require("shelljs");

cron.schedule("* * * * * *", function(){
	
	console.log("Scheduler running"+new Date());
	console.log("Scheduler running"+new Date().getTimezoneOffset());
	console.log("Scheduler running"+new Date().getTime());
	console.log("Scheduler running"+new Date().toISOString());
	
});

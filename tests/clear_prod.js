const axios = require('axios');

const { openBrowser, textBox, setViewPort, goto, into, write, click ,evaluate,waitFor,press} = require('taiko');

/* Note: - This script has been validated with Taiko Version: 1.0.12 (Chromium: 81.0.3994.0) RELEASE
   Please ensure that both npm and node are installed priori and are accessible on command prompt.
   To install taiko  
    npm install -g taiko
  
    This should install taiko globally. To validate this is installed globally. Go to any other folder and type on the terminal
    taiko -version

    if taiko is installed properly it should provide the version of taiko and corresponding chromium driver as a result.

    to run the test in the directory where app.js exists
        taiko app.js or 
        from any directory taik <fullpath>/app.js
 */



(async () => {
  try {
    await openClear(); 

    await performLogin(); 

    /*loadLibrary function should be adjusted based on the user that is configured in production 
        and the default tab he or she would land into. 
    */
    await loadLibrary();  
    searchResult = await performSearch();

    if(searchResult){
        console.log("Search is Working"); 
        console.log("POST request to Emitter-service: Search success");
        console.log("date:" +new Date().toISOString());
        var data = JSON.stringify({"testresult":true,"componentname":"search","location":"Bengaluru","time":new Date().toISOString(),"responseTime":500,"failuremessage":""});
        data.time = new Date().toISOString();
        callEmitterService(data);
    }else{
        console.log("Search is unavailable");
        console.log("POST request to Emitter-service: Search failure");
        console.log("date:" +new Date().toISOString());
        var data = JSON.stringify({"testresult":true,"componentname":"search","location":"Bengaluru","time":new Date().toISOString(),"responseTime":500,"failuremessage":"Search service broken"});
        data.time = new Date().toISOString();
        callEmitterService(data);
    }

    await evaluate(()=>{ logout(); return null; });

  } catch (error) {
      console.error(error);
  } finally {
    closeBrowser();
  }
})();


const envValues = {
    //url and username password
    url:"https://www.oneclear.com/BC/Product/Modules/SignIn.aspx",
    username:"pft_qa",
    password:"Cloud#54321",


    processTabXPath:'//*[@id="Navigation"]/ul/li[1]/div',
    tenantName:"Media Cloud",
    searchIconXPath:'//*[@id="AdavncedSearchButton"]',
    searchTerm:'Apple',
    noResultMessage:'No results found for given search criteria.',
    navTimeoutValueMs:200000,
    waitTimeMs:5000,
    noBrowser:false,

    emitterService: 'https://08a3052b-8871-4288-ba56-85b7da7d85de.mock.pstmn.io/portalemitter'
   
}



 /*
    Starts the browser with the default parameters. Tries to set up flash, the view port of the browser so that site can load properly.
    Attempts to set up flash for the site bieng loaded. Flash may not be needed as the site may be configured to work with only HTML5.
    Taiko does not keep a cache. Every instance of the browser loads up with no cache.
    It is thereby important to give some time for the application to laod. The default timeout values thereby are overridden.
  */
 async function openClear() {
	 var start = new Date().getTime();
    try {
        await openBrowser({ignoreCertificateErrors:true,headless:true,args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            "--allow-flash", '--no-first-run', '--no-sandbox',
            '--no-zygote']});
        await setViewPort({width:1280, height:720});
        await goto(envValues.url,{timeout:envValues.navTimeoutValueMs});
        try{
            await overridePermissions(envValues.url,["flash"]);
        }catch(error){
            console.log("got an error setting up flash")
        }
    }catch (error) {
		var end = new Date().getTime();
        logError("openClear",error)
		var data = JSON.stringify({"testresult":true,"componentname":"portal","location":"Bengaluru","time":new Date().toISOString(),"responseTime":end - start,"failuremessage":"Error occurred while login to portal"});
        data.time = new Date().toISOString();
        callEmitterService(data);
    }
}

/*
    Nothing complex here. Provides the user name and password and simulates enter press.
    Provides enough time to load the site as there won't be any cached scripts that we can run.
*/
async function performLogin(){
    try{
        
        waitForElement(textBox({placeholder:"Username"}),'elem');
        await write(envValues.username,into(textBox({placeholder:"Username"})));
        await press("Enter");
        waitForElement(textBox({placeholder:"Password"}),'elem');
        await write(envValues.password,into(textBox({placeholder:"Password"})));
        await press("Enter",{navigationTimeout: envValues.navTimeoutValueMs});


        console.log("POST request to portalemitter: performLogin success");
        console.log("date:" +new Date().toISOString());
        var data = JSON.stringify({"testresult":true,"componentname":"portal","location":"Bengaluru","time":new Date().toISOString(),"responseTime":300,"failuremessage":""});
        data.time = new Date().toISOString();
        callEmitterService(data);
        
    }catch(error){
        console.log("logIntoClear",error);
        console.log("POST request to portalemitter: performLogin Error");
        var data = JSON.stringify({"testresult":true,"componentname":"portal","location":"Bengaluru","time":new Date().toISOString(),"responseTime":400,"failuremessage":"Error occurred while login to portal"});
        data.time = new Date().toISOString();
        callEmitterService(data);
    }
}

async function loadLibrary(){
    try{

        waitForSpinnerToStop();

        /*
            The code below waits for the processTab to be visible and then clicks on it.
            Snooze function is written to put an absolute wait on the executin thread equivalent of
            Thread.sleep(). This is to ensure that the element is trunly clickable
            Once Process Tab is clicked we give another snooze before clicking on the tenant itself.
            
            NOTE: In production this may not be required if the user is setup properly to land in the right tabs post login.
            This function would have be to correctly set accordingly.
        */
        waitForElement(envValues.processTabXPath,'selector') //we wait for the element to be visible
        await snooze(envValues.waitTimeMs);       // explicit wait as test runs have shown this area to add flakiness to the tests.

        await click($(envValues.processTabXPath)); // we click the process tab
        await snooze(envValues.waitTimeMs);        // explicit wait for the tab tranistion to settle in before we click on the tenant name
        

        await click(envValues.tenantName,          // click on the tenant and provide enough time to load the libary..
            {navigationTimeout: envValues.navTimeoutValueMs});
        
    }catch(error){
        console.log("loadLibrary",error);
    }
    console.log(">>> loadLibrary exited");
}

async function performSearch(){
    console.log(">>> performSearch entered");
    let searchResult=false;
    try{

        waitForSpinnerToStop();                             //wait for the Loader to stop and the library to load properly/
        await click($(envValues.searchIconXPath));          // Click on the magnifying glass
        await write(envValues.searchTerm,into(textBox({placeholder:"Search Terms"}))); // enter search term
        await press("Enter",{navigationTimeout: envValues.navTimeoutValueMs}); // press enter and wait for navigation to complete
    
        waitForSpinnerToStop(); // wait for spinner to stop to indicate that library is loaded up.

        var resultText = 'matching "'+envValues.searchTerm+'"';
        let results= await (text(resultText)).exists();  // would return true if the matching rows count is shown on the screen
        let noResult = await (text(envValues.noResultMessage)).exists(); // would return true if the No results related message is shown to the users
        
        if (results && !noResult){
            searchResult=true;
        }
        
    }catch(error){
        console.log("performSearch",error);
    }
   return searchResult;
}
function logError(step, error){
    console.log("Error!!!! >>> "+step);
    console.error(error);
}

function waitForElement(elem, type){
    if(type === 'selector'){
        waitFor(async () => (await $(elem).isVisible()), 10000);
    }

    if(type === 'elem'){
        waitFor(async () => (await elem.isVisible()), 10000);
    }

    waitSimply();
}

function waitSimply(){
     waitFor(5000);
}
/*
    This function just waits for the spinner to stop for 120 seconds. As soon as spinner stops the function returns.
 */
function waitForSpinnerToStop(){
    //console.log(">>> waitForSpinnerToStop called");
    let spinner ='//*[@id="globalWaiting"]/div';
    waitFor(async () => !(await $(spinner).exists()), envValues.navTimeoutValueMs);
    //console.log(">>> waitForSpinnerToStop ended");
}

// equivalent of Thread.sleep() introduced to handle scenarios where taiko's wait functions were not working fine.
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));



function callEmitterService(data) {
    var config = {
        method: 'post',
        url: envValues.emitterService,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      axios(config)
      .then(function (response) {
        console.log("status:" +response.status);
        //console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
}

/* Regex-patterns to check URLs against */
var tests = {
	url: /khanacademy\.org\/(.*?)*/,
	projects: /projects(.*?)/,
	editor: /computer-programming\//
};

/* A function creator for callbacks */
function callback(element, url) 
{
	// Do something
	console.log("Url loaded:", url);
}

window.onload = function()
{
	/* When the browser-action button is clicked... */
	chrome.browserAction.onClicked.addListener(function(tab) 
	{
	    /*...check the URL of the active tab against our pattern and... */
	    if (tests.url.test(tab.url)) 
	    {
	        /* ...if it matches, send a message specifying a callback too */
	        chrome.tabs.sendMessage(tab.id, { 
	        	text: "report_back",
	        }, function(element)
	    	{
	    		return callback(element, tab.url);
	    	});
	    }
	});
};

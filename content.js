var embedButton = "<span class=\"text_12zg6rl-o_O-LabelLarge_np83x5-o_O-text_918o9i\">" + 
				  "<span class=\"downloadLabel_15qmo7n\"><span>Download</span></span></span>";

var buttons = {};

/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse)
{
    /* If the received message has the expected format... */
    if (msg.text && (msg.text === "report_back")) 
    {
        /* Call the specified callback, passing 
           the web-pages DOM content as argument */
   		sendResponse(document);
    }
});

let projectStructure = {
    "css" : {
        "index.css": "https://raw.githubusercontent.com/prolightHub/KaTemplate/master/css/index.css",
    },
    "js" : {
        "loadKa.js": "https://raw.githubusercontent.com/prolightHub/KaTemplate/master/js/loadKa.js",
    },
    "libraries": {
        "processing.js": "https://raw.githubusercontent.com/Khan/processing-js/66bec3a3ae88262fcb8e420f7fa581b46f91a052/processing.js",
    },
    "index.html": "https://raw.githubusercontent.com/prolightHub/KaTemplate/master/index.html",
};

var loaded = 0;
loadCode(projectStructure);

function loadCode(object)
{
    for(var i in object)
    {
        if(typeof object[i] === "object")
        {
            loadCode(object[i]);
        }
        else if(typeof object[i] === "string")
        {
            ajax(object[i], content => 
            {
            	if(content.length > 50)
            	{
                	loaded++;
                	object[i] = content.toString();
            	}
            });
        }
    }
}
function ajax(url, func, onErr)
{
    return fetch(url)
    .then(response => response.text())
    .then(func)
    .catch(err => {
    	(onErr || function() {})();
    	console.log(err);
    });
}

var downloader = {
	extractCode: function(str)
	{
		var test = "[\"./javascript/tutorial-scratchpad-package/scratchpad-page-entry.js\"] = ";
	    var index = str.indexOf(test) + test.length;
	    return str.substring(index, str.indexOf("</script>", index));
	},
	onclick: function(event)
	{
		this.entry = JSON.parse(this.extractCode(document.body.innerHTML));

		this.project = {
			title: this.entry.props.scratchpad.title.split(' ').join('_'), 
			width: this.entry.props.scratchpad.width || 400,
			height: this.entry.props.scratchpad.width || 400,
		};

		this.zip = new JSZip();

		this.build();
		this.download();
	},
	download: function()
	{
		downloader.zip.generateAsync({type : "blob"}).then(function(content) 
        {
            saveAs(content, downloader.project.title + ".zip");
        });
	},
	build: function()
	{
		var scratchpad = this.entry.props.scratchpad;

		var master = this.zip.folder(this.project.title + "-master");
			master.folder();

		if(scratchpad.docsUrlPath.indexOf("pjs") === -1)
		{
			//Webpage
			master.file("index.html", scratchpad.revision.code);
		}else{
			var css = master.folder("css");
				css.file("index.css", projectStructure.css["index.css"]);

			//Processing.js
			var js = master.folder("js");
	        	js.file("index.js", this.alignCode(scratchpad.revision.code, this.project.width, this.project.height));
	        	js.file("loadKa.js", projectStructure.js["loadKa.js"]);

	        var libraries = master.folder("libraries");
	        	libraries.file("processing.js", projectStructure.libraries["processing.js"]);

       		master.file("index.html", projectStructure["index.html"].replace("Processing Js", scratchpad.title || ""));
		}
	},
	alignCode: function(code, width, height)
	{
		if(width && height)
	    {
	        return "function main()\n{\n\nsize(" + width + ", " + height + ");\n\n\n" + code.toString() + "\n\n}\n\ncreateProcessing(main);";
	    }else{
	        return "function main()\n{\n\n" + code.toString() + "\n\n}\n\ncreateProcessing(main);";
	    }
	},
};

var tests = {
	editor: /computer-programming\//
};

if (tests.editor.test(window.location.href))
{
	window.addEventListener("load", function()
	{
		var load = window.setInterval(function()
		{
			try{
				/* Create the Download button with all its attributes */
				var dload = document.createElement("a");
				dload.innerText = "Download";
				dload.setAttribute("class", "link_1uvuyao-o_O-computing_77ub1h");
				dload.setAttribute("role", "button");
				dload.setAttribute("href", "javascript:void(0)");
				dload.setAttribute('id', "0-btn-download0v1");

				/* Embed the button! */
				var place = document.getElementsByClassName("buttons_vponqv")[0];
				place.appendChild(document.createElement("span").appendChild(dload));

				/* Link it with our projects*/
				buttons.download = dload;
				buttons.download.onclick = (function()
				{
					if(!window.checkLoaded)
					{
						/* Emergency in case some files are not available, use the backup! */
						if(loaded >= 4)
						{
		    				localStorage.setItem("projectStructure", JSON.stringify(projectStructure));
		    			}else{
							projectStructure = JSON.parse(localStorage.getItem("projectStructure"));
		    			}
		    			window.checkLoaded = true;
		    		}

					downloader.onclick();
				});

				window.clearInterval(load);
			}
			catch(e)
			{
				console.log(e);
			}
		}, 1000);
	});
}
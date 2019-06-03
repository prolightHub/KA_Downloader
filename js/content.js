var code = (function()
{
	var scratchpadsUrl = "https://www.khanacademy.org/api/internal/scratchpads/";
	var id = window.location.href.split("/").reverse()[0];
	var url = scratchpadsUrl + id;

	const proxyUrl = "https://cors-anywhere.herokuapp.com/";

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

	var temp = {};
	temp.codeLoaded = 0;
	temp.checkLoaded = 0;

	var downloader = {
		init: function()
		{
			this.project = {
				title: this.data.json.title,
				filename: this.data.json.relativeUrl.split("/")[2],
				width: this.data.json.width,
				height: this.data.json.height
			};

			this.zip = new JSZip();

			this.build();
			this.download();
		},
		build: function()
		{
			var master = this.zip.folder(this.project.title + "-master");

			if(this.data.json.newUrlPath.indexOf("webpage") !== -1)
			{
				// Webpage
				master.file("index.html", this.data.json.revision.code);
			}
			else if(this.data.json.newUrlPath.indexOf("pjs") !== -1)
			{
				var css = master.folder("css");
					css.file("index.css", projectStructure.css["index.css"]);

				//Processing.js
				var js = master.folder("js");
		        	js.file("index.js", this.helpers.alignCode(this.data.json.revision.code, this.project.width, this.project.height));
		        	js.file("loadKa.js", projectStructure.js["loadKa.js"]);

		        var libraries = master.folder("libraries");
		        	libraries.file("processing.js", projectStructure.libraries["processing.js"]);

	       		master.file("index.html", projectStructure["index.html"].replace("Processing Js", this.data.json.title || ""));
			}

			master.file("scratchpads.json", JSON.stringify(this.data.json));
		},
		download: function()
		{
			this.zip.generateAsync({type : "blob"}).then(function(content) 
	        {
	            saveAs(content, downloader.project.filename + ".zip");
	        });
		},
		helpers: {
			alignCode: function(code, width, height)
			{
				if(width && height)
			    {
			        return "function main()\n{\n\nsize(" + width + ", " + height + ");\n\n\n" + code.toString() + "\n\n}\n\ncreateProcessing(main);";
			    }else{
			        return "function main()\n{\n\n" + code.toString() + "\n\n}\n\ncreateProcessing(main);";
			    }
			},
		}
	};

	function init()
	{
		loadSketch();
		loadCode(projectStructure);
		embedDownloadButton();
	}

	init();

	function loadSketch()
	{
		/* Gets the code */
		$.ajax(proxyUrl + url,
		{
			type: 'GET',
		    dataType: 'json',

		    success: function(json) 
		    {
		    	downloader.data = {
		    		json: json
		    	};

		    	var code = json.revision.code;

		    	console.log(json);
		    }
		});
	}

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
	        	$.ajax(proxyUrl + object[i],
				{
					type: 'GET',

		            success: function(content) 
		            {
		            	if(content.length > 50)
		            	{
		                	temp.codeLoaded++;
		                	object[i] = content.toString();
		            	}
		            }
		        });
	        }
	    }
	}

	function embedDownloadButton()
	{
		window.addEventListener("load", function()
		{
			var loop = window.setInterval(function()
			{
				try{
					var dload = document.createElement("a");
					dload.innerText = "Download";
					dload.setAttribute("class", "_ydn7zo7");
					dload.setAttribute("role", "button");
					dload.setAttribute("href", "javascript:void(0)");
					dload.setAttribute('id', "0-btn-download0v1");

					var votingWrap = document.querySelector(".voting-wrap") || document.querySelector(".voting");
					var buttonWrap = votingWrap.parentNode;

					buttonWrap.appendChild(document.createElement("span").appendChild(dload));

					dload.onclick = (function()
					{
						if(!temp.checkLoaded)
						{
							/* Emergency in case some files are not available, use the backup! */
							if(temp.codeLoaded >= 4)
							{
			    				localStorage.setItem("projectStructure", JSON.stringify(projectStructure));
			    			}else{
								projectStructure = JSON.parse(localStorage.getItem("projectStructure"));
			    			}

			    			temp.checkLoaded = true;
			    		}

						downloader.init();
					});

					clearInterval(loop);
				}
				catch(e)
				{
					console.log(e);
				}
			}, 4000);
		});
	}

	window.downloader = downloader;
	window.temp = temp;
	window.projectStructure = projectStructure;
	window.scratchpadsUrl = scratchpadsUrl;
	window.id = id;
	window.url = url;
	window.proxyUrl = proxyUrl;
});

if((/computer-programming\//).test(window.location.href))
{
	code();
}
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	var sites = [],
		ideKey = "XDEBUG_ECLIPSE",
		match = false,
		domain;

	// Check if localStorage is available and get the settings out of it
	if (localStorage)
	{
		if (localStorage["sites"])
		{
			sites = JSON.parse(localStorage["sites"]);
		}

		if (localStorage["xdebugIdeKey"])
		{
			ideKey = localStorage["xdebugIdeKey"];
		}
	}

	// Get the current domain out of the tab URL and check if it matches anything in the sites array
	domain = tab.url.match(/:\/\/(.[^\/]+)/)[1];
	match = isValueInArray(sites, domain);

	// Check if we have a match or don't need to match at all
	if (match || sites.length === 0)
	{
		// Show the pageAction
		chrome.pageAction.show(tabId);

		// Request the current status and update the icon accordingly
		chrome.tabs.sendMessage(
			tabId,
			{
				cmd: "getStatus",
				idekey: ideKey
			},
			function(response)
			{
				updateIcon(response.status, tabId);
			}
		);
	}
});

function updateIcon(status, tabId)
{
	// Figure the correct title/image with the given state
	var title = "Debugging, profiling & tracing disabled",
		image = "images/bug-gray.png";

	if (status == 1)
	{
		title = "Debugging enabled";
		image = "images/bug.png";
	}
	else if (status == 2)
	{
		title = "Profiling enabled";
		image = "images/clock.png";
	}
	else if (status == 3)
	{
		title = "Tracing enabled";
		image = "images/script.png";
	}

	// Update title
	chrome.pageAction.setTitle({
		tabId: tabId,
		title: title
	});

	// Update image
	chrome.pageAction.setIcon({
		tabId: tabId,
		path: image
	});
}

function isValueInArray(arr, val)
{
	for (i = 0; i < arr.length; i++)
	{
		var re = new RegExp(arr[i], "gi");
		if (re.test(val))
		{
			return true;
		}
	}

	return false;
}

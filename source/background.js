chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	// We only react on a complete load of a http(s) page,
	//  only then we're sure the content.js is loaded.
	if (changeInfo.status !== "complete" || tab.url.indexOf("http") !== 0)
	{
		return;
	}

	// Prep some variables
	var sites = [],
		ideKey = "XDEBUG_ECLIPSE",
		match = true,
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
	domain = tab.url.match(/:\/\/(.[^\/]*)/)[1];
	match = isValueInArray(sites, domain);

	// Check if we have a match or don't need to match at all
	if ( (domain != null && match) || sites.length === 0)
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

chrome.commands.onCommand.addListener(function(command)
{
	if ('toggle_debug_action' == command)
	{
		var ideKey = "XDEBUG_ECLIPSE";

		// Check if localStorage is available and get the settings out of it
		if (localStorage && localStorage["xdebugIdeKey"])
		{
			ideKey = localStorage["xdebugIdeKey"];
		}

		// Fetch the active tab
		chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function(tabs)
		{
			// Get the current state
			chrome.tabs.sendMessage(
				tabs[0].id,
				{
					cmd: "getStatus",
					idekey: ideKey
				},
				function(response)
				{
					// If state is debugging (1) toggle to disabled (0), else toggle to debugging
					var newState = (1 == response.status) ? 0 : 1;

					chrome.tabs.sendMessage(
						tabs[0].id,
						{
							cmd: "setStatus",
							status: newState,
							idekey: ideKey
						},
						function(response)
						{
							// Update the icon
							updateIcon(response.status, tabs[0].id);
						}
					);
				}
			);
		});
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

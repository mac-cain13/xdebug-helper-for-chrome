chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	// We only react on a complete load of a http(s) page,
	//  only then we're sure the content.js is loaded.
	if (changeInfo.status !== "complete" || tab.url.indexOf("http") !== 0)
	{
		return;
	}

	// Prep some variables
	var ideKey = "XDEBUG_ECLIPSE",
		match = true,
		traceTrigger = ideKey,
		profileTrigger = ideKey,
		domain;

	// Check if localStorage is available and get the settings out of it
	if (localStorage)
	{
		if (localStorage["xdebugIdeKey"])
		{
			ideKey = localStorage["xdebugIdeKey"];
		}

		if (localStorage["xdebugTraceTrigger"])
		{
			traceTrigger = localStorage["xdebugTraceTrigger"];
		}

		if (localStorage["xdebugProfileTrigger"])
		{
			profileTrigger = localStorage["xdebugProfileTrigger"];
		}
	}

	// Request the current status and update the icon accordingly
	chrome.tabs.sendMessage(
		tabId,
		{
			cmd: "getStatus",
			idekey: ideKey,
			traceTrigger: traceTrigger,
			profileTrigger: profileTrigger
		},
		function(response)
		{
			if (chrome.runtime.lastError) {
				console.log("Error: ", chrome.runtime.lastError);
			} else {
				updateIcon(response.status, tabId);
			}
		}
	);
});

chrome.commands.onCommand.addListener(function(command)
{
	if ('toggle_debug_action' == command)
	{
		var ideKey = "XDEBUG_ECLIPSE";
		var traceTrigger = ideKey;
		var profileTrigger = ideKey;

		// Check if localStorage is available and get the settings out of it
		if (localStorage)
		{
			if (localStorage["xdebugIdeKey"])
			{
				ideKey = localStorage["xdebugIdeKey"];
			}

			if (localStorage["xdebugTraceTrigger"])
			{
				traceTrigger = localStorage["xdebugTraceTrigger"];
			}

			if (localStorage["xdebugProfileTrigger"])
			{
				profileTrigger = localStorage["xdebugProfileTrigger"];
			}
		}

		// Fetch the active tab
		chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function(tabs)
		{
			// Do nothing when there is no active tab atm
			if (tabs.length == 0) {
				return;
			}

			// Get the current state
			chrome.tabs.sendMessage(
				tabs[0].id,
				{
					cmd: "getStatus",
					idekey: ideKey,
					traceTrigger: traceTrigger,
					profileTrigger: profileTrigger
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
							idekey: ideKey,
							traceTrigger: traceTrigger,
							profileTrigger: profileTrigger
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
	chrome.browserAction.setTitle({
		tabId: tabId,
		title: title
	});

	// Update image
	chrome.browserAction.setIcon({
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

chrome.tabs.onUpdated.addListener(function(tabid)
{
	chrome.tabs.getSelected(null, function(tab)
	{
		if (!localStorage || !localStorage['sites'])
		{
			return;
		}

		sites = localStorage["sites"];
		sites = JSON.parse(sites);

		baseDomain = tab.url.match(/:\/\/(.[^/]+)/)[1];

		match = isValueInArray(sites, baseDomain);

		if (match || sites.length == 0)
		{
			chrome.pageAction.show(tabid);
			chrome.tabs.getSelected(null, function(tab)
			{
				chrome.tabs.sendRequest(
					tab.id,
					{
						cmd: "status", idekey: localStorage["xdebugIdeKey"]
					},
					function(response)
					{
						updateIcon(response.result, tabid);
					}
				);
			});
		}
	});
});

chrome.pageAction.onClicked.addListener(function(tab)
{
	chrome.tabs.getSelected(null, function(tab)
	{
		chrome.tabs.sendRequest(
			tab.id,
			{
				cmd: "toggle", idekey: localStorage["xdebugIdeKey"]
			},
			function(response)
			{
				updateIcon(response.result, tab.id);
			}
		);
	});
});

function updateIcon(status, tabid)
{
	if (status == 1)
	{
		chrome.pageAction.setTitle({
			tabId: tabid,
			title: "Debugging enabled"
		});

		chrome.pageAction.setIcon({
			tabId: tabid,
			 path: "images/bug.png"
		});
	}
	else if (status == 2)
	{
		chrome.pageAction.setTitle({
			tabId: tabid,
			title: "Profiling enabled"
		});

		chrome.pageAction.setIcon({
			tabId: tabid,
			 path: "images/clock.png"
		});
	}
	else if (status == 3)
	{
	  chrome.pageAction.setTitle({
		tabId: tabid,
		title: "Tracing enabled"
	  });

	  chrome.pageAction.setIcon({
		tabId: tabid,
		path: "images/script-save.png"
	  });
	}
	else
	{
		chrome.pageAction.setTitle({
			tabId: tabid,
			title: "Debugging, profiling & tracing disabled"
		});

		chrome.pageAction.setIcon({
		   tabId: tabid,
			path: "images/bug-gray.png"
		});
	}
}

function isValueInArray(arr, val)
{
	for (i = 0; i < arr.length; i++)
	{
		re = new RegExp(arr[i], "gi");
		if (re.test(val))
		{
			return true;
		}
	}

	return false;
}

$(function() {
	var ideKey = "XDEBUG_ECLIPSE";
	var traceTrigger = ideKey;
	var profileTrigger = ideKey;

	// Check if localStorage is available and get the ideKey out of it if any
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

	// Request the current state from the active tab
	chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function(tabs)
	{
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
					// Highlight the correct option
					$('a[data-status="' + response.status + '"]').addClass("active");
				}
			);
	});

	// Attach handler when user clicks on
	$("a").on("click", function(eventObject) {
		var newStatus = $(this).data("status");

		// Set the new state on the active tab
		chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function(tabs)
		{
			chrome.tabs.sendMessage(
				tabs[0].id,
				{
					cmd: "setStatus",
					status: newStatus,
					idekey: ideKey,
					traceTrigger : traceTrigger,
					profileTrigger : profileTrigger
				},
				function(response)
				{
					// Make the backgroundpage update the icon and close the popup
					chrome.runtime.getBackgroundPage(function(backgroundPage) {
						backgroundPage.updateIcon(response.status, tabs[0].id);
						window.close();
					});
				}
			);
		});
	});

	// Shortcuts
	key("d", function() { $("#action-debug").click(); });
	key("p", function() { $("#action-profile").click(); });
	key("t", function() { $("#action-trace").click(); });
	key("s", function() { $("#action-disable").click(); });
	key("space,enter", function() { $("a:focus").click(); });
	key("down,right", function()
	{
		var current = $(".action:focus");
		if (current.length === 0)
		{
			$(".action:first").focus();
		}
		else
		{
			current.parent().next().find("a").focus();
		}
	});
	key("up,left", function()
	{
		var current = $(".action:focus");
		if (current.length === 0)
		{
			$(".action:last").focus();
		}
		else
		{
			current.parent().prev().find("a").focus();
		}
	});

	// Bit of a hack to prevent Chrome from focussing the first option automaticly
	$("a").on("focus", function()
	{
		$(this).blur();
		$("a").off("focus");
	});
});

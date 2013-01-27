$(function() {
	var ideKey = "XDEBUG_ECLIPSE";

	// Check if localStorage is available and get the ideKey out of it if any
	if (localStorage && localStorage["xdebugIdeKey"])
	{
		ideKey = localStorage["xdebugIdeKey"];
	}

	// Request the current tab for the current state
	chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs)
	{
		chrome.tabs.sendRequest(
				tabs[0].id,
				{
					cmd: "getStatus",
					idekey: ideKey
				},
				function(response)
				{
					$('a[data-status="' + response.status + '"]').addClass("active");
				}
			);
	});

	// Attach handler when user clicks on
	$("a").on("click", function(eventObject) {
		var obj = $(this),
			requestedStatus = obj.data("status");

		chrome.tabs.getSelected(null, function(tab)
		{
			chrome.tabs.sendRequest(
				tab.id,
				{
					cmd: "setStatus",
					status: requestedStatus,
					idekey: ideKey
				},
				function(response)
				{
					chrome.extension.getBackgroundPage().updateIcon(response.status, tab.id);
					window.close();
				}
			);
		});
	});
});

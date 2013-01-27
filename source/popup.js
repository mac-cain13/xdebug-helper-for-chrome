$(function() {
	$("a").on("click", function(eventObject) {
		var requestedStatus = $(this).data("action");

		chrome.tabs.getSelected(null, function(tab)
		{
			chrome.tabs.sendRequest(
				tab.id,
				{
					cmd: "setStatus",
					status: requestedStatus,
					idekey: localStorage["xdebugIdeKey"]
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
$(function() {
	$("a").on("click", function(eventObject) {
		chrome.tabs.getSelected(null, function(tab)
		{
			chrome.tabs.sendRequest(
				tab.id,
				{
					cmd: "toggleStatus",
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
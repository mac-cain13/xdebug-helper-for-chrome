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
					chrome.extension.getBackgroundPage().updateIcon(response.result, tab.id);
					window.close();
				}
			);
		});
	});
});
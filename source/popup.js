$(function() {
$("a").on("click", function(eventObject) {
	chrome.tabs.getSelected(null, function(tab)
	{
		chrome.tabs.sendRequest(
			tab.id,
			{
				cmd: "toggle",
				idekey: localStorage["xdebugIdeKey"]
			},
			function(response)
			{
				//updateIcon(response.result, tab.id);
			}
		);
	});
});
});
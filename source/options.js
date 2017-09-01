(function () {

	// setTimeout() return value
	let disablePopupTimeout;

	function save_options()
	{
		localStorage["xdebugIdeKey"] = document.getElementById("idekey").value;
		localStorage["xdebugTraceTrigger"] = document.getElementById("tracetrigger").value;
		localStorage["xdebugProfileTrigger"] = document.getElementById("profiletrigger").value;
		localStorage.xdebugDisablePopup = document.getElementById('disable-popup').checked ? '1' : '0';
	}

	function restore_options()
	{
		// Restore IDE Key
		idekey = localStorage["xdebugIdeKey"];

		if (!idekey)
		{
			idekey = "XDEBUG_ECLIPSE";
		}

		if (idekey == "XDEBUG_ECLIPSE" || idekey == "netbeans-xdebug" || idekey == "macgdbp" || idekey == "PHPSTORM")
		{
			$("#ide").val(idekey);
			$("#idekey").prop('disabled', true);
		}
		else
		{
			$("#ide").val("null");
			$("#idekey").prop('disabled', false);
		}
		$('#idekey').val(idekey);

		// Restore Trace Triggers
		var traceTrigger = localStorage["xdebugTraceTrigger"];
		if (traceTrigger !== null)	{
			$("#tracetrigger").val(traceTrigger);
		} else {
			$("#tracetrigger").val(null);
		}

		// Restore Profile Triggers
		var profileTrigger = localStorage["xdebugProfileTrigger"];
		if (profileTrigger !== null)	{
			$("#profiletrigger").val(profileTrigger);
		} else {
			$("#profiletrigger").val(null);
		}

		// Restore Disable Popup
		document.getElementById('disable-popup').checked = (localStorage.xdebugDisablePopup === '1') ? true : false;
	}

	$(function()
	{
		$("#ide").change(function ()
		{
			if ($("#ide").val() != "null")
			{
				$("#idekey").prop('disabled', true);
				$("#idekey").val($("#ide").val());

				save_options();
			}
			else
			{
				$("#idekey").prop('disabled', false);
			}
		});

		$("#idekey").change(save_options);

		// Persist Disable Popup on onChange event
		$('#disable-popup').change(disablePopupChanged);

		$('.save-button').click(save_options);

		restore_options();
	});

	/**
	 * Disable Popup checkbox changed, persist it.
	 */
	function disablePopupChanged() {
		const $disablePopupSaved = $('.disable-popup-saved');

		$disablePopupSaved.addClass('show');

		// First clear interval
		clearInterval(disablePopupTimeout);
		// Hide after 2 seconds
		disablePopupTimeout = setTimeout(() => $disablePopupSaved.removeClass('show'), 2000);

		// Persist
		save_options();

		// We need to reload the extension, because to hide the popup
        chrome.extension.getBackgroundPage().window.location.reload(true);
	}

})();

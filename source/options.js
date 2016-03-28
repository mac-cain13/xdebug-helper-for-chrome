function save_options()
{
	localStorage["xdebugIdeKey"] = document.getElementById("idekey").value;
	localStorage["xdebugTraceTrigger"] = document.getElementById("tracetrigger").value;
	localStorage["xdebugProfileTrigger"] = document.getElementById("profiletrigger").value;
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
	}
	else
	{
		$("#ide").val("null");
		$("#customkey").fadeIn();
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
}

$(function()
{
	$("#ide").change(function ()
	{
		if ($("#ide").val() != "null")
		{
			$("#customkey").fadeOut();
			$("#idekey").val($("#ide").val());

			save_options();
		}
		else
		{
			$("#customkey").fadeIn();
		}
	});

	$("#idekey").change(save_options);

	$('.save-button').click(save_options);

	restore_options();
});

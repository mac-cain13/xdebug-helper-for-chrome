function save_options()
{
	input = document.getElementById("idekey");
	idekey = input.value;
	localStorage["xdebugIdeKey"] = idekey;

	siteBox = document.getElementById("siteBox");
	sites = [];
	for (i = 0; i < siteBox.length; i++)
	{
		sites.push(siteBox.options[i].value);
	}
	localStorage["sites"] = JSON.stringify(sites);
}

function restore_options()
{
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

	sites = localStorage["sites"];
	if (sites)
	{
		sites = JSON.parse(sites);
		for(i = 0; i < sites.length; i++)
		{
			addItem("siteBox", sites[i]);
		}
	}
}

function addSite()
{
	siteText = document.getElementById("newSite").value.trim();

	if (siteText.length > 0) {
		addItem("siteBox", siteText);
		save_options();
		document.getElementById("newSite").value = '';

		save_options();
	}
}

function removeSelectedSite()
{
	siteBox = document.getElementById("siteBox");
	for (i = siteBox.length-1; i >= 0; i--) {
		if (siteBox.options[i].selected)
		{
			siteBox.remove(i);
		}
	}

	save_options();
}

function addItem(id, value)
{
	opt = document.createElement("option");
	document.getElementById(id).options.add(opt);
	opt.value = value;
	opt.text = value;
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
	
	$('#save-options').click(save_options);

	$('#add-site').click(addSite);

	$('#remove-site').click(removeSelectedSite);

	restore_options();
});

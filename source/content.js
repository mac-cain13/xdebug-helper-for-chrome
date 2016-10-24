var xdebug = (function() {
	// Set a cookie
	function setCookie(name, value, days)
	{
		var exp = new Date();
		exp.setTime(exp.getTime() + (days * 24 * 60 * 60 * 1000));
		document.cookie = name + "=" + value + "; expires=" + exp.toGMTString() + "; path=/";
	}

	// Get the content in a cookie
	function getCookie(name)
	{
		// Search for the start of the goven cookie
		var prefix = name + "=",
			cookieStartIndex = document.cookie.indexOf(prefix),
			cookieEndIndex;

		// If the cookie is not found return null
		if (cookieStartIndex == -1)
		{
			return null;
		}

		// Look for the end of the cookie
		cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length);
		if (cookieEndIndex == -1)
		{
			cookieEndIndex = document.cookie.length;
		}

		// Extract the cookie content
		return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex));
	}

	// Remove a cookie
	function deleteCookie(name)
	{
		setCookie(name, null, -1);
	}

	// Public methods
	var exposed = {
		// Handles messages from other extension parts
		messageListener : function(request, sender, sendResponse)
		{
			var newStatus,
				idekey = "XDEBUG_ECLIPSE",
				traceTrigger = idekey,
				profileTrigger = idekey;

			// Use the IDE key from the request, if any is given
			if (request.idekey)
			{
				idekey = request.idekey;
			}
			if (request.traceTrigger)
			{
				traceTrigger = request.traceTrigger;
			}
			if (request.profileTrigger)
			{
				profileTrigger = request.profileTrigger;
			}

			// Execute the requested command
			if (request.cmd == "getStatus")
			{
				newStatus = exposed.getStatus(idekey, traceTrigger, profileTrigger);
			}
			else if (request.cmd == "toggleStatus")
			{
				newStatus = exposed.toggleStatus(idekey, traceTrigger, profileTrigger);
			}
			else if (request.cmd == "setStatus")
			{
				newStatus = exposed.setStatus(request.status, idekey, traceTrigger, profileTrigger);
			}

			// Respond with the current status
			sendResponse({ status: newStatus });
		},

		// Get current state
		getStatus : function(idekey, traceTrigger, profileTrigger)
		{
			var status = 0;

			if (getCookie("XDEBUG_SESSION") == idekey)
			{
				status = 1;
			}
			else if (getCookie("XDEBUG_PROFILE") == profileTrigger)
			{
				status = 2;
			}
			else if (getCookie("XDEBUG_TRACE") == traceTrigger)
			{
				status = 3;
			}

			return status;
		},

		// Toggle to the next state
		toggleStatus : function(idekey, traceTrigger, profileTrigger)
		{
			var nextStatus = (exposed.getStatus(idekey, traceTrigger, profileTrigger) + 1) % 4;
			return exposed.setStatus(nextStatus, idekey, traceTrigger, profileTrigger);
		},

		// Set the state
		setStatus : function(status, idekey, traceTrigger, profileTrigger)
		{
			if (status == 1)
			{
				// Set debugging on
				setCookie("XDEBUG_SESSION", idekey, 365);
				deleteCookie("XDEBUG_PROFILE");
				deleteCookie("XDEBUG_TRACE");
			}
			else if (status == 2)
			{
				// Set profiling on
				deleteCookie("XDEBUG_SESSION");
				setCookie("XDEBUG_PROFILE", profileTrigger, 365);
				deleteCookie("XDEBUG_TRACE");

			}
			else if (status == 3)
			{
				// Set tracing on
				deleteCookie("XDEBUG_SESSION");
				deleteCookie("XDEBUG_PROFILE");
				setCookie("XDEBUG_TRACE", traceTrigger, 365);
			}
			else
			{
				// Disable all Xdebug functions
				deleteCookie("XDEBUG_SESSION");
				deleteCookie("XDEBUG_PROFILE");
				deleteCookie("XDEBUG_TRACE");
			}

			// Return the new status
			return exposed.getStatus(idekey, traceTrigger, profileTrigger);
		}
	};

	return exposed;
})();

// Attach the message listener
chrome.runtime.onMessage.addListener(xdebug.messageListener);

var xdebug = (function() {
	// Set a cookie
	function setCookie(name, value, minutes)
	{
		var exp = new Date();
		exp.setTime(exp.getTime() + (minutes * 60 * 1000));
		document.cookie = name + "=" + value + "; expires=" + exp.toGMTString() + "; path=/";
	}

	// Get a cookie
	function getCookie(name)
	{
		var prefix = name + "=";
		var cookieStartIndex = document.cookie.indexOf(prefix);
		if (cookieStartIndex == -1)
			return null;

		var cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length);
		if (cookieEndIndex == -1)
			cookieEndIndex = document.cookie.length;

		return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex));
	}

	// Remove a cookie
	function deleteCookie(name)
	{
		setCookie(name, null, -60);
	}

	// Public methods
	var exposed = {
		// Handles request from other extension parts
		requestListener : function(request, sender, sendResponse)
		{
			var result,
				idekey = "XDEBUG_ECLIPSE";

			// Use the IDE key from the request, if any is given
			if (request.idekey)
			{
				idekey = request.idekey;
			}

			// Execute the requested command
			if (request.cmd == "getStatus")
			{
				result = exposed.getStatus(idekey);
			}
			else if (request.cmd == "toggleStatus")
			{
				result = exposed.toggleStatus(idekey);
			}
			else if (request.cmd == "setStatus")
			{
				result = exposed.setStatus(request.status, idekey);
			}

			// Respond with the current status
			sendResponse({result: result});
		},

		// Get current state
		getStatus : function(idekey)
		{
			var result = 0;

			if (getCookie("XDEBUG_SESSION") == idekey)
			{
				result = 1;
			}
			else if (getCookie("XDEBUG_PROFILE") == idekey)
			{
				result = 2;
			}
			else if (getCookie("XDEBUG_TRACE") == idekey)
			{
				result = 3;
			}

			return result;
		},

		// Toggle to the next state
		toggleStatus : function(idekey)
		{
			var nextStatus = (exposed.getStatus(idekey) + 1) % 4;
			return exposed.setStatus(nextStatus, idekey);
		},

		// Set the state
		setStatus : function(status, idekey)
		{
			if (status == 1)
			{
				// Set debugging on
				setCookie("XDEBUG_SESSION", idekey, 60);
				deleteCookie("XDEBUG_PROFILE");
				deleteCookie("XDEBUG_TRACE");
			}
			else if (status == 2)
			{
				// Set profiling on
				deleteCookie("XDEBUG_SESSION");
				setCookie("XDEBUG_PROFILE", idekey, 60);
				deleteCookie("XDEBUG_TRACE");
			}
			else if (status == 3)
			{
				// Set tracing on
				deleteCookie("XDEBUG_SESSION");
				deleteCookie("XDEBUG_PROFILE");
				setCookie("XDEBUG_TRACE", idekey, 60);
			}
			else
			{
				// Disable all Xdebug functions
				deleteCookie("XDEBUG_SESSION");
				deleteCookie("XDEBUG_PROFILE");
				deleteCookie("XDEBUG_TRACE");
			}

			// Return the new status
			return exposed.getStatus(idekey);
		}
	};

	return exposed;
})();

// Attach the request listener
chrome.extension.onRequest.addListener(xdebug.requestListener);

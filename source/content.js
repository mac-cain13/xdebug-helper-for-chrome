
chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) 
        {
            if (request.idekey)
            {
                idekey = request.idekey;
            }

            if (request.cmd == "status")
            {
                result = xdebugCheckStatus();
            }
            else if (request.cmd == "toggle")
            {
                result = xdebugToggle();
            }
            
            sendResponse({result: result});
		}
);

function xdebugCheckStatus() 
{
    if (xdebugGetCookie('XDEBUG_SESSION') == idekey) 
    {
    	return 1;
    } 
    else if (xdebugGetCookie('XDEBUG_PROFILE') == idekey) 
    {
    	return 2;
    }
    
    return 0;
}

function xdebugToggle()
{
	var debuggingState = xdebugCheckStatus();
	
    if (debuggingState == 0) 
    {
    	// Current is all off, switch debugging on
    	xdebugSetCookie('XDEBUG_SESSION', idekey, 60);
    	xdebugSetCookie('XDEBUG_PROFILE', null, -60);
    } 
    else if (debuggingState == 1) 
    {
    	// Current is debugging on; switch debugging off and profiling on
    	xdebugSetCookie('XDEBUG_SESSION', null, -60);
    	xdebugSetCookie('XDEBUG_PROFILE', idekey, 60);
    } 
    else if (debuggingState == 2) 
    {
    	// Current is profiling on; switch all off
    	xdebugSetCookie('XDEBUG_SESSION', null, -60);
    	xdebugSetCookie('XDEBUG_PROFILE', null, -60);
    }
    
    // Return the new state
    return xdebugCheckStatus();
}

function xdebugSetCookie(cookieName, cookieVal,minutes) 
{
    var exp=new Date();
    exp.setTime(exp.getTime()+(minutes*60*1000));
    document.cookie=cookieName+"="+cookieVal+"; expires="+exp.toGMTString()+"; path=/";
}

function xdebugGetCookie(name) 
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
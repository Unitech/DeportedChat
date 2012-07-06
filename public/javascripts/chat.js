
var windowFocus = true;
var username;
var chatHeartbeatCount = 0;
var minChatHeartbeat = 1000;
var maxChatHeartbeat = 33000;
var chatHeartbeatTime = minChatHeartbeat;
var originalTitle;
var blinkOrder = 0;

var chatboxFocus = new Array();
var newMessages = new Array();
var newMessagesWin = new Array();
var chatBoxes = new Array();
var chatboxtitle;

var msg_buff = [];


/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

function init_cookie() {

    jQuery.cookie = function(name, value, options) {
	if (typeof value != 'undefined') { // name and value given, set cookie
            options = options || {};
            if (value === null) {
		value = '';
		options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
		var date;
		if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
		} else {
                    date = options.expires;
		}
		expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            }
            // CAUTION: Needed to parenthesize options.path and options.domain
            // in the following expressions, otherwise they evaluate to undefined
            // in the packed version for some reason...
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	} else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
			cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
			break;
                    }
		}
            }
            return cookieValue;
	}
    };
    
}

function append_message(name, message) {
    $("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+name+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+message+'</span></div>');
    $("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);	
}

function build_old_msg(data) {
    for (var i = 0; i < data.length; i++) {
	var name = data[i].split('~')[0];
	var msg = data[i].split('~')[1];

	append_message(name, msg);
    }
}


function init_chat(username, winname) {

    chatboxtitle = winname;

    createChatBox(winname);
    now.name = username;

    $("#chatbox_"+winname+" .chatboxtextarea").focus();
    
    if ($.cookie('chatbox_message')) {
	msg_buff = $.cookie('chatbox_message').split('|');
	build_old_msg(msg_buff);
    }

    //$.cookie('chatbox_message', '');
    
    init_message_incoming();    
}




function rolover(name, data) {
    // Put timestamp to perimy the cookie
    if (msg_buff.length > 10) {
	msg_buff.shift();
    }

    msg_buff.push(name + '~' + data);
    
    $.cookie('chatbox_message', msg_buff.join('|'), {path: '/' });    
}

function init_message_incoming() {
    now.receiveMessage = function(name, message) {
	// XSS Prevention
	message = $('<div/>').text(message).html();

	// Save text in cookie
	rolover(name, message);		
	append_message(name, message);

	// If chat hidden, blink it
	if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') == 'none')
	    $('.chatboxtitle').addClass('css3-blink').css({'color':'black'});
    }
    
}

function restructureChatBoxes() {
    align = 0;
    for (x in chatBoxes) {
	chatboxtitle = chatBoxes[x];

	if ($("#chatbox_"+chatboxtitle).css('display') != 'none') {
	    if (align == 0) {
		$("#chatbox_"+chatboxtitle).css('right', '20px');
	    } else {
		width = (align)*(225+7)+20;
		$("#chatbox_"+chatboxtitle).css('right', width+'px');
	    }
	    align++;
	}
    }
}

function chatWith(chatuser) {
    chatboxtitle = chatuser;
}

function createChatBox(chatboxtitle,minimizeChatBox) {
    if ($("#chatbox_"+chatboxtitle).length > 0) {
	if ($("#chatbox_"+chatboxtitle).css('display') == 'none') {
	    $("#chatbox_"+chatboxtitle).css('display','block');
	    restructureChatBoxes();
	}
	$("#chatbox_"+chatboxtitle+" .chatboxtextarea").focus();
	return;
    }

    $(" <div />" ).attr("id","chatbox_"+chatboxtitle)
	.addClass("chatbox")
	.html('<div class="chatboxhead" onclick="javascript:toggleChatBoxGrowth(\''+chatboxtitle+'\')"><div class="chatboxtitle">'+chatboxtitle+'</div><div class="chatboxoptions"><a href="javascript:void(0)">-</a></div><br clear="all"/></div><div class="chatboxcontent"></div><div class="chatboxinput"><textarea class="chatboxtextarea" onkeydown="javascript:return checkChatBoxInputKey(event,this,\''+chatboxtitle+'\');"></textarea></div>')
	.appendTo($( "body" ));
    
    $("#chatbox_"+chatboxtitle).css('bottom', '0px');
    
    chatBoxeslength = 0;

    for (x in chatBoxes) {
	if ($("#chatbox_"+chatBoxes[x]).css('display') != 'none') {
	    chatBoxeslength++;
	}
    }

    if (chatBoxeslength == 0) {
	$("#chatbox_"+chatboxtitle).css('right', '20px');
    } else {
	width = (chatBoxeslength)*(225+7)+20;
	$("#chatbox_"+chatboxtitle).css('right', width+'px');
    }
    
    chatBoxes.push(chatboxtitle);


    if ($.cookie('chatbox_minimized') == 'true') {
	toggleChatBoxGrowth(chatboxtitle);
    }
    

    chatboxFocus[chatboxtitle] = false;

    $("#chatbox_"+chatboxtitle+" .chatboxtextarea").blur(function(){
	chatboxFocus[chatboxtitle] = false;
	$("#chatbox_"+chatboxtitle+" .chatboxtextarea").removeClass('chatboxtextareaselected');
    }).focus(function(){
	chatboxFocus[chatboxtitle] = true;
	newMessages[chatboxtitle] = false;
	$('#chatbox_'+chatboxtitle+' .chatboxhead').removeClass('chatboxblink');
	$("#chatbox_"+chatboxtitle+" .chatboxtextarea").addClass('chatboxtextareaselected');
    });

    $("#chatbox_"+chatboxtitle).click(function() {
	if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') != 'none') {
	    $("#chatbox_"+chatboxtitle+" .chatboxtextarea").focus();
	}
    });

    $("#chatbox_"+chatboxtitle).show();
}


function closeChatBox(chatboxtitle) {
    $('#chatbox_'+chatboxtitle).css('display','none');
    restructureChatBoxes();    
}

function toggleChatBoxGrowth(chatboxtitle) {
    
    if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') == 'none') {  
	
	$('.chatboxtitle').removeClass('css3-blink').css({'color':'white'});
	$.cookie('chatbox_minimized', 'false', {expires : 7, path: '/' });
	
	$('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','block');
	$('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','block');
	$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);


    } else {

	$.cookie('chatbox_minimized', 'true', {expires : 7, path: '/' });

	$('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','none');
	$('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','none');
    }
    
}

function checkChatBoxInputKey(event,chatboxtextarea,chatboxtitle) {
    
    if(event.keyCode == 13 && event.shiftKey == 0)  {
	message = $(chatboxtextarea).val();
	message = message.replace(/^\s+|\s+$/g,"");

	$(chatboxtextarea).val('');
	$(chatboxtextarea).focus();
	$(chatboxtextarea).css('height','44px');

	if (message != '')
	    now.distributeMessage(message);	   

	return false;
    }

    var adjustedHeight = chatboxtextarea.clientHeight;
    var maxHeight = 94;

    if (maxHeight > adjustedHeight) {
	adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
	if (maxHeight)
	    adjustedHeight = Math.min(maxHeight, adjustedHeight);
	if (adjustedHeight > chatboxtextarea.clientHeight)
	    $(chatboxtextarea).css('height',adjustedHeight+8 +'px');
    } else {
	$(chatboxtextarea).css('overflow','auto');
    }
    
}

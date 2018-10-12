console.log('app is alive');

/* global variable of currentluy selected channel */
var currentChannel;

/* onload selected channel */
currentChannel = octoberfest;

/* current location of app user */
var currentLocation = {
    longitude: 48.264976,
    latitude: 11.668641,
    what3words: "dose.verse.lunged"
};

/* function to switch between channels by clicking on the channel row in the channel list */
/** @param channelObject
 *  @param channelElement
*/

function switchChannel(channelObject, channelElement) {
    console.log('Turning into channel', channelObject);
    
    /* quit creation mode if currently selected */
    abortCreationMode();

    /* empty messages in chatarea */
    $('#chat').empty();
    /* adjusting of the selected channel name in the rightside app-bar */
    $('#rightside .app-bar h1 span').html(channelObject.name);
    /* adjusting of the selected channel location in the rightside app-bar shown as w3w */
    $('#rightside .app-bar h1 strong').html('<a href="https://map.what3words.com/'
        +channelObject.createdBy
        +'" target="_blank">'
        +channelObject.createdBy
        +'</a>');
    
    /* removing of class "selected-channel" from all channels in the list */
    $('#channels li').removeClass('selected-channel');

    /* adding of class "selected-channel" to the recently clicked channel */
    $(channelElement).addClass('selected-channel');
    
    /* remove of class (solid/ unsolid) of the star in rightside app-bar */
    $('#rightside .app-bar i').removeClass('fas far');

    /* adding of class depending on the value starred in the channel object */
    $('#rightside .app-bar i').addClass(channelObject.starred ? 'fas' : 'far');
    
    /* defining of recently clicked channel as currently selected channel */
    currentChannel = channelObject;

    $('#chat').append(showMessages());

};

function showMessages() {
    $().each(function() {currentChannel.messages, createMessageElement(currentChannel.messages)});
};


/* function to toggle the star rightside app-bar between solid and unsolid (like/ no like) 
and chaning of the channelObject.starred value in channel list */

function likeChannel() {
    $('#rightside .app-bar i').toggleClass('fas far');
    
    /* starred value is changed */
    currentChannel.starred = !currentChannel.starred;

    $('#channels li:contains('+currentChannel.name+') .fa-star').removeClass('fas far');
    $('#channels li:contains('+currentChannel.name+') .fa-star').addClass(currentChannel.starred ? 'fas' : 'far');

    console.log(currentChannel.name,' starstatus is ',currentChannel.starred);
};

/** function to add class "selected-tab" to recently clicked tab 
    @param tabID
*/

function selectTab(tabID) {
    $('#tab-bar button').removeClass('selected-tab');
    console.log('Changing to Tab ' + tabID)
    $(tabID).addClass('selected-tab')
};

/* function to show the emoji window */
function showEmojis()  {
    $('#emojis').toggle();
};

/* function to load the full emojis list */
function loadEmojis() {
    var emojis = require('emojis-list');
    console.log(emojis[0]);
}

/* section-2 creates new message objects and puts them into the chatarea */

/** @param text
 *  @constructor
 */

 /* messageObject that performs as a form for newly created messages*/
function Message(text) {
    this.createdBy = currentLocation.what3words;
    this.latitude = currentLocation.latitude;
    this.longitude = currentLocation.longitude;
    this.createdOn = new Date();
    this.expiresOn = new Date(Date.now() + 15 * 60 * 1000); /* current time plus 15min (converted to ms) */
    this.text = text;
    this.own = true; /* always true as messages created are always "own" messages */
};


/* function that is linked with clicking the send button */
function sendMessage() {
    /* reading the input out of the message input field */
    var text = $('#message-input').val();
    /* check the text length; show alert if fail */
    if (text.length == 0) {
        alert("You have nothing to say?");
        console.log("No message created");
        return;
    }
    /* create newMessage object */
    var newMessage = new Message(text);

    /* push message into currentChannel object */
    currentChannel.messages.push(newMessage);
    /* add 1 message to currentChannel.messageCount */
    currentChannel.messageCount+=1;
    
    /* create new message in chat area */
    createMessageElement(newMessage);

    /* scroll to bottom afte send */
    $('#chat').scrollTop($('#chat').prop('scrollHight'));
    /* clear message input field */
    $('#message-input').val('');

    console.log("New message '", newMessage.text, "' in channel", currentChannel, "consisting of ", text.length, " letters");

    console.log(currentChannel.name, "has", currentChannel.messageCount, "messages now");
};

/** @param messageObject
 *  @returns
 */
/* function to create new message html field in the chatarea:
   <div class="message">
        <h3>
            <strong><a href="w3w_link">channel_createdBy</a></strong> channel_createdOn 
            <span class="remaining-time">channel_expiresIn=min left</span>
        </h3>
            <p>message_text<button class="button-accent">+5min</button></p>
    </div>
*/

function createMessageElement(messageObject) {
    /* converting the specific time to a period of time (the message is going to remain) */
    var expiresIn = Math.round((messageObject.expiresOn - Date.now()) / 1000 / 60);
    
    /* create a messageObject and return is back to "sendMessage()" */
    return $('#chat').append('<div class="message'+
    (messageObject.own ? ' own' : '')+'">'+
        '<h3>'+
            '<strong><a href="https://map.what3words.com/' + messageObject.createdBy + '"target="_blank">' + messageObject.createdBy + '</a></strong>' +
            messageObject.createdOn.toLocaleString() + /* converting the time format */
            '<span class="remaining-time">' + expiresIn + 'min left</span>'+
        '</h3>'+
            '<p>' + messageObject.text + '<button class="button-accent">+5min</button></p>'+
    '</div>');
};

/* end of section-2 */


/* section-3 creates channel list + sorts channels */

/* function sorts by 'new' - creation date */
/** @param channelA
 *  @param channelB
 *  @returns {Number}
 */

function compareNew(channelA, channelB) {
    return channelB.createdOn - channelA.createdOn;
};

/* function sorts by 'trending' - messageCount */
/** @param channelA
 *  @param channelB
 *  @returns {Number} (if <0 first position)
 */

function compareTrending(channelA, channelB) {
    return channelB.messageCount - channelA.messageCount;
};

/* function sorts by 'favorites' - starred or not? */
/** @param channelA
 *  @param channelB
 *  @returns {Number}
 */

function compareFavorites(channelA, channelB) {
    return channelA.starred ? -1 : 1 ;
}


/* function lists the channels; order determined by selcted tab; onload (compared by 'new') */

/** @param criterion */

function listChannels(criterion) {
    /* sort channels by 'new', 'trending' or 'favorites' criteria */
    channels.sort(criterion);

    $('#channels ul').empty();

    for (var i=0; i < channels.length; i++) {
        console.log('add channel:', channels[i]);
        $('#channels ul').append(createChannelElement(channels[i]));
    };
    switchChannel(currentChannel, $(this));
};

/* end of section-3 */


/* section-4 creates channels and channel html elements */

/* channel object that performs as a form for newly created channels */
/** @param name
 *  @constructor
 */

function Channel(name) {
    this.name = name;
    this.createdOn = new Date();
    this.createdBy = currentLocation.what3words;
    this.starred = false; //initially not starred
    this.expiresIn = 60; //temporary
    this.messageCount = 0; //no messages in the beginning
    this.messages = [];
};

/* function creates a new channel */
function createChannel() {
    /* reading channel name input field */
    var name = $('#channel-input').val();
    /* reading message input field */
    var text = $('#message-input').val();

    /* check channel name input field validity */
    if (name.length == 0 || name.search(" ") > -1 || name.search("#") == -1) {
        alert('Enter valid channel name ("#" in the beginning, no spaces');
        return;
    } else if (text.length == 0) { //check message input field
        alert('Introduce yourself at first!');
        return;
    } else {
        /* create new channel object */
        var channel = new Channel(name);
        /* set new channel as currentChannel */
        currentChannel = channel;
        /* push new channel in 'channels' object */
        channels.push(channel);
        /* initiate html element creation */
        $('#channels ul').append(createChannelElement(channel));
        console.log("New channel created:", channel.name);
        /* send initial message */
        sendMessage();
        /* empty channel name input field */
        $("#channbel-input").val('');
        /* return to previous view */
        abortCreationMode();

        /* adjust rightside app-bar meta data */
        $('#rightside .app-bar h1 span').html(channel.name);
        $('#rightside .app-bar h1 strong').html('<a href="https://map.what3words.com/'
            +channel.createdBy
            +'" target="_blank">'
            +channel.createdBy
            +'</a>');
    }
}


/* function creates a channel html element */

/** @param channelObject
 *  @returns
 */
/* function creates channel list object:
   <li>channel_name
        <span class="channel-list-icons">
           <i class"fa? fa-star></i><span>channel_expiresIn+min</span><span>channel_messageCount+new</span><i class="fas fa-chevron-right"></i>
        </span>
    </li>
*/

 function createChannelElement(channelObject) {
    var channel = $('<li>').html(channelObject.name);
    channel.click(function() {
        switchChannel(channelObject, $(this));
    }); /* onclick handler added and linked to "switchChannel" function */
    var channelBar = $('<span>').addClass('channel-list-icons').appendTo(channel);
    $('<i>').addClass('fa-star').addClass(channelObject.starred ? 'fas' : 'far').appendTo(channelBar); /* star */
    $('<span>').text(channelObject.expiresIn + ' min').appendTo(channelBar); /* min counter */
    $('<span>').text(channelObject.messageCount + ' new').appendTo(channelBar); /* message counter */
    $('<i>').addClass('fas fa-chevron-right').appendTo(channelBar); /* right arrow */

    return channel; /* return newly adjusted variable "channel" to function "listChannels" */
     
 }


/* end of section-4 */


/* section-5 switches to the channel creation mode */

 //var oldAppBar = $('#rightside .app-bar h1');
 //oldAppBar.data('oldAppBar', createChannel());

function initCreationMode() {
    console.log("switched to Creation Mode");
    /* swap app-bar */
    $("#app-bar-messages").hide();
    $("#app-bar-create").addClass('show');

    /* empty messages in chatarea */ 
    $('#chat').empty();

    /* swap chat-bar button */
    $("#send-message-button").hide();
    $("#create-channel-button").show();
};

function abortCreationMode() {
    console.log("Quit Creation Mode");
    /* restore previous view */
    $("#app-bar-messages").show();
    $("#app-bar-create").removeClass('show');
    $("#send-message-button").show();
    $("#create-channel-button").hide();
}




 
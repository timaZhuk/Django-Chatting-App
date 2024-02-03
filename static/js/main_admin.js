/**
 * Variables
 */

// get room uuid
// replaceAll('"', ""); replace all "" with empty space (delete them)
const chatRoom = document
  .querySelector("#room_uuid")
  .textContent.replaceAll('"', "");

//console.log("chatRoom", chatRoom);

// make chatSocket variable globally available
let chatSocket = null;

/**
 * Elements
 */

//Caht Messages body (logging)
const chatlogElement = document.querySelector("#chat_log");
//chat Input messanger
const chatInputElement = document.querySelector("#chat_message_input");
//chat Input Submit (button)
const chatSubmitElement = document.querySelector("#chat_message_submit");
//chat user name
const chatName = document
  .querySelector("#user_name")
  .textContent.replaceAll('"', "");

//chat user name
const agentId = document
  .querySelector("#user_id")
  .textContent.replaceAll('"', "");

/**
 *FUNCTIONS
 *
 */

//--------- function scroll the chat to bottom (the news chat message)
function scrollToBottom() {
  chatlogElement.scrollTop = chatlogElement.scrollHeight;
}
//--ASYNC FUNCTIONS
//----Send Messages to BackEnd---------
// 'type':'message'  because in consumers.py we put the value
// if type == 'message': in receive function
async function sendMessage() {
  chatSocket.send(
    JSON.stringify({
      type: "message",
      message: chatInputElement.value,
      name: chatName,
      agent: agentId,
    }) //JSON
  ); //chatSocket
  // after we've sent the message. input field wiil be empty
  chatInputElement.value = "";
}

//-------------data from Server--------------------
function onChatMessage(data) {
  console.log("onChatMessage", data);
  if (data.type == "chat_message") {
    // -------------------------------------
    if (!data.agent) {
      chatlogElement.innerHTML += `<div class="flex w-full mt-2 space-x-3 max-w-md">
        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-red-300 text-center pt-2">
        ${data.initials}
        </div>
  
        <div>
        <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
        <p class="text-sm">
        ${data.message}
        </p>
        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
        </div>
        </div>
  
        </div>`;
    } else {
      chatlogElement.innerHTML += `<div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-green-300 text-center pt-2">
        ${data.initials}
        </div>
  
        <div>
        <div class="bg-blue-300 p-3 rounded-l-lg rounded-br-lg">
        <p class="text-sm">
        ${data.message}
        </p>
        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
        </div>
        </div>
  
        </div>`;
    } // inner if
  } //outer if
  //-----------------------------------
  //--------- function scroll the chat to bottom (the news chat message)
  scrollToBottom();
} // end of onChatMessage

/**
 * Web Socket
 */

// in Chat Consumers (consumers.py) we get the same 'room_uuid' like in main.js
chatSocket = new WebSocket(`ws://${window.location.host}/ws/${chatRoom}/`);

//--1----communication with WebSocket----get--msg from backend---------
//-----------onmessage------------------
chatSocket.onmessage = function (e) {
  console.log("on in admin main Message");
  //information from server
  onChatMessage(JSON.parse(e.data));
};
//--------onopen-----------------------
chatSocket.onopen = function (e) {
  console.log("on open");
  //information from server
  scrollToBottom();
};

//----------------------------------
chatSocket.onclose = function (e) {
  console.log("chat socket closed unexpectadly");
  //information from server
};

/**
 * EventListeners
 */

//----------SUBMIT THE MESSAGE---SEND---to BackEnd (Messages)-------------------------
chatSubmitElement.onclick = function (e) {
  e.preventDefault();
  //-----function to send msg to through WebSocket-----
  sendMessage();
  //-------------------------------------------------------------------
  return false;
};

//----------
chatInputElement.onkeyup = function (e) {
  if (e.keyCode == 13) {
    sendMessage();
  }
};

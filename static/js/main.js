/**
 *Chat info vars for backend
 *
 */

let chatName = "";
let chatSocket = null;
// --- shows current page url
let chatWindowUrl = window.location.href;
//---- chat id (uuid) like 'fa4zna09m9'
let chatRoomUuid = Math.random().toString(36).slice(2, 12);
// console.log("ChatUuid ", chatRoomUuid);
//--------------------------------------------------------------------
/**
 *Elements
 *
 */

//all chat MAIN Window activation
const chatElement = document.querySelector("#chat");
//button that open bubble window
const chatOpenElement = document.querySelector("#chat_open");
//button helps to join to chat room
const chatJoinElement = document.querySelector("#chat_join");
// icon of chat user
const chatIconElement = document.querySelector("#chat_icon");
// chat window
const chatWelcomeElement = document.querySelector("#chat_welcome");

// ---------------Window where the chatting process will be started----------
const chatRoomElement = document.querySelector("#chat_room");
//Caht name or Client name
const chatNameElement = document.querySelector("#chat_name");
//Caht Messages body (logging)
const chatlogElement = document.querySelector("#chat_log");
//chat Input messanger
const chatInputElement = document.querySelector("#chat_message_input");
//chat Input Submit (button)
const chatSubmitElement = document.querySelector("#chat_message_submit");

//---------------------------------------------------------------
/**
 *Functions
 *
 */
// REGULAR FUNCTIONS
//--------- function scroll the chat to bottom (the news chat message)
function scrollToBottom() {
  chatlogElement.scrollTop = chatlogElement.scrollHeight;
}
// -----function to get X-CSRFToken------------
function getCookie(name) {
  // initialli is null
  var cookieValue = null;

  // check if cookie exist or not empty
  if (document.cookie && document.cookie != "") {
    // split by ';' semicolon separator
    var cookies = document.cookie.split(";");
    console.log(cookies);

    //loop through the cookies list
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // there we can find the 'substring name='csrftoken'
      // take the value of csrftoken=value
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        console.log(cookieValue);
        break;
      } // if end inner
    }
    // for loop end
  }
  // --if statement end
  return cookieValue;
}
// -- getCookie end-------

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
    if (data.agent) {
      chatlogElement.innerHTML += `<div class="flex w-full mt-2 space-x-3 max-w-md">
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
    } else {
      chatlogElement.innerHTML += `<div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
      <div class="flex-shrink-0 h-10 w-10 rounded-full bg-red-300 text-center pt-2">
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
  scrollToBottom();
} // end of onChatMessage

//---ASYNC-function-Get all input data to create CHAT Room----------
async function joinChatRoom() {
  console.log("we in chat room");
  //get all values from input fields (Name of user)
  chatName = chatNameElement.value;
  //-----testing how it works
  console.log("chatName", chatName);
  // chet that we ceate a UUID for ChatRoom
  console.log("CurrentChatUuid", chatRoomUuid);

  //-----create a FormData object that we send to backend
  const data = new FormData();
  data.append("name", chatName);
  data.append("url", chatWindowUrl);
  //use fetch to send the data and then get it back
  await fetch(`/api/create-room/${chatRoomUuid}/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: data,
  }) //fetch function ()
    //recieve data convert from JSON
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log("data", data);
    });
  //--------end fetch requests--------------
  //window.location.host return localhost url then we add path to chat room
  // /ws/chat/${chatRoomUuid}/
  chatSocket = new WebSocket(
    `ws://${window.location.host}/ws/${chatRoomUuid}/`
  );
  //1----communication with WebSocket----get--msg from backend---------
  // When receiving data from a web server, the data is always a string.
  //Parse the data with JSON.parse(), and the data becomes a JavaScript object.
  chatSocket.onmessage = function (e) {
    console.log("onMessage");
    //information from server
    onChatMessage(JSON.parse(e.data));
  };
  //2----------------------------------------------------------
  chatSocket.onopen = function (e) {
    console.log("onOpen chat room--chat socket was opend");
    scrollToBottom();
  };

  //3------close WebSocket-----------------------------------
  chatSocket.onclose = function (e) {
    console.log("onClose - chat socket was closed");
  };

  //------------------------------------
} //----- join chat room----------------------------------------

//-------------------------------------------------------------
/**
 *EventListeners
 *
 */
//------Open the chat name input with button to START CHATTING------------
chatOpenElement.onclick = function (e) {
  e.preventDefault();
  chatIconElement.classList.add("hidden");
  chatWelcomeElement.classList.remove("hidden");
  //------------------------
  return false;
};

//------Open MESSAGE - CHATTING ROOM--------------------
chatJoinElement.onclick = function (e) {
  e.preventDefault();
  chatIconElement.classList.add("hidden");
  chatWelcomeElement.classList.add("hidden");
  chatRoomElement.classList.remove("hidden");
  //--------when we inside chat----call function for chatting--------------------------------------------
  joinChatRoom();
  //---------------------------------------------------------
  return false;
};

//----------SUBMIT THE MESSAGE---SEND---to BackEnd (Messages)-------------------------
chatSubmitElement.onclick = function (e) {
  e.preventDefault();
  //-----function to send msg to through WebSocket-----
  sendMessage();
  //-------------------------------------
  return false;
};

chatInputElement.onkeyup = function (e) {
  if (e.keyCode == 13) {
    sendMessage();
  }
};

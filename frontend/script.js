const chatsContainer = document.querySelector('.chats-container');
const container = document.querySelector('.container');
const promptForm = document.querySelector('.prompt-form');
const promptInput = document.querySelector('.prompt-input');

// API SETUP
const API_KEY = "AIzaSyAAN9wDSiGKa9QSljHYhqaBve_XQXId16o";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";

const chatHistory = [];

// Function to create message elements
const createMsgElement = (content,...classes) => {
    const div = document.createElement('div');
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Function to scroll to the bottom of the chat container
const scrollToBottom = () => container.scrollTo({top:container.scrollHeight, behavior: "smooth"});

// Typing effect
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    // Set an interval to type eacah word
    const typingInterval = setInterval(() => {
        if(wordIndex < words.length){
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            botMsgDiv.classList.remove("loading");
            scrollToBottom();
        }
        else{
            clearInterval(typingInterval);
        }
    }, 40);
}

// Make API calls and generate the bot's response
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");
    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts:[{text: userMessage}]
    });
    try{
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({contents: chatHistory})
        });
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);
        // console.log(data);
        
        // Process the response and display it in the chat
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        // textElement.textContent = responseText;
        typingEffect(responseText, textElement, botMsgDiv);
    } catch (error){
        console.log(error);
    }
}

// Handle the form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  userMessage = promptInput.value.trim();
  if(!userMessage) return;
  
  promptInput.value = "";

  // Generate user message HTML and add in the chats container
  const userMsgHTML = `<p class="message-text"></p>`;
  const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    // Generate bot message HTML and add in the chats container in 600 ms
    const botMsgHTML = `<img src="docAssist_logo.svg" class="avatar"><p class="message-text">Just a sec</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600);
  
}

promptForm.addEventListener("submit", handleFormSubmit);
const chatsContainer = document.querySelector('.chats-container');
const container = document.querySelector('.container');
const promptForm = document.querySelector('.prompt-form');
const promptInput = document.querySelector('.prompt-input');

// const BACKEND_URL = "http://localhost:3000/extract_keywords"; // Backend endpoint

// API SETUP
const API_KEY = "AIzaSyAAN9wDSiGKa9QSljHYhqaBve_XQXId16o";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
let typingInterval, controller;
const chatHistory = [];

// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Function to scroll to the bottom of the chat container
const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// Typing effect
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    // set interval to type words
    typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            scrollToBottom();
        } else {
            clearInterval(typingInterval);
            botMsgDiv.classList.remove("loading");
            document.body.classList.remove("bot-responding");
        }
    }, 40);
};

// Make API call to backend
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");
    controller = new AbortController();

    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts:[{text: userMessage}]
    });

    try {
        const response = await fetch(API_URL, { // change to BACKEND_URL for local server  
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({contents: chatHistory}),
            signal: controller.signal
        });
        
        const data = await response.json(); // for API_URL
        console.log(data);

        if(!response.ok) throw new Error(data.error.message);

        // const responseText = await response.text(); //   for BACKEND_URL
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim(); // only for API_URL
    
        typingEffect(responseText, textElement, botMsgDiv); // only for API_URL
        // typingEffect(responseText.trim(), textElement, botMsgDiv); // for BACKEND_URL
        chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    } catch (error) {
        textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
        textElement.style.color = "#d62939";
        botMsgDiv.classList.remove("loading");
        document.body.classList.remove("bot-responding");
        scrollToBottom();
    }
};

// Handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();

    // Check if user message is empty or bot is already responding, then restrict the user from sending a new message
    if (!userMessage || document.body.classList.contains("bot-responding")) return;

    promptInput.value = "";
    document.body.classList.add("chats-active", "bot-responding");
    // Generate user message HTML
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() => {
        // Generate bot message HTML
        const botMsgHTML = `<img src="docAssist_logo.svg" class="avatar"><p class="message-text">Processing...</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);
    }, 600);
};

// Stop Bot Response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
    controller?.abort();
    clearInterval(typingInterval);
    chatsContainer.querySelector(".bot-message.loading").classList.remove("loading");
    document.body.classList.remove("bot-responding");
});

  // Delete all chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
    chatHistory.length = 0;
    chatsContainer.innerHTML = "";
    document.body.classList.remove("chats-active", "bot-responding");
});

promptForm.addEventListener("submit", handleFormSubmit);
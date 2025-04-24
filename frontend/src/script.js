const chatsContainer = document.querySelector('.chats-container');
const container = document.querySelector('.container');
const promptForm = document.querySelector('.prompt-form');
const promptInput = document.querySelector('.prompt-input');

const BACKEND_URL = "http://localhost:3000/extract_keywords"; // Backend endpoint

let userMessage = "";
let typingInterval, controller;
const chatHistory = [];
let session_id = "";
let username = "";


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
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id, username, text: userMessage }),
            signal: controller.signal
        });

        if (!response.ok) throw new Error("Failed to fetch response from server");

        const responseText = await response.text();
        typingEffect(responseText.trim(), textElement, botMsgDiv);
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
const handleFormSubmit = async (e) => {
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

// Load chat history from database for a specific session
const loadChatHistory = async () => {
    try {
        const response = await fetch(`http://localhost:3000/get_chats/${session_id}`);

        const chats = await response.json();

        chats.forEach(({ role, message }) => {
            const msgDiv = createMsgElement(
                `<p class="message-text">${message}</p>`, 
                role === "user" ? "user-message" : "bot-message"
            );
            chatsContainer.appendChild(msgDiv);
        });

        scrollToBottom();
    } catch (error) {
        console.error("Failed to load chat history:", error);
    }
};

const loadConversations = async () => {
    try {
        const response = await fetch(`http://localhost:3000/get_conversations?username=${encodeURIComponent(username)}`);
        const conversations = await response.json();
        console.log("Loaded conversations:", conversations);

        const conversationButtonsContainer = document.getElementById("conversation-buttons");
        conversationButtonsContainer.innerHTML = '';

        conversations.forEach((convSessionId, index) => { // Renamed variable to avoid confusion
            console.log("Conversation object:", convSessionId); // Debug log

            const conversationItem = document.createElement('li');
            conversationItem.classList.add("nav-item");

            const conversationLink = document.createElement('button');
            conversationLink.classList.add("nav-link");
            // conversationLink.textContent = `Session ID: ${convSessionId}`;
            conversationLink.textContent = `Conversation ${index + 1}`;

            if (convSessionId) {
                conversationLink.addEventListener("click", () => {
                    console.log("cliCK");
                    session_id = convSessionId; // Set the global session_id correctly
                    console.log("new session_id is:", session_id);
                    chatsContainer.innerHTML = ""; // Clear old messages
                    loadChatHistory(); // Load the chat history for this session

                    loadConversations();// On sidebar, refresh conversation list
                });
            }

            conversationItem.appendChild(conversationLink);
            conversationButtonsContainer.appendChild(conversationItem);
        });
    } catch (error) {
        console.error("Failed to load conversations:", error);
    }
};

// Start new conversation
const startNewConversation = async () => {
    try {
        const response = await fetch("http://localhost:3000/start_conversation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        const { session_id: newSessionId } = await response.json();
        session_id = newSessionId; // Store the session ID
        chatsContainer.innerHTML = ""; // Clear chat UI
        loadChatHistory(); // Load the chat history for the new session
        await loadConversations(); // Add this after setting session_id
    } catch (error) {
        console.error("Failed to start a new conversation:", error);
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize a new session when the page loads
window.onload = async () => {
    await sleep(1000);  // waits 1 seconds
    await startNewConversation();
    console.log("loading conversation for username,", username);
    await loadConversations();
};


// Delete all chats OVERRIDDEN
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
    loadChatHistory();
    testLoadConversations();
});

promptForm.addEventListener("submit", handleFormSubmit);

async function testLoadConversations() {
    try {
      const res = await fetch("http://localhost:3000/get_conversations");
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${errText}`);
      }
  
      const sessionIds = await res.json();
      console.log("✅ Unique session IDs:", sessionIds);
    } catch (err) {
      console.error("❌ Failed to load conversations:", err.message);
    }
  }
  
document.addEventListener("DOMContentLoaded", testLoadConversations);


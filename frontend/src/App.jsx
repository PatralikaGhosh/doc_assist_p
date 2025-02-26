import { useState } from "react";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (input.trim() === "") return;
  
    // Send user input to backend
    const response = await fetch("http://localhost:3000/extract_keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });
  
    const data = await response.json();
    const extractedKeywords = data.keywords.join(", ");
  
    setMessages([
      ...messages,
      { text: input, sender: "You" },
      { text: `Keywords: ${extractedKeywords}`, sender: "Bot" },
    ]);
  
    setInput("");
  };
  

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen p-4 max-w-md mx-auto bg-gray-100 shadow-lg rounded-lg">
      <div className="flex-1 overflow-y-auto border-b p-4 bg-white rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`my-2 p-2 rounded-lg ${msg.sender === "You" ? "bg-blue-200 text-right" : "bg-gray-200 text-left"}`}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          className="flex-1 p-2 border rounded-lg"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={sendMessage}>
          Send
        </button>
        <button className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg" onClick={clearChat}>
          Clear
        </button>
      </div>
    </div>
  );
}

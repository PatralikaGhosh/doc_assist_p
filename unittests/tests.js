/* Run these unit test functions within server.js manually*/

async function testConnectDB() {
try {
    const res = await fetch("http://localhost:3000/start_conversation");
    if (!res.ok) throw new Error(`Failed to connect to backend`);
    console.log("✅ MongoDB connection successful");
} catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
}
}


async function testStartConversation() {
try {
    const res = await fetch("http://localhost:3000/start_conversation", {
    method: "POST",
    });
    const data = await res.json();
    if (data.session_id && typeof data.session_id === "string") {
    console.log("✅ Session started with ID:", data.session_id);
    } else {
    throw new Error("Invalid session_id format");
    }
} catch (err) {
    console.error("❌ Failed to start conversation:", err.message);
}
}


async function testGetConversations(username) {
try {
    const res = await fetch(`http://localhost:3000/get_conversations?username=${username}`);
    if (!res.ok) throw new Error("Invalid user or server error");

    const sessionIds = await res.json();
    console.log("✅ Conversations for user:", username, sessionIds);
} catch (err) {
    console.error("❌ Failed to get conversations:", err.message);
}
}

async function testDeleteConversation(session_id) {
try {
    const res = await fetch(`http://localhost:3000/delete_conversation/${session_id}`, {
    method: "DELETE",
    });
    const result = await res.json();
    if (result.deleted) {
    console.log("✅ Deleted conversation:", session_id);
    } else {
    throw new Error("Delete failed or session not found");
    }
} catch (err) {
    console.error("❌ Failed to delete conversation:", err.message);
}
}

async function testGetChats(session_id) {
try {
    const res = await fetch(`http://localhost:3000/get_chats/${session_id}`);
    if (!res.ok) throw new Error("Invalid session_id or server error");

    const chats = await res.json();
    console.log(`✅ Chats for session ${session_id}:`, chats);
} catch (err) {
    console.error("❌ Failed to get chats:", err.message);
}
}

async function testSaveMessage() {
const sessionRes = await fetch("http://localhost:3000/start_conversation", { method: "POST" });
const { session_id } = await sessionRes.json();

try {
    const res = await fetch("http://localhost:3000/extract_keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        session_id,
        username: "testuser",
        text: "React and MongoDB testing",
    }),
    });

    const reply = await res.text();
    console.log("✅ Bot responded:", reply);
} catch (err) {
    console.error("❌ Failed to save message:", err.message);
}
}
  

/* Function calls to run */

// testConnectDB();
// testStartConversation();
// testGetConversations("testuser");
// testSaveMessage();
// testGetChats("your-session-id-here");
// testDeleteConversation("your-session-id-here");


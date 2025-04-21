import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";  // Import uuid for generating unique session IDs

dotenv.config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(process.env.MONGO_URL);

async function connectDB() {
    await client.connect();
    console.log("✅ Connected to MongoDB");
}
connectDB();

const db = client.db("chatbotDB");
const chatsCollection = db.collection("chats");

// Store messages in MongoDB with session_id
const saveMessage = async (session_id, role, username, message) => {
    await chatsCollection.insertOne({ session_id, role, username, message, timestamp: new Date() });
};

// Create a new conversation session (returns a session_id)
app.post("/start_conversation", (req, res) => {
    const session_id = uuidv4(); // Generate a unique session_id
    res.send({ session_id });
});

// Store and process the extracted keywords (with session_id)
app.post("/extract_keywords", async (req, res) => {
    const { session_id, username, text } = req.body;
    if (!session_id || !text || !username) {
        return res.status(400).send("No session_id or text provided");
    }

    await saveMessage(session_id, "user", username, text); // Log user message

    const pythonProcess = spawn("python3", ["keyword_processor.py", text]);

    let data = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (chunk) => (data += chunk.toString()));
    pythonProcess.stderr.on("data", (chunk) => (errorOutput += chunk.toString()));

    pythonProcess.on("close", async () => {
        if (errorOutput) {
            console.error("Python Error:", errorOutput.trim()); // Log extracted keywords
        }

        const botResponse = data.trim();
        await saveMessage(session_id, "bot", username, botResponse); // Log bot response

        res.send(botResponse);  // Send plain text response to frontend
    });
});

// Get all chats for a specific session_id
app.get("/get_chats/:session_id", async (req, res) => {
    const { session_id } = req.params;
    console.log("get_chats the session_id is", session_id);
    const chats = await chatsCollection.find({ session_id }).sort({ timestamp: 1 }).toArray();
    res.send(chats);
});

app.get("/get_conversations", async (req, res) => {
  try {
    const { username } = req.query;
    console.log("Calling get_conversations for username", username);
    const sessionIds = await chatsCollection.distinct("session_id", { username });
    res.json(sessionIds); // sends ["abc", "def", ...]
  } catch (err) {
    console.error("Error getting conversations:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
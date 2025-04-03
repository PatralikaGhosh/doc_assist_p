import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

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

// Store messages in MongoDB
const saveMessage = async (role, message) => {
    await chatsCollection.insertOne({ role, message, timestamp: new Date() });
};

app.post("/extract_keywords", async (req, res) => {
    const userInput = req.body.text;
    if (!userInput) {
        return res.status(400).send("No text provided");
    }

    await saveMessage("user", userInput); // Log user message

    const pythonProcess = spawn("python3", ["keyword_processor.py", userInput]);

    let data = "";
    let errorOutput = "";

    // Capture extracted keywords printed in stderr
    pythonProcess.stdout.on("data", (chunk) => (data += chunk.toString()));
    pythonProcess.stderr.on("data", (chunk) => (errorOutput += chunk.toString()));

    pythonProcess.on("close", async () => {
        if (errorOutput) {
            console.error("Python Error:", errorOutput.trim()); // Log extracted keywords
        }

        const botResponse = data.trim();
        await saveMessage("bot", botResponse); // Log bot response

        res.send(botResponse);  //Send plain text response to frontend
    });
});

// Get all chats
app.get("/get_chats", async (req, res) => {
    const chats = await chatsCollection.find().sort({ timestamp: 1 }).toArray();
    res.send(chats);
});

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
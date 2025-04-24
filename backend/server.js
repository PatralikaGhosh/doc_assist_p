import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import dotenv from "dotenv";

// Chat history imports
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";  // Import uuid for generating unique session IDs

// AWS SDK v3 imports
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";


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

// ----- AWS S3 CONFIG -----
const s3Client = new S3Client({
    region: process.env.AWS_REGION, 
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,     
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  const BUCKET_NAME = process.env.S3_BUCKET_NAME;

  console.log("Bucket name", process.env.AWS_ACCESS_KEY_ID);

// Store and process the extracted keywords (with session_id)
app.post("/extract_keywords", async (req, res) => {
  const { session_id, username, text } = req.body;
  if (!session_id || !text) {
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

// ----- NEW S3 PRE-SIGNED URL ENDPOINT -----
app.post("/get_presigned_url", async (req, res) => {
    try {
      const { fileName, fileType } = req.body;
      if (!fileName || !fileType) {
        return res.status(400).json({ error: "Missing fileName or fileType" });
      }
  
      // Create the command to put the object in S3
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        ContentType: fileType,
      });
  
      // Generate the pre-signed URL
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 60 * 5, 
      });
  
      return res.json({ url: signedUrl });
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      res.status(500).json({ error: "Failed to generate pre-signed URL" });
    }
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

  app.get("/list-files", async (req, res) => {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
      });
  
      const response = await s3Client.send(command);
  
      if (!response.Contents) {
        return res.json({ files: [] });
      }
  
      // Filter out directories and map the file URLs
      const files = response.Contents.filter(file => !file.Key.endsWith("/"))
        .map(file => ({
          fileName: file.Key,
          fileUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
        }));
  
      res.json({ files });
    } catch (error) {
      console.error("Error listing files:", error);
      res.status(500).json({ error: "Failed to list files" });
    }
  });
  
  app.post("/delete-file", async (req, res) => {
    const { fileName } = req.body;
    const bucketName = "docassistbucket";

    if (!fileName) {
        return res.status(400).json({ message: "File name is required" });
    }

    try {
        const deleteParams = {
            Bucket: bucketName,
            Key: fileName,
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));

        res.json({ message: `Successfully deleted ${fileName}` });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ message: "Failed to delete file", error: error.message });
    }
});


app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
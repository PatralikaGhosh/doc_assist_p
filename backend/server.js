import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/extract_keywords", (req, res) => {
    const userInput = req.body.text;

    const pythonProcess = spawn("python3", ["solr_document_processing.py", userInput]);

    let data = "";
    pythonProcess.stdout.on("data", (chunk) => {
        console.log("Python Output:", chunk.toString()); // Debugging output
        data += chunk.toString();
    });
    
    pythonProcess.on("close", () => {
        try {
            console.log("Final Data:", data); // Log before parsing JSON
            res.json({ keywords: JSON.parse(data) });
        } catch (error) {
            console.error("JSON parse error:", error);
            res.status(500).json({ error: "Processing failed", rawOutput: data });
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

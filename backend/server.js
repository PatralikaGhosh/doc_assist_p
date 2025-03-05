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
    if (!userInput) {
        return res.status(400).send("No text provided");
    }

    const pythonProcess = spawn("python3", ["keyword_processor.py", userInput]);

    let data = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (chunk) => {
        data += chunk.toString();
    });

    // Capture extracted keywords printed in stderr
    pythonProcess.stderr.on("data", (chunk) => {
        errorOutput += chunk.toString();
    });

    pythonProcess.on("close", () => {
        if (errorOutput) {
            console.error("Python Error:", errorOutput.trim()); // Log extracted keywords
        }
        res.send(data.trim()); //Send plain text response to frontend
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import dotenv from "dotenv";
// AWS SDK v3 imports
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";



dotenv.config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
  

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

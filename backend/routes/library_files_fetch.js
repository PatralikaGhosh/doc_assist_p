import express from "express";
import AWS from "aws-sdk";

const router = express.Router();

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

router.get("/list-pdfs", async (req, res) => {
  try {
    const data = await s3
      .listObjectsV2({ Bucket: BUCKET_NAME, Prefix: "" })
      .promise();

    const pdfFiles = data.Contents
      .filter(item => item.Key.endsWith(".pdf"))
      .map(item => item.Key);

    res.json({ files: pdfFiles });
  } catch (err) {
    console.error("Error listing PDFs:", err);
    res.status(500).json({ error: "Could not list PDF files" });
  }
});

export default router;

const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file first!');
    return;
  }

  // 1. Request a pre-signed URL from your server
  const fileName = file.name;
  const fileType = file.type;

  try {
    const response = await fetch('http://localhost:3000/get_presigned_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileName, fileType })
    });

    const data = await response.json();
    const { url } = data; // The pre-signed URL from the server

    // 2. Upload the file to S3 using the pre-signed URL
    const upload = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType
      },
      body: file
    });

    if (upload.ok) {
      alert('File uploaded successfully!');
      // Optionally, you can store the file metadata here or notify your server
    } else {
      alert('Failed to upload file.');
    }
  } catch (error) {
    console.error('Error uploading the file:', error);
    alert('Error uploading the file!');
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const pdfList = document.getElementById("pdf-links");
  const s3BucketUrl = "https://docassistbucket.s3.amazonaws.com/";

  try {
    const res = await fetch("/api/list-pdfs");
    const { files } = await res.json();

    files.forEach(file => {
      const link = document.createElement("a");
      link.href = s3BucketUrl + encodeURIComponent(file);
      link.textContent = file;
      link.target = "_blank";
      link.classList.add("pdf-link");
      pdfList.appendChild(link);
      pdfList.appendChild(document.createElement("br"));
    });
  } catch (err) {
    console.error("Failed to fetch PDF list:", err);
    pdfList.textContent = "Failed to load PDF files.";
  }
});
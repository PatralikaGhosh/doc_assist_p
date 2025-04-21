const uploadTriggerBtn = document.getElementById('uploadTriggerBtn');
const uploadPopup = document.getElementById('uploadPopup');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

uploadTriggerBtn.addEventListener('click', () => {
    console.log("Upload button clicked!");
    uploadPopup.classList.toggle('hidden');
  });

  uploadBtn.addEventListener('click', async () => {
    const files = fileInput.files;
    if (!files.length) {
      alert('Please select at least one file!');
      return;
    }
  
    for (const file of files) {
      const fileName = file.name;
      const fileType = file.type;
  
      try {
        // Get pre-signed URL
        const response = await fetch('http://localhost:3000/get_presigned_url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileName, fileType })
        });
  
        const data = await response.json();
        const { url } = data;
  
        // Upload file
        const upload = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': fileType
          },
          body: file
        });
  
        if (!upload.ok) {
          alert(`Failed to upload ${fileName}`);
        }
      } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
        alert(`Error uploading ${fileName}`);
      }
    }
  
    alert('All files uploaded!');
    fileInput.value = ""; // Clear the input
    uploadPopup.classList.add('hidden'); // Hide popup
  });

fileInput.addEventListener("change", () => {
const selected = Array.from(fileInput.files).map(f => f.name).join(", ");
console.log("Selected files:", selected);
});
  

document.addEventListener("DOMContentLoaded", () => {
    const uploadTriggerBtn = document.getElementById('uploadTriggerBtn');
    const uploadPopup = document.getElementById('uploadPopup');
    const closePopupBtn = document.getElementById('closePopupBtn');
  
    uploadTriggerBtn.addEventListener('click', () => {
      uploadPopup.classList.remove('hidden');
    });
  
    closePopupBtn.addEventListener('click', () => {
      uploadPopup.classList.add('hidden');
    });
  
    // Your existing upload logic here...
  });
  
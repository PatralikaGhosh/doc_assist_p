import { onAuthReady } from '/src/auth.js';

document.addEventListener("DOMContentLoaded", () => {
    const fileListContainer = document.getElementById("file-list");
    const searchForm        = document.getElementById("searchForm");
    const searchInput       = searchForm.querySelector('input[name="q"]');
  
    /** In‑memory cache of everything we get from S3 */
    let allFiles = [];
    let currentUser = "";
    const allowedEmails = ["pyxis2100@gmail.com", "timothy.smithii@tamu.edu", "rohanganta@tamu.edu", "avanti@gmail.com"];
  
    /* ---------------------------------------------------------- *
     * 1.  Fetch & render ALL files once on load
     * ---------------------------------------------------------- */
    async function loadFiles() {
      try {
        const res  = await fetch("http://localhost:3000/list-files"); // ← your existing endpoint
        const data = await res.json();
        allFiles   = data?.files ?? [];
        renderList(allFiles);
      } catch (err) {
        console.error("Error fetching files:", err);
        fileListContainer.innerHTML = "<p>Error loading files.</p>";
      }
    }
  
    /* ---------------------------------------------------------- *
     * 2.  Render a given list of file objects
     * ---------------------------------------------------------- */
    function renderList(list = []) {
      const isAdmin = currentUser && allowedEmails.includes(currentUser.email);
      
      fileListContainer.innerHTML = "";                                // wipe previous
      if (!list.length) {
        fileListContainer.innerHTML = "<p>No files found.</p>";
        return;
      }
  
      list.forEach(({ fileName, fileUrl }) => {
        const fileItem      = document.createElement("div");
        fileItem.className  = "file-item";
  
        const link          = document.createElement("a");
        link.className      = "file-name";
        link.href           = fileUrl;
        link.textContent    = fileName;
        link.target         = "_blank";
  
        const delBtn        = document.createElement("button");
        delBtn.className    = "delete-button";
        delBtn.textContent  = "Delete";
        delBtn.onclick      = () => deleteFile(fileName);
        
        delBtn.style.visibility = isAdmin ? "visible" : "hidden"; // Admin only can use delete button
        
        fileItem.append(link, delBtn);
        fileListContainer.appendChild(fileItem);
      });
    }
  
    /* ---------------------------------------------------------- *
     * 3.  Handle search (ENTER key or search‑button click)
     * ---------------------------------------------------------- */
    searchForm.addEventListener("submit", e => {
      e.preventDefault();                                   // stop the page reload
      const term = searchInput.value.trim().toLowerCase();
  
      // Blank search ‑‑> show everything
      if (!term) {
        renderList(allFiles);
        return;
      }
  
      // Client‑side filtering
      const filtered = allFiles.filter(f =>
        f.fileName.toLowerCase().includes(term)
      );
      renderList(filtered);
  
      /* --- Server‑side option ----------------------------------
         If you’d rather let Express/S3 do the filtering, call:
           fetch(`http://localhost:3000/list-files?q=${encodeURIComponent(term)}`)
         then renderList() the returned subset.
      ----------------------------------------------------------- */
    });
  
    /* ---------------------------------------------------------- *
     * 4.  Existing delete logic (unchanged)
     * ---------------------------------------------------------- */
    async function deleteFile(fileName) {
      if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;
  
      try {
        const res  = await fetch("http://localhost:3000/delete-file", {
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body   : JSON.stringify({ fileName }),
        });
        const data = await res.json();
        alert(data.message);
        // Remove from local cache & re‑render
        allFiles = allFiles.filter(f => f.fileName !== fileName);
        renderList(allFiles);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    /* ---------------------------------------------------------- *
   * 5.  Get user from auth.js, then load and render files
   * ---------------------------------------------------------- */
    onAuthReady(user => {
      currentUser = user;
      loadFiles(); // now renderList will have access to currentUser, kick things off
    });
  });
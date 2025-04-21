/**
 * @jest-environment jsdom
 */

describe("Chat interface functionality", () => {
    let promptForm, promptInput, themeToggleBtn, chatsContainer, stopBtn, deleteBtn;
  
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="container"></div>
        <div class="chats-container"></div>
        <form class="prompt-form">
          <input class="prompt-input" />
          <button type="submit">Send</button>
        </form>
        <button id="theme-toggle-btn">dark_mode</button>
        <button id="stop-response-btn">Stop</button>
        <button id="delete-chats-btn">Delete</button>
      `;
  
      // Required global references
      promptForm = document.querySelector(".prompt-form");
      promptInput = document.querySelector(".prompt-input");
      themeToggleBtn = document.querySelector("#theme-toggle-btn");
      chatsContainer = document.querySelector(".chats-container");
      stopBtn = document.querySelector("#stop-response-btn");
      deleteBtn = document.querySelector("#delete-chats-btn");
  
      jest.resetModules();
      require("./script"); // Make sure your chat script is exported properly
    });
  
    test("toggles theme correctly", () => {
      expect(document.body.classList.contains("light-theme")).toBe(false);
      themeToggleBtn.click();
      expect(document.body.classList.contains("light-theme")).toBe(true);
      expect(themeToggleBtn.textContent).toBe("dark_mode");
    });
  
    test("deletes chats", () => {
      chatsContainer.innerHTML = "<div class='message'>test</div>";
      deleteBtn.click();
      expect(chatsContainer.innerHTML).toBe("");
    });
  
    test("stops bot response safely", () => {
      document.body.classList.add("bot-responding");
      chatsContainer.innerHTML = "<div class='bot-message loading'><p class='message-text'>Loading...</p></div>";
      stopBtn.click();
  
      expect(document.body.classList.contains("bot-responding")).toBe(false);
      expect(chatsContainer.querySelector(".bot-message").classList.contains("loading")).toBe(false);
    });
  });
  
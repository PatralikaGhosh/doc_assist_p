/**
 * @jest-environment jsdom
 */

describe("Sidebar functionality", () => {
    let sidebar, sidebarToggler, menuToggler, span;
  
    beforeEach(() => {
      // Set up HTML structure
      document.body.innerHTML = `
        <div class="sidebar"></div>
        <button class="sidebar-toggler"></button>
        <button class="menu-toggler"><span>menu</span></button>
      `;
  
      // Assign DOM elements
      sidebar = document.querySelector(".sidebar");
      sidebarToggler = document.querySelector(".sidebar-toggler");
      menuToggler = document.querySelector(".menu-toggler");
      span = menuToggler.querySelector("span");
  
      // Mock scrollHeight
      Object.defineProperty(sidebar, "scrollHeight", {
        value: 200,
        writable: true,
      });
  
      // Reload the sidebar module for fresh event listeners each test
      jest.resetModules();
      require("./sidebar");
    });
  
    test("toggles 'collapsed' class when sidebar-toggler is clicked", () => {
      expect(sidebar.classList.contains("collapsed")).toBe(false);
  
      sidebarToggler.click();
      expect(sidebar.classList.contains("collapsed")).toBe(true);
  
      sidebarToggler.click();
      expect(sidebar.classList.contains("collapsed")).toBe(false);
    });
  
  
    test("sets height to fullSidebarHeight on window resize for width >= 1024px", () => {
      window.innerWidth = 1200;
      window.dispatchEvent(new Event("resize"));
  
      expect(sidebar.style.height).toBe("calc(100vh - 32px)");
    });
  
    test("removes 'collapsed' and adjusts height for width < 1024px (menu inactive)", () => {
      sidebar.classList.add("collapsed");
  
      window.innerWidth = 768;
      window.dispatchEvent(new Event("resize"));
  
      expect(sidebar.classList.contains("collapsed")).toBe(false);
      expect(sidebar.style.height).toBe("56px"); // menu inactive, default collapsed height
    });
  
    test("adjusts height correctly on resize if menu is active", () => {
      menuToggler.click(); // activate menu first
  
      window.innerWidth = 768;
      window.dispatchEvent(new Event("resize"));
  
      expect(sidebar.classList.contains("menu-active")).toBe(true);
      expect(sidebar.style.height).toBe("200px"); // height based on scrollHeight
    });
  });
  
const themeToggleBtn = document.querySelector("#theme-toggle-btn");

// Set initial theme from local storage
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
const themeIcon = document.querySelector("#theme-icon");
themeIcon.textContent = isLightTheme ? "dark_mode" : "light_mode";


// Toggle dark/light theme
themeToggleBtn.addEventListener("click", () => {
    const isLightTheme = document.body.classList.toggle("light-theme");
    localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
    themeIcon.textContent = isLightTheme ? "dark_mode" : "light_mode";
});
// Simple JS for mobile menu toggle (optional for future use)

document.addEventListener("DOMContentLoaded", function() {
  const menuButton = document.querySelector(".show-menu-space");
  const menuSpace = document.getElementById("menu-space");

  if (menuButton && menuSpace) {
    menuButton.addEventListener("click", function() {
      menuSpace.classList.toggle("spring-open");
    });
  }

  console.log("Website Loaded Successfully!");
});

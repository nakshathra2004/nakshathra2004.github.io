document.addEventListener("DOMContentLoaded", function () {
  // Theme toggle functionality
  const toggleBtn = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");

  function setTheme(dark) {
    document.body.classList.toggle("dark-mode", dark);
    themeIcon.classList.remove("fa-moon", "fa-sun");
    themeIcon.classList.add(dark ? "fa-sun" : "fa-moon");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  // Initial theme
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    setTheme(true);
  } else {
    setTheme(false);
  }

  toggleBtn.addEventListener("click", function () {
    setTheme(!document.body.classList.contains("dark-mode"));
  });

  // Mobile navigation toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("navMenu");

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      const icon = mobileToggle.querySelector("i");
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    });
  }

  // Close mobile menu when clicking on nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      // Smooth scroll with offset for sticky navbar
      const href = this.getAttribute('href');
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
      if (navMenu && mobileToggle) {
        navMenu.classList.remove("active");
        const icon = mobileToggle.querySelector("i");
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-times");
      }
      // Update active nav link
      navLinks.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Update active nav link on scroll (with header offset)
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // triggers when section is in viewport center
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const navLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (navLink) {
          navLinks.forEach(l => l.classList.remove("active"));
          navLink.classList.add("active");
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
});

// Always scroll to top on reload
window.addEventListener("load", function () {
  setTimeout(() => window.scrollTo(0, 0), 1);
});
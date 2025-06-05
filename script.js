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

// Smooth scroll to #about if user scrolls down from hero section (works in both light and dark mode)
(function() {
  const hero = document.getElementById('home');
  const about = document.getElementById('about');
  let scrolled = false;

  function shouldScroll() {
    // Only trigger if we're near the top of the page and hero is mostly visible
    return window.scrollY < 50 && hero && about;
  }

  if (hero && about) {
    // Mouse wheel
    hero.addEventListener('wheel', function(e) {
      if (!scrolled && e.deltaY > 0 && shouldScroll()) {
        scrolled = true;
        about.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { scrolled = false; }, 400);
        e.preventDefault();
      }
    }, { passive: false });

    // Touch devices (swipe up)
    let touchStartY = null;
    hero.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) touchStartY = e.touches[0].clientY;
    });
    hero.addEventListener('touchmove', function(e) {
      if (touchStartY !== null && e.touches.length === 1) {
        const touchEndY = e.touches[0].clientY;
        if (touchStartY - touchEndY > 40 && shouldScroll()) {
          about.scrollIntoView({ behavior: 'smooth' });
          touchStartY = null;
        }
      }
    });
    hero.addEventListener('touchend', function() { touchStartY = null; });
  }
})();

// Smooth scroll to the next section when scrolling down from any section
(function() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  let scrolled = false;

  function getNextSection(current) {
    const idx = sections.indexOf(current);
    return idx !== -1 && idx < sections.length - 1 ? sections[idx + 1] : null;
  }

  sections.forEach(section => {
    // Mouse wheel
    section.addEventListener('wheel', function(e) {
      if (!scrolled && e.deltaY > 0 && window.scrollY < section.offsetTop + 50) {
        const next = getNextSection(section);
        if (next) {
          scrolled = true;
          next.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => { scrolled = false; }, 400);
          e.preventDefault();
        }
      }
    }, { passive: false });

    // Touch devices (swipe up)
    let touchStartY = null;
    section.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) touchStartY = e.touches[0].clientY;
    });
    section.addEventListener('touchmove', function(e) {
      if (touchStartY !== null && e.touches.length === 1) {
        const touchEndY = e.touches[0].clientY;
        if (touchStartY - touchEndY > 40 && window.scrollY < section.offsetTop + 50) {
          const next = getNextSection(section);
          if (next) {
            next.scrollIntoView({ behavior: 'smooth' });
            touchStartY = null;
          }
        }
      }
    });
    section.addEventListener('touchend', function() { touchStartY = null; });
  });
})();
// ============================================
// MAIN JAVASCRIPT
// Navigation, Modals, Scroll Animations
// ============================================

(function () {
  // --- Navigation ---
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
  const pages = document.querySelectorAll('.page');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Page Navigation
  function navigateTo(pageId) {
    // Hide all pages
    pages.forEach(p => p.classList.remove('active'));
    // Show target page
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav active state
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + pageId);
    });

    // Close mobile nav
    if (hamburger) hamburger.classList.remove('open');
    if (mobileNav) mobileNav.classList.remove('open');
    document.body.style.overflow = '';

    // Trigger reveal animations
    setTimeout(revealOnScroll, 100);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('href').substring(1);
      navigateTo(pageId);
      history.pushState(null, '', '#' + pageId);
    });
  });

  // Handle hash navigation
  function handleHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      navigateTo(hash);
    } else {
      navigateTo('home');
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();

  // --- Scroll Reveal ---
  function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;

    reveals.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < windowHeight - 80) {
        el.classList.add('visible');
      }
    });

    // Animate skill bars
    const skillBars = document.querySelectorAll('.skill-bar');
    skillBars.forEach(bar => {
      const top = bar.getBoundingClientRect().top;
      if (top < windowHeight - 50) {
        const width = bar.getAttribute('data-width');
        if (width && !bar.classList.contains('animated')) {
          bar.style.width = width;
          bar.classList.add('animated');
        }
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);

  // --- Certificate Modal ---
  const certCards = document.querySelectorAll('.cert-card');
  const modal = document.getElementById('cert-modal');
  const modalImg = document.getElementById('cert-modal-img');
  const modalClose = document.querySelector('.modal-close');

  certCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-cert-img');
      if (imgSrc && modalImg) {
        modalImg.src = imgSrc;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // --- Contact Form (Web3Forms) ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('[name="name"]').value.trim();
      const email = contactForm.querySelector('[name="email"]').value.trim();
      const message = contactForm.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        showNotification('Please fill in all fields.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          showNotification('Message sent successfully! I will get back to you soon.', 'success');
          contactForm.reset();
        } else {
          showNotification('Failed to send message. Please try again.', 'error');
        }
      } catch (error) {
        showNotification('Network error. Please try again later.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  function showNotification(msg, type) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.cssText = `
      position: fixed;
      top: 90px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      z-index: 3000;
      animation: slideIn 0.3s ease;
      backdrop-filter: blur(10px);
      max-width: 400px;
    `;

    if (type === 'success') {
      notif.style.background = 'rgba(0, 255, 136, 0.15)';
      notif.style.border = '1px solid rgba(0, 255, 136, 0.3)';
      notif.style.color = '#00ff88';
    } else {
      notif.style.background = 'rgba(255, 60, 60, 0.15)';
      notif.style.border = '1px solid rgba(255, 60, 60, 0.3)';
      notif.style.color = '#ff5555';
    }

    notif.textContent = msg;
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 4000);
  }

  // Add notification animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
  `;
  document.head.appendChild(style);

  // --- Typing Effect for Hero ---
  const typingEl = document.querySelector('.typing-text');
  if (typingEl) {
    const words = ['Engineer', 'Developer', 'Founder', 'Leader', 'Innovator'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        typingEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 60 : 120;

      if (!isDeleting && charIndex === currentWord.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 500;
      }

      setTimeout(typeEffect, delay);
    }

    typeEffect();
  }

  // --- Counter Animation ---
  const counters = document.querySelectorAll('.stat-number');
  let counterAnimated = false;

  function animateCounters() {
    if (counterAnimated) return;
    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    const rect = statsBar.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      counterAnimated = true;
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            counter.textContent = target;
            clearInterval(timer);
          } else {
            counter.textContent = Math.floor(current);
          }
        }, 30);
      });
    }
  }

  window.addEventListener('scroll', animateCounters);

  // --- Security Headers (Basic) ---
  // Prevent clickjacking
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }
})();

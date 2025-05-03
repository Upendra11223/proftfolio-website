document.addEventListener('DOMContentLoaded', function () {
  // ========== THEME TOGGLE ==========
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle?.querySelector('i');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon?.classList.replace('fa-moon', 'fa-sun');
  }
  themeToggle?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    if (themeIcon) {
      themeIcon.classList.replace(isLight ? 'fa-moon' : 'fa-sun', isLight ? 'fa-sun' : 'fa-moon');
    }
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  // ========== MOBILE MENU TOGGLE ==========
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  mobileMenuBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        navLinks?.classList.remove('active');
        mobileMenuBtn?.querySelector('i')?.classList.replace('fa-times', 'fa-bars');
        window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

  // ========== INTERSECTION OBSERVER ==========
  const animatedElements = document.querySelectorAll('.project-card, .skill-card, .timeline-item, .publication-card, .skill-bar');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animatedElements.forEach(el => observer.observe(el));

  // ========== FALLBACK SCROLL ==========
  function fallbackScrollReveal() {
    const scrollElements = document.querySelectorAll('.scroll-fade, .scroll-up');
    scrollElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60 && rect.bottom > 0) {
        el.classList.add('in-view');
      }
    });
  }
  window.addEventListener('scroll', fallbackScrollReveal);
  fallbackScrollReveal();

  // ========== SKILL BAR ANIMATION ==========
  document.querySelectorAll('.skill-bar').forEach(bar => {
    const percentage = bar.getAttribute('data-percentage') || '85';
    bar.style.width = '0';
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            bar.style.transition = 'width 1s ease';
            bar.style.width = percentage + '%';
          }, 200);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(bar);
  });

  // ========== NAV LINK HIGHLIGHT ==========
  function highlightNavOnScroll() {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', highlightNavOnScroll);

  // ========== CONTACT FORM HANDLER ==========
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const message = document.getElementById('message')?.value;
    if (!name || !email || !message) {
      alert('Please fill all the fields');
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/upendrakhanal2006@gmail.com';
    form.style.display = 'none';

    const inputs = [
      { name: 'name', value: name },
      { name: 'email', value: email },
      { name: 'message', value: message }
    ];
    inputs.forEach(({ name, value }) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    alert(`Thanks for your message, ${name}! Redirecting...`);
  });

  // ========== PARALLAX ==========
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        header.style.backgroundPosition = `center ${scrollY * 0.4}px`;
      }
    });
  }

  // ========== TYPEWRITER EFFECT ==========
  function typeWriterEffect(element, speed = 75) {
    const text = element.textContent;
    element.textContent = '';
    let index = 0;

    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  const typewriterSpan = document.querySelector('.typewriter-text');
  if (typewriterSpan) {
    typewriterSpan.style.borderRight = '2px solid var(--primary-color)';
    typewriterSpan.style.paddingRight = '5px';
    typewriterSpan.style.whiteSpace = 'nowrap';
    typewriterSpan.style.overflow = 'hidden';

    typeWriterEffect(typewriterSpan, 60);
  }
});

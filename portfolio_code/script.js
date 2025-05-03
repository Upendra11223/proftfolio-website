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

  // ========== IMPROVED SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close mobile menu if open
        navLinks?.classList.remove('active');
        mobileMenuBtn?.querySelector('i')?.classList.replace('fa-times', 'fa-bars');
        
        // Calculate offset based on viewport height for better mobile experience
        const offset = window.innerHeight < 600 ? 60 : 80;
        window.scrollTo({ 
          top: targetElement.offsetTop - offset, 
          behavior: 'smooth' 
        });
      }
    });
  });

  // ========== ENHANCED INTERSECTION OBSERVER ==========
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  };
  
  // Different animations for different element types
  const animateElement = (element) => {
    if (element.classList.contains('project-card')) {
      element.style.animationDelay = '0.1s';
      element.classList.add('in-view', 'scroll-up');
    } else if (element.classList.contains('skill-card')) {
      const index = Array.from(document.querySelectorAll('.skill-card')).indexOf(element);
      element.style.animationDelay = `${index * 0.1}s`;
      element.classList.add('in-view', 'scroll-up');
    } else if (element.classList.contains('timeline-item')) {
      const index = Array.from(document.querySelectorAll('.timeline-item')).indexOf(element);
      element.style.animationDelay = `${index * 0.15}s`;
      element.classList.add('in-view', 'scroll-up');
    } else if (element.classList.contains('publication-card')) {
      const index = Array.from(document.querySelectorAll('.publication-card')).indexOf(element);
      element.style.animationDelay = `${index * 0.15}s`;
      element.classList.add('in-view', 'scroll-fade');
    } else {
      element.classList.add('in-view');
    }
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateElement(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all animated elements
  document.querySelectorAll('.project-card, .skill-card, .timeline-item, .publication-card, .scroll-fade, .scroll-up').forEach(el => {
    observer.observe(el);
  });

  // ========== IMPROVED SKILL BAR ANIMATION ==========
  document.querySelectorAll('.skill-bar').forEach(bar => {
    const width = bar.style.width || '0%';
    bar.style.width = '0';
    
    const skillObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            bar.style.transition = 'width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            bar.style.width = width;
          }, 300);
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    skillObserver.observe(bar);
  });

  // ========== ACTIVE NAV HIGHLIGHTING ==========
  function highlightNavOnScroll() {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    // Get the current scroll position
    const scrollPosition = window.scrollY;
    
    // Find the current section
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        // Remove active class from all nav items
        navItems.forEach(item => {
          item.classList.remove('active');
        });
        
        // Add active class to current nav item
        const currentNavItem = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
        if (currentNavItem) {
          currentNavItem.classList.add('active');
        }
      }
    });
  }
  
  window.addEventListener('scroll', highlightNavOnScroll);
  highlightNavOnScroll();

  // ========== ENHANCED TYPEWRITER EFFECT ==========
  function typeWriterEffect(element, text, speed = 75) {
    let i = 0;
    element.innerHTML = '';
    element.style.borderRight = '2px solid var(--primary-color)';
    
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // Add blinking cursor effect after typing is done
        element.style.animation = 'blinkCursor 0.8s infinite';
      }
    }
    
    type();
  }
  
  const typewriterElement = document.querySelector('.typewriter-text');
  if (typewriterElement) {
    const text = typewriterElement.textContent;
    typeWriterEffect(typewriterElement, text, 60);
  }

  // ========== PARALLAX HEADER EFFECT ==========
  function handleParallax() {
    const header = document.querySelector('header');
    const scrollPosition = window.scrollY;
    
    if (header && scrollPosition < window.innerHeight) {
      // Create subtle parallax effect
      const translateY = scrollPosition * 0.4;
      header.style.backgroundPosition = `center ${translateY}px`;
      
      // Add fading effect to header content
      const profileContainer = document.querySelector('.profile-container');
      if (profileContainer) {
        const opacity = 1 - (scrollPosition / (window.innerHeight * 0.7));
        profileContainer.style.opacity = Math.max(opacity, 0);
      }
    }
  }
  
  window.addEventListener('scroll', handleParallax);
  handleParallax();

  // ========== CONTACT FORM ENHANCEMENT ==========
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const formInputs = contactForm.querySelectorAll('input, textarea');
    
    // Add focus effects to form inputs
    formInputs.forEach(input => {
      const formGroup = input.closest('.form-group');
      
      input.addEventListener('focus', () => {
        formGroup.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        if (!input.value) {
          formGroup.classList.remove('focused');
        }
      });
      
      // Check if input already has value (e.g., on page reload)
      if (input.value) {
        formGroup.classList.add('focused');
      }
    });
    
    // Form submission
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name')?.value;
      const email = document.getElementById('email')?.value;
      const message = document.getElementById('message')?.value;
      
      if (!name || !email || !message) {
        alert('Please fill in all the fields');
        return;
      }
      
      // Create and submit form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://formsubmit.co/upendrakhanal2006@gmail.com';
      form.style.display = 'none';
      
      const fields = [
        { name: 'name', value: name },
        { name: 'email', value: email },
        { name: 'message', value: message }
      ];
      
      fields.forEach(field => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      
      // Show success message with animation
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        submitBtn.style.backgroundColor = '#28a745';
        
        // Reset form after delay
        setTimeout(() => {
          form.submit();
          alert(`Thanks for your message, ${name}! I'll be in touch soon.`);
          submitBtn.innerHTML = originalText;
          submitBtn.style.backgroundColor = '';
          submitBtn.disabled = false;
          contactForm.reset();
          
          // Remove focused class from all inputs
          formInputs.forEach(input => {
            input.closest('.form-group').classList.remove('focused');
          });
        }, 1500);
      }, 1500);
    });
  }

  // ========== Add CSS Animation Classes ==========
  document.querySelectorAll('.skill-card').forEach((card, index) => {
    card.classList.add('has-animation');
    card.style.animationDelay = `${index * 0.1}s`;
  });
});

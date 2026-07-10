(function () {
  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  if (savedTheme === "light" || savedTheme === "dark") root.setAttribute("data-theme", savedTheme);

  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    var setIcon = function () {
      var isDark = root.getAttribute("data-theme") !== "light";
      themeToggle.textContent = isDark ? "🌙" : "☀️";
    };
    setIcon();
    themeToggle.addEventListener("click", function () {
      var darkNow = root.getAttribute("data-theme") !== "light";
      var next = darkNow ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      setIcon();
    });
  }

  var progress = document.getElementById("scroll-progress");
  var header = document.getElementById("topbar");
  var updateScrollUi = function () {
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (scrollTop / max) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (header) header.classList.toggle("scrolled", scrollTop > 16);
  };
  updateScrollUi();
  window.addEventListener("scroll", updateScrollUi, { passive: true });

  if (!prefersReduced && "IntersectionObserver" in window) {
    var reveals = document.querySelectorAll(".reveal");
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });

    reveals.forEach(function (el, idx) {
      el.style.transitionDelay = Math.min(idx * 80, 320) + "ms";
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  var counters = document.querySelectorAll("[data-counter]");
  var animateCounter = function (el) {
    var end = parseInt(el.getAttribute("data-counter"), 10) || 0;
    if (prefersReduced) {
      el.textContent = String(end);
      return;
    }
    var start = null;
    var duration = 1100;
    var tick = function (time) {
      if (!start) start = time;
      var progress = Math.min((time - start) / duration, 1);
      el.textContent = String(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = String(end);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  var navLinks = document.querySelectorAll("nav a[href^='#']");
  var sectionById = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    sectionById[id] = document.getElementById(id);
  });

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + id);
        });
      });
    }, { threshold: 0.55 });

    Object.keys(sectionById).forEach(function (key) {
      if (sectionById[key]) sectionObserver.observe(sectionById[key]);
    });
  }

  if (!prefersReduced && window.matchMedia("(hover: hover)").matches) {
    var magneticButtons = document.querySelectorAll(".magnetic");
    magneticButtons.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + (x * 0.08).toFixed(2) + "px," + (y * 0.08).toFixed(2) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });

    var tiltCards = document.querySelectorAll(".tilt");
    tiltCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 8;
        var ry = (px - 0.5) * 10;
        card.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-3px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }
})();

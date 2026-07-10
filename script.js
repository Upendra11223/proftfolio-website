(function () {
  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  var themeButton = document.getElementById("theme");
  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark" ||
        (!root.hasAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var spotlight = document.getElementById("spotlight");
  if (spotlight && !reducedMotion && window.matchMedia("(hover: hover)").matches) {
    var pending = false;
    window.addEventListener("mousemove", function (e) {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        spotlight.style.setProperty("--mx", e.clientX + "px");
        spotlight.style.setProperty("--my", e.clientY + "px");
        pending = false;
      });
    }, { passive: true });
  }

  var typed = document.getElementById("typed-role");
  if (typed) {
    if (reducedMotion) {
      typed.textContent = "a web developer and AI researcher.";
    } else {
      var words = ["a web developer.", "an AI researcher.", "a JavaScript builder."];
      var word = 0;
      var idx = 0;
      var removing = false;
      var tick = function () {
        var current = words[word];
        if (removing) {
          idx -= 1;
          typed.textContent = current.slice(0, idx);
          if (idx === 0) {
            removing = false;
            word = (word + 1) % words.length;
            setTimeout(tick, 250);
            return;
          }
          setTimeout(tick, 40);
          return;
        }
        idx += 1;
        typed.textContent = current.slice(0, idx);
        if (idx === current.length) {
          removing = true;
          setTimeout(tick, 1200);
          return;
        }
        setTimeout(tick, 70);
      };
      tick();
    }
  }

  if (!reducedMotion && "IntersectionObserver" in window) {
    var revealTargets = document.querySelectorAll("section, .stat-card, .project-card, .skill-card, .list > li");
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (Math.min(i % 6, 4) * 55) + "ms";
      revealObserver.observe(el);
    });

    var bars = document.querySelectorAll(".skill-bar");
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    bars.forEach(function (bar) { barObserver.observe(bar); });

    var counters = document.querySelectorAll("[data-counter]");
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var end = parseInt(el.getAttribute("data-counter"), 10) || 0;
        var duration = 1100;
        var startTime = null;

        var step = function (t) {
          if (!startTime) startTime = t;
          var progress = Math.min((t - startTime) / duration, 1);
          var value = Math.floor(progress * end);
          el.textContent = String(value);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = String(end);
          }
        };

        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.45 });

    counters.forEach(function (counter) { counterObserver.observe(counter); });
  } else {
    document.querySelectorAll(".skill-bar").forEach(function (bar) {
      bar.classList.add("animate");
    });
    document.querySelectorAll("[data-counter]").forEach(function (el) {
      el.textContent = el.getAttribute("data-counter");
    });
  }

  var tiltCards = document.querySelectorAll(".tilt-card");
  if (!reducedMotion && window.matchMedia("(hover: hover)").matches) {
    tiltCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 10;
        var ry = (px - 0.5) * 12;
        card.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }
})();

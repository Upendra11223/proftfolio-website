// Theme toggle and scroll reveals.
(function () {
  var root = document.documentElement;

  /* ---------- theme: follows system until you pick one ---------- */
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function isDark() {
    return root.getAttribute("data-theme") === "dark" ||
      (!root.hasAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("theme");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
      });
    }

    /* ---------- scroll reveals: things pop in as you reach them ---------- */
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    var targets = document.querySelectorAll(
      ".section-head, .card, .papers > li, .timeline > li, .facts > li, .contact"
    );
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });

    targets.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = ((i % 4) * 70) + "ms";
      io.observe(el);
    });
  });
})();

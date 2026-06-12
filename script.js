// Theme toggle, scroll reveals, and the cursor spotlight.
(function () {
  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme: follows system until you pick one ---------- */
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  document.getElementById("theme").addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark" ||
      (!root.hasAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- cursor spotlight ---------- */
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

  /* ---------- scroll reveals, staggered ---------- */
  if (!reducedMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll("section, .list > li");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    targets.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (Math.min(i % 6, 4) * 60) + "ms";
      io.observe(el);
    });
  }
})();

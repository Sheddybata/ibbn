(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var header = document.querySelector(".site-header");
  var year = document.getElementById("year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (!toggle || !nav || !header) return;

  var mqMobile = window.matchMedia("(max-width: 900px)");

  function setMenuOpen(open) {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (mqMobile.matches) {
      document.body.style.overflow = open ? "hidden" : "";
    }
  }

  toggle.addEventListener("click", function () {
    setMenuOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (mqMobile.matches) {
        setMenuOpen(false);
      }
    });
  });

  window.addEventListener("resize", function () {
    if (!mqMobile.matches) {
      setMenuOpen(false);
      document.body.style.overflow = "";
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mqMobile.matches && nav.classList.contains("is-open")) {
      setMenuOpen(false);
    }
  });
})();

(function () {
  function openDetailsFromHash() {
    var hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return;
    var el = document.getElementById(hash);
    if (!el) return;
    if (el.tagName === "DETAILS") {
      el.open = true;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  openDetailsFromHash();
  window.addEventListener("hashchange", openDetailsFromHash);
})();

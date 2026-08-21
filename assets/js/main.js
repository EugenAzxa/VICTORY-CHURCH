/* Victory Church International - site behaviour */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- loader: through the years ---------------- */
  var loader = document.getElementById("loader");
  if (loader) {
    var STEPS = [
      { year: "33 AD", place: "Jerusalem", line: "The Spirit falls at Pentecost. People speak in languages they never learned. The movement takes its name from this day." },
      { year: "1856", place: "Weston, Ontario", line: "Anglicans raise a red brick church on Weston Road. A cross is set on the gable." },
      { year: "1906", place: "Azusa Street, Los Angeles", line: "William Seymour, son of formerly enslaved parents, leads the revival that carries Pentecost around the world." },
      { year: "1925", place: "Southwestern Nigeria", line: "The Aladura rise. In Yoruba the word means the praying people. African founded, African led." },
      { year: "2006", place: "Toronto", line: "Five people gather in the living room of Pastor Felix Ayomike." },
      { year: "2016", place: "2125 Weston Road", line: "The church built in 1856 becomes theirs. The faith that went out returns home." },
      { year: "Today", place: "North York", line: "Victory Church International" }
    ];

    var elYear  = loader.querySelector("[data-ld-year]"),
        elPlace = loader.querySelector("[data-ld-place]"),
        elLine  = loader.querySelector("[data-ld-line]"),
        elFill  = loader.querySelector("[data-ld-fill]"),
        elDots  = loader.querySelector("[data-ld-dots]"),
        skipBtn = loader.querySelector("[data-ld-skip]"),
        i = 0, timer = null, finished = false;

    STEPS.forEach(function () {
      var d = document.createElement("span");
      d.className = "ld-dot";
      elDots.appendChild(d);
    });
    var dots = elDots.children;

    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      loader.classList.add("done");
      document.body.style.overflow = "";
      try { sessionStorage.setItem("vc_intro", "1"); } catch (e) {}
      setTimeout(function () { loader.hidden = true; }, 750);
    }

    function render() {
      var s = STEPS[i];
      elYear.textContent = s.year;
      elPlace.textContent = s.place;
      elLine.textContent = s.line;
      elYear.classList.remove("ld-step");  void elYear.offsetWidth;  elYear.classList.add("ld-step");
      elPlace.classList.remove("ld-step"); void elPlace.offsetWidth; elPlace.classList.add("ld-step");
      elLine.classList.remove("ld-step");  void elLine.offsetWidth;  elLine.classList.add("ld-step");
      elFill.style.width = ((i + 1) / STEPS.length * 100) + "%";
      for (var d = 0; d < dots.length; d++) dots[d].classList.toggle("on", d === i);

      i++;
      if (i < STEPS.length) {
        timer = setTimeout(render, i === 1 ? 2100 : 2500);
      } else {
        timer = setTimeout(finish, 1900);
      }
    }

    var seen = false;
    try { seen = sessionStorage.getItem("vc_intro") === "1"; } catch (e) {}

    if (seen || reduce) {
      loader.hidden = true;
      loader.classList.add("done");
    } else {
      document.body.style.overflow = "hidden";
      skipBtn.addEventListener("click", finish);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
      });
      render();
    }
  }

  /* ---------------- header state + mobile nav ---------------- */
  var hdr = document.querySelector(".hdr");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("stuck", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var burger = document.querySelector(".burger"),
      mnav = document.querySelector(".mnav");
  if (burger && mnav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      mnav.classList.toggle("open", !open);
    });
    mnav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        mnav.classList.remove("open");
      });
    });
  }

  /* ---------------- tabbed frame ---------------- */
  var tablist = document.querySelector("[data-tabs]");
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll(".tab"));

    function select(idx) {
      tabs.forEach(function (t, n) {
        var on = n === idx;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    }
    tabs.forEach(function (t, n) {
      t.addEventListener("click", function () { select(n); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = (n + d + tabs.length) % tabs.length;
        tabs[next].focus();
        select(next);
      });
    });
    select(0);

    // Show the edge fade only while the strip actually overflows.
    var wrap = tablist.parentElement;
    if (wrap && wrap.classList.contains("tabs-wrap")) {
      var sync = function () {
        var over = tablist.scrollWidth - tablist.clientWidth > 2;
        wrap.classList.toggle("scrollable", over && tablist.scrollLeft < tablist.scrollWidth - tablist.clientWidth - 2);
      };
      sync();
      tablist.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync);
    }
  }

  /* ---------------- scroll reveal ---------------- */
  var rv = document.querySelectorAll(".rv");
  if (rv.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      rv.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      rv.forEach(function (el, n) {
        el.style.transitionDelay = Math.min(n % 4, 3) * 70 + "ms";
        io.observe(el);
      });
      // Safety net: content must never be left permanently invisible if the
      // observer does not fire (print, headless render, odd viewport states).
      setTimeout(function () {
        rv.forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.2) el.classList.add("in");
        });
      }, 1200);
      window.addEventListener("load", function () {
        setTimeout(function () { rv.forEach(function (el) { el.classList.add("in"); }); }, 6000);
      });
    }
  }

  /* ---------------- footer year ---------------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();

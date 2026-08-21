/* Victory Church International - site behaviour */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Where visitor details are sent. Point this at a form backend (Formspree,
     Getform, Basin, a Google Apps Script, or the church's own handler).
     While it is empty the form falls back to opening the visitor's own email
     client, so the form still works but nothing is captured automatically. */
  var LEAD_ENDPOINT = "";
  var LEAD_TO = "info@victorychurch.ca";

  /* ---------------- loader: through the years ---------------- */
  var loader = document.getElementById("loader");
  if (loader) {
    var STEPS = [
      { tag: "33 AD", year: "33 AD", place: "Jerusalem",
        line: "The Spirit falls at Pentecost. People speak in languages they never learned. The movement takes its name from this day." },
      { tag: "1856", year: "1856", place: "Weston, Ontario",
        line: "Anglicans raise a red brick church on Weston Road and set a cross on the gable.",
        img: "assets/img/ink/building-1856.webp", alt: "The 1856 red brick church on Weston Road" },
      { tag: "1906", year: "1906", place: "Azusa Street, Los Angeles",
        line: "William Seymour, son of formerly enslaved parents, leads the revival that carries Pentecost around the world." },
      { tag: "1925", year: "1925", place: "Southwestern Nigeria",
        line: "The Aladura rise. In Yoruba the word means the praying people. African founded and African led." },
      { tag: "2006", year: "2006", place: "Toronto",
        line: "Five people gather in the living room of Pastor Felix Ayomike." },
      { tag: "2016", year: "2016", place: "2125 Weston Road",
        line: "The church built in 1856 becomes theirs. The faith that went out returns home.",
        img: "assets/img/ink/congregation.webp", alt: "The congregation gathered together" },
      { tag: "Today", year: "Today", place: "North York, Toronto",
        line: "Victory Church International. Love God. Love People. Pray.",
        img: "assets/img/ink/choir.webp", alt: "The choir leading worship" }
    ];

    var elYear  = loader.querySelector("[data-ld-year]"),
        elPlace = loader.querySelector("[data-ld-place]"),
        elLine  = loader.querySelector("[data-ld-line]"),
        elFill  = loader.querySelector("[data-ld-fill]"),
        elSegs  = loader.querySelector("[data-ld-segs]"),
        elMedia = loader.querySelector("[data-ld-media]"),
        skipBtn = loader.querySelector("[data-ld-skip]"),
        i = 0, timer = null, finished = false;

    STEPS.forEach(function (s) {
      var b = document.createElement("span");
      b.className = "ld-seg";
      b.textContent = s.tag;
      elSegs.appendChild(b);
      if (s.img) { var pre = new Image(); pre.src = s.img; }
    });
    var segs = elSegs.children;

    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      loader.classList.add("done");
      document.body.style.overflow = "";
      try { sessionStorage.setItem("vc_intro", "1"); } catch (e) {}
      setTimeout(function () { loader.hidden = true; }, 750);
    }

    function bump(el) { el.classList.remove("ld-step"); void el.offsetWidth; el.classList.add("ld-step"); }

    function render() {
      var s = STEPS[i];
      elYear.textContent = s.year;
      elPlace.textContent = s.place;
      elLine.textContent = s.line;
      bump(elYear); bump(elPlace); bump(elLine);

      if (s.img) {
        elMedia.innerHTML = '<img src="' + s.img + '" alt="' + s.alt + '">';
      } else {
        elMedia.innerHTML =
          '<div class="ld-panel"><span class="ld-ghost">' + s.year +
          '</span><span class="ld-cap">' + s.place + '</span></div>';
      }

      elFill.style.width = ((i + 1) / STEPS.length * 100) + "%";
      for (var n = 0; n < segs.length; n++) {
        segs[n].classList.toggle("on", n === i);
        segs[n].classList.toggle("past", n < i);
      }
      // keep the active segment visible when the strip has to scroll
      if (segs[i] && segs[i].scrollIntoView) {
        try { segs[i].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); } catch (e) {}
      }

      i++;
      if (i < STEPS.length) timer = setTimeout(render, i === 1 ? 1900 : 2200);
      else timer = setTimeout(finish, 2000);
    }

    // ?intro in the URL always replays it, which is how to show it to somebody
    // again without hunting through browser storage.
    var force = /[?&]intro\b/.test(location.search);
    var seen = false;
    try { seen = !force && sessionStorage.getItem("vc_intro") === "1"; } catch (e) {}

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

  /* ---------------- lead capture ---------------- */
  var form = document.getElementById("lead-form");
  if (form) {
    var done      = document.querySelector("[data-lead-done]"),
        doneTitle = document.querySelector("[data-done-title]"),
        doneBody  = document.querySelector("[data-done-body]"),
        formErr   = form.querySelector("[data-form-error]"),
        submitBtn = form.querySelector("[data-submit]"),
        fName     = document.getElementById("lf-name"),
        fEmail    = document.getElementById("lf-email"),
        fPhone    = document.getElementById("lf-phone"),
        fConsent  = document.getElementById("lf-consent"),
        consentErr= form.querySelector("[data-consent-err]");

    function setErr(input, msg) {
      var slot = input.parentElement.querySelector(".err");
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (slot) { slot.textContent = msg || ""; slot.hidden = !msg; }
      return !msg;
    }

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

    function validate() {
      var ok = true;
      ok = setErr(fName, fName.value.trim() ? "" : "Please tell us your first name.") && ok;
      ok = setErr(fEmail, !fEmail.value.trim() ? "Please enter your email address."
                        : !validEmail(fEmail.value.trim()) ? "That email address does not look right."
                        : "") && ok;
      var cOk = fConsent.checked;
      consentErr.textContent = cOk ? "" : "Please tick the box so we know we may email you.";
      consentErr.hidden = cOk;
      return ok && cOk;
    }

    [fName, fEmail].forEach(function (el) {
      el.addEventListener("input", function () {
        if (el.getAttribute("aria-invalid") === "true") validate();
      });
    });
    fConsent.addEventListener("change", function () {
      if (fConsent.checked) { consentErr.hidden = true; consentErr.textContent = ""; }
    });

    function succeed(name, viaEmail) {
      form.style.display = "none";
      done.classList.add("show");
      doneTitle.textContent = "Thank you, " + name;
      doneBody.textContent = viaEmail
        ? "Your email app should now be open with your details filled in. Send that message and we will reply with your copy of the guide."
        : "Your guide is on the way. It should reach your inbox in the next few minutes. If it does not appear, please check your spam folder.";
      try { localStorage.setItem("vc_lead", "1"); } catch (e) {}
      var n = document.querySelector("[data-nudge]");
      if (n) n.classList.remove("show");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      formErr.classList.remove("show");
      if (!validate()) {
        var bad = form.querySelector('[aria-invalid="true"]') || (!fConsent.checked ? fConsent : null);
        if (bad) bad.focus();
        return;
      }

      var payload = {
        firstName: fName.value.trim(),
        email: fEmail.value.trim(),
        phone: fPhone.value.trim(),
        consent: true,
        interest: "Seven Days of Prayer guide",
        page: location.href
      };

      if (!LEAD_ENDPOINT) {
        // No backend wired up yet: hand off to the visitor's email client so the
        // request still reaches the church rather than silently disappearing.
        var body = "Please send me the Seven Days of Prayer guide.\n\n"
                 + "Name: " + payload.firstName + "\n"
                 + "Email: " + payload.email + "\n"
                 + (payload.phone ? "Phone: " + payload.phone + "\n" : "")
                 + "I agree to receive the guide and occasional news by email.\n";
        window.location.href = "mailto:" + LEAD_TO
          + "?subject=" + encodeURIComponent("Seven Days of Prayer guide")
          + "&body=" + encodeURIComponent(body);
        succeed(payload.firstName, true);
        return;
      }

      submitBtn.disabled = true;
      var label = submitBtn.innerHTML;
      submitBtn.textContent = "Sending...";

      fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error("Request failed with status " + r.status);
        succeed(payload.firstName, false);
      }).catch(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = label;
        formErr.textContent = "Something went wrong sending that. Please try again, or email us directly at " + LEAD_TO + ".";
        formErr.classList.add("show");
      });
    });
  }

  /* ---------------- slide in prompt ---------------- */
  var nudge = document.querySelector("[data-nudge]");
  if (nudge) {
    var dismissed = false;
    try { dismissed = localStorage.getItem("vc_nudge") === "1" || localStorage.getItem("vc_lead") === "1"; } catch (e) {}
    var guideSec = document.getElementById("guide");

    function closeNudge() {
      nudge.classList.remove("show");
      try { localStorage.setItem("vc_nudge", "1"); } catch (e) {}
      dismissed = true;
      window.removeEventListener("scroll", maybeShow);
    }
    nudge.querySelector("[data-nudge-x]").addEventListener("click", closeNudge);
    nudge.querySelector("[data-nudge-go]").addEventListener("click", closeNudge);

    function maybeShow() {
      if (dismissed) return;
      var loaderUp = loader && !loader.hidden && !loader.classList.contains("done");
      if (loaderUp) return;
      // Hold off while the visitor is already looking at the guide itself.
      if (guideSec) {
        var g = guideSec.getBoundingClientRect();
        if (g.top < window.innerHeight && g.bottom > 0) { nudge.classList.remove("show"); return; }
      }
      var pct = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (pct > 0.28) nudge.classList.add("show");
    }
    window.addEventListener("scroll", maybeShow, { passive: true });
  }

  /* ---------------- footer year ---------------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();

/* --------------------------------------------------------------------------
   Ink reveal
   The congregation plate assembles itself out of ink particles, which is the
   move the reference footer is built on. It is decoration, so it is skipped
   entirely on small screens, under prefers-reduced-motion, and any time the
   canvas cannot be read. The plain <img> underneath is always the fallback.

   The plate is a one bit stipple, so point sampling it returns noise. The
   density map is built by letting the browser downscale the image instead,
   which averages the stipple back into real tone, and each cell of that map
   becomes one particle in one of three ink weights.
   -------------------------------------------------------------------------- */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var host = document.querySelector("[data-ink-reveal]");
  if (!host) return;

  var img = host.querySelector("img");
  if (!img || reduce || window.innerWidth < 860) return;

  var DURATION = 1700;      // ms, first particle leaving to last one landing
  var LIFE = 0.42;          // share of the run any one particle spends in flight
  var CELL = 7;             // device pixels per particle
  var ALPHAS = [0.3, 0.62, 1];

  function start() {
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cv = document.createElement("canvas");
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    var ctx = cv.getContext("2d");
    if (!ctx) return;

    var cols = Math.max(120, Math.min(240, Math.round(cv.width / CELL)));
    var rows = Math.max(1, Math.round(cols * cv.height / cv.width));

    var off = document.createElement("canvas");
    off.width = cols;
    off.height = rows;
    var octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";

    var d;
    try {
      octx.drawImage(img, 0, 0, cols, rows);
      d = octx.getImageData(0, 0, cols, rows).data;
    } catch (e) {
      return; // tainted canvas or a decode failure: keep the plain image
    }

    var cw = cv.width / cols, ch = cv.height / rows;
    var buckets = [[], [], []];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = (r * cols + c) * 4;
        if (d[i + 3] < 40) continue;
        var dark = 1 - (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
        if (dark < 0.14) continue;   // paper, nothing to draw
        buckets[dark < 0.3 ? 0 : dark < 0.55 ? 1 : 2].push(c * cw, r * ch);
      }
    }
    if (!buckets[0].length && !buckets[1].length && !buckets[2].length) return;

    // Freeze the flight path per particle so every frame redraws the same
    // trajectory rather than jittering.
    var spread = cv.width * 0.15;
    var flights = buckets.map(function (pts) {
      var n = pts.length / 2;
      var f = {
        tx: new Float32Array(n), ty: new Float32Array(n),
        sx: new Float32Array(n), sy: new Float32Array(n),
        dl: new Float32Array(n), n: n
      };
      for (var k = 0; k < n; k++) {
        var px = pts[k * 2], py = pts[k * 2 + 1];
        var ang = Math.random() * Math.PI * 2;
        var rr = spread * (0.25 + Math.random() * 0.75);
        f.tx[k] = px; f.ty[k] = py;
        f.sx[k] = px + Math.cos(ang) * rr;
        f.sy[k] = py + Math.sin(ang) * rr - cv.height * 0.12;
        // sweep left to right, the way a press lays down a sheet
        f.dl[k] = (px / cv.width) * (1 - LIFE) * 0.8 + Math.random() * (1 - LIFE) * 0.2;
      }
      return f;
    });

    cv.style.width = "100%";
    cv.style.height = "100%";
    host.appendChild(cv);
    host.classList.add("assembling");
    ctx.fillStyle = "#14140F";

    var t0 = 0;
    function frame(now) {
      if (!t0) t0 = now;
      var t = Math.min(1, (now - t0) / DURATION);
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var b = 0; b < 3; b++) {
        var f = flights[b];
        if (!f.n) continue;
        ctx.globalAlpha = ALPHAS[b];
        for (var k = 0; k < f.n; k++) {
          var local = (t - f.dl[k]) / LIFE;
          if (local <= 0) continue;
          if (local >= 1) {
            ctx.fillRect(f.tx[k], f.ty[k], cw, ch);
          } else {
            var e = 1 - Math.pow(1 - local, 3);
            ctx.fillRect(f.sx[k] + (f.tx[k] - f.sx[k]) * e,
                         f.sy[k] + (f.ty[k] - f.sy[k]) * e, cw, ch);
          }
        }
      }
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        host.classList.remove("assembling");
        host.classList.add("assembled");
        setTimeout(function () { cv.remove(); }, 700);
      }
    }
    requestAnimationFrame(frame);
  }

  function watch() {
    if (!("IntersectionObserver" in window)) { start(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); start(); }
    }, { threshold: 0.12 });
    io.observe(host);
  }

  // On a first visit the intro sequence covers the page for several seconds.
  // The hero is technically in the viewport behind it, so without this the
  // whole reveal would play to nobody.
  function ready() {
    var loader = document.getElementById("loader");
    var covered = loader && !loader.hidden && !loader.classList.contains("done");
    if (!covered) { watch(); return; }
    var mo = new MutationObserver(function () {
      if (loader.hidden || loader.classList.contains("done")) {
        mo.disconnect();
        setTimeout(watch, 500);   // let the loader finish fading out
      }
    });
    mo.observe(loader, { attributes: true, attributeFilter: ["class", "hidden"] });
  }

  if (img.complete && img.naturalWidth) ready();
  else img.addEventListener("load", ready, { once: true });
})();

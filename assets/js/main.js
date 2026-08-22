/* Victory Church International - site behaviour */

/* ---------------------------------------------------------------------------
   Shared: assembling a plate out of ink particles.

   The plates are one bit stipple, so point sampling one returns noise. The
   density map is built by letting the browser downscale the image, which
   averages the stipple back into real tone, and every cell of that map becomes
   a particle in one of three ink weights.

   Returns true if it took over the element, false if the caller should just
   leave the plain <img> alone.
   --------------------------------------------------------------------------- */
var VC = (function () {
  "use strict";

  var LIFE = 0.42;          // share of the run a particle spends in flight
  var CELL = 7;             // device pixels per particle
  var ALPHAS = [0.3, 0.62, 1];
  var INK = "#12151A";

  function assemble(host, img, opts) {
    opts = opts || {};
    var duration = opts.duration || 1700;

    if (!host || !img || !img.naturalWidth) return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return false;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cv = document.createElement("canvas");
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    var ctx = cv.getContext("2d");
    if (!ctx) return false;

    var cols = Math.max(120, Math.min(240, Math.round(cv.width / CELL)));
    var rows = Math.max(1, Math.round(cols * cv.height / cv.width));

    var off = document.createElement("canvas");
    off.width = cols; off.height = rows;
    var octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return false;
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";

    var d;
    try {
      octx.drawImage(img, 0, 0, cols, rows);
      d = octx.getImageData(0, 0, cols, rows).data;
    } catch (e) {
      return false;   // tainted canvas or a decode failure
    }

    var cw = cv.width / cols, ch = cv.height / rows;
    var buckets = [[], [], []];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = (r * cols + c) * 4;
        if (d[i + 3] < 40) continue;
        var dark = 1 - (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
        if (dark < 0.14) continue;                       // paper
        buckets[dark < 0.3 ? 0 : dark < 0.55 ? 1 : 2].push(c * cw, r * ch);
      }
    }
    if (!buckets[0].length && !buckets[1].length && !buckets[2].length) return false;

    // Freeze each flight path so every frame redraws the same trajectory
    // instead of jittering.
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
    ctx.fillStyle = INK;

    var t0 = 0;
    function frame(now) {
      if (!t0) t0 = now;
      var t = Math.min(1, (now - t0) / duration);
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
      if (opts.onProgress) opts.onProgress(t);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        host.classList.remove("assembling");
        host.classList.add("assembled");
        setTimeout(function () { cv.remove(); }, 700);
        if (opts.onDone) opts.onDone();
      }
    }
    requestAnimationFrame(frame);
    return true;
  }

  return { assemble: assemble };
})();
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Where visitor details are sent. Point this at a form backend (Formspree,
     Getform, Basin, a Google Apps Script, or the church's own handler).
     While it is empty the form falls back to opening the visitor's own email
     client, so the form still works but nothing is captured automatically. */
  var LEAD_ENDPOINT = "";
  var LEAD_TO = "info@victorychurch.ca";

  /* ---------------- intro: the congregation arrives ----------------
     The old intro narrated seven dates before letting anyone in, and the page
     then told the same story twice more. It now does one thing: the
     congregation assembles out of ink, and the page behind it is already
     holding that same picture, so the handover has no seam. The dates moved
     into the scroll, where they belong. */
  var loader = document.getElementById("loader");
  var introPlayed = false;

  if (loader) {
    var ldArt = loader.querySelector("[data-ld-art]"),
        ldImg = ldArt && ldArt.querySelector("img"),
        ldFill = loader.querySelector("[data-ld-fill]"),
        ldSkip = loader.querySelector("[data-ld-skip]"),
        ldDone = false,
        ldTimer = null;

    function endIntro() {
      if (ldDone) return;
      ldDone = true;
      clearTimeout(ldTimer);
      loader.classList.add("done");
      document.body.style.overflow = "";
      try { sessionStorage.setItem("vc_intro", "1"); } catch (e) {}
      setTimeout(function () { loader.hidden = true; }, 700);
    }

    // ?intro in the URL always replays it, which is how to show somebody the
    // sequence again without digging through browser storage.
    var force = /[?&]intro\b/.test(location.search);
    var seen = false;
    try { seen = !force && sessionStorage.getItem("vc_intro") === "1"; } catch (e) {}

    if (seen || reduce) {
      loader.hidden = true;
      loader.classList.add("done");
    } else {
      introPlayed = true;
      document.documentElement.setAttribute("data-intro-played", "1");
      document.body.style.overflow = "hidden";
      ldSkip.addEventListener("click", endIntro);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") endIntro();
      });

      var runIntro = function () {
        var ran = VC.assemble(ldArt, ldImg, {
          duration: 3200,
          onProgress: function (p) { if (ldFill) ldFill.style.width = (p * 100) + "%"; },
          onDone: function () { ldTimer = setTimeout(endIntro, 900); }
        });
        // No canvas, no particles, no waiting: show the plate and move on.
        if (!ran) {
          if (ldFill) ldFill.style.width = "100%";
          ldTimer = setTimeout(endIntro, 1200);
        }
      };

      if (ldImg && ldImg.complete && ldImg.naturalWidth) runIntro();
      else if (ldImg) {
        ldImg.addEventListener("load", runIntro, { once: true });
        ldImg.addEventListener("error", endIntro, { once: true });
        ldTimer = setTimeout(endIntro, 6000);   // never trap anyone behind a slow image
      } else {
        endIntro();
      }
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

/* ---------------------------------------------------------------------------
   Hero plate
   On a return visit there is no intro sequence, so the hero assembles itself
   instead. On a first visit the intro has just done exactly that, and doing it
   twice in five seconds is worse than not doing it at all.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var host = document.querySelector("[data-ink-reveal]");
  if (!host) return;
  if (document.documentElement.hasAttribute("data-intro-played")) return;

  var img = host.querySelector("img");
  if (!img || window.innerWidth < 860) return;

  function watch() {
    if (!("IntersectionObserver" in window)) { VC.assemble(host, img); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); VC.assemble(host, img); }
    }, { threshold: 0.12 });
    io.observe(host);
  }

  if (img.complete && img.naturalWidth) watch();
  else img.addEventListener("load", watch, { once: true });
})();

/* ---------------------------------------------------------------------------
   The history, one picture per era

   Four milestones, four different pictures: a crop of the drawing for the five
   people in a living room, the first worship centre, the red brick church the
   Anglicans raised in 1856, and the whole congregation today.

   This used to be one drawing with a mask animated on every scroll frame. It
   repainted a full bleed image continuously to show a change most people never
   noticed, and it was the reason scrolling felt heavy. Now the only work on
   scroll is deciding which plate is lit, and the plates cross fade on opacity
   alone, which the compositor handles without repainting anything.

   Desktop holds the frame still and changes the era inside it. Phones get the
   same four beats as ordinary blocks, because scroll pinning on a mid range
   Android is how a site comes to feel broken, and this congregation is
   overwhelmingly on phones.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var story = document.querySelector("[data-story]");
  if (!story) return;

  var rail = story.querySelector(".story-rail"),
      beats = [].slice.call(story.querySelectorAll("[data-beat]")),
      plates = [].slice.call(story.querySelectorAll("[data-plate]")),
      ticks = [].slice.call(story.querySelectorAll("[data-tick]"));
  if (!rail || !beats.length) return;

  var pinned = false;
  function sync() {
    pinned = window.innerWidth >= 900 &&
             !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    story.classList.toggle("is-pinned", pinned);
  }
  sync();
  window.addEventListener("resize", sync);

  var active = -1;
  function setActive(i) {
    if (i === active || i < 0 || i >= beats.length) return;
    active = i;
    beats.forEach(function (b, n) { b.classList.toggle("is-on", n === i); });
    plates.forEach(function (p, n) { p.classList.toggle("is-on", n === i); });
    ticks.forEach(function (t, n) {
      t.classList.toggle("is-on", n === i);
      t.classList.toggle("is-past", n < i);
    });
  }
  setActive(0);

  var queued = false;
  function onScroll() {
    if (queued || !pinned) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      var rect = rail.getBoundingClientRect();
      var travel = rect.height - window.innerHeight;
      if (travel <= 0) return;
      var p = Math.min(1, Math.max(0, -rect.top / travel));
      setActive(Math.min(beats.length - 1, Math.floor(p * beats.length)));
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Off the pinned path, each block lights up as it arrives.
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (pinned) return;
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(beats.indexOf(en.target));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    beats.forEach(function (b) { io.observe(b); });
  }
})();

/* ---------------------------------------------------------------------------
   Leader panel

   The church has never published contact details for its ministry leaders, and
   the live site still reads "For more information contact: ???" where they
   should be. Publishing thirteen people's personal addresses would not be the
   fix even if we had them, so every message is addressed to the church office
   with the leader's name already in the subject line. If the church would
   rather route these somewhere else, change OFFICE below.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var OFFICE = "info@victorychurch.ca";

  var dlg = document.getElementById("leader-dialog");
  var opens = [].slice.call(document.querySelectorAll(".person-open"));
  if (!dlg || !opens.length) return;

  // No <dialog> support: leave the cards as plain, inert markup rather than
  // wiring up a half broken modal.
  if (typeof dlg.showModal !== "function") {
    opens.forEach(function (b) {
      b.setAttribute("aria-haspopup", "false");
      var more = b.querySelector(".person-more");
      if (more) more.remove();
    });
    return;
  }

  var elImg  = dlg.querySelector("[data-pd-img]"),
      elRole = dlg.querySelector("[data-pd-role]"),
      elName = dlg.querySelector("[data-pd-name]"),
      elJob  = dlg.querySelector("[data-pd-job]"),
      elText = dlg.querySelector("[data-pd-text]"),
      elMail = dlg.querySelector("[data-pd-mail]"),
      elClose = dlg.querySelector("[data-pd-close]"),
      last = null;

  function open(btn) {
    var name = btn.getAttribute("data-name"),
        role = btn.getAttribute("data-role"),
        job  = btn.getAttribute("data-job"),
        img  = btn.getAttribute("data-img");
    var body = btn.parentNode.querySelector(".person-text");

    elImg.src = img;
    elImg.alt = name;
    elRole.textContent = role;
    elName.textContent = name;
    elJob.textContent = job;
    elText.innerHTML = body ? body.innerHTML : "";

    elMail.href = "mailto:" + OFFICE
      + "?subject=" + encodeURIComponent("For " + name + ", " + role)
      + "&body=" + encodeURIComponent(
          "This message is for " + name + " (" + role + ").\n\n");
    elMail.setAttribute("aria-label", "Get in touch with " + name + " through the church office");

    last = btn;
    dlg.showModal();
    elClose.focus();
  }

  opens.forEach(function (b) {
    b.addEventListener("click", function () { open(b); });
  });

  elClose.addEventListener("click", function () { dlg.close(); });

  // clicking the backdrop closes it, clicking the panel does not
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) dlg.close();
  });

  dlg.addEventListener("close", function () {
    if (last) { last.focus(); last = null; }
  });
})();

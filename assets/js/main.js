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
        img: "assets/img/building-1856.webp", alt: "The 1856 red brick church on Weston Road" },
      { tag: "1906", year: "1906", place: "Azusa Street, Los Angeles",
        line: "William Seymour, son of formerly enslaved parents, leads the revival that carries Pentecost around the world." },
      { tag: "1925", year: "1925", place: "Southwestern Nigeria",
        line: "The Aladura rise. In Yoruba the word means the praying people. African founded and African led." },
      { tag: "2006", year: "2006", place: "Toronto",
        line: "Five people gather in the living room of Pastor Felix Ayomike." },
      { tag: "2016", year: "2016", place: "2125 Weston Road",
        line: "The church built in 1856 becomes theirs. The faith that went out returns home.",
        img: "assets/img/congregation.webp", alt: "The congregation gathered together" },
      { tag: "Today", year: "Today", place: "North York, Toronto",
        line: "Victory Church International. Love God. Love People. Pray.",
        img: "assets/img/choir.webp", alt: "The choir leading worship" }
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

/* Ethereal Editorial — shared behaviour. Data lives in Supabase (see schema.sql). */
(function () {
  "use strict";

  // Contact details live here so every page stays in sync.
  // supabaseUrl / supabaseAnonKey: Supabase → Project Settings → API ("Project URL" and the "anon public" key).
  // The anon key is meant to be public; row level security in schema.sql protects the data.
  // Never put the service_role key here.
  var CONFIG = {
    email: "etherealeditorial2@gmail.com",
    facebook: "https://www.facebook.com/search/top?q=Ethereal%20Editorial",
    upwork: "https://www.upwork.com/freelancers/~019480e4dcaa7030bf",
    supabaseUrl: "https://grozapfcoearxbrgijec.supabase.co",
    supabaseAnonKey: "sb_publishable_c1EO38sVw5rZWPSENTOp_Q_ibAjutY9"
  };

  var ICONS = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z"/></svg>',
    upwork: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v17l-6-4-6 4z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6M8 14l1 5"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7 9l5-5 5 5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };

  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(name) {
    var p = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!p.length) return "EE";
    return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] : (p[0][1] || ""))).toUpperCase();
  }
  function money(n) { return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function num(n) { return Number(n || 0).toLocaleString("en-US"); }
  function fmtDate(d, withTime) {
    if (!d) return "";
    var dt = new Date(d);
    var o = { month: "short", day: "numeric", year: "numeric" };
    if (withTime) { o.hour = "numeric"; o.minute = "2-digit"; }
    return dt.toLocaleString("en-US", o);
  }
  function ago(d) {
    var s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 60) return "Just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago";
    if (s < 172800) return "Yesterday";
    if (s < 604800) return Math.floor(s / 86400) + " days ago";
    return fmtDate(d);
  }
  function countWords(t) { return (String(t || "").match(/\S+/g) || []).length; }
  function param(k) { return new URLSearchParams(location.search).get(k); }
  function safe(fn) { try { return fn(); } catch (e) { return null; } }

  // ---- small per-browser preferences (never data) ----
  var store = {
    get: function (k, d) { var v = safe(function () { return localStorage.getItem("ee:" + k); }); if (v == null) return d; try { return JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { safe(function () { localStorage.setItem("ee:" + k, JSON.stringify(v)); }); },
    del: function (k) { safe(function () { localStorage.removeItem("ee:" + k); }); }
  };

  // ---- Supabase client ----
  var SB_URL = CONFIG.supabaseUrl;
  var SB_KEY = CONFIG.supabaseAnonKey;
  // "Keep me signed in" off → the session lives in sessionStorage and ends with the browser.
  var authStorage = {
    getItem: function (k) { return safe(function () { return sessionStorage.getItem(k); }) || safe(function () { return localStorage.getItem(k); }); },
    setItem: function (k, v) {
      var keep = safe(function () { return localStorage.getItem("ee:keep"); }) !== "0";
      safe(function () { (keep ? localStorage : sessionStorage).setItem(k, v); });
      safe(function () { (keep ? sessionStorage : localStorage).removeItem(k); });
    },
    removeItem: function (k) { safe(function () { localStorage.removeItem(k); }); safe(function () { sessionStorage.removeItem(k); }); }
  };
  var sb = (SB_URL && SB_KEY && window.supabase)
    ? window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: authStorage } })
    : null;

  var profileCache = null;
  function session() {
    if (!sb) return Promise.resolve(null);
    return sb.auth.getSession().then(function (r) { return r.data.session; });
  }
  function profile(force) {
    if (!sb) return Promise.resolve(null);
    if (profileCache && !force) return Promise.resolve(profileCache);
    return session().then(function (s) {
      if (!s) return null;
      return sb.from("profiles").select("*").eq("id", s.user.id).maybeSingle().then(function (r) {
        if (r.error) throw r.error;
        profileCache = r.data;
        return profileCache;
      });
    });
  }
  function homeFor(p) {
    if (!p) return "signin.html";
    if (p.role === "admin") return "admin.html";
    if (p.role === "reader") return "discover.html";
    return "dashboard.html";
  }
  // Gate a page: no session → sign in; wrong role → that role's home. Resolves with the profile.
  function guard(roles) {
    if (!sb) { setupNotice(); return new Promise(function () {}); }
    return profile().then(function (p) {
      if (!p) {
        location.replace("signin.html?next=" + encodeURIComponent(location.pathname.replace(/^\//, "") + location.search + location.hash));
        return new Promise(function () {});
      }
      if (roles && roles.indexOf(p.role) === -1 && p.role !== "admin") {
        location.replace(homeFor(p));
        return new Promise(function () {});
      }
      return p;
    }).catch(function (e) { fail(e); return new Promise(function () {}); });
  }
  function signOut() {
    profileCache = null;
    return sb ? sb.auth.signOut().catch(function () {}) : Promise.resolve();
  }
  function setupNotice() {
    if ($(".setup-notice")) return;
    var d = document.createElement("div");
    d.className = "setup-notice";
    d.innerHTML = "<b>The site isn't connected to its database yet.</b> Fill supabaseUrl and supabaseAnonKey at the top of app.js. Steps are in SETUP.md.";
    document.body.insertBefore(d, document.body.firstChild);
  }

  // ---- errors ----
  var FRIENDLY = [
    [/Invalid login credentials/i, "That email and password don't match. Try again or reset your password."],
    [/Email not confirmed/i, "Please confirm your email first. Check your inbox for the link."],
    [/User already registered/i, "An account with this email already exists. Try signing in."],
    [/row-level security|violates row-level|permission denied/i, "You don't have permission to do that."],
    [/Failed to fetch|NetworkError|Load failed/i, "Can't reach the server. Check your connection and try again."],
    [/rate limit/i, "Too many attempts. Please wait a minute and try again."],
    [/Password should be/i, "Use a password of at least 8 characters."]
  ];
  function message(e) {
    var m = (e && (e.message || e.error_description || e.msg)) || String(e || "Something went wrong.");
    for (var i = 0; i < FRIENDLY.length; i++) if (FRIENDLY[i][0].test(m)) return FRIENDLY[i][1];
    return m;
  }
  function fail(e) { if (window.console) console.error(e); toast(message(e), "err"); }
  // Unwraps a Supabase response: throws on error, returns data.
  function q(promise) { return promise.then(function (r) { if (r.error) throw r.error; return r.data; }); }

  // ---- toast ----
  function toast(msg, kind) {
    var wrap = $(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.style.transition = "opacity .3s"; t.style.opacity = "0"; }, kind === "err" ? 4500 : 2800);
    setTimeout(function () { t.remove(); }, kind === "err" ? 4900 : 3200);
  }

  // ---- modal ----
  function modal(html) {
    var bg = $(".modal-bg");
    if (!bg) {
      bg = document.createElement("div"); bg.className = "modal-bg";
      bg.innerHTML = '<div class="modal" role="dialog" aria-modal="true"></div>';
      bg.addEventListener("click", function (e) { if (e.target === bg || e.target.closest("[data-close]")) closeModal(); });
      document.body.appendChild(bg);
    }
    $(".modal", bg).innerHTML = html;
    bg.classList.add("open");
    var f = $("input, textarea, button", bg); if (f) f.focus();
    return $(".modal", bg);
  }
  function closeModal() { var bg = $(".modal-bg"); if (bg) bg.classList.remove("open"); }
  function confirmBox(title, text, okLabel, danger) {
    return new Promise(function (resolve) {
      var m = modal("<h3>" + esc(title) + '</h3><p class="muted">' + esc(text) + '</p><div class="btn-row"><button class="btn btn-outline btn-sm" data-close>Cancel</button><button class="btn ' + (danger ? "btn-rust" : "btn-ink") + ' btn-sm" data-ok>' + esc(okLabel) + "</button></div>");
      var done = false;
      $("[data-ok]", m).onclick = function () { done = true; closeModal(); resolve(true); };
      var bg = $(".modal-bg");
      var obs = new MutationObserver(function () { if (!bg.classList.contains("open")) { obs.disconnect(); if (!done) resolve(false); } });
      obs.observe(bg, { attributes: true, attributeFilter: ["class"] });
    });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  // ---- busy buttons ----
  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.textContent; btn.disabled = true; btn.textContent = label || "Saving…"; }
    else { btn.disabled = false; if (btn.dataset.label) btn.textContent = btn.dataset.label; }
  }

  // ---- validation ----
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(input, msg) {
    var field = input.closest(".field") || input.parentNode;
    var err = $(".field-error", field);
    input.classList.toggle("invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) {
      if (!err) { err = document.createElement("span"); err.className = "field-error"; field.appendChild(err); }
      err.textContent = msg;
    } else if (err) err.remove();
  }
  function validate(form) {
    var first = null;
    $$("input, select, textarea", form).forEach(function (el) {
      if (el.disabled || el.type === "hidden" || el.closest("[hidden]")) return;
      var v = el.type === "checkbox" ? el.checked : (el.type === "file" ? el.files.length : el.value.trim());
      var msg = "";
      if (el.required && !v) msg = el.type === "checkbox" ? "Please tick this box to continue." : (el.type === "file" ? "Please attach your file." : "This field is required.");
      else if (el.type === "email" && v && !EMAIL_RE.test(v)) msg = "Enter a valid email address.";
      else if (el.type === "url" && v && !/^https?:\/\/\S+\.\S+/.test(v)) msg = "Enter a full link starting with https://";
      else if (el.minLength > 0 && v && String(v).length < el.minLength) msg = "Use at least " + el.minLength + " characters.";
      else if (el.type === "number" && v !== "" && el.min !== "" && Number(v) < Number(el.min)) msg = "Must be at least " + Number(el.min).toLocaleString("en-US") + ".";
      if (el.type === "file") {
        var dz = el.closest(".dropzone"); if (dz) dz.style.borderColor = msg ? "#ef4444" : "";
        var f = el.closest(".field"), old = f && $(".field-error", f);
        if (old) old.remove();
        if (msg && f) { var s = document.createElement("span"); s.className = "field-error"; s.textContent = msg; f.appendChild(s); }
      } else setError(el, msg);
      if (msg && !first) first = el;
    });
    if (first) { first.focus({ preventScroll: true }); (first.closest(".dropzone") || first).scrollIntoView({ behavior: "smooth", block: "center" }); }
    return !first;
  }
  document.addEventListener("input", function (e) {
    if (e.target.classList && e.target.classList.contains("invalid")) setError(e.target, "");
  });

  // ---- dropzones ----
  function initDropzones() {
    $$(".dropzone").forEach(function (dz) {
      var input = $("input[type=file]", dz), label = $(".file-name", dz);
      if (!input) return;
      var maxMb = Number(dz.dataset.maxMb || 20);
      var accept = (input.getAttribute("accept") || "").split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
      function show() {
        var f = input.files[0];
        var field = dz.closest(".field"); var err = field && $(".field-error", field);
        if (err) err.remove();
        dz.style.borderColor = "";
        if (!f) { if (label) label.textContent = ""; return; }
        var ext = "." + f.name.split(".").pop().toLowerCase();
        if (accept.length && accept.indexOf(ext) === -1) { input.value = ""; toast("That file type isn't supported. Use " + accept.join(", ") + ".", "err"); if (label) label.textContent = ""; return; }
        if (f.size > maxMb * 1024 * 1024) { input.value = ""; toast("File is larger than " + maxMb + " MB.", "err"); if (label) label.textContent = ""; return; }
        if (label) label.textContent = f.name + " · " + (f.size / 1024 < 1024 ? Math.max(1, Math.round(f.size / 1024)) + " KB" : (f.size / 1048576).toFixed(1) + " MB");
        dz.dispatchEvent(new CustomEvent("filechange", { detail: f, bubbles: true }));
      }
      input.addEventListener("change", show);
      ["dragenter", "dragover"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("is-over"); }); });
      ["dragleave", "drop"].forEach(function (ev) { dz.addEventListener(ev, function () { dz.classList.remove("is-over"); }); });
      dz.addEventListener("drop", function (e) {
        e.preventDefault();
        if (e.dataTransfer && e.dataTransfer.files.length) {
          try { input.files = e.dataTransfer.files; } catch (err) { /* old browsers: fall back to browse */ }
          show();
        }
      });
    });
  }
  // Storage keys must be plain ASCII; keep the extension.
  function safeName(name) {
    var ext = (String(name).match(/\.[a-z0-9]{1,6}$/i) || [""])[0].toLowerCase();
    var base = String(name).replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
    return base + ext;
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); });
  }

  // ---- contact links ----
  function initContacts() {
    $$("[data-contact]").forEach(function (a) {
      var kind = a.dataset.contact;
      if (kind === "email") a.href = "mailto:" + CONFIG.email + (a.dataset.subject ? "?subject=" + encodeURIComponent(a.dataset.subject) : "");
      else if (CONFIG[kind]) { a.href = CONFIG[kind]; a.target = "_blank"; a.rel = "noopener"; }
    });
    $$("[data-contact-text=email]").forEach(function (el) { el.textContent = CONFIG.email; });
    $$("[data-icon]").forEach(function (el) { if (ICONS[el.dataset.icon]) el.innerHTML = ICONS[el.dataset.icon]; });
  }

  // ---- marketing header ----
  function initNav() {
    var header = $(".site-header"), btn = $(".nav-toggle");
    if (!header || !btn) return;
    btn.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open);
    });
    $$(".main-nav a, .header-actions a", header).forEach(function (a) {
      a.addEventListener("click", function () { header.classList.remove("nav-open"); btn.setAttribute("aria-expanded", "false"); });
    });
    var signin = $(".header-actions .signin"), start = $(".header-actions .btn");
    if (!signin || !start) return;
    profile().then(function (p) {
      if (!p) return;
      signin.textContent = "Sign out"; signin.href = "#";
      signin.addEventListener("click", function (e) { e.preventDefault(); signOut().then(function () { location.reload(); }); });
      start.textContent = "My account"; start.href = homeFor(p);
    }).catch(function () {});
  }

  // ---- reveal on scroll ----
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  // ---- app shell (signed-in pages) ----
  var SIDE = {
    author: [
      { group: "Beta reading" },
      { id: "manuscripts", label: "My manuscripts", icon: "book", href: "dashboard.html" },
      { id: "discover", label: "Discover", icon: "search", href: "discover.html" },
      { group: "Editing" },
      { id: "edits", label: "My edits", icon: "pen", href: "edits.html" },
      { id: "chat", label: "Chat", icon: "chat", href: "chat.html" },
      { id: "marketing", label: "Book marketing", icon: "megaphone", href: "index.html#marketing" }
    ],
    reader: [
      { group: "Beta reading" },
      { id: "discover", label: "Discover", icon: "search", href: "discover.html" },
      { id: "reading", label: "Reading list", icon: "bookmark", href: "discover.html?tab=reading" },
      { id: "profile", label: "My reader profile", icon: "user", href: "profile.html" },
      { group: "Help" },
      { id: "chat", label: "Chat", icon: "chat", href: "chat.html" }
    ],
    admin: [
      { group: "Admin" },
      { id: "admin", label: "Admin panel", icon: "shield", href: "admin.html" },
      { group: "Beta reading" },
      { id: "manuscripts", label: "My manuscripts", icon: "book", href: "dashboard.html" },
      { id: "discover", label: "Discover", icon: "search", href: "discover.html" }
    ]
  };
  function mountShell(active, p) {
    var top = $("#app-top");
    if (top) {
      top.className = "app-top";
      top.innerHTML =
        '<div class="bar">' +
        '<a class="brand" href="index.html"><img src="logo-mark.png" alt=""><span>Ethereal Editorial</span></a>' +
        '<label class="search"><span class="sr-only">Search</span>' + ICONS.search + '<input type="search" placeholder="Search for a title, author or genre"></label>' +
        '<span class="chip ' + (p.role === "reader" ? "chip-peach" : p.role === "admin" ? "chip-soft" : "chip-mint") + '" style="margin-left:auto;font-size:12px;padding:4px 10px">' +
        (p.role === "reader" ? (p.reader_status === "approved" ? "Approved reader" : p.reader_status === "declined" ? "Reader · not approved" : "Reader · pending") : p.role === "admin" ? "Admin" : "Author") + "</span>" +
        '<button class="user-btn" aria-haspopup="true" aria-label="Account menu">' + esc(initials(p.name)) + "</button>" +
        '<div class="user-menu" role="menu"><div class="who">' + esc(p.name) + "<br>" + esc(p.email) + "</div>" +
        (p.role === "reader" ? '<a href="profile.html">My reader profile</a>' : '<a href="edits.html">My edits</a>') +
        '<a href="chat.html">Chat with Ethereal Editorial</a>' +
        (p.role === "admin" ? '<a href="admin.html">Admin panel</a>' : "") +
        "<button data-signout>Sign out</button></div></div>";
      var ub = $(".user-btn", top), menu = $(".user-menu", top);
      ub.addEventListener("click", function (e) { e.stopPropagation(); menu.classList.toggle("open"); });
      document.addEventListener("click", function () { menu.classList.remove("open"); });
      $("[data-signout]", top).addEventListener("click", function () { signOut().then(function () { location.href = "index.html"; }); });
      $(".search input", top).addEventListener("keydown", function (e) {
        if (e.key === "Enter") location.href = "discover.html?q=" + encodeURIComponent(this.value.trim());
      });
    }
    var side = $("#sidebar");
    if (side) {
      side.className = "sidebar";
      side.innerHTML = (SIDE[p.role] || SIDE.author).map(function (it) {
        if (it.group) return '<span class="eyebrow">' + it.group + "</span>";
        return '<a class="side-link' + (it.id === active ? " is-on" : "") + '" href="' + it.href + '">' + ICONS[it.icon] + "<span>" + it.label + "</span></a>";
      }).join("");
    }
  }

  function initYear() { $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); }); }

  // Mark pages whose script waits on data so CSS can show a loading state.
  function loaded() { document.documentElement.classList.remove("is-loading"); }

  document.addEventListener("DOMContentLoaded", function () {
    initContacts(); initNav(); initDropzones(); initReveal(); initYear();
  });
  if (sb) sb.auth.onAuthStateChange(function (ev) { if (ev === "SIGNED_OUT") profileCache = null; });

  window.EE = {
    CONFIG: CONFIG, ICONS: ICONS, sb: sb, store: store,
    $: $, $$: $$, esc: esc, initials: initials, money: money, num: num, fmtDate: fmtDate, ago: ago,
    countWords: countWords, param: param, safeName: safeName, uuid: uuid,
    toast: toast, modal: modal, closeModal: closeModal, confirm: confirmBox, busy: busy,
    validate: validate, setError: setError, message: message, fail: fail, q: q,
    session: session, profile: profile, guard: guard, signOut: signOut, homeFor: homeFor,
    mountShell: mountShell, setupNotice: setupNotice, loaded: loaded
  };
})();

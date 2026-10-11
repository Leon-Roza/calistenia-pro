/* ============================================================
   app.js — Lógica da aplicação: rotas, treino ativo,
   cronômetro de descanso, progresso e perfil.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- helpers ---------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function readLS(key, fb) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function writeLS(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function todayKey(d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseKey(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtMMSS(sec) { sec = Math.max(0, Math.round(sec)); return pad(Math.floor(sec / 60)) + ":" + pad(sec % 60); }
  function initials(name) {
    var parts = String(name || "?").trim().split(/\s+/);
    return ((parts[0] || "")[0] || "?").toUpperCase() + (parts[1] ? parts[1][0].toUpperCase() : "");
  }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function startOfWeek(d) { var x = new Date(d); var day = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - day); return x; }

  /* ---------------- icons ---------------- */
  var I = {
    home: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h2M20 12h2"/><rect x="4" y="8" width="4" height="8" rx="1.2"/><rect x="16" y="8" width="4" height="8" rx="1.2"/><path d="M8 12h8"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor"/></svg>',
    chart: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><rect x="5" y="12" width="3.6" height="6" rx="1"/><rect x="10.2" y="8" width="3.6" height="10" rx="1"/><rect x="15.4" y="4" width="3.6" height="14" rx="1"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5S20 17 20 21"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5 11-11"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    fire: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3-2 4-2 7a4 4 0 108 0c0-1.5-.7-2.5-1.5-3.5C15 8 13 6 12 3z" fill="none"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>',
    logout: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3"/><path d="M10 12H3"/><path d="M7 8l-4 4 4 4"/></svg>',
    timer: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>'
  };

  /* ---------------- state ---------------- */
  var state = {
    user: null,
    route: "home",
    session: null,
    cal: { y: new Date().getFullYear(), m: new Date().getMonth() },
    lastSummaryWorkout: null
  };

  var ROUTES = {
    home: { title: "Início", icon: I.home, label: "Início" },
    treinos: { title: "Treinos", icon: I.dumbbell, label: "Treinos" },
    treinar: { title: "Treinar", icon: I.play, label: "Treinar" },
    progresso: { title: "Progresso", icon: I.chart, label: "Progresso" },
    perfil: { title: "Perfil", icon: I.user, label: "Perfil" }
  };

  /* settings por usuário */
  function settingsKey() { return "cp_settings_" + (state.user ? state.user.id : "x"); }
  function getSettings() { return readLS(settingsKey(), { rest: 60, sound: true }); }
  function setSettings(patch) { writeLS(settingsKey(), Object.assign(getSettings(), patch)); }

  /* ---------------- boot ---------------- */
  function boot() {
    applyTheme(Store.getTheme());
    bindAuth();
    var user = Store.currentUser();
    if (user) { enterApp(user); } else { showAuth(); }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#eef2f9" : "#0b1120");
  }

  function showAuth() {
    state.user = null;
    $("#app").classList.add("hidden");
    $("#app").setAttribute("aria-hidden", "true");
    $("#auth-screen").classList.remove("hidden");
    var art = $("#auth-art");
    if (art && !art.dataset.done) { art.innerHTML = Illustrations.hero(); art.dataset.done = "1"; }
  }

  function enterApp(user) {
    state.user = user;
    $("#auth-screen").classList.add("hidden");
    var app = $("#app");
    app.classList.remove("hidden");
    app.setAttribute("aria-hidden", "false");
    restoreActiveSession();
    renderNav();
    setRoute("home");
    updateUserChrome();
  }

  function updateUserChrome() {
    var u = state.user;
    var ini = initials(u.name);
    var av = $("#topbar-avatar"); if (av) av.textContent = ini;
    var su = $("#sidebar-user");
    if (su) {
      su.innerHTML = '<div class="avatar" style="width:38px;height:38px;border-radius:11px">' + ini + "</div>" +
        '<div style="min-width:0"><strong style="display:block;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(u.name) + "</strong>" +
        '<small class="muted" style="font-size:.76rem;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(u.email) + "</small></div>";
      su.dataset.action = "go"; su.dataset.route = "perfil";
    }
  }

  /* ---------------- auth bindings ---------------- */
  function bindAuth() {
    $$(".auth-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var which = tab.dataset.authTab;
        $$(".auth-tab").forEach(function (t) { t.classList.toggle("is-active", t === tab); });
        $("#form-login").classList.toggle("hidden", which !== "login");
        $("#form-register").classList.toggle("hidden", which !== "register");
      });
    });

    $$("[data-toggle-pass]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = btn.parentElement.querySelector("input");
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
        btn.textContent = input.type === "password" ? "👁" : "🙈";
      });
    });

    $("#form-login").addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("#login-error"); err.textContent = "";
      var email = $("#login-email").value, pass = $("#login-password").value;
      var btn = e.target.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Entrando...";
      Store.login(email, pass).then(function (user) {
        e.target.reset();
        enterApp(user);
        toast("Bem-vindo de volta, " + user.name.split(" ")[0] + "!", "success");
      }).catch(function (ex) {
        err.textContent = ex.message || "Não foi possível entrar.";
      }).then(function () { btn.disabled = false; btn.textContent = "Entrar"; });
    });

    $("#form-register").addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("#reg-error"); err.textContent = "";
      var name = $("#reg-name").value, email = $("#reg-email").value;
      var pass = $("#reg-password").value, conf = $("#reg-confirm").value;
      if (pass !== conf) { err.textContent = "As senhas não conferem."; return; }
      var btn = e.target.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Criando...";
      Store.register(name, email, pass).then(function (user) {
        e.target.reset();
        enterApp(user);
        toast("Conta criada! Bons treinos 💪", "success");
      }).catch(function (ex) {
        err.textContent = ex.message || "Não foi possível criar a conta.";
      }).then(function () { btn.disabled = false; btn.textContent = "Criar conta e treinar"; });
    });
  }

  /* ---------------- nav ---------------- */
  function renderNav() {
    var order = ["home", "treinos", "treinar", "progresso", "perfil"];
    var side = "", bottom = "";
    order.forEach(function (r) {
      var it = ROUTES[r];
      side += '<button class="side-nav__item" data-action="go" data-route="' + r + '">' + it.icon + "<span>" + it.label + "</span></button>";
      if (r === "treinar") {
        bottom += '<button class="nav-btn nav-btn--center" data-action="go" data-route="' + r + '"><span class="nav-btn__fab">' + I.play + "</span><span>" + it.label + "</span></button>";
      } else {
        bottom += '<button class="nav-btn" data-action="go" data-route="' + r + '">' + it.icon + "<span>" + it.label + "</span></button>";
      }
    });
    $("#side-nav").innerHTML = side;
    $("#bottom-nav").innerHTML = bottom;
  }

  function markNavActive() {
    $$("[data-action='go']").forEach(function (b) {
      if (b.classList.contains("side-nav__item") || b.classList.contains("nav-btn")) {
        b.classList.toggle("is-active", b.dataset.route === state.route);
      }
    });
  }

  function setRoute(route) {
    if (!ROUTES[route]) route = "home";
    state.route = route;
    var title = ROUTES[route].title, sub = "";
    if (route === "home") sub = WorkoutData.dow[new Date().getDay()] + ", " + new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
    if (route === "treinar" && state.session) sub = "Sessão em andamento";
    $("#topbar-title").textContent = title;
    $("#topbar-sub").textContent = sub;
    markNavActive();
    render();
    $("#view").scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------- render ---------------- */
  function render() {
    var view = $("#view");
    if (state.route === "home") view.innerHTML = viewHome();
    else if (state.route === "treinos") view.innerHTML = viewWorkouts();
    else if (state.route === "treinar") view.innerHTML = viewTrain();
    else if (state.route === "progresso") view.innerHTML = viewProgress();
    else if (state.route === "perfil") view.innerHTML = viewProfile();
  }

  /* ---------- derived data ---------- */
  function completedLogs() {
    var logs = Store.getAllLogs(state.user.id);
    return Object.keys(logs).map(function (k) { return logs[k]; })
      .filter(function (l) { return l && l.completed; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }
  function setsDone(log) {
    var n = 0, total = 0;
    Object.keys(log.exercises || {}).forEach(function (id) {
      (log.exercises[id].sets || []).forEach(function (s) { total++; if (s.done) n++; });
    });
    return { done: n, total: total };
  }
  function streak() {
    var logs = Store.getAllLogs(state.user.id);
    var d = new Date();
    if (!(logs[todayKey(d)] && logs[todayKey(d)].completed)) d.setDate(d.getDate() - 1);
    var n = 0;
    while (true) {
      var l = logs[todayKey(d)];
      if (l && l.completed) { n++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  }
  function weekCount() {
    var start = startOfWeek(new Date());
    return completedLogs().filter(function (l) { return parseKey(l.date) >= start; }).length;
  }
  function nextTrainingDay(from) {
    var d = new Date(from || new Date());
    for (var i = 0; i < 7; i++) {
      var w = WorkoutData.workoutForDay(d.getDay());
      if (w) return { workout: w, date: new Date(d) };
      d.setDate(d.getDate() + 1);
    }
    return null;
  }

  /* ---------------- HOME ---------------- */
  function viewHome() {
    var today = new Date();
    var wk = WorkoutData.workoutForDay(today.getDay());
    var st = streak(), wc = weekCount(), done = completedLogs().length;
    var firstName = state.user.name.split(" ")[0];

    var hero;
    if (wk) {
      var w = WorkoutData.getWorkout(wk);
      hero = '<div class="hero">' +
        '<div class="hero__row"><div>' +
          '<div class="hero__eyebrow">Treino de hoje · ' + esc(w.daysLabel) + "</div>" +
          "<h1>" + esc(w.name) + "</h1>" +
          '<div class="hero__meta">' +
            '<span class="pill">' + I.clock + " " + esc(w.est) + "</span>" +
            '<span class="pill">' + w.exercises.length + " exercícios</span>" +
            '<span class="pill">' + esc(w.goal) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="hero__badge"><b>' + w.id + "</b><small>Treino</small></div>" +
        "</div>" +
        '<div class="hero__actions">' +
          '<button class="btn btn--primary btn--lg" data-action="start-workout" data-workout="' + w.id + '">' + I.play + " Iniciar treino</button>" +
          '<button class="btn btn--outline btn--lg" data-action="view-workout" data-workout="' + w.id + '">Ver exercícios</button>' +
        "</div></div>";
    } else {
      var nx = nextTrainingDay();
      var nw = nx ? WorkoutData.getWorkout(nx.workout) : null;
      hero = '<div class="hero">' +
        '<div class="hero__row"><div>' +
          '<div class="hero__eyebrow">Hoje é dia de descanso 🌙</div>' +
          "<h1>Recupere e volte mais forte</h1>" +
          (nw ? '<p style="opacity:.9">Próximo treino: <b>' + esc(nw.name) + "</b> — " + esc(WorkoutData.dow[nx.date.getDay()]) + "</p>" : "") +
        "</div></div>" +
        '<div class="hero__actions">' +
          (nw ? '<button class="btn btn--primary btn--lg" data-action="start-workout" data-workout="' + nw.id + '">Treinar mesmo assim</button>' : "") +
          '<button class="btn btn--outline btn--lg" data-action="go" data-route="progresso">Ver progresso</button>' +
        "</div></div>";
    }

    return '<div class="page">' +
      '<div class="row-between"><div><h1 style="font-size:1.35rem">Olá, ' + esc(firstName) + " 👋</h1>" +
      '<p class="muted">Pronto para o treino de hoje?</p></div></div>' +

      hero +

      '<div class="stat-row">' +
        statBox(I.fire, st, "Sequência", st === 1 ? "dia" : "dias") +
        statBox(I.check, wc, "Esta semana", wc === 1 ? "treino" : "treinos") +
        statBox(I.dumbbell, done, "Total de", done === 1 ? "treino" : "treinos") +
        statBox(I.chart, Math.min(100, Math.round((weekCount() / 3) * 100)) + "%", "Meta semanal", "3 treinos") +
      "</div>" +

      '<div class="card"><div class="section-head" style="margin-bottom:12px"><h3>Esta semana</h3><span class="muted">Seg – Dom</span></div>' +
        weekStrip() +
      "</div>" +

      '<div><div class="section-head" style="margin-bottom:12px"><h3>Início rápido</h3><span class="muted">Escolha um treino</span></div>' +
        '<div class="stack">' + workoutCard("A") + workoutCard("B") + "</div>" +
      "</div>" +
    "</div>";
  }

  function statBox(icon, value, label, unit) {
    return '<div class="stat"><div class="stat__value">' + value + (unit ? "<small>" + esc(unit) + "</small>" : "") + "</div>" +
      '<div class="stat__label">' + icon + " " + esc(label) + "</div></div>";
  }

  function weekStrip() {
    var logs = Store.getAllLogs(state.user.id);
    var start = startOfWeek(new Date());
    var today = new Date();
    var html = "";
    for (var i = 0; i < 7; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      var key = todayKey(d);
      var planned = WorkoutData.workoutForDay(d.getDay());
      var l = logs[key];
      var cls = "week__day";
      if (sameDay(d, today)) cls += " is-today";
      if (l && l.completed) cls += " is-done";
      else if (planned) cls += " is-training";
      else cls += " is-rest";
      html += '<div class="' + cls + '"><span>' + WorkoutData.dowShort[d.getDay()] + "</span><b>" + d.getDate() +
        '</b><span class="dot"></span></div>';
    }
    return '<div class="week">' + html + "</div>";
  }

  function workoutCard(id) {
    var w = WorkoutData.getWorkout(id);
    var first = WorkoutData.getExercise(w.exercises[0]);
    return '<button class="wk-card" data-action="view-workout" data-workout="' + id + '">' +
      '<div class="wk-card__art">' + Illustrations.art(first.ill) + "</div>" +
      '<div class="wk-card__body">' +
        "<h4>" + esc(w.name) + "</h4>" +
        "<p>" + esc(w.daysLabel) + " · " + esc(w.est) + "</p>" +
        '<div class="wk-card__tags">' + w.tags.slice(0, 4).map(function (t) { return '<span class="pill">' + esc(t) + "</span>"; }).join("") + "</div>" +
      "</div>" +
      '<div class="wk-card__chev">' + I.chevron + "</div>" +
    "</button>";
  }

  /* ---------------- TREINOS ---------------- */
  function viewWorkouts() {
    return '<div class="page">' +
      '<div class="card card--pad-lg">' +
        '<div class="row-between"><div><h1 style="font-size:1.25rem">Seu plano de calistenia</h1>' +
        '<p class="muted">2 treinos por semana · Segunda, Quarta e Sexta</p></div>' +
        '<span class="pill pill--primary">Progressões</span></div>' +
      "</div>" +
      workoutDetail("A") +
      workoutDetail("B") +
    "</div>";
  }

  function workoutDetail(id) {
    var w = WorkoutData.getWorkout(id);
    var exs = w.exercises.map(function (exId, i) {
      var ex = WorkoutData.getExercise(exId);
      return '<article class="ex-card">' +
        '<div class="ex-card__art">' + Illustrations.art(ex.ill) + "</div>" +
        '<div class="ex-card__info">' +
          '<div class="ex-card__head"><span class="ex-card__num">' + (i + 1) + "</span><h4>" + esc(ex.name) + "</h4></div>" +
          '<p class="ex-card__target">' + ex.sets + " séries · <b>" + esc(ex.targetLabel) + "</b></p>" +
          '<div class="ex-card__muscles">' + ex.muscles.map(function (m) { return '<span class="pill">' + esc(m) + "</span>"; }).join("") + "</div>" +
          '<div class="ex-card__actions">' +
            '<button class="btn btn--ghost btn--sm" data-action="open-exercise" data-ex="' + ex.id + '">' + I.info + " Como fazer</button>" +
            (ex.video ? '<a class="btn btn--ghost btn--sm" target="_blank" rel="noopener" href="' + ex.video + '">' + I.play + " Vídeo</a>" : "") +
          "</div>" +
        "</div>" +
      "</article>";
    }).join("");

    return '<section class="card" style="background:transparent;border:none;box-shadow:none;padding:0">' +
      '<div class="section-head" style="margin:6px 2px 12px">' +
        '<div><h3 style="font-size:1.15rem">' + esc(w.name) + " " + '<span class="pill pill--primary" style="margin-left:6px">' + esc(w.daysLabel) + "</span></h3>" +
        '<p class="muted">' + esc(w.goal) + " · " + esc(w.est) + "</p></div>" +
        '<button class="btn btn--primary btn--sm" data-action="start-workout" data-workout="' + w.id + '">' + I.play + " Iniciar</button>" +
      "</div>" +
      '<div class="ex-list">' + exs + "</div>" +
    "</section>";
  }

  /* ---------------- TREINAR ---------------- */
  function viewTrain() {
    if (state.session) return viewSession();
    return '<div class="page">' +
      '<div class="card card--pad-lg"><h1 style="font-size:1.25rem">Vamos treinar</h1>' +
      '<p class="muted">Escolha um treino para iniciar a sessão. Você pode registrar cada série com um toque.</p></div>' +
      '<div class="stack">' +
        trainPickerCard("A") + trainPickerCard("B") +
      "</div>" +
    "</div>";
  }

  function trainPickerCard(id) {
    var w = WorkoutData.getWorkout(id);
    var todayW = WorkoutData.workoutForDay(new Date().getDay());
    var isToday = todayW === id;
    var names = w.exercises.map(function (e) { return WorkoutData.getExercise(e).name; }).join(" · ");
    return '<div class="card card--pad-lg">' +
      '<div class="row-between" style="margin-bottom:6px"><h3 style="font-size:1.15rem">' + esc(w.name) +
        (isToday ? ' <span class="pill pill--orange" style="margin-left:6px">Hoje</span>' : "") + "</h3>" +
        '<span class="muted">' + esc(w.est) + "</span></div>" +
      '<p class="muted" style="margin-bottom:4px">' + esc(w.daysLabel) + "</p>" +
      '<p style="font-size:.85rem;color:var(--text-2);margin-bottom:14px">' + esc(names) + "</p>" +
      '<button class="btn btn--primary btn--block" data-action="start-workout" data-workout="' + id + '">' + I.play + " Iniciar " + esc(w.name) + "</button>" +
    "</div>";
  }

  function viewSession() {
    var s = state.session;
    var w = WorkoutData.getWorkout(s.workoutId);
    var counts = setsDone(s);
    var pct = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;

    var exs = w.exercises.map(function (exId, i) {
      var ex = WorkoutData.getExercise(exId);
      var log = s.exercises[exId];
      var rows = log.sets.map(function (set, idx) { return setRow(ex, log, idx); }).join("");
      var exDone = log.sets.every(function (x) { return x.done; });
      return '<div class="card">' +
        '<div class="row-between" style="margin-bottom:12px">' +
          '<div class="row"><span class="ex-card__num">' + (i + 1) + "</span>" +
          '<div><h3 style="font-size:1.02rem">' + esc(ex.name) + '</h3><small class="muted">' + esc(ex.targetLabel) + "</small></div></div>" +
          '<button class="icon-btn" data-action="open-exercise" data-ex="' + ex.id + '" aria-label="Como fazer">' + I.info + "</button>" +
        "</div>" +
        '<div class="sets">' + rows + "</div>" +
        (exDone ? '<div class="row mt-16" style="color:var(--primary);font-weight:700;font-size:.86rem">' + I.check + " Exercício concluído</div>" : "") +
      "</div>";
    }).join("");

    return '<div class="page">' +
      '<div class="card card--pad-lg">' +
        '<div class="row-between"><div><div class="hero__eyebrow" style="color:var(--muted)">Sessão em andamento</div>' +
        '<h1 style="font-size:1.3rem">' + esc(w.name) + "</h1></div>" +
        '<span class="pill pill--primary">' + counts.done + "/" + counts.total + " séries</span></div>" +
        '<div class="bar" style="margin-top:14px"><div class="bar__fill" style="width:' + pct + '%"></div></div>' +
      "</div>" +
      exs +
      '<div class="row wrap" style="gap:10px">' +
        '<button class="btn btn--primary btn--lg grow" data-action="finish-workout">' + I.check + " Finalizar treino</button>" +
        '<button class="btn btn--ghost btn--lg" data-action="cancel-workout">Cancelar</button>' +
      "</div>" +
    "</div>";
  }

  function setRow(ex, log, idx) {
    var set = log.sets[idx];
    var done = set.done;
    if (ex.targetType === "time") {
      var shown = set.value != null ? fmtMMSS(set.value) : fmtMMSS(ex.seconds);
      return '<div class="set-row' + (done ? " is-done" : "") + '">' +
        '<div class="set-row__idx">' + (idx + 1) + "</div>" +
        '<div class="set-row__goal"><span>Série ' + (idx + 1) + "</span><b>" + esc(ex.targetLabel) + "</b></div>" +
        '<div class="set-row__controls">' +
          '<button class="btn btn--ghost btn--sm" data-action="hold-timer" data-ex="' + ex.id + '" data-idx="' + idx + '">' + I.timer + " " + shown + "</button>" +
          '<button class="check-round' + (done ? " is-on" : "") + '" data-action="set-done" data-ex="' + ex.id + '" data-idx="' + idx + '" aria-label="Marcar série ' + (idx + 1) + '">' + I.check + "</button>" +
        "</div>" +
      "</div>";
    }
    var val = set.value == null ? "" : set.value;
    var ph = ex.targetType === "max" ? "—" : (ex.reps || "");
    return '<div class="set-row' + (done ? " is-done" : "") + '">' +
      '<div class="set-row__idx">' + (idx + 1) + "</div>" +
      '<div class="set-row__goal"><span>Série ' + (idx + 1) + "</span><b>" + esc(ex.targetLabel) + "</b></div>" +
      '<div class="set-row__controls">' +
        '<div class="stepper">' +
          '<button data-action="set-dec" data-ex="' + ex.id + '" data-idx="' + idx + '" aria-label="Menos">−</button>' +
          '<input type="number" inputmode="numeric" min="0" placeholder="' + ph + '" value="' + val + '" data-role="set-input" data-ex="' + ex.id + '" data-idx="' + idx + '" aria-label="Repetições" />' +
          '<button data-action="set-inc" data-ex="' + ex.id + '" data-idx="' + idx + '" aria-label="Mais">+</button>' +
        "</div>" +
        '<button class="check-round' + (done ? " is-on" : "") + '" data-action="set-done" data-ex="' + ex.id + '" data-idx="' + idx + '" aria-label="Marcar série ' + (idx + 1) + '">' + I.check + "</button>" +
      "</div>" +
    "</div>";
  }

  /* ---------------- PROGRESSO ---------------- */
  function viewProgress() {
    var logs = completedLogs();
    var st = streak(), wc = weekCount();
    var totalSets = logs.reduce(function (a, l) { return a + setsDone(l).done; }, 0);
    var totalMin = logs.reduce(function (a, l) {
      if (!l.startedAt || !l.finishedAt) return a;
      return a + Math.max(0, (new Date(l.finishedAt) - new Date(l.startedAt)) / 60000);
    }, 0);

    var prs = personalRecords(logs);

    var recent = logs.slice(-6).reverse();

    return '<div class="page">' +
      '<div class="stat-row">' +
        statBox(I.fire, st, "Sequência atual", st === 1 ? "dia" : "dias") +
        statBox(I.dumbbell, logs.length, "Treinos feitos", "total") +
        statBox(I.check, totalSets, "Séries feitas", "total") +
        statBox(I.clock, Math.round(totalMin), "Tempo treinado", "min") +
      "</div>" +

      '<div class="card"><div class="section-head" style="margin-bottom:14px"><h3>Frequência</h3>' +
        '<div class="row" style="gap:6px"><button class="icon-btn" data-action="cal-move" data-delta="-1" aria-label="Mês anterior" style="transform:scaleX(-1)">' + I.chevron + "</button>" +
        '<button class="icon-btn" data-action="cal-move" data-delta="1" aria-label="Próximo mês">' + I.chevron + "</button></div></div>" +
        calendarHtml() +
        '<div class="legend">Menos <i class="lvl-1" style="background:var(--surface-2)"></i><i style="background:color-mix(in srgb,var(--primary) 22%, var(--surface-2))"></i><i style="background:color-mix(in srgb,var(--primary) 45%, var(--surface-2))"></i><i style="background:var(--primary)"></i> Mais</div>' +
      "</div>" +

      '<div class="grid grid--2">' +
        '<div class="card"><h3 style="font-size:1rem;margin-bottom:12px">Recordes pessoais</h3>' +
          (prs.length ? '<div class="stack">' + prs.map(function (p) {
            return '<div class="row-between"><span style="font-size:.9rem">' + esc(p.name) + "</span>" +
              '<b style="color:var(--primary)">' + p.value + " <small class=\"muted\">" + esc(p.unit) + "</small></b></div>";
          }).join("") + "</div>" : '<p class="muted" style="font-size:.88rem">Complete treinos para ver seus recordes.</p>') +
        "</div>" +
        '<div class="card"><h3 style="font-size:1rem;margin-bottom:12px">Resumo semanal</h3>' +
          weekSummaryHtml() +
        "</div>" +
      "</div>" +

      '<div><div class="section-head" style="margin-bottom:12px"><h3>Histórico</h3><span class="muted">Últimos treinos</span></div>' +
        (recent.length ? '<div class="stack">' + recent.map(historyRow).join("") + "</div>" :
          '<div class="card empty"><div class="empty__icon">📋</div><h4>Nenhum treino ainda</h4><p class="muted">Seus treinos concluídos aparecerão aqui.</p></div>') +
      "</div>" +
    "</div>";
  }

  function personalRecords(logs) {
    var best = {};
    logs.forEach(function (l) {
      Object.keys(l.exercises || {}).forEach(function (id) {
        var ex = WorkoutData.getExercise(id);
        if (!ex) return;
        (l.exercises[id].sets || []).forEach(function (s) {
          if (!s.done || s.value == null) return;
          if (!best[id] || s.value > best[id]) best[id] = s.value;
        });
      });
    });
    return Object.keys(best).map(function (id) {
      var ex = WorkoutData.getExercise(id);
      return {
        name: ex.name,
        value: ex.targetType === "time" ? fmtMMSS(best[id]) : best[id],
        unit: ex.targetType === "time" ? "tempo" : "reps"
      };
    });
  }

  function calendarHtml() {
    var y = state.cal.y, m = state.cal.m;
    var monthName = new Date(y, m, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    var logs = Store.getAllLogs(state.user.id);
    var first = new Date(y, m, 1);
    var startPad = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var today = new Date();

    var head = WorkoutData.dowShort.map(function (d) { return '<div class="cal__dow">' + d + "</div>"; }).join("");
    var cells = "";
    for (var p = 0; p < startPad; p++) cells += '<div class="cal__cell is-empty"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var dt = new Date(y, m, d);
      var l = logs[todayKey(dt)];
      var cls = "cal__cell";
      if (l && l.completed) {
        var n = setsDone(l).done;
        cls += n >= 8 ? " lvl-3" : n >= 5 ? " lvl-2" : " lvl-1";
      }
      if (sameDay(dt, today)) cls += " is-today";
      cells += '<div class="' + cls + '" title="' + todayKey(dt) + '">' + d + "</div>";
    }
    return '<div class="row-between" style="margin-bottom:10px"><strong style="text-transform:capitalize">' + monthName + "</strong></div>" +
      '<div class="cal">' + head + cells + "</div>";
  }

  function weekSummaryHtml() {
    var start = startOfWeek(new Date());
    var html = "";
    for (var i = 0; i < 7; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      var planned = !!WorkoutData.workoutForDay(d.getDay());
      var l = Store.getLog(state.user.id, todayKey(d));
      var ok = l && l.completed;
      html += '<div class="row-between" style="padding:7px 0;font-size:.88rem">' +
        "<span>" + WorkoutData.dow[d.getDay()] + "</span>" +
        (ok ? '<span class="pill pill--primary">' + I.check + " Feito</span>" :
          planned ? '<span class="muted">' + esc(WorkoutData.getWorkout(WorkoutData.workoutForDay(d.getDay())).name) + "</span>" :
          '<span class="muted">Descanso</span>') +
        "</div>";
    }
    return html;
  }

  function historyRow(l) {
    var w = WorkoutData.getWorkout(l.workoutId);
    var c = setsDone(l);
    var dur = (l.startedAt && l.finishedAt) ? Math.max(1, Math.round((new Date(l.finishedAt) - new Date(l.startedAt)) / 60000)) + " min" : "";
    return '<div class="card row-between">' +
      '<div class="row"><span class="ex-card__num" style="background:color-mix(in srgb,var(--blue) 16%,transparent);color:var(--blue)">' + (w ? w.id : "?") + "</span>" +
      '<div><strong style="display:block;font-size:.95rem">' + esc(w ? w.name : "Treino") + "</strong>" +
      '<small class="muted">' + parseKey(l.date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) + (dur ? " · " + dur : "") + "</small></div></div>" +
      '<span class="pill pill--primary">' + c.done + "/" + c.total + "</span>" +
    "</div>";
  }

  /* ---------------- PERFIL ---------------- */
  function viewProfile() {
    var u = state.user;
    var s = getSettings();
    var logs = completedLogs();
    return '<div class="page">' +
      '<div class="card card--pad-lg"><div class="profile-head">' +
        '<div class="avatar">' + initials(u.name) + "</div>" +
        '<div style="min-width:0"><h2 style="font-size:1.2rem">' + esc(u.name) + "</h2>" +
        '<p class="muted" style="font-size:.86rem;overflow:hidden;text-overflow:ellipsis">' + esc(u.email) + "</p>" +
        '<p class="muted" style="font-size:.8rem;margin-top:4px">Membro desde ' + new Date(u.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) + "</p></div>" +
      "</div>" +
      '<div class="stat-row" style="margin-top:18px">' +
        statBox(I.dumbbell, logs.length, "Treinos", "feitos") +
        statBox(I.fire, streak(), "Sequência", "dias") +
      "</div></div>" +

      '<div class="card"><h3 style="font-size:1rem;margin-bottom:6px">Conta</h3>' +
        '<div class="list-row"><span class="list-row__label">' + I.user + " Nome</span>" +
          '<button class="btn btn--ghost btn--sm" data-action="edit-name">Editar</button></div>' +
        '<div class="list-row"><span class="list-row__label">' + I.info + " Senha</span>" +
          '<button class="btn btn--ghost btn--sm" data-action="change-password">Alterar</button></div>' +
      "</div>" +

      '<div class="card"><h3 style="font-size:1rem;margin-bottom:6px">Preferências</h3>' +
        '<div class="list-row"><span class="list-row__label">' + I.clock + " Descanso entre séries</span>" +
          '<div class="stepper"><button data-action="rest-dec">−</button><input type="number" value="' + s.rest + '" data-role="rest-input" aria-label="Segundos de descanso" /><button data-action="rest-inc">+</button></div></div>' +
        '<div class="list-row"><span class="list-row__label">' + I.timer + " Som do cronômetro</span>" +
          '<button class="switch' + (s.sound ? " is-on" : "") + '" data-action="toggle-sound" aria-label="Alternar som"></button></div>' +
        '<div class="list-row"><span class="list-row__label">' + I.home + " Tema escuro</span>" +
          '<button class="switch' + (Store.getTheme() !== "light" ? " is-on" : "") + '" data-action="toggle-theme" aria-label="Alternar tema"></button></div>' +
      "</div>" +

      '<div class="card"><h3 style="font-size:1rem;margin-bottom:6px">Dados</h3>' +
        '<div class="list-row"><span class="list-row__label">' + I.info + " Seus dados ficam salvos neste navegador</span></div>" +
        '<button class="btn btn--danger btn--block mt-8" data-action="clear-logs">Apagar histórico de treinos</button>' +
        '<button class="btn btn--ghost btn--block mt-8" data-action="logout">' + I.logout + " Sair da conta</button>" +
      "</div>" +
    "</div>";
  }

  /* ---------------- actions ---------------- */
  function handleAction(action, el) {
    switch (action) {
      case "go": setRoute(el.dataset.route); break;
      case "toggle-theme": {
        var next = Store.getTheme() === "light" ? "dark" : "light";
        Store.setTheme(next); applyTheme(next);
        if (state.route === "perfil") render();
        break;
      }
      case "open-exercise": openExerciseModal(el.dataset.ex); break;
      case "view-workout": setRoute("treinos"); break;
      case "start-workout": requestStartWorkout(el.dataset.workout); break;

      case "set-done": toggleSet(el.dataset.ex, +el.dataset.idx); break;
      case "set-inc": bumpSet(el.dataset.ex, +el.dataset.idx, 1); break;
      case "set-dec": bumpSet(el.dataset.ex, +el.dataset.idx, -1); break;
      case "hold-timer": startHold(el.dataset.ex, +el.dataset.idx); break;
      case "finish-workout": finishWorkout(); break;
      case "cancel-workout": cancelWorkout(); break;

      case "cal-move": moveCal(+el.dataset.delta); break;

      case "edit-name": editName(); break;
      case "change-password": changePassword(); break;
      case "rest-inc": changeRest(15); break;
      case "rest-dec": changeRest(-15); break;
      case "toggle-sound": { var s = getSettings(); setSettings({ sound: !s.sound }); render(); break; }
      case "clear-logs": clearLogs(); break;
      case "logout": doLogout(); break;

      case "timer-skip": closeTimer(); break;
      case "timer-add": addRestTime(30); break;
      case "timer-done": finishHold(); break;
      case "modal-close": closeModal(); break;
    }
}

  /* ---------------- session ---------------- */
  function requestStartWorkout(id) {
    if (!WorkoutData.getWorkout(id)) return;
    if (state.session && setsDone(state.session).done > 0 && state.session.workoutId !== id) {
      var w = WorkoutData.getWorkout(id);
      confirmModal(
        "Começar outro treino?",
        "Você tem uma sessão em andamento com séries já registradas. Se iniciar o " + esc(w.name) + ", a sessão atual será substituída.",
        "Iniciar " + w.name,
        function () { startWorkout(id); }
      );
    } else {
      startWorkout(id);
    }
  }

  function startWorkout(id) {
    state.session = buildLog(id);
    persistActive();
    if (state.route !== "treinar") setRoute("treinar");
    else { render(); updateTopbarSub(); }
    toast("Sessão iniciada. Bons treinos! 💪", "success");
  }
  function updateTopbarSub() {
    if (state.route === "treinar") $("#topbar-sub").textContent = state.session ? "Sessão em andamento" : "";
  }

  function buildLog(workoutId) {
    var w = WorkoutData.getWorkout(workoutId);
    var exercises = {};
    w.exercises.forEach(function (id) {
      var ex = WorkoutData.getExercise(id);
      var sets = [];
      for (var i = 0; i < ex.sets; i++) {
        var prefill = prevValue(workoutId, id, i);
        var val;
        if (prefill != null) val = prefill;
        else if (ex.targetType === "max") val = null;
        else val = ex.reps || ex.seconds;
        sets.push({ value: val, done: false });
      }
      exercises[id] = { sets: sets };
    });
    return {
      workoutId: workoutId,
      date: todayKey(),
      startedAt: new Date().toISOString(),
      finishedAt: null,
      completed: false,
      exercises: exercises
    };
  }

  function prevValue(workoutId, exId, idx) {
    var logs = completedLogs().filter(function (l) { return l.workoutId === workoutId; });
    for (var i = logs.length - 1; i >= 0; i--) {
      var set = logs[i].exercises && logs[i].exercises[exId] && logs[i].exercises[exId].sets[idx];
      if (set && set.value != null) return set.value;
    }
    return null;
  }

  function persistActive() {
    var key = "cp_active_" + state.user.id;
    if (state.session) writeLS(key, state.session);
    else { try { localStorage.removeItem(key); } catch (e) {} }
    saveLogSilently();
  }
  function saveLogSilently() {
    if (!state.session) return;
    Store.saveLog(state.user.id, state.session.date, state.session);
  }
  function restoreActiveSession() {
    var s = readLS("cp_active_" + state.user.id, null);
    if (s && s.workoutId && WorkoutData.getWorkout(s.workoutId)) {
      state.session = s;
    } else { state.session = null; }
  }

  function toggleSet(exId, idx) {
    var log = state.session.exercises[exId];
    var ex = WorkoutData.getExercise(exId);
    var set = log.sets[idx];
    set.done = !set.done;
    if (set.done && set.value == null && ex.targetType !== "max") set.value = ex.reps || ex.seconds;
    persistActive();

    if (set.done) {
      var isLast = idx === log.sets.length - 1 && allNextDone(exId, idx);
      var rest = getSettings().rest;
      if (rest > 0 && !isLast) {
        render();
        setTimeout(function () { startRest(rest); }, 150);
        return;
      }
    }
    render();
  }
  function allNextDone(exId, idx) {
    var log = state.session.exercises[exId];
    for (var i = idx + 1; i < log.sets.length; i++) if (!log.sets[i].done) return false;
    return true;
  }
  function bumpSet(exId, idx, delta) {
    var set = state.session.exercises[exId].sets[idx];
    var cur = set.value == null ? 0 : +set.value;
    set.value = Math.max(0, cur + delta);
    persistActive();
    var row = $('[data-role="set-input"][data-ex="' + exId + '"][data-idx="' + idx + '"]');
    if (row) row.value = set.value;
  }

  function finishWorkout() {
    var s = state.session;
    var c = setsDone(s);
    s.completed = true;
    s.finishedAt = new Date().toISOString();
    Store.saveLog(state.user.id, s.date, s);
    persistActive();
    state.session = null;
    try { localStorage.removeItem("cp_active_" + state.user.id); } catch (e) {}
    var dur = Math.max(1, Math.round((new Date(s.finishedAt) - new Date(s.startedAt)) / 60000));
    openModal(summaryHtml(s, c, dur));
    setRoute("home");
  }
  function cancelWorkout() {
    openModal(
      '<div class="modal__handle"></div>' +
      '<div class="modal__head"><h3>Cancelar treino?</h3></div>' +
      '<p class="muted">O progresso não será marcado como concluído.</p>' +
      '<div class="row mt-20" style="gap:10px"><button class="btn btn--ghost grow" data-action="modal-close">Voltar</button>' +
      '<button class="btn btn--danger grow" id="confirm-cancel">Sim, cancelar</button></div>'
    );
    $("#confirm-cancel").addEventListener("click", function () {
      var date = state.session ? state.session.date : null;
      state.session = null;
      if (date) Store.deleteLog(state.user.id, date);
      persistActive();
      closeModal();
      setRoute("home");
      toast("Treino cancelado.");
    });
  }

  function summaryHtml(s, c, dur) {
    var w = WorkoutData.getWorkout(s.workoutId);
    return '<div class="modal__handle"></div>' +
      '<div class="text-center" style="padding:6px 0 4px"><div style="font-size:2.6rem">🎉</div>' +
      '<h3 style="font-size:1.35rem;margin:6px 0">Treino concluído!</h3>' +
      '<p class="muted">' + esc(w.name) + " · " + parseKey(s.date).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) + "</p></div>" +
      '<div class="stat-row" style="margin:18px 0">' +
        '<div class="stat"><div class="stat__value">' + c.done + "<small>/" + c.total + "</small></div><div class=\"stat__label\">Séries</div></div>" +
        '<div class="stat"><div class="stat__value">' + dur + "<small>min</small></div><div class=\"stat__label\">Duração</div></div>" +
      "</div>" +
      '<button class="btn btn--primary btn--block btn--lg" data-action="modal-close">Continuar</button>';
  }

  /* ---------------- rest / hold timer ---------------- */
  var timer = null;
  function startRest(seconds) {
    openTimer("rest", seconds);
  }
  function addRestTime(sec) {
    if (timer && timer.mode === "rest") {
      timer.endAt += sec * 1000;
      timer.total += sec;
    }
  }
  function startHold(exId, idx) {
    var ex = WorkoutData.getExercise(exId);
    openTimer("hold", ex.seconds || 30, { exId: exId, idx: idx });
  }
  function finishHold() {
    if (!timer || timer.mode !== "hold") return;
    var secs = Math.round(timer.elapsed);
    var opts = timer.opts;
    closeTimer();
    var log = state.session.exercises[opts.exId];
    var set = log.sets[opts.idx];
    if (secs > 0) { set.value = secs; set.done = true; }
    persistActive();
    render();
    var rest = getSettings().rest;
    var last = opts.idx === log.sets.length - 1;
    if (set.done && rest > 0 && !last) setTimeout(function () { startRest(rest); }, 150);
  }

  function openTimer(mode, total, opts) {
    closeTimer();
    opts = opts || {};
    var r = 92, C = 2 * Math.PI * r;
    var target = mode === "rest" ? total : total;
    var html =
      '<div class="timer-overlay" id="timer-overlay">' +
        '<div class="timer-card">' +
          '<div class="hero__eyebrow" style="color:var(--muted);margin-bottom:14px">' + (mode === "rest" ? "Descanso" : "Cronômetro") + "</div>" +
          '<div class="timer-ring">' +
            '<svg viewBox="0 0 220 220" width="220" height="220">' +
              '<circle class="timer-ring__track" cx="110" cy="110" r="' + r + '"></circle>' +
              '<circle class="timer-ring__bar" id="timer-bar" cx="110" cy="110" r="' + r + '" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (mode === "rest" ? "0" : C.toFixed(1)) + '"></circle>' +
            "</svg>" +
            '<div class="timer-ring__time" id="timer-time">' + fmtMMSS(mode === "rest" ? total : 0) + "<small>" + (mode === "rest" ? "restantes" : "decorrido") + "</small></div>" +
          "</div>" +
          (mode === "rest"
            ? '<div class="timer-actions"><button class="btn btn--ghost" data-action="timer-add">+30s</button>' +
              '<button class="btn btn--primary" data-action="timer-skip">Pular descanso</button></div>'
            : '<div class="timer-actions"><button class="btn btn--ghost" data-action="timer-skip">Cancelar</button>' +
              '<button class="btn btn--primary" data-action="timer-done">Concluir série</button></div>') +
        "</div></div>";
    $("#modal-root").innerHTML = html;

    timer = {
      mode: mode,
      total: total,
      opts: opts,
      startAt: Date.now(),
      endAt: Date.now() + (mode === "rest" ? total * 1000 : 0),
      elapsed: 0,
      interval: null
    };
    timer.interval = setInterval(tickTimer, 100);
    tickTimer();
  }

  function tickTimer() {
    if (!timer) return;
    var now = Date.now();
    var bar = $("#timer-bar"), time = $("#timer-time");
    if (!bar) return;
    var C = 2 * Math.PI * 92;
    if (timer.mode === "rest") {
      var remain = Math.max(0, (timer.endAt - now) / 1000);
      var pct = timer.total > 0 ? remain / timer.total : 0;
      bar.setAttribute("stroke-dashoffset", (C * (1 - pct)).toFixed(1));
      time.innerHTML = fmtMMSS(remain) + "<small>restantes</small>";
      if (remain <= 0) { restFinished(); }
    } else {
      timer.elapsed = (now - timer.startAt) / 1000;
      var p = Math.min(1, timer.elapsed / timer.total);
      bar.setAttribute("stroke-dashoffset", (C * (1 - p)).toFixed(1));
      time.innerHTML = fmtMMSS(timer.elapsed) + "<small>decorrido</small>";
    }
  }

  function restFinished() {
    if (!timer || timer.mode !== "rest") return;
    beep();
    var ov = $("#timer-overlay"); if (ov) ov.remove();
    clearInterval(timer.interval);
    timer = null;
    toast("Descanso concluído. Próxima série! 💪", "success");
  }
  function closeTimer() {
    var ov = $("#timer-overlay"); if (ov) ov.remove();
    if (timer && timer.interval) clearInterval(timer.interval);
    timer = null;
    $("#modal-root").innerHTML = "";
  }

  function beep() {
    if (!getSettings().sound) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.start(); o.stop(ctx.currentTime + 0.5);
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, 700);
    } catch (e) {}
  }

  /* ---------------- modal / toast ---------------- */
  function openModal(html) {
    var root = $("#modal-root");
    root.innerHTML = '<div class="modal-backdrop"><div class="modal" id="modal-box">' + html + "</div></div>";
  }
  function closeModal() { $("#modal-root").innerHTML = ""; }

  function confirmModal(title, text, okLabel, onOk) {
    openModal(
      '<div class="modal__handle"></div><div class="modal__head"><h3>' + esc(title) + "</h3></div>" +
      '<p class="muted">' + text + "</p>" +
      '<div class="row mt-20" style="gap:10px"><button class="btn btn--ghost grow" data-action="modal-close">Voltar</button>' +
      '<button class="btn btn--primary grow" id="confirm-ok">' + esc(okLabel) + "</button></div>"
    );
    $("#confirm-ok").addEventListener("click", function () { closeModal(); onOk(); });
  }

  function openExerciseModal(exId) {
    var ex = WorkoutData.getExercise(exId);
    if (!ex) return;
    var html =
      '<div class="modal__handle"></div>' +
      '<div class="modal__head"><div><span class="pill pill--primary">' + ex.sets + " séries</span> " +
      '<span class="pill">' + esc(ex.targetLabel) + "</span></div>" +
      '<button class="icon-btn" data-action="modal-close" aria-label="Fechar">✕</button></div>' +
      "<h3>" + esc(ex.name) + "</h3>" +
      '<div class="detail-art">' + Illustrations.art(ex.ill) + "</div>" +
      '<div class="ex-card__muscles">' + ex.muscles.map(function (m) { return '<span class="pill">' + esc(m) + "</span>"; }).join("") +
        '<span class="pill pill--blue">' + esc(ex.equipment) + "</span></div>" +
      '<h4 style="margin:16px 0 10px">Como executar</h4>' +
      '<ol class="steps">' + ex.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
      '<h4 style="margin:18px 0 10px">Dicas</h4>' +
      '<ul class="tips">' + ex.tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      (ex.video ? '<a class="btn btn--primary btn--block btn--lg mt-20" target="_blank" rel="noopener" href="' + ex.video + '">' + I.play + " Ver vídeo tutorial</a>" : "") +
      (state.session && state.session.exercises[exId]
        ? '<button class="btn btn--primary btn--block btn--lg mt-20" data-action="modal-close">Voltar ao treino</button>'
        : '<button class="btn btn--ghost btn--block btn--lg mt-20" data-action="modal-close">Fechar</button>');
    openModal(html);
  }

  var toastTimer = null;
  function toast(msg, type) {
    var t = $("#toast");
    t.textContent = msg;
    t.className = "toast show" + (type ? " is-" + type : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast"; }, 2800);
  }

  /* ---------------- perfil actions ---------------- */
  function editName() {
    openModal(
      '<div class="modal__handle"></div><div class="modal__head"><h3>Editar nome</h3>' +
      '<button class="icon-btn" data-action="modal-close">✕</button></div>' +
      '<label class="field"><span>Nome</span><input type="text" id="name-input" value="' + esc(state.user.name) + '"></label>' +
      '<button class="btn btn--primary btn--block mt-8" id="save-name">Salvar</button>'
    );
    $("#save-name").addEventListener("click", function () {
      var v = $("#name-input").value;
      var u = Store.updateUser({ name: v });
      if (u) { state.user = u; updateUserChrome(); closeModal(); render(); toast("Nome atualizado.", "success"); }
      else toast("Informe um nome válido.", "error");
    });
  }

  function changePassword() {
    openModal(
      '<div class="modal__handle"></div><div class="modal__head"><h3>Alterar senha</h3>' +
      '<button class="icon-btn" data-action="modal-close">✕</button></div>' +
      '<label class="field"><span>Senha atual</span><input type="password" id="cp-current"></label>' +
      '<label class="field"><span>Nova senha</span><input type="password" id="cp-new" placeholder="Mínimo de 6 caracteres"></label>' +
      '<p class="form-error" id="cp-err"></p>' +
      '<button class="btn btn--primary btn--block" id="cp-save">Salvar nova senha</button>'
    );
    $("#cp-save").addEventListener("click", function () {
      var err = $("#cp-err"); err.textContent = "";
      Store.changePassword($("#cp-current").value, $("#cp-new").value).then(function () {
        closeModal(); toast("Senha alterada com sucesso.", "success");
      }).catch(function (ex) { err.textContent = ex.message || "Erro."; });
    });
  }

  function changeRest(delta) {
    var s = getSettings();
    var v = Math.max(0, Math.min(300, s.rest + delta));
    setSettings({ rest: v });
    var inp = $('[data-role="rest-input"]'); if (inp) inp.value = v;
  }

  function clearLogs() {
    openModal(
      '<div class="modal__handle"></div><div class="modal__head"><h3>Apagar histórico?</h3></div>' +
      '<p class="muted">Isso remove permanentemente todos os seus treinos registrados. Não afeta sua conta.</p>' +
      '<div class="row mt-20" style="gap:10px"><button class="btn btn--ghost grow" data-action="modal-close">Voltar</button>' +
      '<button class="btn btn--danger grow" id="confirm-clear">Apagar</button></div>'
    );
    $("#confirm-clear").addEventListener("click", function () {
      writeLS(Store.logsKey(state.user.id), {});
      try { localStorage.removeItem("cp_active_" + state.user.id); } catch (e) {}
      state.session = null;
      closeModal(); render(); toast("Histórico apagado.");
    });
  }

  function doLogout() {
    openModal(
      '<div class="modal__handle"></div><div class="modal__head"><h3>Sair da conta?</h3></div>' +
      '<p class="muted">Seu progresso continua salvo neste dispositivo.</p>' +
      '<div class="row mt-20" style="gap:10px"><button class="btn btn--ghost grow" data-action="modal-close">Voltar</button>' +
      '<button class="btn btn--primary grow" id="confirm-logout">Sair</button></div>'
    );
    $("#confirm-logout").addEventListener("click", function () {
      Store.logout();
      closeModal();
      state.session = null;
      showAuth();
      toast("Você saiu da conta.");
    });
  }

  function moveCal(delta) {
    var d = new Date(state.cal.y, state.cal.m + delta, 1);
    state.cal.y = d.getFullYear(); state.cal.m = d.getMonth();
    render();
  }

  /* ---------------- global events ---------------- */
  document.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("modal-backdrop")) { closeModal(); return; }
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.dataset.action;
    if (action === "timer-skip") { closeTimer(); return; }
    handleAction(action, el);
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.role === "set-input") {
      var set = state.session.exercises[t.dataset.ex].sets[+t.dataset.idx];
      set.value = t.value === "" ? null : Math.max(0, parseInt(t.value, 10) || 0);
      persistActive();
    } else if (t.dataset && t.dataset.role === "rest-input") {
      setSettings({ rest: Math.max(0, Math.min(300, parseInt(t.value, 10) || 0)) });
    }
  });

  $("#topbar-avatar") && $("#topbar-avatar").addEventListener("click", function () { setRoute("perfil"); });
  $("#btn-theme") && $("#btn-theme").addEventListener("click", function () {
    var next = Store.getTheme() === "light" ? "dark" : "light";
    Store.setTheme(next);
    applyTheme(next);
    if (state.route === "perfil") render();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); closeTimer(); }
  });

  /* Se o player carregar mas a animação .lottie falhar, remove o elemento
     para o SVG de fallback voltar a aparecer. */
  (function () {
    var attempts = {};
    setInterval(function () {
      var els = document.querySelectorAll("dotlottie-wc.lottie-fig:defined");
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el._lottieResolved) continue;
        var d = el.dotLottie;
        if (d && d.isLoaded) { el._lottieResolved = true; continue; }
        if (el._lottieKey == null) { el._lottieKey = Math.random().toString(36).slice(2); attempts[el._lottieKey] = 0; }
        if (++attempts[el._lottieKey] > 6) { el._lottieResolved = true; el.remove(); }
      }
    }, 700);
  })();

  boot();
})();

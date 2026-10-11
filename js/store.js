/* ============================================================
   store.js — Persistência local, cadastro e login
   Tudo fica salvo no navegador (localStorage) deste dispositivo.
   Senhas são guardadas como hash (SHA-256 + salt), nunca em texto.
   ============================================================ */
(function () {
  "use strict";

  var KEYS = {
    users: "cp_users",
    session: "cp_session",
    theme: "cp_theme",
    logs: "cp_logs_"   // + userId
  };

  /* ---------- helpers ---------- */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) { try { return crypto.randomUUID(); } catch (e) {} }
    return "u-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function randomSalt() {
    var a = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (var i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
    return toHex(a);
  }
  function toHex(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += ("0" + bytes[i].toString(16)).slice(-2);
    return s;
  }
  /* hash alternativo (fallback) quando Web Crypto não está disponível */
  function fnv(str, rounds) {
    var h = 2166136261 >>> 0;
    for (var r = 0; r < rounds; r++) {
      for (var i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      h = (h ^ (h >>> 13)) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8);
  }

  function hashPassword(password, salt) {
    var data = salt + "::" + password;
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
        .then(function (buf) { return "sha256:" + toHex(new Uint8Array(buf)); })
        .catch(function () { return "fnv:" + fnv(data, 12) + fnv(salt + password, 5); });
    }
    return Promise.resolve("fnv:" + fnv(data, 12) + fnv(salt + password, 5));
  }

  /* ---------- users ---------- */
  function getUsers() { return read(KEYS.users, []); }
  function saveUsers(list) { return write(KEYS.users, list); }

  function normalizeEmail(e) { return String(e || "").trim().toLowerCase(); }

  var Store = {
    /* --- autenticação --- */
    register: function (name, email, password) {
      name = String(name || "").trim();
      email = normalizeEmail(email);

      if (name.length < 2) return Promise.reject(new Error("Informe seu nome."));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Promise.reject(new Error("E-mail inválido."));
      if (String(password || "").length < 6) return Promise.reject(new Error("A senha precisa ter ao menos 6 caracteres."));

      var users = getUsers();
      if (users.some(function (u) { return u.email === email; })) {
        return Promise.reject(new Error("Já existe uma conta com esse e-mail."));
      }

      var salt = randomSalt();
      return hashPassword(password, salt).then(function (hash) {
        var user = {
          id: uuid(),
          name: name,
          email: email,
          salt: salt,
          hash: hash,
          createdAt: new Date().toISOString()
        };
        users.push(user);
        saveUsers(users);
        write(KEYS.session, user.id);
        return this.publicUser(user);
      }.bind(this));
    },

    login: function (email, password) {
      email = normalizeEmail(email);
      var users = getUsers();
      var user = users.filter(function (u) { return u.email === email; })[0];
      if (!user) return Promise.reject(new Error("E-mail ou senha incorretos."));

      return hashPassword(String(password || ""), user.salt).then(function (hash) {
        if (hash !== user.hash) throw new Error("E-mail ou senha incorretos.");
        write(KEYS.session, user.id);
        return this.publicUser(user);
      }.bind(this));
    },

    logout: function () {
      try { localStorage.removeItem(KEYS.session); } catch (e) {}
    },

    currentUser: function () {
      var id = read(KEYS.session, null);
      if (!id) return null;
      var user = getUsers().filter(function (u) { return u.id === id; })[0];
      return user ? this.publicUser(user) : null;
    },

    updateUser: function (patch) {
      var id = read(KEYS.session, null);
      if (!id) return null;
      var users = getUsers();
      var user = users.filter(function (u) { return u.id === id; })[0];
      if (!user) return null;
      if (typeof patch.name === "string" && patch.name.trim().length >= 2) user.name = patch.name.trim();
      saveUsers(users);
      return this.publicUser(user);
    },

    changePassword: function (current, next) {
      var id = read(KEYS.session, null);
      if (!id) return Promise.reject(new Error("Sessão expirada."));
      if (String(next || "").length < 6) return Promise.reject(new Error("A nova senha precisa ter ao menos 6 caracteres."));
      var users = getUsers();
      var user = users.filter(function (u) { return u.id === id; })[0];
      if (!user) return Promise.reject(new Error("Usuário não encontrado."));

      return hashPassword(String(current || ""), user.salt).then(function (hash) {
        if (hash !== user.hash) throw new Error("Senha atual incorreta.");
        user.salt = randomSalt();
        return hashPassword(String(next), user.salt);
      }).then(function (newHash) {
        user.hash = newHash;
        saveUsers(users);
        return true;
      }).catch(function (err) { throw err; });
    },

    publicUser: function (u) {
      return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
    },

    /* --- registros de treino --- */
    logsKey: function (userId) { return KEYS.logs + userId; },
    getAllLogs: function (userId) { return read(this.logsKey(userId), {}); },
    getLog: function (userId, date) { return this.getAllLogs(userId)[date] || null; },
    saveLog: function (userId, date, log) {
      var all = this.getAllLogs(userId);
      all[date] = log;
      return write(this.logsKey(userId), all);
    },
    deleteLog: function (userId, date) {
      var all = this.getAllLogs(userId);
      delete all[date];
      return write(this.logsKey(userId), all);
    },

    /* --- tema --- */
    getTheme: function () { return read(KEYS.theme, "dark"); },
    setTheme: function (t) { write(KEYS.theme, t === "light" ? "light" : "dark"); }
  };

  window.Store = Store;
})();

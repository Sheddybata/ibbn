(function () {
  var loginSection = document.getElementById("admin-login");
  var appSection = document.getElementById("admin-app");
  var loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  var cfg = window.IBBN_CONFIG || {};
  var supabaseClient = null;
  if (window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }

  var PAGE_SIZE = 25;
  var members = [];
  var filtered = [];
  var page = 1;
  var selected = null;
  var cardReady = false;
  var photoUrlCache = {};
  var drawToken = 0;
  var loginStatus = document.getElementById("login-status");
  var appStatus = document.getElementById("app-status");
  var loginBtn = document.getElementById("login-btn");
  var headerActions = document.getElementById("admin-header-actions");
  var adminUser = document.getElementById("admin-user");
  var drawer = document.getElementById("member-drawer");
  var canvasFront = document.getElementById("admin-card-front");
  var canvasBack = document.getElementById("admin-card-back");
  var downloadCardBtn = document.getElementById("download-member-card");
  var stateSelect = document.getElementById("filter-state");
  var lgaSelect = document.getElementById("filter-lga");

  if (!supabaseClient) {
    setLoginStatus("Admin is not connected. Add Supabase keys to config.js.", true);
    loginBtn.disabled = true;
    return;
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    signIn();
  });

  document.getElementById("sign-out-btn").addEventListener("click", signOut);
  document.getElementById("refresh-btn").addEventListener("click", function () {
    loadMembers();
  });
  document.getElementById("csv-btn").addEventListener("click", downloadCsv);
  document.getElementById("download-member-card").addEventListener("click", function () {
    if (!selected || !cardReady || !window.IBBNCard) return;
    window.IBBNCard.downloadBoth(canvasFront, canvasBack, selected.membership_id);
  });

  ["filter-search", "filter-state", "filter-from", "filter-to"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", onFilterChange);
    document.getElementById(id).addEventListener("change", onFilterChange);
  });
  lgaSelect.addEventListener("change", onFilterChange);

  document.querySelectorAll("[data-close-drawer]").forEach(function (el) {
    el.addEventListener("click", closeDrawer);
  });

  document.querySelectorAll("[data-admin-card-face]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showAdminCardFace(btn.getAttribute("data-admin-card-face"));
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !drawer.hidden) closeDrawer();
  });

  supabaseClient.auth.getSession().then(function (res) {
    if (res.data && res.data.session) {
      enterApp(res.data.session.user);
    }
  });

  function signIn() {
    var email = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;
    if (!email || !password) {
      setLoginStatus("Enter your email and password.", true);
      return;
    }
    loginBtn.disabled = true;
    setLoginStatus("Signing in…", false);
    supabaseClient.auth
      .signInWithPassword({ email: email, password: password })
      .then(function (res) {
        loginBtn.disabled = false;
        if (res.error) {
          setLoginStatus(friendlyAuthError(res.error), true);
          return;
        }
        enterApp(res.data.user);
      })
      .catch(function () {
        loginBtn.disabled = false;
        setLoginStatus("Could not sign in. Check your connection and try again.", true);
      });
  }

  function signOut() {
    closeDrawer();
    supabaseClient.auth.signOut().finally(function () {
      members = [];
      filtered = [];
      selected = null;
      showLogin();
    });
  }

  function enterApp(user) {
    setLoginStatus("Checking access…", false);
    supabaseClient
      .from("admins")
      .select("user_id, email")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(function (res) {
        if (res.error || !res.data) {
          supabaseClient.auth.signOut();
          showLogin();
          setLoginStatus(
            res.error && /admins/i.test(res.error.message)
              ? "Admin access is not set up yet. Run the latest SQL in Supabase, then add your user to the admins table."
              : "This account is not authorised to open the admin console.",
            true
          );
          return;
        }
        adminUser.textContent = user.email || res.data.email || "Admin";
        showApp();
        loadMembers();
      });
  }

  function showLogin() {
    loginSection.hidden = false;
    appSection.hidden = true;
    headerActions.hidden = true;
    loginBtn.disabled = false;
  }

  function showApp() {
    loginSection.hidden = true;
    appSection.hidden = false;
    headerActions.hidden = false;
    setLoginStatus("", false);
  }

  function loadMembers() {
    setAppStatus("Loading registrations…", false);
    fetchAllMembers()
      .then(function (rows) {
        members = rows;
        fillStateFilter();
        applyFilters();
        renderOverview();
        document.getElementById("admin-updated").textContent =
          "Updated " + formatWhen(new Date().toISOString()) + " (WAT).";
        setAppStatus("", false);
      })
      .catch(function (err) {
        setAppStatus(err.message || "Could not load registrations.", true);
      });
  }

  function fetchAllMembers() {
    var pageSize = 1000;
    var all = [];
    function next(from) {
      return supabaseClient
        .from("members")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1)
        .then(function (res) {
          if (res.error) throw new Error(res.error.message);
          all = all.concat(res.data || []);
          if ((res.data || []).length === pageSize) return next(from + pageSize);
          return all;
        });
    }
    return next(0);
  }

  function onFilterChange() {
    page = 1;
    if (this === stateSelect) fillLgaFilter();
    applyFilters();
  }

  function applyFilters() {
    var q = document.getElementById("filter-search").value.trim().toLowerCase();
    var state = stateSelect.value;
    var lga = lgaSelect.value;
    var from = document.getElementById("filter-from").value;
    var to = document.getElementById("filter-to").value;

    filtered = members.filter(function (m) {
      if (state && m.state !== state) return false;
      if (lga && m.lga !== lga) return false;
      if (from && lagosDate(m.created_at) < from) return false;
      if (to && lagosDate(m.created_at) > to) return false;
      if (!q) return true;
      var hay = [
        m.membership_id,
        m.title,
        m.first_name,
        m.last_name,
        m.other_names,
        m.phone,
        m.email,
        m.whatsapp,
        m.vin,
      ]
        .join(" ")
        .toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > pages) page = pages;
    renderTable();
  }

  function fillStateFilter() {
    var keep = stateSelect.value;
    var states = uniqueSorted(
      members.map(function (m) {
        return m.state;
      })
    );
    stateSelect.innerHTML = '<option value="">All states</option>';
    states.forEach(function (name) {
      var opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      stateSelect.appendChild(opt);
    });
    if (keep && states.indexOf(keep) !== -1) stateSelect.value = keep;
    fillLgaFilter();
  }

  function fillLgaFilter() {
    var keep = lgaSelect.value;
    var state = stateSelect.value;
    lgaSelect.innerHTML = '<option value="">All LGAs</option>';
    if (!state) {
      lgaSelect.disabled = true;
      lgaSelect.value = "";
      return;
    }
    var lgas = uniqueSorted(
      members
        .filter(function (m) {
          return m.state === state;
        })
        .map(function (m) {
          return m.lga;
        })
    );
    lgas.forEach(function (name) {
      var opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      lgaSelect.appendChild(opt);
    });
    lgaSelect.disabled = false;
    if (keep && lgas.indexOf(keep) !== -1) lgaSelect.value = keep;
    else lgaSelect.value = "";
  }

  function renderOverview() {
    var now = new Date();
    var today = lagosDate(now);
    var month = today.slice(0, 7);
    var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    var todayCount = 0;
    var weekCount = 0;
    var monthCount = 0;
    var gender = {};
    var byState = {};

    members.forEach(function (m) {
      var day = lagosDate(m.created_at);
      if (day === today) todayCount += 1;
      if (day.slice(0, 7) === month) monthCount += 1;
      if (new Date(m.created_at) >= weekAgo) weekCount += 1;
      var g = m.gender || "Unspecified";
      gender[g] = (gender[g] || 0) + 1;
      var st = m.state || "Unspecified";
      byState[st] = (byState[st] || 0) + 1;
    });

    document.getElementById("stat-total").textContent = String(members.length);
    document.getElementById("stat-today").textContent = String(todayCount);
    document.getElementById("stat-week").textContent = String(weekCount);
    document.getElementById("stat-month").textContent = String(monthCount);

    document.getElementById("stat-gender").innerHTML = Object.keys(gender)
      .sort()
      .map(function (key) {
        return "<li><span>" + escapeHtml(key) + "</span><strong>" + gender[key] + "</strong></li>";
      })
      .join("") || "<li>No data yet</li>";

    var stateRows = Object.keys(byState)
      .sort(function (a, b) {
        return byState[b] - byState[a] || a.localeCompare(b);
      })
      .map(function (key) {
        return (
          "<div><span>" +
          escapeHtml(key) +
          "</span><strong>" +
          byState[key] +
          "</strong></div>"
        );
      });
    document.getElementById("stat-states").innerHTML = stateRows.join("") || "<p>No data yet</p>";

    var recent = members.slice(0, 8);
    document.getElementById("recent-list").innerHTML =
      recent
        .map(function (m) {
          return (
            '<li><button type="button" class="admin-recent-btn" data-open-id="' +
            escapeAttr(m.membership_id) +
            '"><span>' +
            escapeHtml(displayName(m)) +
            '</span><span>' +
            escapeHtml(m.membership_id) +
            " · " +
            escapeHtml(m.state || "") +
            " · " +
            escapeHtml(formatWhen(m.created_at)) +
            "</span></button></li>"
          );
        })
        .join("") || "<li>No registrations yet.</li>";

    document.getElementById("recent-list").onclick = function (e) {
      var btn = e.target.closest("[data-open-id]");
      if (!btn) return;
      openMemberById(btn.getAttribute("data-open-id"));
    };
  }

  function renderTable() {
    var start = (page - 1) * PAGE_SIZE;
    var rows = filtered.slice(start, start + PAGE_SIZE);
    var body = document.getElementById("members-body");
    document.getElementById("filter-count").textContent =
      "Showing " +
      (filtered.length ? start + 1 : 0) +
      "–" +
      Math.min(start + PAGE_SIZE, filtered.length) +
      " of " +
      filtered.length +
      (filtered.length === members.length ? "" : " (filtered from " + members.length + ")");

    if (!rows.length) {
      body.innerHTML =
        '<tr><td colspan="7" class="admin-empty">No members match these filters.</td></tr>';
    } else {
      body.innerHTML = rows
        .map(function (m) {
          var src = publicPhotoUrl(m);
          var img = src
            ? '<img class="admin-thumb" src="' +
              escapeAttr(src) +
              '" alt="" width="40" height="48" />'
            : '<span class="admin-thumb admin-thumb-empty"></span>';
          return (
            '<tr data-open-id="' +
            escapeAttr(m.membership_id) +
            '"><td>' +
            img +
            "</td><td>" +
            escapeHtml(displayName(m)) +
            "</td><td>" +
            escapeHtml(m.membership_id) +
            "</td><td>" +
            escapeHtml(m.phone || "—") +
            "</td><td>" +
            escapeHtml(m.state || "—") +
            "</td><td>" +
            escapeHtml(m.lga || "—") +
            "</td><td>" +
            escapeHtml(formatWhen(m.created_at)) +
            "</td></tr>"
          );
        })
        .join("");
    }

    body.querySelectorAll("[data-open-id]").forEach(function (row) {
      row.addEventListener("click", function () {
        openMemberById(row.getAttribute("data-open-id"));
      });
    });

    var pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    var pager = document.getElementById("pager");
    if (pages <= 1) {
      pager.innerHTML = "";
      return;
    }
    pager.innerHTML =
      '<button type="button" class="btn btn-ghost btn-sm" id="page-prev"' +
      (page <= 1 ? " disabled" : "") +
      ">Previous</button>" +
      '<span>Page ' +
      page +
      " of " +
      pages +
      "</span>" +
      '<button type="button" class="btn btn-ghost btn-sm" id="page-next"' +
      (page >= pages ? " disabled" : "") +
      ">Next</button>";
    var prev = document.getElementById("page-prev");
    var next = document.getElementById("page-next");
    if (prev) {
      prev.addEventListener("click", function () {
        if (page > 1) {
          page -= 1;
          renderTable();
        }
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        if (page < pages) {
          page += 1;
          renderTable();
        }
      });
    }
  }

  function openMemberById(id) {
    var member = members.find(function (m) {
      return m.membership_id === id;
    });
    if (member) openDrawer(member);
  }

  function openDrawer(member) {
    selected = member;
    cardReady = false;
    downloadCardBtn.disabled = true;
    drawToken += 1;
    var token = drawToken;
    document.getElementById("drawer-title").textContent = displayName(member);
    var photoEl = document.getElementById("drawer-photo");
    var publicUrl = publicPhotoUrl(member);
    if (publicUrl) {
      photoEl.src = publicUrl;
      photoEl.alt = displayName(member);
      photoEl.hidden = false;
    } else {
      photoEl.removeAttribute("src");
      photoEl.hidden = true;
    }

    var rows = [
      ["Membership ID", member.membership_id],
      ["Title", member.title],
      ["First name", member.first_name],
      ["Other names", member.other_names],
      ["Surname", member.last_name],
      ["Gender", member.gender],
      ["Date of birth", member.date_of_birth],
      ["Phone", member.phone],
      ["WhatsApp", member.whatsapp],
      ["Email", member.email],
      ["Occupation", member.occupation],
      ["State", member.state],
      ["LGA", member.lga],
      ["Ward", member.ward],
      ["Polling unit", member.polling_unit],
      ["VIN / PVC", member.vin],
      ["Registered", formatWhen(member.created_at)],
    ];
    document.getElementById("drawer-list").innerHTML = rows
      .map(function (pair) {
        return (
          "<div><dt>" +
          escapeHtml(pair[0]) +
          "</dt><dd>" +
          escapeHtml(pair[1] || "—") +
          "</dd></div>"
        );
      })
      .join("");

    setDrawerStatus("Preparing ID card…", false);
    showAdminCardFace("front");
    drawer.hidden = false;
    document.body.style.overflow = "hidden";

    if (!window.IBBNCard) {
      setDrawerStatus("Card module failed to load.", true);
      return;
    }

    memberPhotoObjectUrl(member)
      .then(function (photoSrc) {
        if (token !== drawToken) {
          if (photoSrc && photoSrc.indexOf("blob:") === 0) URL.revokeObjectURL(photoSrc);
          return;
        }
        return window.IBBNCard.drawFront(canvasFront, member, photoSrc)
          .then(function () {
            return window.IBBNCard.drawBack(canvasBack, member.membership_id, member.created_at);
          })
          .then(function () {
            if (photoSrc && photoSrc.indexOf("blob:") === 0) URL.revokeObjectURL(photoSrc);
            if (token !== drawToken) return;
            cardReady = true;
            downloadCardBtn.disabled = false;
            setDrawerStatus("", false);
          });
      })
      .catch(function (err) {
        if (token !== drawToken) return;
        setDrawerStatus(err.message || "Could not draw this ID card.", true);
      });
  }

  function closeDrawer() {
    drawToken += 1;
    selected = null;
    cardReady = false;
    downloadCardBtn.disabled = true;
    drawer.hidden = true;
    document.body.style.overflow = "";
  }

  function showAdminCardFace(side) {
    canvasFront.classList.toggle("is-visible", side === "front");
    canvasBack.classList.toggle("is-visible", side === "back");
    document.querySelectorAll("[data-admin-card-face]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-admin-card-face") === side);
    });
  }

  function memberPhotoObjectUrl(member) {
    if (!member.photo_path) return Promise.resolve("");
    return supabaseClient.storage
      .from("member-photos")
      .download(member.photo_path)
      .then(function (res) {
        if (res.error || !res.data) return publicPhotoUrl(member) || "";
        return URL.createObjectURL(res.data);
      })
      .catch(function () {
        return publicPhotoUrl(member) || "";
      });
  }

  function publicPhotoUrl(member) {
    if (!member.photo_path) return "";
    if (photoUrlCache[member.photo_path]) return photoUrlCache[member.photo_path];
    var pub = supabaseClient.storage.from("member-photos").getPublicUrl(member.photo_path);
    var url = pub && pub.data && pub.data.publicUrl;
    if (url) photoUrlCache[member.photo_path] = url;
    return url || "";
  }

  function downloadCsv() {
    var cols = [
      "membership_id",
      "title",
      "first_name",
      "last_name",
      "other_names",
      "gender",
      "date_of_birth",
      "email",
      "phone",
      "whatsapp",
      "occupation",
      "state",
      "lga",
      "ward",
      "polling_unit",
      "vin",
      "created_at",
    ];
    var lines = [cols.join(",")];
    filtered.forEach(function (m) {
      lines.push(
        cols
          .map(function (key) {
            return csvEscape(m[key]);
          })
          .join(",")
      );
    });
    var blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "ibbn-members-" + lagosDate(new Date()) + ".csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function csvEscape(value) {
    var s = value == null ? "" : String(value);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function displayName(m) {
    return [m.title, m.first_name, m.other_names, m.last_name].filter(Boolean).join(" ");
  }

  function uniqueSorted(items) {
    var seen = {};
    items.forEach(function (item) {
      if (item) seen[item] = true;
    });
    return Object.keys(seen).sort();
  }

  function lagosDate(value) {
    var d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  }

  function formatWhen(value) {
    var d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
      timeZone: "Africa/Lagos",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function friendlyAuthError(err) {
    var msg = (err && err.message) || "";
    if (/invalid login/i.test(msg)) return "Wrong email or password.";
    if (/email not confirmed/i.test(msg)) return "Confirm this email in Supabase before signing in.";
    return msg || "Sign in failed.";
  }

  function setLoginStatus(msg, isError) {
    loginStatus.textContent = msg || "";
    loginStatus.classList.toggle("is-error", Boolean(isError && msg));
  }

  function setAppStatus(msg, isError) {
    appStatus.textContent = msg || "";
    appStatus.classList.toggle("is-error", Boolean(isError && msg));
  }

  function setDrawerStatus(msg, isError) {
    var el = document.getElementById("drawer-status");
    el.textContent = msg || "";
    el.classList.toggle("is-error", Boolean(isError && msg));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }
})();

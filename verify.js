(function () {
  var form = document.getElementById("verify-form");
  if (!form) return;

  var cfg = window.IBBN_CONFIG || {};
  var supabaseClient = null;
  if (window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }

  var idInput = document.getElementById("verify-id");
  var statusEl = document.getElementById("verify-status");
  var submitBtn = document.getElementById("verify-btn");
  var resultEl = document.getElementById("verify-result");
  var badgeEl = document.getElementById("verify-badge");
  var listEl = document.getElementById("verify-list");
  var photoEl = document.getElementById("verify-photo");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    lookup(idInput.value);
  });

  var fromQuery = new URLSearchParams(location.search).get("id");
  if (fromQuery) {
    idInput.value = String(fromQuery).trim().toUpperCase();
    lookup(fromQuery);
  }

  function lookup(raw) {
    var id = normalizeId(raw);
    resultEl.hidden = true;
    photoEl.removeAttribute("src");
    photoEl.hidden = true;

    if (!id) {
      setStatus("Enter a membership ID such as IBBN-2026-123456.", true);
      return;
    }
    if (!supabaseClient) {
      setStatus("Verification is not connected yet. Try again after IBBN finishes setup.", true);
      return;
    }

    submitBtn.disabled = true;
    setStatus("Checking the register…", false);

    supabaseClient
      .rpc("verify_member", { p_membership_id: id })
      .then(function (res) {
        submitBtn.disabled = false;
        if (res.error) {
          setStatus(friendlyError(res.error), true);
          return;
        }
        var row = (res.data && res.data[0]) || null;
        if (!row) {
          setStatus("No IBBN member was found for " + id + ".", true);
          return;
        }
        renderMember(row);
      })
      .catch(function () {
        submitBtn.disabled = false;
        setStatus("Could not reach the membership register. Check your connection and try again.", true);
      });
  }

  function renderMember(row) {
    var issued = formatIssued(row.issued_at);
    var rows = [
      ["Name", row.full_name],
      ["Membership ID", row.membership_id],
      ["State", row.state],
      ["LGA", row.lga],
      ["Ward", row.ward],
      ["Polling unit", row.polling_unit],
      ["Issued", issued],
    ];
    listEl.innerHTML = rows
      .map(function (pair) {
        return "<div><dt>" + escapeHtml(pair[0]) + "</dt><dd>" + escapeHtml(pair[1] || "—") + "</dd></div>";
      })
      .join("");

    badgeEl.textContent = "Verified member";
    resultEl.hidden = false;
    setStatus("This card matches a member on the IBBN register.", false);
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });

    if (row.photo_path) {
      var pub = supabaseClient.storage.from("member-photos").getPublicUrl(row.photo_path);
      var url = pub && pub.data && pub.data.publicUrl;
      if (url) {
        photoEl.src = url;
        photoEl.hidden = false;
      }
    }
  }

  function normalizeId(raw) {
    var id = String(raw || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    if (!/^IBBN-\d{4}-\d{6}$/.test(id)) return "";
    return id;
  }

  function formatIssued(value) {
    if (!value) return "—";
    var d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function friendlyError(err) {
    var msg = (err && err.message) || "";
    if (/verify_member/i.test(msg) || err.code === "PGRST202") {
      return "Verification is not enabled on the register yet. Ask IBBN to run the latest SQL setup.";
    }
    return msg || "Verification failed. Try again.";
  }

  function setStatus(msg, isError) {
    statusEl.textContent = msg || "";
    statusEl.classList.toggle("is-error", Boolean(isError && msg));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();

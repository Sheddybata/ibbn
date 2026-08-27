(function () {
  var form = document.getElementById("register-form");
  if (!form) return;

  var cfg = window.IBBN_CONFIG || {};
  var supabaseClient = null;
  if (window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }

  var step = 1;
  var statePack = null;
  var portraitUrl = "";
  var portraitBlob = null;

  var dobDay = document.getElementById("dob-day");
  var dobMonth = document.getElementById("dob-month");
  var dobYear = document.getElementById("dob-year");
  var dobValue = document.getElementById("dob-value");

  (function initDob() {
    var now = new Date();
    var maxYear = now.getFullYear() - 18;
    var minYear = now.getFullYear() - 110;
    for (var y = maxYear; y >= minYear; y--) {
      var opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      dobYear.appendChild(opt);
    }
    fillDobDays();
    dobDay.addEventListener("change", syncDob);
    dobMonth.addEventListener("change", function () {
      fillDobDays();
      syncDob();
    });
    dobYear.addEventListener("change", function () {
      fillDobDays();
      syncDob();
    });
  })();

  function fillDobDays() {
    var keep = dobDay.value;
    var month = Number(dobMonth.value);
    var year = Number(dobYear.value) || 2000;
    var max = month ? new Date(year, month, 0).getDate() : 31;
    dobDay.innerHTML = '<option value="">Day</option>';
    for (var d = 1; d <= max; d++) {
      var val = d < 10 ? "0" + d : String(d);
      var opt = document.createElement("option");
      opt.value = val;
      opt.textContent = String(d);
      dobDay.appendChild(opt);
    }
    if (keep && Number(keep) <= max) dobDay.value = keep;
  }

  function syncDob() {
    if (dobYear.value && dobMonth.value && dobDay.value) {
      dobValue.value = dobYear.value + "-" + dobMonth.value + "-" + dobDay.value;
    } else {
      dobValue.value = "";
    }
  }
  var stateSelect = document.getElementById("state-select");
  var lgaSelect = document.getElementById("lga-select");
  var wardSelect = document.getElementById("ward-select");
  var puSelect = document.getElementById("pu-select");
  var statusEl = document.getElementById("form-status");
  var geoStatus = document.getElementById("geo-status");
  var submitBtn = document.getElementById("submit-btn");
  var cardResult = document.getElementById("card-result");
  var canvas = document.getElementById("id-card");
  var canvasBack = document.getElementById("id-card-back");
  var photoPreview = document.getElementById("photo-preview");
  var issuedId = "";

  fetch("data/inec/states.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (states) {
      states.forEach(function (row) {
        var opt = document.createElement("option");
        opt.value = row.id;
        opt.textContent = row.name;
        stateSelect.appendChild(opt);
      });
    })
    .catch(function () {
      setGeoStatus("Could not load states. Refresh the page.", true);
    });

  stateSelect.addEventListener("change", function () {
    resetSelect(lgaSelect, "Select LGA");
    resetSelect(wardSelect, "Select ward");
    resetSelect(puSelect, "Select polling unit");
    statePack = null;
    var id = stateSelect.value;
    if (!id) return;
    setGeoStatus("Loading wards and polling units…", false);
    lgaSelect.disabled = true;
    fetch("data/inec/state-" + id + ".json")
      .then(function (r) {
        if (!r.ok) throw new Error("Missing state list");
        return r.json();
      })
      .then(function (pack) {
        statePack = pack;
        fillNamedSelect(lgaSelect, pack.lgas, "Select LGA");
        lgaSelect.disabled = false;
        setGeoStatus("", false);
      })
      .catch(function () {
        setGeoStatus("Could not load that state’s wards and polling units.", true);
      });
  });

  lgaSelect.addEventListener("change", function () {
    resetSelect(wardSelect, "Select ward");
    resetSelect(puSelect, "Select polling unit");
    var lga = currentLga();
    if (!lga) return;
    fillNamedSelect(wardSelect, lga.wards, "Select ward");
    wardSelect.disabled = false;
  });

  wardSelect.addEventListener("change", function () {
    resetSelect(puSelect, "Select polling unit");
    var ward = currentWard();
    if (!ward) return;
    var units = (ward.units || []).map(function (name, i) {
      return { id: String(i), name: name };
    });
    fillNamedSelect(puSelect, units, "Select polling unit");
    puSelect.disabled = false;
  });

  document.getElementById("photo-input").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    usePhotoFile(file);
  });

  document.getElementById("photo-upload-btn").addEventListener("click", function () {
    document.getElementById("photo-input").click();
  });

  var cameraModal = document.getElementById("camera-modal");
  var cameraVideo = document.getElementById("camera-video");
  var cameraStatus = document.getElementById("camera-status");
  var facingBtn = document.getElementById("camera-facing-btn");
  var cameraStream = null;
  var facingMode = "user";

  document.getElementById("photo-camera-btn").addEventListener("click", function () {
    facingMode = "user";
    openCamera();
  });

  facingBtn.addEventListener("click", function () {
    facingMode = facingMode === "user" ? "environment" : "user";
    openCamera();
  });

  document.getElementById("camera-close-btn").addEventListener("click", closeCamera);

  document.getElementById("camera-capture-btn").addEventListener("click", function () {
    if (!cameraVideo.videoWidth) {
      cameraStatus.textContent = "Wait for the camera to start, then capture.";
      return;
    }
    var snap = document.createElement("canvas");
    snap.width = cameraVideo.videoWidth;
    snap.height = cameraVideo.videoHeight;
    snap.getContext("2d").drawImage(cameraVideo, 0, 0);
    snap.toBlob(function (blob) {
      if (!blob) return;
      usePhotoBlob(blob);
      closeCamera();
    }, "image/jpeg", 0.9);
  });

  function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraStatus.textContent = "Camera is not available in this browser. Use Upload photo.";
      cameraModal.hidden = false;
      return;
    }
    cameraModal.hidden = false;
    cameraStatus.textContent = facingMode === "user" ? "Front camera" : "Back camera";
    facingBtn.textContent = facingMode === "user" ? "Use back camera" : "Use front camera";
    cameraVideo.classList.toggle("is-front", facingMode === "user");
    stopCamera();
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 1280 } },
      })
      .then(function (stream) {
        cameraStream = stream;
        cameraVideo.srcObject = stream;
        return cameraVideo.play();
      })
      .catch(function () {
        cameraStatus.textContent =
          "Could not open the " +
          (facingMode === "user" ? "front" : "back") +
          " camera. Check permission, or try the other camera / Upload photo.";
      });
  }

  function stopCamera() {
    if (!cameraStream) return;
    cameraStream.getTracks().forEach(function (track) {
      track.stop();
    });
    cameraStream = null;
    cameraVideo.srcObject = null;
  }

  function closeCamera() {
    stopCamera();
    cameraModal.hidden = true;
  }

  function usePhotoFile(file) {
    compressImage(file, 900, 0.86).then(usePhotoBlob);
  }

  function usePhotoBlob(blob) {
    portraitBlob = blob;
    if (portraitUrl) URL.revokeObjectURL(portraitUrl);
    portraitUrl = URL.createObjectURL(blob);
    photoPreview.src = portraitUrl;
    photoPreview.hidden = false;
  }

  form.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!validateStep(step)) return;
      if (step === 3) fillReview();
      go(step + 1);
    });
  });

  form.querySelectorAll("[data-prev]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      go(step - 1);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep(4)) return;
    completeRegistration();
  });

  document.getElementById("download-card").addEventListener("click", function () {
    if (window.IBBNCard) window.IBBNCard.downloadBoth(canvas, canvasBack, issuedId);
  });

  document.getElementById("print-card").addEventListener("click", function () {
    showCardFace("front");
    window.print();
  });

  document.querySelectorAll("[data-card-face]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showCardFace(btn.getAttribute("data-card-face"));
    });
  });

  function showCardFace(side) {
    canvas.classList.toggle("is-visible", side === "front");
    canvasBack.classList.toggle("is-visible", side === "back");
    document.querySelectorAll("[data-card-face]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-card-face") === side);
    });
  }

  function currentLga() {
    if (!statePack) return null;
    return (statePack.lgas || []).find(function (row) {
      return row.id === lgaSelect.value;
    });
  }

  function currentWard() {
    var lga = currentLga();
    if (!lga) return null;
    return (lga.wards || []).find(function (row) {
      return row.id === wardSelect.value;
    });
  }

  function resetSelect(el, placeholder) {
    el.innerHTML = '<option value="">' + placeholder + "</option>";
    el.disabled = true;
  }

  function fillNamedSelect(el, items, placeholder) {
    el.innerHTML = '<option value="">' + placeholder + "</option>";
    (items || []).forEach(function (item) {
      var opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.name;
      el.appendChild(opt);
    });
    el.disabled = false;
  }

  function selectedLabel(el) {
    var opt = el.options[el.selectedIndex];
    return opt && opt.value ? opt.textContent : "";
  }

  function go(next) {
    step = Math.min(4, Math.max(1, next));
    form.querySelectorAll(".reg-panel").forEach(function (panel) {
      var n = Number(panel.getAttribute("data-step"));
      var on = n === step;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    document.querySelectorAll("[data-step-dot]").forEach(function (dot) {
      var n = Number(dot.getAttribute("data-step-dot"));
      dot.classList.toggle("is-active", n === step);
      dot.classList.toggle("is-done", n < step);
    });
    scrollToStepTop();
  }

  function scrollToStepTop() {
    var target = document.querySelector(".reg-steps") || form;
    var header = document.querySelector(".site-header");
    var offset = (header ? header.offsetHeight : 0) + 12;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function fieldsetFor(n) {
    return form.querySelector('.reg-panel[data-step="' + n + '"]');
  }

  function validateStep(n) {
    var panel = fieldsetFor(n);
    var controls = panel.querySelectorAll("input, select, textarea");
    for (var i = 0; i < controls.length; i++) {
      var el = controls[i];
      if (!el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    if (n === 1) {
      syncDob();
      if (!dobValue.value) {
        setStatus("Select day, month, and year of birth.", true);
        return false;
      }
    }
    if (n === 2) {
      var phone = form.phone.value.replace(/\s+/g, "");
      if (!/^(\+?234|0)[789][01]\d{8}$/.test(phone)) {
        setStatus("Enter a valid Nigerian phone number.", true);
        form.phone.focus();
        return false;
      }
    }
    if (n === 4 && !portraitBlob) {
      setStatus("Please add a passport photograph.", true);
      return false;
    }
    setStatus("", false);
    return true;
  }

  function values() {
    var fd = new FormData(form);
    var phone = String(fd.get("phone") || "").replace(/\s+/g, "");
    syncDob();
    return {
      title: String(fd.get("title") || "").trim(),
      first_name: String(fd.get("first_name") || "").trim(),
      last_name: String(fd.get("last_name") || "").trim(),
      other_names: String(fd.get("other_names") || "").trim(),
      gender: String(fd.get("gender") || "").trim(),
      date_of_birth: dobValue.value,
      email: String(fd.get("email") || "").trim(),
      phone: phone,
      whatsapp: String(fd.get("whatsapp") || "").replace(/\s+/g, "") || phone,
      occupation: String(fd.get("occupation") || "").trim(),
      state: selectedLabel(stateSelect),
      lga: selectedLabel(lgaSelect),
      ward: selectedLabel(wardSelect),
      polling_unit: selectedLabel(puSelect),
      vin: String(fd.get("vin") || "").trim().toUpperCase(),
      consent: form.consent.checked,
    };
  }

  function fillReview() {
    var v = values();
    var rows = [
      ["Name", [v.title, v.first_name, v.other_names, v.last_name].filter(Boolean).join(" ")],
      ["Gender", v.gender],
      ["Date of birth", v.date_of_birth],
      ["Phone", v.phone],
      ["WhatsApp", v.whatsapp],
      ["Email", v.email || "—"],
      ["State", v.state],
      ["LGA", v.lga],
      ["Ward", v.ward],
      ["Polling unit", v.polling_unit],
      ["VIN / PVC", v.vin],
    ];
    document.getElementById("review-list").innerHTML = rows
      .map(function (pair) {
        return "<div><dt>" + escapeHtml(pair[0]) + "</dt><dd>" + escapeHtml(pair[1]) + "</dd></div>";
      })
      .join("");
  }

  function membershipId() {
    var year = String(new Date().getFullYear());
    var n = Math.floor(100000 + Math.random() * 900000);
    return "IBBN-" + year + "-" + n;
  }

  function completeRegistration() {
    var v = values();
    var id = membershipId();
    issuedId = id;
    submitBtn.disabled = true;
    setStatus("Issuing your card…", false);

    if (!window.IBBNCard) {
      submitBtn.disabled = false;
      setStatus("Card module failed to load. Refresh the page.", true);
      return;
    }

    var cardMember = Object.assign({}, v, { membership_id: id });
    window.IBBNCard.drawFront(canvas, cardMember, portraitUrl)
      .then(function () {
        return window.IBBNCard.drawBack(canvasBack, id, new Date());
      })
      .then(function () {
        return saveToSupabase(v, id);
      })
      .then(function (note) {
        form.hidden = true;
        cardResult.hidden = false;
        document.getElementById("save-note").textContent = note;
        document.querySelector(".reg-steps").hidden = true;
        showCardFace("front");
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        setStatus(err.message || "Registration failed. Try again.", true);
      });
  }

  function saveToSupabase(v, id) {
    if (!supabaseClient) {
      return Promise.resolve(
        "Card issued locally. Connect Supabase so records are stored for the movement."
      );
    }

    var photoPath = id + "/portrait.jpg";
    return supabaseClient.storage
      .from("member-photos")
      .upload(photoPath, portraitBlob, { contentType: "image/jpeg", upsert: false })
      .then(function (up) {
        if (up.error) throw new Error(up.error.message);
        return supabaseClient.from("members").insert({
          membership_id: id,
          title: v.title || null,
          first_name: v.first_name,
          last_name: v.last_name,
          other_names: v.other_names || null,
          gender: v.gender || null,
          date_of_birth: v.date_of_birth || null,
          email: v.email || null,
          phone: v.phone,
          whatsapp: v.whatsapp || null,
          occupation: v.occupation || null,
          state: v.state,
          lga: v.lga,
          ward: v.ward,
          polling_unit: v.polling_unit,
          vin: v.vin || null,
          photo_path: photoPath,
          consent: true,
        });
      })
      .then(function (res) {
        if (res.error) {
          if (res.error.code === "23505") {
            throw new Error("This phone or VIN is already registered.");
          }
          throw new Error(res.error.message);
        }
        return "Saved. Membership ID " + id + " — download or print your card.";
      });
  }

  function compressImage(file, maxEdge, quality) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) {
        reject(new Error("Please choose an image file."));
        return;
      }
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(
          function (blob) {
            if (!blob) reject(new Error("Could not process the photo."));
            else resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = function () {
        reject(new Error("Could not read that image."));
      };
      img.src = url;
    });
  }

  function setStatus(msg, isError) {
    statusEl.textContent = msg || "";
    statusEl.classList.toggle("is-error", Boolean(isError && msg));
  }

  function setGeoStatus(msg, isError) {
    if (!geoStatus) return;
    geoStatus.textContent = msg || "";
    geoStatus.classList.toggle("is-error", Boolean(isError && msg));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();

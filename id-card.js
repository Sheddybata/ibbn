(function (global) {
  var LOGO_SRC = "public/ibbn.png";

  function cardVerifyUrl(id) {
    var origin = "https://ibbnnigeria.org";
    var host = location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      origin = location.origin;
    }
    return origin + "/verify.html?id=" + encodeURIComponent(id);
  }

  function formatIssued(value) {
    var d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) d = new Date();
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function loadImg(img, src) {
    return new Promise(function (resolve, reject) {
      if (src && /^https?:/i.test(src) && src.indexOf(location.origin) !== 0) {
        img.crossOrigin = "anonymous";
      }
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error("Could not load image for the card."));
      };
      img.src = src;
    });
  }

  function makeQr(text) {
    if (typeof qrcode !== "function") {
      return Promise.resolve("");
    }
    try {
      var qr = qrcode(0, "M");
      qr.addData(text);
      qr.make();
      return Promise.resolve(qr.createDataURL(6, 2));
    } catch (err) {
      return Promise.resolve("");
    }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = String(text).split(" ");
    var line = "";
    var yy = y;
    for (var i = 0; i < words.length; i++) {
      var test = line + words[i] + " ";
      if (ctx.measureText(test).width > maxWidth && i > 0) {
        ctx.fillText(line, x, yy);
        line = words[i] + " ";
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, yy);
    return yy + 4;
  }

  function drawCover(ctx, img, x, y, w, h) {
    var ir = img.width / img.height;
    var cr = w / h;
    var dw = w;
    var dh = h;
    var dx = x;
    var dy = y;
    if (ir > cr) {
      dw = h * ir;
      dx = x - (dw - w) / 2;
    } else {
      dh = w / ir;
      dy = y - (dh - h) / 2;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  function drawHalftone(ctx, w, h, strength) {
    strength = strength == null ? 1 : strength;
    var cx = w - 40;
    var cy = 36;
    for (var r = 18; r < 420; r += 16) {
      var dots = Math.max(10, Math.round(r / 9));
      for (var i = 0; i < dots; i++) {
        var t = (i / dots) * Math.PI * 0.55;
        var x = cx - Math.cos(t) * r;
        var y = cy + Math.sin(t) * r * 0.72;
        if (x < 0 || y > h - 8) continue;
        var fade = 1 - r / 420;
        var radius = 1.2 + fade * 2.4;
        ctx.beginPath();
        ctx.fillStyle = "rgba(0,0,0," + (0.1 + fade * 0.18) * strength + ")";
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawStripe(ctx, w, h, barH) {
    var segs = ["#ffffff", "#4d9a66", "#ffffff", "#1e4d30"];
    var segW = w / segs.length;
    segs.forEach(function (color, i) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(i * segW), h - barH, Math.ceil(segW) + 1, barH);
    });
  }

  function drawField(ctx, label, value, x, y, maxWidth, valueSize) {
    valueSize = valueSize || 18;
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "500 12px 'DM Sans', sans-serif";
    ctx.fillText(label + ":", x, y);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 " + valueSize + "px Fraunces, Georgia, serif";
    var text = String(value || "—").toUpperCase();
    var next = wrapText(ctx, text, x, y + valueSize + 4, maxWidth, valueSize + 4);
    return next + 14;
  }

  function drawPhotoPlaceholder(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "600 14px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHOTO", x + w / 2, y + h / 2);
    ctx.textAlign = "left";
  }

  function drawFront(canvas, member, photoSrc) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var logo = new Image();
    var barH = 22;
    var v = member || {};

    var photoPromise = photoSrc
      ? loadImg(new Image(), photoSrc).catch(function () {
          return null;
        })
      : Promise.resolve(null);

    return Promise.all([loadImg(logo, LOGO_SRC), photoPromise]).then(function (parts) {
      var photo = parts[1];
      ctx.fillStyle = "#31794c";
      ctx.fillRect(0, 0, w, h);
      drawHalftone(ctx, w, h - barH);

      ctx.drawImage(logo, 28, 22, 72, 72);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 15px Fraunces, Georgia, serif";
      ctx.fillText("INITIATIVE FOR BETTER", 112, 46);
      ctx.fillText("AND BRIGHTER NIGERIA", 112, 66);
      ctx.font = "700 22px Fraunces, Georgia, serif";
      ctx.fillText("IBBN", 112, 92);

      ctx.textAlign = "right";
      ctx.font = "800 24px Fraunces, Georgia, serif";
      ctx.fillText("MEMBERSHIP", w - 28, 46);
      ctx.fillText("IDENTITY CARD", w - 28, 74);
      ctx.textAlign = "left";

      var photoW = 198;
      var photoH = 252;
      var photoX = w - 24 - photoW;
      var photoY = h - barH - 88 - photoH;
      if (photo) {
        drawCover(ctx, photo, photoX, photoY, photoW, photoH);
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
      } else {
        drawPhotoPlaceholder(ctx, photoX, photoY, photoW, photoH);
      }

      var colX = 32;
      var colW = photoX - colX - 16;
      var half = Math.floor((colW - 18) / 2);
      var y = 152;
      var fullName = [v.first_name, v.other_names, v.last_name].filter(Boolean).join(" ");

      y = drawField(ctx, "Name", fullName, colX, y, colW, 22);
      y = drawField(ctx, "ID No", v.membership_id || "", colX, y, colW, 20);

      var rowY = y;
      var yLeft = drawField(ctx, "State", v.state, colX, rowY, half, 18);
      var yRight = drawField(ctx, "LGA", v.lga, colX + half + 18, rowY, half, 18);
      rowY = Math.max(yLeft, yRight);

      yLeft = drawField(ctx, "Ward", v.ward, colX, rowY, half, 18);
      yRight = drawField(ctx, "Polling unit", v.polling_unit, colX + half + 18, rowY, half, 18);
      rowY = Math.max(yLeft, yRight);

      drawField(ctx, "VIN", v.vin, colX, rowY, colW, 18);

      drawStripe(ctx, w, h, barH);
    });
  }

  function drawBack(canvas, membershipId, issuedAt) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var barH = 22;
    var logo = new Image();
    var issued = formatIssued(issuedAt || new Date());

    return Promise.all([loadImg(logo, LOGO_SRC), makeQr(cardVerifyUrl(membershipId))]).then(function (parts) {
      var qrUrl = parts[1];
      var paint = function (qrImg) {
        ctx.fillStyle = "#31794c";
        ctx.fillRect(0, 0, w, h);
        drawHalftone(ctx, w, h - barH, 0.4);

        ctx.drawImage(logo, 28, 22, 72, 72);
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 15px Fraunces, Georgia, serif";
        ctx.fillText("INITIATIVE FOR BETTER", 112, 46);
        ctx.fillText("AND BRIGHTER NIGERIA", 112, 66);
        ctx.font = "700 22px Fraunces, Georgia, serif";
        ctx.fillText("IBBN", 112, 92);

        ctx.textAlign = "right";
        ctx.font = "800 22px Fraunces, Georgia, serif";
        ctx.fillText("MEMBERSHIP CARD", w - 28, 50);
        ctx.fillText("BACK", w - 28, 76);
        ctx.textAlign = "left";

        var qrSize = 168;
        var qrX = w - 28 - qrSize;
        var qrY = 118;
        if (qrImg) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          ctx.fillStyle = "rgba(255,255,255,0.82)";
          ctx.font = "600 12px 'DM Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("SCAN TO VERIFY", qrX + qrSize / 2, qrY + qrSize + 28);
          ctx.textAlign = "left";
        }

        var colX = 36;
        var colW = qrX - colX - 28;
        var y = 128;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "italic 500 14px Fraunces, Georgia, serif";
        y = wrapText(ctx, "Member of a citizen-driven movement for national rebirth", colX, y, colW, 20);
        y += 18;

        y = drawField(ctx, "Membership ID", membershipId, colX, y, colW, 20);
        y = drawField(ctx, "Issued", issued, colX, y, colW, 18);

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "500 14px 'DM Sans', sans-serif";
        y = wrapText(
          ctx,
          "This card confirms membership of IBBN. Scan the QR to verify. It is not a national ID or a voter's card.",
          colX,
          y + 8,
          colW,
          20
        );

        y += 20;
        ctx.fillStyle = "#ffffff";
        ctx.font = "600 15px Fraunces, Georgia, serif";
        ctx.fillText("•  Integrity    •  Unity    •  Peaceful civic engagement", colX, y);

        y += 36;
        ctx.fillStyle = "rgba(255,255,255,0.82)";
        ctx.font = "500 12px 'DM Sans', sans-serif";
        ctx.fillText("Contact:", colX, y);
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 16px Fraunces, Georgia, serif";
        ctx.fillText("WHATSAPP  +234 818 160 1414", colX, y + 24);
        ctx.fillText("IBBNNIGERIA.ORG", colX, y + 48);

        drawStripe(ctx, w, h, barH);
      };

      if (!qrUrl) {
        paint(null);
        return;
      }
      var qrImg = new Image();
      return loadImg(qrImg, qrUrl).then(function () {
        paint(qrImg);
      });
    });
  }

  function downloadCanvas(el, filename) {
    var link = document.createElement("a");
    link.download = filename;
    link.href = el.toDataURL("image/png");
    link.click();
  }

  function downloadBoth(frontCanvas, backCanvas, membershipId) {
    var gap = 28;
    var w = frontCanvas.width;
    var h = frontCanvas.height;
    var sheet = document.createElement("canvas");
    sheet.width = w;
    sheet.height = h * 2 + gap;
    var ctx = sheet.getContext("2d");
    ctx.fillStyle = "#f4f1ea";
    ctx.fillRect(0, 0, sheet.width, sheet.height);
    ctx.drawImage(frontCanvas, 0, 0);
    ctx.drawImage(backCanvas, 0, h + gap);
    var name = (membershipId || "IBBN-membership") + "-front-and-back.png";
    downloadCanvas(sheet, name);
  }

  global.IBBNCard = {
    drawFront: drawFront,
    drawBack: drawBack,
    downloadBoth: downloadBoth,
    cardVerifyUrl: cardVerifyUrl,
    formatIssued: formatIssued,
  };
})(window);

(function () {
  var HOURS = {
    Sun: null,
    Mon: null,
    Tue: { open: 9 * 60, close: 19 * 60 },
    Wed: { open: 9 * 60, close: 19 * 60 },
    Thu: { open: 9 * 60, close: 19 * 60 },
    Fri: { open: 9 * 60, close: 19 * 60 },
    Sat: { open: 8 * 60, close: 16 * 60 }
  };
  var ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var opener = document.querySelector("#after-hours-assistant");
  var dialog = document.querySelector("#after-hours-dialog");
  var form = document.querySelector("#booking-form");
  var confirmation = document.querySelector("#booking-confirmation");

  /*
   * TODO(elevenlabs): Replace openAfterHoursStub with a real session.
   * The button hook is #after-hours-assistant
   *   data-agent-provider="elevenlabs"
   *   data-agent-role="after-hours"
   *   data-agent-id="..."  (set the agent id on the button)
   * Keep this dialog as a fallback if the agent script fails to load.
   */
  function openAfterHoursStub() {
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  }

  if (opener && dialog) {
    opener.addEventListener("click", openAfterHoursStub);
    dialog.querySelector("[data-close-dialog]").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      var rect = dialog.getBoundingClientRect();
      var inside = event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  }

  function formatMinutes(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? "p.m." : "a.m.";
    var h12 = h % 12 || 12;
    if (m === 0) return h12 + " " + suffix;
    return h12 + ":" + String(m).padStart(2, "0") + " " + suffix;
  }

  function denverNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (type) {
      return parts.find(function (part) { return part.type === type; }).value;
    };
    return {
      weekday: get("weekday"),
      minutes: Number(get("hour")) * 60 + Number(get("minute"))
    };
  }

  function updateStatus() {
    var el = document.querySelector("#shop-status");
    if (!el) return;
    var now = denverNow();
    var today = HOURS[now.weekday];
    if (today && now.minutes >= today.open && now.minutes < today.close) {
      el.textContent = "Open now · closes " + formatMinutes(today.close) + " Mountain Time";
      return;
    }
    var start = ORDER.indexOf(now.weekday);
    var i;
    for (i = 1; i <= 7; i += 1) {
      var name = ORDER[(start + i) % 7];
      if (HOURS[name]) {
        var when = i === 1 ? "tomorrow" : name;
        el.textContent = "Closed now · opens " + when + " " + formatMinutes(HOURS[name].open) + " Mountain Time";
        return;
      }
    }
  }

  function denverToday() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Denver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  }

  try {
    updateStatus();
    var dateInput = document.querySelector("#book-date");
    if (dateInput) dateInput.min = denverToday();
  } catch (err) {
    /* Static hours remain in the table if time zones are unavailable. */
  }

  function digits(value) {
    return String(value).replace(/\D/g, "");
  }

  function validPhone(value) {
    var count = digits(value).length;
    return count === 10 || (count === 11 && digits(value).charAt(0) === "1");
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  }

  function setError(input, message) {
    var error = document.getElementById(input.getAttribute("aria-describedby"));
    input.setAttribute("aria-invalid", "true");
    if (error) {
      error.hidden = false;
      error.textContent = message;
    }
  }

  function clearErrors(target) {
    target.querySelectorAll("[aria-invalid]").forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });
    target.querySelectorAll(".field-error").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
    var summary = target.querySelector(".form-errors");
    if (summary) {
      summary.hidden = true;
      summary.textContent = "";
    }
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  if (form && confirmation) {
    form.addEventListener("input", function (event) {
      if (!event.target.matches("input, select, textarea")) return;
      event.target.removeAttribute("aria-invalid");
      var error = document.getElementById(event.target.getAttribute("aria-describedby"));
      if (error) {
        error.hidden = true;
        error.textContent = "";
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(form);

      var today = "";
      try { today = denverToday(); } catch (err) { today = ""; }

      var dateOk = fieldValue("book-date") !== "" && (today === "" || fieldValue("book-date") >= today);
      var checks = [
        ["book-name", fieldValue("book-name").length >= 2, "Enter your name."],
        ["book-phone", validPhone(fieldValue("book-phone")), "Enter a 10-digit phone number."],
        ["book-email", validEmail(fieldValue("book-email")), "Enter an email like name@example.com."],
        ["book-service", fieldValue("book-service") !== "", "Choose a service."],
        ["book-date", dateOk, "Choose today or a later day."],
        ["book-time", fieldValue("book-time") !== "", "Choose a time of day."]
      ];

      var firstInvalid = null;
      checks.forEach(function (check) {
        if (check[1]) return;
        var input = document.getElementById(check[0]);
        setError(input, check[2]);
        if (!firstInvalid) firstInvalid = input;
      });

      var summary = form.querySelector(".form-errors");
      if (firstInvalid) {
        if (summary) {
          summary.hidden = false;
          summary.textContent = "A few fields still need attention.";
        }
        firstInvalid.focus();
        return;
      }

      confirmation.querySelector("[data-confirm-name]").textContent = fieldValue("book-name");
      confirmation.querySelector("[data-confirm-service]").textContent = fieldValue("book-service");
      confirmation.querySelector("[data-confirm-when]").textContent =
        fieldValue("book-date") + " · " + fieldValue("book-time");
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus();
    });

    var reset = document.querySelector("#booking-reset");
    if (reset) {
      reset.addEventListener("click", function () {
        form.reset();
        clearErrors(form);
        try {
          var dateInput = document.querySelector("#book-date");
          if (dateInput) dateInput.min = denverToday();
        } catch (err) { /* min date is optional */ }
        confirmation.hidden = true;
        form.hidden = false;
        var name = document.getElementById("book-name");
        if (name) name.focus();
      });
    }
  }
})();

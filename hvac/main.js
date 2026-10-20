(function () {
  var HOURS = {
    Sun: null,
    Mon: { open: 7 * 60 + 30, close: 18 * 60 },
    Tue: { open: 7 * 60 + 30, close: 18 * 60 },
    Wed: { open: 7 * 60 + 30, close: 18 * 60 },
    Thu: { open: 7 * 60 + 30, close: 18 * 60 },
    Fri: { open: 7 * 60 + 30, close: 18 * 60 },
    Sat: { open: 8 * 60, close: 14 * 60 }
  };
  var ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var opener = document.querySelector("#after-hours-assistant");
  var dialog = document.querySelector("#after-hours-dialog");
  var form = document.querySelector("#quote-form");
  var confirmation = document.querySelector("#quote-confirmation");

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

  try {
    updateStatus();
  } catch (err) {
    /* Static hours in the table remain the source of truth. */
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

      var checks = [
        ["quote-name", fieldValue("quote-name").length >= 2, "Enter your name."],
        ["quote-phone", validPhone(fieldValue("quote-phone")), "Enter a 10-digit phone number."],
        ["quote-email", validEmail(fieldValue("quote-email")), "Enter an email like name@example.com."],
        ["quote-address", fieldValue("quote-address").length >= 5, "Enter the service address."],
        ["quote-service", fieldValue("quote-service") !== "", "Choose a service."],
        ["quote-timing", fieldValue("quote-timing") !== "", "Choose a time of day."]
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

      confirmation.querySelector("[data-confirm-name]").textContent = fieldValue("quote-name");
      confirmation.querySelector("[data-confirm-phone]").textContent = fieldValue("quote-phone");
      confirmation.querySelector("[data-confirm-service]").textContent = fieldValue("quote-service");
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus();
    });

    var reset = document.querySelector("#quote-reset");
    if (reset) {
      reset.addEventListener("click", function () {
        form.reset();
        clearErrors(form);
        confirmation.hidden = true;
        form.hidden = false;
        var name = document.getElementById("quote-name");
        if (name) name.focus();
      });
    }
  }
})();

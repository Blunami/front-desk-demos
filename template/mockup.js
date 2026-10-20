(function () {
  var opener = document.querySelector("#after-hours-assistant");
  var dialog = document.querySelector("#after-hours-dialog");
  var form = document.querySelector("[data-request-form]");
  var confirmation = document.querySelector("[data-confirmation]");
  var scheduleNode = document.querySelector("#mockup-schedule");

  /*
   * TODO(elevenlabs): Replace openAfterHoursStub with a real session.
   * Hook: #after-hours-assistant
   *   data-agent-provider="elevenlabs"
   *   data-agent-role="after-hours"
   *   data-agent-id="..."
   * Keep #after-hours-dialog as the fallback.
   */
  function openAfterHoursStub() {
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  }

  if (opener && dialog) {
    opener.addEventListener("click", openAfterHoursStub);
    var closer = dialog.querySelector("[data-close-dialog]");
    if (closer) closer.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) {
      var rect = dialog.getBoundingClientRect();
      var inside = event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  }

  function readSchedule() {
    if (!scheduleNode) return null;
    try {
      return JSON.parse(scheduleNode.textContent);
    } catch (err) {
      return null;
    }
  }

  function formatMinutes(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? "p.m." : "a.m.";
    var h12 = h % 12 || 12;
    if (m === 0) return h12 + " " + suffix;
    return h12 + ":" + String(m).padStart(2, "0") + " " + suffix;
  }

  function updateStatus() {
    var data = readSchedule();
    var el = document.querySelector("#shop-status");
    if (!data || !el || !data.days) return;
    var tz = data.tz || "America/Denver";
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (type) {
      return parts.find(function (part) { return part.type === type; }).value;
    };
    var map = { Sun: "sun", Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat" };
    var order = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    var labels = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };
    var key = map[get("weekday")];
    var minutes = Number(get("hour")) * 60 + Number(get("minute"));
    var today = data.days[key];
    if (today && minutes >= today[0] && minutes < today[1]) {
      el.textContent = "Open now · closes " + formatMinutes(today[1]);
      return;
    }
    var start = order.indexOf(key);
    var i;
    for (i = 1; i <= 7; i += 1) {
      var name = order[(start + i) % 7];
      if (data.days[name]) {
        var when = i === 1 ? "tomorrow" : labels[name];
        el.textContent = "Closed now · opens " + when + " " + formatMinutes(data.days[name][0]);
        return;
      }
    }
  }

  function denverToday(tz) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz || "America/Denver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  }

  try {
    updateStatus();
    var dateInput = document.querySelector("[data-date]");
    var schedule = readSchedule();
    if (dateInput) dateInput.min = denverToday(schedule && schedule.tz);
  } catch (err) {
    /* The hours table stays readable if the clock cannot be read. */
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

  function valueOf(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  if (form && confirmation) {
    form.addEventListener("input", function (event) {
      if (!event.target.matches("input, select, textarea")) return;
      event.target.removeAttribute("aria-invalid");
      var described = event.target.getAttribute("aria-describedby");
      var error = described ? document.getElementById(described) : null;
      if (error) {
        error.hidden = true;
        error.textContent = "";
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(form);
      var kind = form.getAttribute("data-request-form");
      var checks = [
        ["req-name", valueOf("req-name").length >= 2, "Enter your name."],
        ["req-phone", validPhone(valueOf("req-phone")), "Enter a 10-digit phone number."],
        ["req-email", validEmail(valueOf("req-email")), "Enter an email like name@example.com."],
        ["req-service", valueOf("req-service") !== "", "Choose a service."]
      ];
      if (kind === "booking") {
        var scheduleData = readSchedule();
        var today = "";
        try { today = denverToday(scheduleData && scheduleData.tz); } catch (err) { today = ""; }
        var day = valueOf("req-date");
        checks.push(["req-date", day !== "" && (today === "" || day >= today), "Choose today or a later day."]);
        checks.push(["req-time", valueOf("req-time") !== "", "Choose a time of day."]);
      } else {
        checks.push(["req-timing", valueOf("req-timing") !== "", "Choose a time of day."]);
      }

      var firstInvalid = null;
      checks.forEach(function (check) {
        if (check[1]) return;
        var input = document.getElementById(check[0]);
        if (!input) return;
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

      confirmation.querySelector("[data-confirm-name]").textContent = valueOf("req-name");
      confirmation.querySelector("[data-confirm-service]").textContent = valueOf("req-service");
      var when = confirmation.querySelector("[data-confirm-when]");
      if (when) {
        when.textContent = kind === "booking"
          ? valueOf("req-date") + " · " + valueOf("req-time")
          : valueOf("req-timing");
      }
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus();
    });

    var reset = document.querySelector("[data-reset-form]");
    if (reset) {
      reset.addEventListener("click", function () {
        form.reset();
        clearErrors(form);
        try {
          var dateInput = document.querySelector("[data-date]");
          var scheduleData = readSchedule();
          if (dateInput) dateInput.min = denverToday(scheduleData && scheduleData.tz);
        } catch (err) { /* min date is optional */ }
        confirmation.hidden = true;
        form.hidden = false;
        var name = document.getElementById("req-name");
        if (name) name.focus();
      });
    }
  }
})();

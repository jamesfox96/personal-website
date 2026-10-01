(() => {
  const gate = document.getElementById("contact-gate");
  const status = document.getElementById("contact-status");
  const widget = document.getElementById("contact-challenge");
  const retry = document.getElementById("contact-retry");
  const details = document.getElementById("contact-details");
  let widgetId;
  let widgetSize;
  let loading = false;
  let verifying = false;
  let revealed = false;
  let turnstileScript;

  function showError(message) {
    if (revealed) return;
    status.textContent = message;
    widget.hidden = true;
    retry.hidden = false;
  }

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    return new Promise((resolve, reject) => {
      turnstileScript?.remove();
      const script = document.createElement("script");
      turnstileScript = script;
      const timer = setTimeout(() => {
        script.remove();
        reject(new Error("Verification could not load. Check your connection or browser settings, then try again."));
      }, 15000);
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => {
        clearTimeout(timer);
        if (window.turnstile) resolve();
        else reject(new Error("Verification could not load. Please try again."));
      };
      script.onerror = () => {
        clearTimeout(timer);
        script.remove();
        reject(new Error("Verification could not load. Check your connection or browser settings, then try again."));
      };
      document.head.append(script);
    });
  }

  async function revealContact(token) {
    if (verifying || revealed) return;
    verifying = true;
    retry.hidden = true;
    status.textContent = "Checking your human credentials. No CV required…";
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed. Please try again.");
      if (typeof data.email !== "string" || !data.email) {
        throw new Error("Contact details are temporarily unavailable. Please try again.");
      }

      const email = document.getElementById("contact-email");
      email.textContent = data.email;
      email.href = `mailto:${encodeURIComponent(data.email)}`;
      if (typeof data.phone === "string" && data.phone) {
        const phone = document.getElementById("contact-phone");
        phone.textContent = data.phone;
        phone.href = `tel:${data.phone.replace(/[^+\d]/g, "")}`;
        document.getElementById("contact-phone-row").hidden = false;
      }
      revealed = true;
      details.hidden = false;
      status.textContent = "Cloudflare reckons you're human. Good enough for me. My details are below.";
      widget.hidden = true;
      window.turnstile.remove(widgetId);
      document.getElementById("contact-details-title").focus();
    } catch (error) {
      showError(error.name === "TimeoutError"
        ? "Verification took too long. Please try again."
        : error instanceof TypeError || error instanceof SyntaxError
          ? "Contact details couldn't be loaded. Please try again, or use LinkedIn below."
          : error.message);
    } finally {
      verifying = false;
    }
  }

  async function startVerification() {
    if (loading || verifying || revealed) return;
    loading = true;
    retry.hidden = true;
    status.textContent = "Loading a quick Cloudflare check…";
    try {
      const response = await fetch("/api/contact", {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.headers.get("Content-Type")?.includes("application/json")) {
        throw new Error("Direct contact is unavailable here. You can still find me on LinkedIn below.");
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Contact details are temporarily unavailable.");
      if (!data.siteKey) throw new Error("Verification is temporarily unavailable.");
      await loadTurnstile();
      if (widgetId !== undefined) window.turnstile.remove(widgetId);
      widget.hidden = false;
      status.textContent = "Complete the check below if prompted. My details will appear once verified.";
      widgetSize = widget.clientWidth < 300 ? "compact" : "flexible";
      widgetId = window.turnstile.render(widget, {
        sitekey: data.siteKey,
        action: "reveal-contact",
        theme: "dark",
        size: widgetSize,
        "response-field": false,
        retry: "never",
        callback: revealContact,
        "error-callback": () => {
          showError("The robot bouncer couldn't finish the check. Try again, or sneak round to LinkedIn below.");
          return true;
        },
        "expired-callback": () => showError("Your human credentials have expired. Nothing personal. Please try again."),
        "timeout-callback": () => showError("The check ran out of patience. Please try again."),
        "unsupported-callback": () => showError("This browser can't run the check. Please try another browser or use LinkedIn below."),
      });
    } catch (error) {
      showError(error.name === "TimeoutError" || error instanceof TypeError
        ? "Verification couldn't load. Please check your connection and try again."
        : error.message);
    } finally {
      loading = false;
    }
  }

  gate.hidden = false;
  retry.addEventListener("click", startVerification);
  new ResizeObserver(() => {
    if (widgetId !== undefined && !widget.hidden && !loading && !verifying && !revealed &&
        widgetSize !== (widget.clientWidth < 300 ? "compact" : "flexible")) {
      startVerification();
    }
  }).observe(widget);
  startVerification();
})();

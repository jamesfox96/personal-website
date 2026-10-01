const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, { Allow: "GET, POST" });
  }

  if (!env.TURNSTILE_SITE_KEY || !env.TURNSTILE_SECRET_KEY || !env.CONTACT_EMAIL) {
    return json({ error: "Contact details are temporarily unavailable. Please use LinkedIn below." }, 503);
  }

  // The site key is public. Contact details and the secret never leave the
  // function until a POST has passed Cloudflare's server-side verification.
  if (request.method === "GET") {
    return json({ siteKey: env.TURNSTILE_SITE_KEY });
  }

  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    return json({ error: "Please verify from the contact page." }, 403);
  }
  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return json({ error: "Expected a JSON request." }, 415);
  }
  if (Number(request.headers.get("Content-Length")) > 4096) {
    return json({ error: "Request too large." }, 413);
  }

  let token;
  try {
    const body = await request.json();
    token = body?.token;
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  if (typeof token !== "string" || !token.trim() || token.length > 2048) {
    return json({ error: "Please complete the verification check." }, 400);
  }

  let validation;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") || undefined,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Verification service unavailable");
    validation = await response.json();
  } catch {
    return json({ error: "Verification is temporarily unavailable. Please try again." }, 503);
  }

  // Siteverify also rejects expired and already-used tokens. Do not cache or
  // reuse a successful validation for a later request.
  if (
    validation?.success !== true ||
    validation.hostname !== url.hostname ||
    validation.action !== "reveal-contact"
  ) {
    return json({ error: "Verification wasn't accepted. Please try again." }, 403);
  }

  return json({
    email: env.CONTACT_EMAIL,
    ...(env.CONTACT_PHONE ? { phone: env.CONTACT_PHONE } : {}),
  });
}

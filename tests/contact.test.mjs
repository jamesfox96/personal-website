import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, test } from "node:test";

// Pages treats function files as ES modules. Keep this package-free site's
// Node tests compatible by importing the same source as an explicit module.
const source = await readFile(new URL("../functions/api/contact.js", import.meta.url), "utf8");
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const env = {
  TURNSTILE_SITE_KEY: "test-public-key",
  TURNSTILE_SECRET_KEY: "test-private-key",
  CONTACT_EMAIL: "hello@example.invalid",
  CONTACT_PHONE: "+44 7700 900123",
};
const validResult = { success: true, hostname: "james-fox.com", action: "reveal-contact" };

function request(body, options = {}) {
  return new Request("https://james-fox.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://james-fox.com", ...options.headers },
    body: JSON.stringify(body),
  });
}

async function assertPrivateResponse(response, expectedStatus) {
  assert.equal(response.status, expectedStatus);
  assert.match(response.headers.get("Cache-Control"), /no-store/);
  assert.match(response.headers.get("X-Robots-Tag"), /noindex/);
  const text = await response.text();
  for (const value of [env.CONTACT_EMAIL, env.CONTACT_PHONE, env.TURNSTILE_SECRET_KEY]) {
    assert.ok(!text.includes(value), "Unverified response must not expose a private value");
  }
}

test("GET only exposes the public site key", async () => {
  globalThis.fetch = () => { throw new Error("GET must not call Siteverify"); };
  const response = await onRequest({ request: new Request("https://james-fox.com/api/contact"), env });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Cache-Control"), /no-store/);
  assert.deepEqual(await response.json(), { siteKey: env.TURNSTILE_SITE_KEY });
});

test("missing configuration fails closed", async () => {
  for (const key of ["TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY", "CONTACT_EMAIL"]) {
    const incomplete = { ...env, [key]: "" };
    await assertPrivateResponse(await onRequest({ request: request({ token: "valid" }), env: incomplete }), 503);
  }
});

test("malformed and absent tokens never reach Siteverify", async () => {
  globalThis.fetch = () => { throw new Error("Invalid requests must be rejected before Siteverify"); };
  for (const body of [null, {}, { token: 123 }, { token: "" }, { token: " " }, { token: "x".repeat(2049) }]) {
    await assertPrivateResponse(await onRequest({ request: request(body), env }), 400);
  }
  const malformed = new Request("https://james-fox.com/api/contact", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{invalid",
  });
  await assertPrivateResponse(await onRequest({ request: malformed, env }), 400);
});

test("unsupported methods, content types, origins and oversized requests are rejected", async () => {
  await assertPrivateResponse(await onRequest({ request: new Request("https://james-fox.com/api/contact", { method: "PUT" }), env }), 405);
  await assertPrivateResponse(await onRequest({ request: request({ token: "valid" }, { headers: { "Content-Type": "text/plain" } }), env }), 415);
  await assertPrivateResponse(await onRequest({ request: request({ token: "valid" }, { headers: { Origin: "https://elsewhere.invalid" } }), env }), 403);
  await assertPrivateResponse(await onRequest({ request: request({ token: "valid" }, { headers: { "Content-Length": "5000" } }), env }), 413);
});

test("failed, expired, wrong-host and wrong-action verifications reveal nothing", async () => {
  for (const result of [
    { success: false, "error-codes": ["invalid-input-response"] },
    { success: false, "error-codes": ["timeout-or-duplicate"] },
    { ...validResult, hostname: "elsewhere.invalid" },
    { ...validResult, action: "different-action" },
    { success: true },
    { ...validResult, success: "true" },
    null,
  ]) {
    globalThis.fetch = async () => Response.json(result);
    await assertPrivateResponse(await onRequest({ request: request({ token: "token" }), env }), 403);
  }
});

test("Siteverify outages and malformed responses fail closed", async () => {
  for (const mock of [
    async () => { throw new Error("Network failure"); },
    async () => new Response("Unavailable", { status: 503 }),
    async () => new Response("not JSON"),
  ]) {
    globalThis.fetch = mock;
    await assertPrivateResponse(await onRequest({ request: request({ token: "token" }), env }), 503);
  }
});

test("verified requests reveal configured details with no caching", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), {
      secret: env.TURNSTILE_SECRET_KEY, response: "valid-token", remoteip: "192.0.2.1",
    });
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(validResult);
  };
  const response = await onRequest({
    request: request({ token: "valid-token" }, { headers: { "CF-Connecting-IP": "192.0.2.1" } }), env,
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Cache-Control"), /no-store/);
  assert.deepEqual(await response.json(), { email: env.CONTACT_EMAIL, phone: env.CONTACT_PHONE });
});

test("phone is optional and each reveal requires fresh verification", async () => {
  let calls = 0;
  globalThis.fetch = async () => Response.json(++calls === 1
    ? validResult
    : { success: false, "error-codes": ["timeout-or-duplicate"] });
  const first = await onRequest({ request: request({ token: "single-use-token" }), env: { ...env, CONTACT_PHONE: "" } });
  assert.deepEqual(await first.json(), { email: env.CONTACT_EMAIL });
  const second = await onRequest({ request: request({ token: "single-use-token" }), env });
  await assertPrivateResponse(second, 403);
  assert.equal(calls, 2);
});

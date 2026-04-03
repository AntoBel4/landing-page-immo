#!/usr/bin/env node
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const playwrightRuntimeDir = process.env.PLAYWRIGHT_RUNTIME_DIR || process.cwd();
const { chromium } = require(path.join(playwrightRuntimeDir, 'node_modules', 'playwright'));

const testUrl = process.env.RDM_TEST_URL
  || 'https://rentrerdesmandats.fr/?utm_source=brevo&utm_medium=email&utm_campaign=lead_nurture_2026&utm_content=j0&utm_term=immo';
const leadEmail = process.env.RDM_TEST_EMAIL || 'cto-test@example.com';
const testReferrer = process.env.RDM_TEST_REFERRER || '';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext(testReferrer ? {
  extraHTTPHeaders: {
    referer: testReferrer
  }
} : {});
const page = await context.newPage();

let leadRequest = null;

await context.route('https://n8n.rentrerdesmandats.fr/webhook/lead-capture', async route => {
  const request = route.request();
  leadRequest = {
    method: request.method(),
    headers: request.headers(),
    postData: request.postDataJSON()
  };

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true })
  });
});

await page.addInitScript(() => {
  window.__tracked = [];
  window.gtag = (...args) => window.__tracked.push(args);
  window.plausible = (eventName, payload) => window.__tracked.push(['plausible', eventName, payload]);
});

await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.evaluate(() => {
  const buyButton = document.getElementById('buyButton');
  if (buyButton) {
    buyButton.addEventListener('click', event => event.preventDefault(), true);
  }
});

await page.click('#buyButton');
await page.waitForTimeout(250);

await page.fill('#leadForm input[type="email"]', leadEmail);
await page.check('#leadForm input[name="consent"]');
await page.click('#leadForm button[type="submit"]');
await page.waitForTimeout(500);

const tracked = await page.evaluate(() => window.__tracked);
const sessionData = await page.evaluate(() => JSON.parse(sessionStorage.getItem('rdm_attribution_v1') || '{}'));
const buyHref = await page.getAttribute('#buyButton', 'href');

const buyEvent = tracked.find(event => event[1] === 'buy_button_clicked');
const leadEvent = tracked.find(event => event[1] === 'lead_captured');
const leadAttribution = leadRequest?.postData?.attribution || {};
const leadPayloadHasReferrerHost = Object.prototype.hasOwnProperty.call(leadAttribution, 'referrer_host');

const result = {
  testUrl,
  testReferrer,
  title: await page.title(),
  buyHref,
  checks: {
    page_loaded: Boolean(await page.title()),
    buy_event_has_utm_source: Boolean(buyEvent?.[2]?.utm_source),
    buy_event_has_session_id: Boolean(buyEvent?.[2]?.session_id),
    lead_payload_has_utm_source: Boolean(leadAttribution.utm_source),
    lead_payload_has_session_id: Boolean(leadAttribution.session_id),
    lead_payload_has_referrer_host: leadPayloadHasReferrerHost,
    lead_payload_referrer_host_non_empty: Boolean(leadAttribution.referrer_host)
  },
  tracked,
  leadRequest,
  sessionData,
  findings: []
};

if (!result.checks.lead_payload_has_referrer_host) {
  result.findings.push('lead-capture payload does not include attribution.referrer_host');
}

if (testReferrer && !result.checks.lead_payload_referrer_host_non_empty) {
  result.findings.push('lead-capture payload keeps attribution.referrer_host empty even when a referrer is supplied');
}

console.log(JSON.stringify(result, null, 2));

await browser.close();

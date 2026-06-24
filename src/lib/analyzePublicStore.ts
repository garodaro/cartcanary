import type { Page } from "playwright-core";
import { PageAnalysisResult, PageSignals, ScreenshotSet } from "@/lib/reportLogic";

const DEFAULT_TIMEOUT_MS = 12000;
const MAX_LINKS = 24;
const TEXT_SCAN_TIMEOUT_MS = 10000;

type BrowserLike = {
  newContext: (...args: unknown[]) => Promise<{
    newPage: () => Promise<Page>;
    close: () => Promise<void>;
  }>;
  close: () => Promise<void>;
};

export function normalizePublicUrl(rawUrl: string) {
  const withProtocol = /^https?:\/\//i.test(rawUrl.trim())
    ? rawUrl.trim()
    : `https://${rawUrl.trim()}`;

  const url = new URL(withProtocol);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Please enter a public http or https store URL.");
  }

  return url.toString();
}

export async function analyzePublicStore(rawUrl: string): Promise<PageAnalysisResult> {
  const normalizedUrl = normalizePublicUrl(rawUrl);
  const screenshots: ScreenshotSet = {};
  const warnings: string[] = [];
  let browser: BrowserLike | undefined;

  try {
    browser = await launchBrowser();

    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 1050 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();
    await gotoWithTimeout(desktopPage, normalizedUrl);
    await settlePage(desktopPage);

    const homepage = await extractSignals(desktopPage, normalizedUrl);
    screenshots.desktop = await screenshotDataUrl(desktopPage);

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const mobilePage = await mobileContext.newPage();
    await gotoWithTimeout(mobilePage, normalizedUrl);
    await settlePage(mobilePage);
    screenshots.mobile = await screenshotDataUrl(mobilePage);

    let productPage: PageSignals | undefined;
    const productUrl = findLikelyProductUrl(homepage);

    if (productUrl) {
      try {
        await gotoWithTimeout(desktopPage, productUrl);
        await settlePage(desktopPage);
        productPage = await extractSignals(desktopPage, productUrl);
        screenshots.productPage = await screenshotDataUrl(desktopPage);
      } catch (error) {
        warnings.push(
          `Product page scan failed, so the audit continued with homepage signals only. ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }

    await desktopContext.close();
    await mobileContext.close();

    return {
      normalizedUrl,
      auditMode: productPage ? "Form + homepage + product page" : "Form + homepage",
      homepage,
      productPage,
      screenshots,
      warnings,
    };
  } finally {
    // Production should use a managed browser service and object storage for
    // screenshots. This local MVP keeps the data in-memory as compact data URLs.
    if (browser) {
      await browser.close();
    }
  }
}

export async function analyzePublicStoreTextOnly(
  rawUrl: string,
  browserFailure?: unknown,
): Promise<PageAnalysisResult> {
  const normalizedUrl = normalizePublicUrl(rawUrl);
  const homepage = await fetchPageSignals(normalizedUrl);
  let productPage: PageSignals | undefined;
  const productUrl = findLikelyProductUrl(homepage);
  const warnings = [
    `Browser screenshot scan failed, so CartCanary continued with a lightweight public HTML scan. ${summarizeError(
      browserFailure,
    )}`,
  ];

  if (productUrl) {
    try {
      productPage = await fetchPageSignals(productUrl);
    } catch (error) {
      warnings.push(
        `Product page text scan failed, so the audit continued with homepage signals only. ${summarizeError(
          error,
        )}`,
      );
    }
  }

  return {
    normalizedUrl,
    auditMode: productPage ? "Form + homepage + product page" : "Form + homepage",
    homepage,
    productPage,
    screenshots: {},
    warnings,
  };
}

async function launchBrowser(): Promise<BrowserLike> {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const browserlessUrl = getBrowserlessWebSocketUrl();

    if (browserlessUrl) {
      const { chromium } = await import("playwright-core");
      return chromium.connectOverCDP(browserlessUrl) as Promise<BrowserLike>;
    }
  }

  if (isServerless) {
    const [{ chromium: playwrightChromium }, chromiumModule] = await Promise.all([
      import("playwright-core"),
      import("@sparticuz/chromium"),
    ]);
    const chromium = chromiumModule.default;
    chromium.setGraphicsMode = false;

    return playwrightChromium.launch({
      args: [...chromium.args, "--disable-dev-shm-usage"],
      executablePath: await chromium.executablePath(),
      headless: true,
    }) as Promise<BrowserLike>;
  }

  const { chromium } = await import("playwright");

  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  }) as Promise<BrowserLike>;
}

function getBrowserlessWebSocketUrl() {
  if (process.env.BROWSERLESS_WS_URL) {
    return process.env.BROWSERLESS_WS_URL;
  }

  if (!process.env.BROWSERLESS_TOKEN) {
    return "";
  }

  const region = process.env.BROWSERLESS_REGION ?? "production-sfo";
  return `wss://${region}.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`;
}

async function fetchPageSignals(url: string): Promise<PageSignals> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TEXT_SCAN_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; CartCanaryAudit/1.0; +https://cartcanary.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error("The URL did not return an HTML page.");
    }

    const finalUrl = response.url || url;
    const html = await response.text();
    return extractSignalsFromHtml(html, finalUrl);
  } finally {
    clearTimeout(timeout);
  }
}

function extractSignalsFromHtml(html: string, currentUrl: string): PageSignals {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const visibleText = decodeHtmlEntities(withoutScripts.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  const lowerText = visibleText.toLowerCase();
  const links = extractLinks(html, currentUrl);
  const sameHostLinks = links.filter((link) => {
    try {
      return new URL(link).host === new URL(currentUrl).host;
    } catch {
      return false;
    }
  });
  const byPattern = (patterns: RegExp[]) =>
    sameHostLinks.filter((link) => patterns.some((pattern) => pattern.test(link)));

  return {
    url: currentUrl,
    pageTitle: firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    metaDescription: firstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    ),
    headings: extractTagText(html, /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi, 12),
    ctaTexts: extractTagText(html, /<(?:a|button)[^>]*>([\s\S]*?)<\/(?:a|button)>/gi, 24),
    bodyTextSample: visibleText.slice(0, 1800),
    internalLinks: sameHostLinks.slice(0, MAX_LINKS),
    productLikeLinks: byPattern([
      /\/products?\//i,
      /\/product\//i,
      /\/items?\//i,
      /\/shop\//i,
    ]).slice(0, MAX_LINKS),
    collectionLikeLinks: byPattern([
      /\/collections?\//i,
      /\/categories?\//i,
      /\/shop/i,
    ]).slice(0, MAX_LINKS),
    cartLikeLinks: byPattern([/\/cart/i, /basket/i, /bag/i]).slice(0, MAX_LINKS),
    checkoutLikeLinks: byPattern([/checkout/i]).slice(0, MAX_LINKS),
    mentions: {
      shipping: /shipping/.test(lowerText),
      returns: /returns?|refunds?/.test(lowerText),
      guarantees: /guarantee|warranty/.test(lowerText),
      reviews: /reviews?|ratings?/.test(lowerText),
      testimonials: /testimonials?/.test(lowerText),
      secureCheckout: /secure checkout|safe checkout|ssl|secure payment/.test(lowerText),
      paymentOptions: /paypal|klarna|afterpay|shop pay|apple pay|google pay|payment/.test(
        lowerText,
      ),
      discounts: /discount|sale|save|promo|coupon/.test(lowerText),
      subscriptions: /subscribe|subscription/.test(lowerText),
      sizing: /size guide|sizing|size chart/.test(lowerText),
      delivery: /delivery/.test(lowerText),
      freeShipping: /free shipping/.test(lowerText),
    },
  };
}

function extractLinks(html: string, currentUrl: string) {
  const links = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi))
    .map((match) => {
      try {
        return new URL(decodeHtmlEntities(match[1]), currentUrl).toString();
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  return Array.from(new Set(links));
}

function extractTagText(html: string, pattern: RegExp, limit: number) {
  return Array.from(html.matchAll(pattern))
    .map((match) => decodeHtmlEntities(match[1].replace(/<[^>]+>/g, " ")))
    .map((text) => text.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function firstMatch(html: string, pattern: RegExp) {
  return decodeHtmlEntities(html.match(pattern)?.[1] ?? "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function summarizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return "";
  }

  return error.message.split("\n")[0].slice(0, 220);
}

async function gotoWithTimeout(page: Page, url: string) {
  page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: DEFAULT_TIMEOUT_MS,
  });
}

async function settlePage(page: Page) {
  try {
    await page.waitForLoadState("networkidle", { timeout: 4000 });
  } catch {
    // Many ecommerce sites keep analytics or chat requests open. A short
    // network-idle attempt is enough for this MVP; we continue if it times out.
  }
}

async function screenshotDataUrl(page: Page) {
  const buffer = await page.screenshot({
    type: "jpeg",
    quality: 45,
    fullPage: false,
    animations: "disabled",
  });

  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

async function extractSignals(page: Page, currentUrl: string): Promise<PageSignals> {
  return page.evaluate(
    ({ currentUrl: evaluatedUrl, maxLinks }) => {
      const absoluteUrl = (href: string) => {
        try {
          return new URL(href, evaluatedUrl).toString();
        } catch {
          return "";
        }
      };

      const textOf = (selector: string) =>
        Array.from(document.querySelectorAll(selector))
          .map((element) => element.textContent?.trim().replace(/\s+/g, " ") ?? "")
          .filter(Boolean);

      const visibleText = (element: Element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0;
      };

      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
        .filter(visibleText)
        .map((link) => absoluteUrl(link.getAttribute("href") ?? ""))
        .filter(Boolean);

      const uniqueLinks = Array.from(new Set(links));
      const sameHostLinks = uniqueLinks.filter((link) => {
        try {
          return new URL(link).host === new URL(evaluatedUrl).host;
        } catch {
          return false;
        }
      });

      const bodyText = (document.body?.innerText ?? "").replace(/\s+/g, " ").trim();
      const lowerText = bodyText.toLowerCase();
      const byPattern = (patterns: RegExp[]) =>
        sameHostLinks.filter((link) => patterns.some((pattern) => pattern.test(link)));

      return {
        url: evaluatedUrl,
        pageTitle: document.title || "",
        metaDescription:
          document
            .querySelector<HTMLMetaElement>('meta[name="description"]')
            ?.content?.trim() ?? "",
        headings: textOf("h1, h2").slice(0, 12),
        ctaTexts: textOf("button, a").slice(0, 24),
        bodyTextSample: bodyText.slice(0, 1800),
        internalLinks: sameHostLinks.slice(0, maxLinks),
        productLikeLinks: byPattern([
          /\/products?\//i,
          /\/product\//i,
          /\/items?\//i,
          /\/shop\//i,
        ]).slice(0, maxLinks),
        collectionLikeLinks: byPattern([
          /\/collections?\//i,
          /\/categories?\//i,
          /\/shop/i,
        ]).slice(0, maxLinks),
        cartLikeLinks: byPattern([/\/cart/i, /basket/i, /bag/i]).slice(0, maxLinks),
        checkoutLikeLinks: byPattern([/checkout/i]).slice(0, maxLinks),
        mentions: {
          shipping: /shipping/.test(lowerText),
          returns: /returns?|refunds?/.test(lowerText),
          guarantees: /guarantee|warranty/.test(lowerText),
          reviews: /reviews?|ratings?/.test(lowerText),
          testimonials: /testimonials?/.test(lowerText),
          secureCheckout: /secure checkout|safe checkout|ssl|secure payment/.test(lowerText),
          paymentOptions: /paypal|klarna|afterpay|shop pay|apple pay|google pay|payment/.test(
            lowerText,
          ),
          discounts: /discount|sale|save|promo|coupon/.test(lowerText),
          subscriptions: /subscribe|subscription/.test(lowerText),
          sizing: /size guide|sizing|size chart/.test(lowerText),
          delivery: /delivery/.test(lowerText),
          freeShipping: /free shipping/.test(lowerText),
        },
      };
    },
    { currentUrl, maxLinks: MAX_LINKS },
  );
}

function findLikelyProductUrl(homepage: PageSignals) {
  return (
    homepage.productLikeLinks[0] ??
    homepage.collectionLikeLinks.find((link) => /\/products?\//i.test(link)) ??
    homepage.internalLinks.find((link) =>
      /\/(products?|product|collections?|shop|item|p)\//i.test(link),
    )
  );
}

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const htmlPath = "dashboard/index.html";
const appPath = "dashboard/app.js";
const cssPath = "dashboard/styles.css";

for (const path of [htmlPath, appPath, cssPath]) {
  if (!existsSync(path)) fail(`Missing dashboard resource: ${path}`);
}

const html = await readFile(htmlPath, "utf8");
const app = await readFile(appPath, "utf8");

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (message) => fail(message));
virtualConsole.on("jsdomError", (error) => fail(error?.message || String(error)));

const dom = new JSDOM(html, {
  url: "http://localhost/dashboard/index.html",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.fetch = async (url) => {
      const resolved = new URL(url, window.location.href);
      const pathname = resolved.pathname.replace(/^\/franchise-ledger\//, "");
      if (!existsSync(pathname)) throw new Error(`Missing fetch resource: ${pathname}`);
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(await readFile(pathname, "utf8")),
      };
    };
  },
});

dom.window.eval(app);

await new Promise((resolve) => setTimeout(resolve, 50));

const doc = dom.window.document;

if (!doc.querySelector("#race-track svg")) fail("Race horse SVG did not render.");
if (!doc.querySelector(".race-dot")) fail("Race horse markers did not render.");
if (!doc.querySelector(".race-dot-final")) fail("Final-season marker did not render.");
if (!doc.querySelector("#race-final-standings li")) fail("Final standings did not render.");
if (doc.querySelector("#race-horse-status")?.textContent !== "Ready") fail("Race horse status is not Ready.");

const firstDot = doc.querySelector(".race-dot");
firstDot?.dispatchEvent(new dom.window.Event("click", { bubbles: true }));

if (doc.querySelector("#race-detail-franchise")?.textContent === "Select a marker") {
  fail("Marker click did not update detail panel.");
}

if (!process.exitCode) {
  console.log("PASS: Franchise Ledger dashboard browser smoke check passed.");
}

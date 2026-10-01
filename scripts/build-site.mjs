import { readFile, writeFile } from "node:fs/promises";
import { renderHeader, renderFooter } from "./site-components.mjs";

// Generated HTML is committed, so hosting and Live Server need no build step.
const pages = [
  { file: "index.html", path: "/" },
  { file: "projects/index.html", path: "/projects/" },
  { file: "experience/index.html", path: "/experience/" },
  { file: "404.html", path: "/404.html" },
];
const check = process.argv.includes("--check");

for (const page of pages) {
  const url = new URL(`../${page.file}`, import.meta.url);
  const original = await readFile(url, "utf8");
  let html = original;
  for (const [tag, attribute, content] of [
    ["header", "data-site-header", renderHeader(page.path)],
    ["footer", "data-site-footer", renderFooter()],
  ]) {
    const host = new RegExp(`(<${tag}\\b[^>]*\\b${attribute}[^>]*>)[\\s\\S]*?(</${tag}>)`, "g");
    if ([...html.matchAll(host)].length !== 1) {
      throw new Error(`Expected one ${attribute} host in ${page.file}`);
    }
    const rendered = content.split("\n").map(line => line.trimEnd()).join("\n").trimEnd();
    html = html.replace(host, (_, open, close) => `${open}${rendered}\n    ${close}`);
  }
  if (html !== original) {
    if (check) {
      console.error(`Shared components are out of date: ${page.file}`);
      process.exitCode = 1;
    } else {
      await writeFile(url, html);
      console.log(`Updated ${page.file}`);
    }
  }
}

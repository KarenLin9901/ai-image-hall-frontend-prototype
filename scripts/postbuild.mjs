import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const output = new URL("../docs/", import.meta.url);
const basePath = "/ai-image-hall-frontend-prototype";
const routes = [
  "works",
  "consent",
  "create/face",
  "verify/consent",
  "verify/provider",
  "verify/processing",
  "verify/result",
  "create/body",
  "create/voice",
  "create/voice-consent",
  "create/record",
  "create/memory",
  "create/place",
  "create/line",
  "create/confirm",
  "task/demo-task",
  "result/demo-task",
  "share/demo-task",
  "work/demo-share",
];

async function rewriteAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) {
      await rewriteAssets(path);
    } else if (/\.(?:css|html|js)$/.test(entry.name)) {
      const source = await readFile(path, "utf8");
      await writeFile(
        path,
        source
          .replaceAll("/images/", `${basePath}/images/`)
          .replaceAll("/media/", `${basePath}/media/`),
      );
    }
  }
}

await rewriteAssets(output);
for (const route of routes) {
  const routeDirectory = new URL(`${route}/`, output);
  await mkdir(routeDirectory, { recursive: true });
  await cp(new URL("index.html", output), new URL("index.html", routeDirectory));
}
await cp(new URL("index.html", output), new URL("404.html", output));
await writeFile(new URL(".nojekyll", output), "");

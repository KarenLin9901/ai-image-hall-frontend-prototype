import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const output = process.argv[2] ? pathToFileURL(resolve(process.argv[2]) + "/") : new URL("../docs/", import.meta.url);
const basePath = "/ai-image-hall-frontend-prototype";
const routes = [
  "works",
  "create",
  "mine",
  "task/demo-task",
  "result/demo-task",
  "work/demo-share",
  "share/demo-share",
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
        // Rewrite only root-relative path literals; absolute and already-prefixed URLs stay intact.
        source.replace(/(["'`(])\/(images|media)\//g, `$1${basePath}/$2/`),
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

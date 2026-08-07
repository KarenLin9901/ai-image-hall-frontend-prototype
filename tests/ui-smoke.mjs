import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
await mkdir(new URL("../outputs/", import.meta.url), { recursive: true });
const server = spawn("npm", ["exec", "vite", "preview", "--", "--host", "127.0.0.1", "--port", "4174"], { cwd, stdio: "ignore" });
const base = "http://127.0.0.1:4174/ai-image-hall-frontend-prototype/";
const faceImage = fileURLToPath(new URL("../public/images/v4/live-futian.jpg", import.meta.url));
for (let attempt = 0; attempt < 40; attempt += 1) {
  try { if ((await fetch(base)).ok) break; } catch {}
  await new Promise((resolve) => setTimeout(resolve, 150));
}

const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 430, height: 932 }, isMobile: true });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "作品展示" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "更多状态" }).count(), 0);
  await page.getByRole("button", { name: /查看作品/ }).click();
  await page.getByRole("button", { name: "分享" }).click();
  await page.getByRole("heading", { name: "分享作品" }).waitFor();
  await page.getByRole("heading", { name: "视频" }).waitFor();
  await page.getByRole("heading", { name: "宣传海报" }).waitFor();
  await page.screenshot({ path: fileURLToPath(new URL("../outputs/frontend-share-poster.png", import.meta.url)), fullPage: true });
  await page.getByRole("button", { name: "保存海报" }).click();
  await page.getByText("宣传海报已保存到相册").waitFor();
  await page.getByRole("button", { name: "复制分享链接" }).click();
  await page.getByText(/分享链接已/).waitFor();
  await page.getByRole("button", { name: "返回作品详情" }).click();
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("button", { name: "视频生成" }).click();
  await page.getByRole("heading", { name: "上传素材" }).waitFor();
  await page.locator('input[name="face_photo"]').setInputFiles(faceImage);
  await page.getByText("核验已通过").waitFor();
  await page.getByRole("checkbox", { name: "确认素材授权" }).check();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("heading", { name: "选择记忆" }).waitFor();
  await page.getByRole("button", { name: /福田/ }).click();
  await page.getByRole("button", { name: /猪柳蛋/ }).click();
  await page.getByRole("button", { name: /深圳湾公园/ }).click();
  await page.getByRole("button", { name: "完成选择" }).click();
  await page.getByText("稳定，稳定地搬家 · 6秒").waitFor();
  await page.getByText("30秒", { exact: true }).waitFor();
  await page.screenshot({ path: fileURLToPath(new URL("../outputs/frontend-v6-summary.png", import.meta.url)), fullPage: true });

  await page.getByRole("button", { name: "提交生成申请" }).click();
  await page.getByRole("heading", { name: "等待管理员确认" }).waitFor();
  await page.getByText("真实生成").waitFor();
  assert.equal(await page.getByRole("heading", { name: "视频生成中" }).count(), 0);
  await page.getByRole("button", { name: "查看我的任务" }).click();
  await page.getByText("待管理员确认", { exact: true }).first().waitFor();

  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  server.kill("SIGTERM");
}

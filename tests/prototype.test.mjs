import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = await readFile(new URL("app/AiImageHall.tsx", root), "utf8");

test("GitHub Pages build includes home, fallback and deep routes", async () => {
  for (const path of ["docs/index.html", "docs/404.html", "docs/create/index.html", "docs/mine/index.html", "docs/task/demo-task/index.html", "docs/work/demo-share/index.html"]) await access(new URL(path, root));
  const html = await readFile(new URL("docs/index.html", root), "utf8");
  assert.match(html, /深圳AI影像馆/);
  assert.match(html, /\/ai-image-hall-frontend-prototype\/assets\//);
});

test("V6 script and admin gate are explicit", () => {
  for (const phrase of ["固定开场", "稳定，稳定地搬家", "福田", "南山", "龙华", "猪柳蛋", "隆江猪脚饭", "续命奶茶", "翻身站", "写字楼卫生间", "深圳湾公园", "30秒", "待管理员确认", "Mac 管理员", "申请公开", "重试中", "已取消"]) assert.match(source, new RegExp(phrase));
  for (const stale of ["M记猪柳蛋", "约 25–30 秒", "东门", "华强北", "蛇口", "用户声音"]) assert.doesNotMatch(source, new RegExp(stale));
});

test("static prototype contains no obvious secrets or local user paths", () => {
  assert.doesNotMatch(source, /sk-[A-Za-z0-9]{16,}/);
  assert.doesNotMatch(source, /gh[opusr]_[A-Za-z0-9]{20,}/);
  assert.doesNotMatch(source, /Bearer\s+[A-Za-z0-9._-]{16,}/i);
  assert.doesNotMatch(source, /\/Users\//);
});

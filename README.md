# 情绪宇宙 · 手机部署指南

一个会呼吸、生长的动态情绪庇护所（单页 Web 应用 / PWA）。写下念头，AI 把它炼成流星、烟花、花朵与星辰，并随你的情绪长期演变、连成星座。

## 包内文件

| 文件 | 作用 |
|------|------|
| `index.html` | 主程序（含星空、天气、星座、语音、烟花、治愈文案、社交分享） |
| `manifest.webmanifest` | PWA 配置（名称、图标、全屏显示） |
| `sw.js` | Service Worker（离线缓存，让 App 断网也能开） |
| `icon-512.png` | 桌面 / 主屏图标 |
| `README.md` | 本说明 |

> 部署时**五个文件请放在同一目录**，不要改文件名（manifest 和 sw.js 靠相对路径互相引用）。

---

## 部署（零成本，三选一）

### 方式 A：GitHub Pages（最常用）
1. 在 github.com 新建一个仓库（如 `emotion-garden`）。
2. 把这五个文件上传到仓库**根目录**（直接拖进去，或 `git push`）。
3. 仓库 → **Settings → Pages** → Source 选 `main` 分支、`/root` → Save。
4. 等约 1 分钟，访问 `https://你的用户名.github.io/emotion-garden/` 即可。

### 方式 B：Netlify / Vercel（最省事，拖拽即上线）
1. 打开 [app.netlify.com](https://app.netlify.com) 或 [vercel.com](https://vercel.com)。
2. 把整个 `emotion-garden` 文件夹**拖到页面部署区**。
3. 自动获得一个 `https://xxxx.netlify.app` 域名，复制即可用。

### 方式 C：Cloudflare Pages / 任意静态托管
同样：上传文件夹 → 绑定域名 → 获得 https 地址。

> 只要你拿到一个 **https** 开头的地址，PWA 与语音功能就都能用。

---

## 装进手机（添加到主屏 = 变成 App）

- **Android（Chrome / Edge）**：用手机浏览器打开上面的 https 地址 → 右上 `⋮` → **「安装应用 / 添加到主屏」** → 桌面出现「情绪宇宙」图标。点开即**全屏、无浏览器边框、可离线**。
- **iPhone（Safari）**：打开地址 → 底部「分享」按钮 → **「添加到主屏」**。

首次打开会让你做 4 道趣味问卷，生成专属宇宙；**双击页面底部小字**可一键填充 7 天示例，立刻看到天气演变与星座连线。

---

## 启用 AI 治愈文案（让"嘴替"真的会吐槽）

默认使用本地文案库，无需联网即可用。想要大模型生成：

1. 打开后点右上角 **⚙️**；
2. **推荐选 `OpenRouter`**（[openrouter.ai](https://openrouter.ai) 免费注册，拿到 Key 即填）或 `SiliconFlow`（硅基流动，国内直连）—— 这两个平台**允许网页在浏览器里直接调用**，粘贴 Key、勾「启用大模型」、保存，文案立刻变成 AI 实时写的；
3. 若你坚持用 DeepSeek / OpenAI / Kimi：它们的接口**默认禁止浏览器直连（CORS 拦截）**，纯前端页面直接填会失败并回退本地文案。要么改用上面的 OpenRouter，要么按下方「自建中转代理」部署一个 Cloudflare Worker 把地址填进「自定义地址」。

任何失败都会**自动回退本地文案**，不会白屏。

### 自建中转代理（保留 DeepSeek，且能绕过跨域）

本包是纯静态站点，无法自己跑后端。但你可以 1 分钟白嫖一个 Cloudflare Worker 做中转：

1. 打开 [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create Worker**，名称随意；
2. 把默认代码整段替换为下面这段（它只做「转发 + 补 CORS 头」，不存任何密钥）：
```js
export default {
  async fetch(req) {
    const url = new URL(req.url);
    const target = "https://api.deepseek.com" + (url.pathname || "/v1/chat/completions");
    const r = await fetch(target, { method: req.method, headers: req.headers, body: req.body });
    const h = new Headers(r.headers);
    h.set("Access-Control-Allow-Origin", "*");
    h.set("Access-Control-Allow-Headers", "*");
    return new Response(r.body, { status: r.status, headers: h });
  }
}
```
3. **Deploy** 后复制给你的 `https://xxx.workers.dev` 地址；
4. 回到 App 的 ⚙️ → 「自定义地址」填 `https://xxx.workers.dev/v1`，平台仍选 `DeepSeek`，保存即可。

> 该 Worker 只转发请求，密钥仍在你浏览器本地、不离开你设备；它返回 `Access-Control-Allow-Origin: *`，所以浏览器就不再拦截。

---

## 在电脑本地预览

```bash
cd 本目录
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```
> 直接双击 `index.html`（file://）也能看页面，但**不能**「添加到主屏」、麦克风（语音）也会被禁用，请用 localhost 或 https。

---

## 常见问题

- **更新代码后手机还是旧版？** PWA 有缓存。手机上「设置 → 应用 → 情绪宇宙 → 清除存储」，或改 `manifest.webmanifest` 里任意内容触发更新。
- **好友的星球怎么看？** 点右上 👥 → 「分享我的宇宙」复制链接发给朋友；朋友打开即把你的星球住进她的世界。朋友更新后重新分享、你再导入即可看到最新天气（纯前端为快照同步，非实时）。
- **想要跨设备实时同步？** 需接入轻量后端（Supabase / 极小 Node 服务），本包暂为纯前端。

# Brilliant Chess

中文说明 / English version: [README.md](README.md)

![screenshot](images/screenshot.png)

[**Brilliant Chess**](https://wdeloo.github.io/Brilliant-Chess) 是一个 **免费** 的 **开源** 棋局分析应用，目标是尽量接近 **Chess.com** 的分析体验。

## 功能说明

- Summary 面板会显示双方的 **Average CPL**（平均子力损失，centipawn loss）。
- CPL 是根据 Stockfish 对每一步的评估值计算的，不会把 mate 评价算进去。
- 仓库里提供了一个命令行校验脚本：

```bash
node scripts/validate-cpl.mjs scripts/sample.pgn
```

如果你想临时调整 Stockfish 深度，可以设置环境变量：

```bash
$env:STOCKFISH_DEPTH=18
node scripts/validate-cpl.mjs scripts/sample.pgn
```

## 先理解部署结构

这个项目最重要的一点是：

- 浏览器应该访问前端
- 前端再通过 `/api/` 去访问后端
- 不要让浏览器直接依赖后端的内网地址

默认生产结构如下：

- 前端：`3000`
- 后端：`9080`
- 对外入口：`80/443`

### 你会用到的环境变量

- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_BASE_PATH`

其中：

- `NEXT_PUBLIC_BACKEND_URL` 表示前端运行时使用的 API 基路径，通常是 `/api` 或 `http://localhost:9080/api`
- `NEXT_PUBLIC_BASE_PATH` 只在你把应用挂在子路径下时才需要，比如 `https://example.com/chess`

后端认证还需要：

- `JWT_SECRET`：必须设置，用来签发登录 session cookie
- `CORS_ORIGINS`：可选，逗号分隔的开发来源，例如 `http://localhost:3000`

示例：

```bash
# 部署在站点根路径时，保持为空
NEXT_PUBLIC_BASE_PATH=

# 部署在 /chess 子路径时
NEXT_PUBLIC_BASE_PATH=/chess
```

## Docker 部署

如果你想要最省心的方式，直接用 Docker。

### 第 1 步：拉代码

```bash
git clone https://github.com/wdeloo/Brilliant-Chess.git
cd Brilliant-Chess
```

### 第 2 步：准备 `.env`

先创建一个 `.env` 文件：

```bash
echo "NEXT_PUBLIC_BASE_PATH=" > .env
```

如果你有后端相关配置，也可以一起写进去，例如：

```bash
JWT_SECRET=replace-with-a-long-random-string
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
GEMINI_API_KEY=your-key-here
DB_TYPE=sqlite
DB_DSN=data/chess.db
```

### 第 3 步：启动整套服务

```bash
docker compose up -d --build
```

### 第 4 步：访问地址

- 前端：`http://你的服务器:3000`
- 后端：`http://你的服务器:9080`

### 第 5 步：放一个公网反向代理

建议把公网入口放在 Nginx、Caddy 或 Cloudflare 上，然后把浏览器流量转到前端的 `3000` 端口。

### Docker 镜像怎么选

- `frontend/Dockerfile`：默认生产镜像，走后端，体积更小，适合正常联机部署
- `frontend/Dockerfile.full`：完整版前端镜像，保留本地 / 离线引擎模式

如果你使用 `docker compose`，默认走的是前者，也就是更小的生产前端。

### 安全模型

认证采用 cookie 方式：

- 登录后后端会下发 HttpOnly session cookie
- 同站点请求时浏览器会自动携带这个 cookie
- 前端不会把 JWT 存到 localStorage，也不会把它暴露给 JavaScript
- 所有受保护接口仍然由后端做最终鉴权

前端页面当然还是可以被绕过，但真正决定“是否允许访问”的是后端。

## Nginx / Caddy 反向代理

这里最重要的规则只有两条：

- `/` 转发到前端
- `/api/` 转发到后端

### 情况 1：前端和后端都在同一台服务器上

假设：

- 前端跑在 `127.0.0.1:3000`
- 后端跑在 `127.0.0.1:9080`

#### Nginx 示例

```nginx
server {
	listen 80;
	server_name chess.example.com;

	location /api/ {
		proxy_pass http://127.0.0.1:9080;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
	}

	location / {
		proxy_pass http://127.0.0.1:3000;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
	}
}
```

#### Caddy 示例

```caddy
chess.example.com {
	handle /api/* {
		reverse_proxy 127.0.0.1:9080
	}

	handle {
		reverse_proxy 127.0.0.1:3000
	}
}
```

### 情况 2：前端是静态文件，Nginx 直接托管

如果你已经把前端构建成静态文件并放到了磁盘上，比如 `/var/www/brilliant-chess`，那么可以这样写。

#### Nginx 静态站点示例

```nginx
server {
	listen 80;
	server_name chess.example.com;
	root /var/www/brilliant-chess;
	index index.html;

	location /api/ {
		proxy_pass http://127.0.0.1:9080;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location / {
		try_files $uri $uri/ /index.html;
	}
}
```

#### Caddy 静态站点示例

```caddy
chess.example.com {
	@api path /api/*
	handle @api {
		reverse_proxy 127.0.0.1:9080
	}

	root * /var/www/brilliant-chess
	try_files {path} /index.html
	file_server
}
```

## 不使用 Docker 的前端部署

前端本质上是一个静态导出，所以你完全可以：

1. 在本地构建前端
2. 拿到 `frontend/dist`
3. 把这个目录放到 Nginx、Caddy、Cloudflare Worker/Pages、或者任意静态托管环境里

### 第 1 步：构建前端

如果你希望前端通过 `/api/` 去调用后端，就在构建前设置：

```bash
cd frontend
$env:NEXT_PUBLIC_BACKEND_URL="/api"
npm install
npm run build
```

这时会生成 `frontend/dist`。

### 第 2 步：把 `dist` 放到你的静态站点目录

例如：

```bash
/var/www/brilliant-chess
```

### 第 3 步：配置反向代理

静态站点只负责前端页面；

- `/` 提供静态文件
- `/api/` 转发到后端

如果你想要离线 / 本地引擎模式，那就不要设置 `NEXT_PUBLIC_BACKEND_URL`，直接构建并托管 `frontend/dist` 即可。

## Cloudflare Worker / Pages 部署

现在 Cloudflare Worker 和 Cloudflare Pages 都支持直接构建和部署静态资产。如果你想把前端部署在 Cloudflare Worker 或 Pages 上，并统一代理 API 请求，可以采用以下配置：

### 方案 1：直接在 Worker 中托管前端并代理 API（推荐）

你可以开启 Cloudflare Workers 的静态资产托管（Assets），然后在 Worker 脚本中只代理 `/api/` 路由：

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 如果是 API 请求，代理到后端
    if (url.pathname.startsWith("/api/")) {
      const targetOrigin = new URL(env.BACKEND_ORIGIN);
      const targetUrl = new URL(request.url);
      targetUrl.protocol = targetOrigin.protocol;
      targetUrl.hostname = targetOrigin.hostname;
      targetUrl.port = targetOrigin.port;

      return fetch(new Request(targetUrl, request));
    }

    // 其它请求直接服务静态资产（Worker 会自动从绑定的资产目录中读取并返回）
    return env.ASSETS.fetch(request);
  },
};
```

#### 环境变量配置

- `BACKEND_ORIGIN`：后端地址，例如 `https://api.example.com`

---

### 方案 2：使用 Worker 路由到独立的 Pages/静态源站与后端

如果你已经把前端部署到独立的静态源站（例如独立的 Cloudflare Pages 域名），想使用 Worker 进行边缘路由：

- `/api/*` -> 后端源站
- 其它所有路径 -> 前端静态源站

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const targetOrigin = url.pathname.startsWith("/api/")
      ? new URL(env.BACKEND_ORIGIN)
      : new URL(env.FRONTEND_ORIGIN);

    const targetUrl = new URL(request.url);
    targetUrl.protocol = targetOrigin.protocol;
    targetUrl.hostname = targetOrigin.hostname;
    targetUrl.port = targetOrigin.port;

    return fetch(new Request(targetUrl, request));
  },
};
```

#### 环境变量配置

- `FRONTEND_ORIGIN`：前端静态站点地址，例如 `https://pages.example.com`
- `BACKEND_ORIGIN`：后端地址，例如 `https://api.example.com`

---

### Cloudflare Pages 部署与构建配置

如果你直接在 Cloudflare Pages 面板中关联 GitHub 仓库并创建项目，其配置如下：

1. **框架预设 (Framework Preset)**：选择 `None` (或者 `Next.js (Static HTML Export)`)
2. **构建根目录 (Root Directory)**：`frontend`
3. **构建命令 (Build Command)**：`npm run build`
4. **输出目录 (Build Output Directory)**：`dist` (注意：Next.js 在本项目中配置的静态导出目录是 `dist`)
5. **环境变量 (Environment Variables)**：
   - 如果你想使用代理的后端（例如配合上述 Worker 代理方案），设置环境变量 `NEXT_PUBLIC_BACKEND_URL` 为 `/api`。

## 常见问题

### 1. 页面能打开，但引擎不工作

先检查下面几件事：

- `/api/` 是否真的转发到了后端
- 前端构建时是否设置了正确的 `NEXT_PUBLIC_BACKEND_URL`
- 如果你把应用挂在子路径下，是否设置了 `NEXT_PUBLIC_BASE_PATH`
- 反向代理是否保留了 WebSocket upgrade

### 2. 页面是空白的，或者静态资源 404

通常是下面几个原因：

- 站点根目录不是 `frontend/dist`
- `basePath` 和实际部署路径不一致
- SPA 路由没有配置 `index.html` 回退

### 3. 我到底该用哪种部署方式

- 想省事：直接用 Docker
- 想自己掌控 Nginx/Caddy：本地构建前端，再放到静态站点后面
- 想做边缘路由：用 Cloudflare Worker/Pages

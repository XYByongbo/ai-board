# ai-board 傻瓜式部署教程

> 目标：把本项目部署到服务器 `69.5.21.175`，通过域名 `http://yongbo.online/board/` 访问。
> 本文每一步都标了执行位置：
> - 【本地终端】= 你自己的 Mac 上打开「终端」App 执行
> - 【服务器】= 先 `ssh` 登录服务器后再执行
> - 【域名商网站】= 在浏览器里登录你的域名控制台操作

---

## 准备清单（开始前确认）

- [ ] 有一台云服务器，公网 IP = `69.5.21.175`，系统是 Linux（Ubuntu / CentOS 均可）
- [ ] 有域名 `yongbo.online`，能在域名商后台改 DNS 解析
- [ ] 你本地是 Mac，已装好 Node（项目已 `npm install` 过）
- [ ] 以下三个文件**已经改好**（无需再动）：
  - `vite.config.ts` → 已设 `base: '/board/'`
  - `deploy/deploy.sh` → 已填 `SERVER="root@69.5.21.175"`、`REMOTE_DIR="/var/www/ai-board"`
  - `deploy/nginx.conf` → 已是子路径 `/board` 部署配置

---

## 步骤 0（建议）：先确认能连上服务器

【本地终端】执行：

```bash
ssh root@69.5.21.175
```

- 如果提示输入密码，输入服务器 root 密码，能进到命令行就说明网络和账号 OK。
- 进去后输入 `exit` 退出。

> 如果连不上：检查服务器是否开机、安全组是否放行 22 端口、IP 是否正确。

---

## 步骤 1：服务器安装 Nginx

【服务器】先登录：

```bash
ssh root@69.5.21.175
```

然后按系统选一条执行：

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y nginx

# CentOS
sudo yum install -y nginx && sudo systemctl enable --now nginx
```

验证安装成功：

```bash
nginx -v
```

看到 `nginx version: ...` 就 OK。输入 `exit` 退出。

---

## 步骤 2：本地配置 SSH 免密登录（只需做一次）

【本地终端】执行：

```bash
# 1) 生成密钥（如果已有可跳过；一路回车即可）
ssh-keygen -t ed25519

# 2) 把公钥传到服务器（会让你输一次服务器密码）
ssh-copy-id root@69.5.21.175
```

测试是否免密成功：

```bash
ssh root@69.5.21.175
```

- 如果**不用输密码**直接进到服务器命令行，说明成功。
- 输入 `exit` 退出。

> 免密的作用：之后 `deploy.sh` 自动上传文件时不会反复让你输密码。

---

## 步骤 3：上传 Nginx 配置并生效

【本地终端】执行：

```bash
# 把配置传到服务器的 nginx 站点目录
scp deploy/nginx.conf root@69.5.21.175:/etc/nginx/conf.d/ai-board.conf

# 测试配置语法并重载 nginx
ssh root@69.5.21.175 "nginx -t && systemctl reload nginx"
```

看到 `nginx: configuration file ... test is successful` 和 `Reloading nginx` 就成功。

---

## 步骤 4：域名解析（在域名商后台做，不是终端）

【域名商网站】操作：

1. 登录你买 `yongbo.online` 的域名商后台（阿里云 / 腾讯云 / Cloudflare 等）。
2. 找到「DNS 解析 / 解析设置」。
3. 添加一条记录：
   - 记录类型：**A**
   - 主机记录：**@**（代表根域名 `yongbo.online`；不要用 www）
   - 记录值 / 指向：**69.5.21.175**
   - TTL：默认即可
4. 保存。

【本地终端】验证是否生效（可能要等几分钟到几小时）：

```bash
ping yongbo.online
# 或
dig yongbo.online +short
```

返回 `69.5.21.175` 说明解析已生效。

> 注：`69.5.x.x` 是境外 IP，域名**无需备案**，HTTP/HTTPS 都能直接用。

---

## 步骤 5：一键部署（核心！以后每次发版都只跑这一条）

【本地终端】进入项目目录执行：

```bash
cd /Users/xyb/Documents/workspace/ai-board
bash deploy/deploy.sh
```

脚本会自动做三件事：
1. `npm run build` → 在本地生成 `dist/` 静态文件
2. SSH 连服务器，确保目录 `/var/www/ai-board` 存在
3. 用 `rsync` 把 `dist/` 增量同步到服务器

看到结尾 `完成！刷新你的域名即可看到最新版本。` 就部署好了。

---

## 步骤 6：访问验证

打开浏览器，访问：

```
http://yongbo.online/board/
```

> ⚠️ 一定要带末尾的斜杠 `/board/`，否则样式可能加载不出来。

能看到「Token 消耗看板」页面 = 部署成功 🎉

---

## 步骤 7（可选）：上 HTTPS 加密

【服务器】登录后执行：

```bash
ssh root@69.5.21.175

# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动申请证书并改写 nginx 配置（把 yongbo.online 换成你的域名）
sudo certbot --nginx -d yongbo.online
```

按提示填邮箱、同意条款即可。完成后访问：

```
https://yongbo.online/board/
```

证书 90 天自动续期（certbot 装好后会自动加定时任务）。

---

## 常见问题排错

**① 浏览器打开 `yongbo.online/board/` 显示 404 / 找不到页面**
- 确认 Nginx 配置已上传并重载（步骤 3）。
- 确认访问地址带 `/board/`（含末尾斜杠）。
- 登录服务器看目录是否有文件：`ssh root@69.5.21.175 "ls /var/www/ai-board"`。

**② 页面能打开，但样式错乱 / JS 报错 404**
- 说明资源路径不对。本项目已在 `vite.config.ts` 设 `base: '/board/'`，重新跑 `bash deploy/deploy.sh` 即可。

**③ SSH 连接被拒绝 / 超时**
- 检查服务器安全组是否放行 **22**（SSH）、**80**（HTTP）、**443**（HTTPS）。
- 确认 nginx 在运行：`ssh root@69.5.21.175 "systemctl status nginx"`。

**④ 域名打不开，但 IP 直接访问正常**
- DNS 还没生效，等几分钟再试（用 `dig yongbo.online +short` 确认）。
- 若服务器在**中国大陆**，域名需先备案才能用 80/443；当前 `69.5.21.175` 是境外 IP，一般无需备案。

**⑤ 部署时提示 `rsync: command not found`（在服务器上）**
- 服务器装一下：`ssh root@69.5.21.175 "sudo apt install -y rsync"`。

**⑥ 部署脚本卡住要输密码**
- 没配免密，回去重做步骤 2（`ssh-copy-id`）。

---

## 以后每次更新代码的流程

1. 在本地改好代码。
2. 【本地终端】`cd /Users/xyb/Documents/workspace/ai-board && bash deploy/deploy.sh`
3. 刷新 `http://yongbo.online/board/` 即可看到新版。

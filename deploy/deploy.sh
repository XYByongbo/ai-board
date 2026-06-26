#!/usr/bin/env bash
# 本地一键部署：构建 + 把 dist 上传到服务器
# 用法：改下面两个变量，然后在项目根目录执行  bash deploy/deploy.sh
set -euo pipefail

# ===== 改成你的 =====
SERVER="root@SERVER_IP"          # 服务器登录：用户@公网IP，例如 root@1.2.3.4
REMOTE_DIR="/var/www/ai-board"   # 服务器上的站点目录（与 nginx.conf 里的 root 一致）
# ===================

cd "$(dirname "$0")/.."

echo "==> 1/3 构建 dist ..."
pnpm build

echo "==> 2/3 确保服务器目录存在 ..."
ssh "$SERVER" "mkdir -p '$REMOTE_DIR'"

echo "==> 3/3 上传 dist 到 $SERVER:$REMOTE_DIR ..."
if command -v rsync >/dev/null 2>&1; then
  # 增量同步并删除服务器上多余的旧文件，保持目录干净
  rsync -avz --delete dist/ "$SERVER:$REMOTE_DIR/"
else
  ssh "$SERVER" "rm -rf '$REMOTE_DIR'/*"
  scp -r dist/* "$SERVER:$REMOTE_DIR/"
fi

echo "==> 完成！刷新你的域名即可看到最新版本。"

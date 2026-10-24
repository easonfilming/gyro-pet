# 陀螺桌宠（gyro-pet）

基于红黑六边形盾徽 Logo 的 3D 陀螺 Windows 桌面宠物，Electron 便携应用。

## 玩法

| 操作 | 效果 |
| --- | --- |
| 鼠标快速划过陀螺 | 抽打一次：+5 秒狂转（可累计），HITs +1，整曲配乐循环播放 |
| 鞭打！按钮 | 等同抽打一次 |
| 制停按钮 | 清空狂转时间，急刹减速，配乐淡出 |
| 按住陀螺缓慢拖动 | 移动桌宠窗口位置 |
| 悬停滚轮 / 右键菜单-放大缩小 | 调整桌宠大小（0.6×–2.5×，自动记忆） |
| 右键陀螺 | 菜单：声音 / 缩放 / 置顶 / 退出 |

- HITs 计数每次启动归零；静音与大小设置本地保留。
- 彩蛋：单次旋转中累计抽满 **369** 下，背景浮现内置照片（人脸完整露出，陀螺自动让位到右侧），旋转结束或制停后收起。

## 构建

依赖：Windows x64（构建机无需安装 Node，`.tools/` 内置便携版，不入库）。

```bash
npm install               # 首次（走 npmmirror 镜像）
npx electron-builder --win portable
# 产物：dist/陀螺桌宠.exe（单文件便携版，双击即用）
```

开发调试：`npm start`。

### 本机构建备注（非管理员环境）

- winCodeSign 缓存包含 macOS 符号链接，非管理员解压会失败；已通过本地镜像（`.tools/mirror/`，不入库）提供剔除 darwin 后的补丁包，并等长替换 `node_modules/app-builder-bin/win/x64/app-builder.exe` 内置的 sha512 校验值。换机器重新 `npm install` 后需重做这两步，或以管理员身份运行一次构建。

## 结构

- `main.js` — 主进程：透明置顶无边框窗口、自定义 `app://` 协议、托盘、右键菜单、窗口拖动/缩放 IPC
- `preload.js` — 上下文桥
- `pet.html` — 渲染层全部逻辑（自包含）：three.js 六棱陀螺建模、竖直竖柄棱柱、鞭子轨迹判定与平滑拖尾、WebAudio 合成音效 + 内嵌整曲配乐（base64）、HITs 计数牌、369 彩蛋
- `vendor/three.module.min.js` — 本地 three.js（0.160.0）
- `build/icon.png` — 应用图标

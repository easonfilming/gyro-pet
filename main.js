const { app, BrowserWindow, ipcMain, Menu, Tray, protocol, net, nativeImage } = require("electron");
const path = require("path");

// 自定义 app:// 协议：让渲染进程能以标准源加载本地文件（ES 模块需要）
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

let win = null;
let tray = null;
let topmost = true;

function createWindow() {
  win = new BrowserWindow({
    width: 320,
    height: 400,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    fullscreenable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadURL("app://bundle/pet.html");
  win.on("closed", () => { win = null; });
}

function showContextMenu() {
  Menu.buildFromTemplate([
    { label: "声音", type: "checkbox", checked: !muted(), click: () => {
      win?.webContents.send("toggle-muted");
    } },
    { type: "separator" },
    { label: "放大", click: () => win?.webContents.send("scale-step", 1) },
    { label: "缩小", click: () => win?.webContents.send("scale-step", -1) },
    { type: "separator" },
    { label: "置顶显示", type: "checkbox", checked: topmost, click: () => {
      topmost = !topmost;
      win?.setAlwaysOnTop(topmost, "screen-saver");
    } },
    { type: "separator" },
    { label: "退出", click: () => app.quit() },
  ]).popup({ window: win });
}

// 渲染进程报告当前静音状态，供菜单勾选显示
let muted = () => win ? win.__muted === true : false;
ipcMain.on("context-menu", (_e, opts) => {
  muted = () => !!(opts && opts.muted);
  showContextMenu();
});
ipcMain.on("set-muted", (_e, v) => { win.__muted = v === true; });
ipcMain.on("drag-window", (_e, dx, dy) => {
  if (!win || typeof dx !== "number" || typeof dy !== "number") return;
  const [x, y] = win.getPosition();
  win.setPosition(Math.round(x + dx), Math.round(y + dy));
});
// 按缩放系数调整窗口大小，保持中心不动
const BASE_W = 320, BASE_H = 400;
ipcMain.on("resize-pet", (_e, scale) => {
  if (!win || typeof scale !== "number") return;
  const w = Math.max(160, Math.round(BASE_W * scale));
  const h = Math.max(200, Math.round(BASE_H * scale));
  const [x, y] = win.getPosition();
  const [cw, ch] = win.getSize();
  win.setBounds({
    x: Math.round(x + (cw - w) / 2),
    y: Math.round(y + (ch - h) / 2),
    width: w,
    height: h,
  });
});

app.whenReady().then(() => {
  protocol.handle("app", (request) => {
    const { pathname } = new URL(request.url);
    const file = path.join(__dirname, decodeURIComponent(pathname));
    return net.fetch(require("url").pathToFileURL(file).toString());
  });
  createWindow();

  // 托盘图标与菜单
  const icon = nativeImage.createFromPath(path.join(__dirname, "build", "icon.png"));
  tray = new Tray(icon);
  tray.setToolTip("陀螺桌宠");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "显示 / 隐藏", click: () => {
      if (!win) return createWindow();
      win.isVisible() ? win.hide() : (win.show(), win.setAlwaysOnTop(topmost, "screen-saver"));
    } },
    { type: "separator" },
    { label: "退出", click: () => app.quit() },
  ]));
});

app.on("window-all-closed", () => app.quit());

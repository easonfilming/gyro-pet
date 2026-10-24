const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("petAPI", {
  showContextMenu: (opts) => ipcRenderer.send("context-menu", opts),
  reportMuted: (v) => ipcRenderer.send("set-muted", v),
  onToggleMuted: (cb) => ipcRenderer.on("toggle-muted", () => cb()),
  dragBy: (dx, dy) => ipcRenderer.send("drag-window", dx, dy),
  resizePet: (scale) => ipcRenderer.send("resize-pet", scale),
  onScaleStep: (cb) => ipcRenderer.on("scale-step", (_e, dir) => cb(dir)),
});

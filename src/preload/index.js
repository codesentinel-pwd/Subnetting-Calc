import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  setPin: (v) => ipcRenderer.send('toggle-pin', v),
  setWidth: (w) => ipcRenderer.send('set-width', w)
})
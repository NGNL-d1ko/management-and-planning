const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('mapDesktop', {
  isElectron: true,
});

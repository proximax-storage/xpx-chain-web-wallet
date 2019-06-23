const {
  app,
  BrowserWindow
} = require('electron')

let win;

function createWindow() {
  // Create the browser window.
  //example https://angularfirebase.com/lessons/desktop-apps-with-electron-and-angular/
  win = new BrowserWindow({
    width: 1024,
    height: 600,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/xpx-catapult-web-wallet-cow/assets/favicon.ico`
  })


  // win.loadURL(`file://${__dirname}/dist/proxiWallet/index.html`)
  win.loadURL('http://localhost:4200/')
  //// uncomment below to open the DevTools.
  win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })

  win.loadFile('dist/xpx-catapult-web-wallet-cow/index.html');
}

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})

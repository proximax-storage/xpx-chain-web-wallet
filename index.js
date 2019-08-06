
const electron = require('electron')
const {app, BrowserWindow} = electron
let win;
function createWindow() {
  // Create the browser window.
  //example https://angularfirebase.com/lessons/desktop-apps-with-electron-and-angular/
  win = new BrowserWindow({
    width: 1024,
   //  height: 600,
    backgroundColor: '#ffffff',
    frame: true,
     icon: `file://${__dirname}/dist/proximax-sirius-wallet/assets/favicon.ico`
  })

  win.loadFile(`dist/proximax-sirius-wallet/index.html`);
  //win.loadURL('http://localhost:4200/');
   //win.loadFile(`index.html`);
    //// uncomment below to open the DevTools.
     win.webContents.closeDevTools();

    // Event when the window is closed.
    win.on('closed', function () {
       win = null
    })
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

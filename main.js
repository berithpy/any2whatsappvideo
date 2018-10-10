const { app, BrowserWindow, ipcMain, shell } = require('electron')
const fs = require("fs");
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')

const encoder = ffmpeg()
encoder.setFfmpegPath(path.join(__dirname,'ffmpeg.exe'))
encoder.setFfprobePath(path.join(__dirname,'ffprobe.exe'))


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 450,
    height: 450,
    icon: path.join(__dirname, 'assets/icon.png')
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//ffmpeg -i input.mp4 -c:v libx264 -profile:v baseline -level 3.0 -pix_fmt yuv420p -strict -2 output.mp4

function reencode(filepath, name) {
  encoder.clone().input(`${filepath}${name}`).outputOptions(
    '-c:v', 'libx264',
    '-profile:v', 'baseline',
    '-level', '3.0',
    '-pix_fmt', 'yuv420p',
    '-strict','-2',
    '-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2'
  )
  .output(`${filepath}fixed_${name}`)
  .on('start', function() {
    console.log('re-encoding');
    //Here we should write a callback to the renderer
  })
  .on('end', function() {
    console.log('done');
    win.webContents.send('encoding-succesful', 'yay')
  })
  .on('progress', function(progress) {
    win.webContents.send('encoding-progress', progress.percent)
  })
  .run();
}

ipcMain.on('video-dropped', (event, arg) => {
  const values = arg.split('@@@')
  let name = values[0]
  let path = values[1]
  console.log(name, path)
  try {
    reencode(path, name)
  } catch (error) {
    win.webContents.send('main-error', true)
  }
})

ipcMain.on('folder-to-open', (event, path) => {
  shell.showItemInFolder(path)
})
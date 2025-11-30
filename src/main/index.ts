import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs/promises'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null
let pendingFile: { content: string; filePath: string } | null = null

async function loadFileFromArgv(
  argv: string[]
): Promise<{ content: string; filePath: string } | null> {
  // In production on Windows, the first argument is the executable, the second is often the file path.
  // We skip this in dev to avoid picking up dev server args.
  if (!is.dev && process.platform === 'win32' && argv.length >= 2) {
    const filePath = argv[1]
    // Basic validation to ensure it's likely a file path and not a flag
    if (filePath && !filePath.startsWith('-')) {
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        return { content, filePath }
      } catch (error) {
        console.error('Failed to read initial file:', error)
      }
    }
  }
  return null
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false, // Disables native window chrome
    autoHideMenuBar: true,
    backgroundColor: '#1e1e2e',
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for dev or load file for prod
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // --- Window Control Handlers ---
  ipcMain.on('window-minimize', () => mainWindow?.minimize())
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.on('window-close', () => mainWindow?.close())
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', async (_, argv) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      // Check for file in the new arguments
      const fileData = await loadFileFromArgv(argv)
      if (fileData) {
        mainWindow.webContents.send('open-file-content', fileData)
      }
    }
  })

  app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.fezcode.nocturnote')

    // Check initial file on startup
    pendingFile = await loadFileFromArgv(process.argv)

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // --- File I/O Handlers ---

    // Handle Save
    ipcMain.handle('save-file', async (_, { content, filePath }) => {
      try {
        let targetPath = filePath
        // If no path provided, show Save Dialog
        if (!targetPath) {
          const { canceled, filePath: savePath } = await dialog.showSaveDialog({
            title: 'Save Note',
            defaultPath: 'Untitled.txt',
            filters: [
              { name: 'Text File', extensions: ['txt'] },
              { name: 'Markdown File', extensions: ['md'] }
            ]
          })
          if (canceled) return { success: false }
          targetPath = savePath
        }

        await fs.writeFile(targetPath, content, 'utf-8')
        return { success: true, filePath: targetPath }
      } catch (error) {
        console.error(error)
        return { success: false, error: 'Failed to save' }
      }
    })

    // Handle Open
    ipcMain.handle('open-file', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }]
        })

        if (canceled || filePaths.length === 0) return { canceled: true }

        const content = await fs.readFile(filePaths[0], 'utf-8')
        return { canceled: false, filePath: filePaths[0], content }
      } catch (error) {
        console.error(error)
        return { canceled: true, error: 'Failed to open' }
      }
    })

    // Handle Initial File Check from Renderer
    ipcMain.handle('get-initial-file', () => {
      const file = pendingFile
      pendingFile = null // Clear it
      return file
    })

    ipcMain.handle('get-app-version', () => app.getVersion())

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

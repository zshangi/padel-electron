// 1. Add BrowserWindow to the import here!
const { app, BrowserWindow } = require('electron'); 
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

let backendProcess = null;
let mainWindow = null;
let activePort = "8000";

function startBackend() {
    let backendPath;

    if (app.isPackaged) {
        backendPath = path.join(
            process.resourcesPath, 
            'padel-backend', 
            'padel-backend'
        );
    } else {
        backendPath = path.join(
            app.getAppPath(), 
            'backend', 
            'dist', 
            'padel-backend', 
            'padel-backend'
        );
    }

    console.log('Targeting backend at:', backendPath);

    backendProcess = spawn(backendPath, [activePort], {
        cwd: path.dirname(backendPath),
        shell: false,
        env: { ...process.env, PYTHONUNBUFFERED: "1", DATA_SQLITE_PATH: path.join(os.homedir(), 'data.sqlite3') }
    });

    backendProcess.stdout.on('data', (data) => console.log(`Django: ${data}`));
    backendProcess.stderr.on('data', (data) => console.error(`Django Error: ${data}`));

    backendProcess.on('error', (err) => {
        console.error('Failed to start process:', err);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1100,
        minHeight: 720,
        backgroundColor: "#ffffff",
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true,
        },
    });

    if (app.isPackaged) {
        // PRODUCTION: Inside the Resources folder of the packaged app
        const indexPath = path.join(process.resourcesPath, 'build', 'index.html');
        mainWindow.loadFile(indexPath);
    } else {
        // DEVELOPMENT: Either the React Dev Server or the local build folder
        // Option A: If React is running (npm start in frontend)
        mainWindow.loadURL('http://localhost:3000'); 

        // Option B: If you just want to load the local build folder without a server
        // mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    if (process.env.ELECTRON_OPEN_DEVTOOLS === "1") {
        mainWindow.webContents.openDevTools({ mode: "detach" });
    }
}

// THE STARTUP SEQUENCE
app.on('ready', () => {
    // 1. Start the Django process
    startBackend();

    // 2. Actually create the window! 
    // We give it a tiny delay to ensure Django starts listening
    setTimeout(() => {
        createWindow();
    }, 1000); 
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    if (backendProcess) {
        console.log("Shutting down backend...");
        backendProcess.kill();
    }
});
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const net = require("net");
const { spawn } = require("child_process");

let djangoProcess = null;
let djangoPort = null;
let mainWindow = null;
let pythonCommand = null;
let startupPromise = null;
let isQuitting = false;

function getMacPythonCandidates() {
  const candidates = [
    "/Library/Frameworks/Python.framework/Versions/Current/bin/python3",
    "/opt/homebrew/bin/python3",
    "/usr/local/bin/python3",
    "/usr/bin/python3",
  ];
  const versionsDir = "/Library/Frameworks/Python.framework/Versions";

  if (fs.existsSync(versionsDir)) {
    const versions = fs
      .readdirSync(versionsDir)
      .filter((version) => /^\d+(\.\d+)?$/.test(version))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    for (const version of versions) {
      candidates.push(path.join(versionsDir, version, "bin", "python3"));
    }
  }

  return candidates;
}

function getPythonCandidates() {
  if (process.env.PYTHON) return [process.env.PYTHON];
  if (process.platform === "win32") return ["python"];
  if (process.platform === "darwin") {
    return [...getMacPythonCandidates(), "python3", "python"];
  }
  return ["python3", "python"];
}

function unique(values) {
  return [...new Set(values)];
}

function getProjectRoot() {
  return app.getAppPath();
}

function getBackendDir() {
  return path.join(getProjectRoot(), "backend");
}

function getBundledBackendExecutable() {
  const executableName = process.platform === "win32" ? "23rd-padel-backend.exe" : "23rd-padel-backend";
  const executablePath = path.join(
    getBackendDir(),
    "dist",
    "23rd-padel-backend",
    executableName
  );

  return fs.existsSync(executablePath) ? executablePath : null;
}

function runChild(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function resolvePythonCommand() {
  if (pythonCommand) return pythonCommand;

  const failures = [];

  for (const candidate of unique(getPythonCandidates())) {
    try {
      const result = await runChild(candidate, [
        "-c",
        "import django; import rest_framework; import rest_framework_simplejwt",
      ]);

      if (result.code === 0) {
        pythonCommand = candidate;
        return pythonCommand;
      }

      failures.push(`${candidate}: ${result.stderr.trim() || `exited with code ${result.code}`}`);
    } catch (error) {
      failures.push(`${candidate}: ${error.message}`);
    }
  }

  const projectRoot = getProjectRoot();
  const requirements = path.join(projectRoot, "backend", "requirements.txt");

  throw new Error(
    [
      "Could not find a Python 3 installation with the Django dependencies installed.",
      "",
      "Tried:",
      ...failures.map((failure) => `- ${failure}`),
      "",
      `Install them with: python3 -m pip install -r "${requirements}"`,
      "If you use a custom Python, launch with PYTHON=/path/to/python3.",
    ].join("\n")
  );
}

async function resolveBackendCommand() {
  const bundledBackend = getBundledBackendExecutable();

  if (bundledBackend) {
    return {
      command: bundledBackend,
      argsPrefix: [],
      displayName: bundledBackend,
    };
  }

  const python = await resolvePythonCommand();
  const managePy = path.join(getBackendDir(), "manage.py");

  return {
    command: python,
    argsPrefix: [managePy],
    displayName: `${python} manage.py`,
  };
}

function getFreePort(host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, host, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function waitForPort(port, host = "127.0.0.1", timeoutMs = 30000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.connect({ port, host }, () => {
        socket.end();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Django did not start on ${host}:${port} within ${timeoutMs}ms`));
          return;
        }
        setTimeout(tryConnect, 300);
      });
    };

    tryConnect();
  });
}

function buildBackendEnv() {
  const userData = app.getPath("userData");
  fs.mkdirSync(userData, { recursive: true });
  const projectRoot = getProjectRoot();

  return {
    ...process.env,
    ELECTRON_OFFLINE: "1",
    DATA_USE_SQLITE: "1",
    DATA_SQLITE_PATH: path.join(userData, "business-data.sqlite3"),
    DJANGO_SQL_DATABASE: path.join(userData, "auth.sqlite3"),
    DJANGO_SECRET_KEY: process.env.DJANGO_SECRET_KEY || "electron-offline-development-secret",
    DJANGO_DEBUG: process.env.DJANGO_DEBUG || "1",
    DJANGO_ALLOWED_HOSTS: process.env.DJANGO_ALLOWED_HOSTS || "localhost 127.0.0.1",
    FRONTEND_BUILD: path.join(projectRoot, "frontend", "build"),
    OFFLINE_ADMIN_USERNAME: process.env.OFFLINE_ADMIN_USERNAME || "admin",
    OFFLINE_ADMIN_PASSWORD: process.env.OFFLINE_ADMIN_PASSWORD || "admin12345",
  };
}

async function runManage(args, env) {
  const backendDir = getBackendDir();
  const backendCommand = await resolveBackendCommand();

  const result = await runChild(backendCommand.command, [...backendCommand.argsPrefix, ...args], {
    cwd: backendDir,
    env,
  });

  if (result.code !== 0) {
    const output = result.stderr.trim() || result.stdout.trim();
    throw new Error(
      [`${backendCommand.displayName} ${args.join(" ")} exited with code ${result.code}`, output]
        .filter(Boolean)
        .join("\n\n")
    );
  }
}

async function startDjango(port) {
  if (djangoProcess && djangoPort) return djangoPort;

  const env = buildBackendEnv();
  const backendDir = getBackendDir();
  const backendCommand = await resolveBackendCommand();

  await runManage(["migrate", "--noinput"], env);
  await runManage(["bootstrap_offline"], env);

  const child = spawn(
    backendCommand.command,
    [...backendCommand.argsPrefix, "runserver", `127.0.0.1:${port}`, "--noreload"],
    {
      cwd: backendDir,
      env,
      stdio: "inherit",
      windowsHide: true,
    }
  );

  djangoProcess = child;
  djangoPort = port;

  child.on("exit", () => {
    if (djangoProcess === child) {
      djangoProcess = null;
      djangoPort = null;
    }
  });

  await waitForPort(port);
  return port;
}

function createWindow(baseUrl) {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#ffffff",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow = window;

  window.on("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });

  window.loadURL(baseUrl);

  if (process.env.ELECTRON_OPEN_DEVTOOLS === "1") {
    window.webContents.openDevTools({ mode: "detach" });
  }
}

function stopDjango() {
  if (!djangoProcess) return;
  djangoProcess.kill();
  djangoProcess = null;
  djangoPort = null;
}

function showStartupError(error) {
  dialog.showErrorBox(
    "23rd Padel could not start",
    error.message
  );
  app.quit();
}

async function startApp() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  if (startupPromise) return startupPromise;

  startupPromise = (async () => {
    try {
      const port = await getFreePort();
      const activePort = await startDjango(port);

      if (!isQuitting) {
        createWindow(`http://127.0.0.1:${activePort}/`);
      }
    } catch (error) {
      showStartupError(error);
    } finally {
      startupPromise = null;
    }
  })();

  return startupPromise;
}

app.whenReady().then(startApp);

app.on("activate", () => {
  startApp();
});

app.on("window-all-closed", () => {
  stopDjango();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
  stopDjango();
});

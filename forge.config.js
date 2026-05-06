module.exports = {
  packagerConfig: {
    asar: false,
    name: "23rd Padel Offline",
    extraResource: [
      './backend/dist/padel-backend',
      './frontend/build'
    ],
    ignore: [
      /^\/\.idea(\/|$)/,
      /^\/\.git(\/|$)/,
      /^\/conf(\/|$)/,
      /^\/env\.dev(\/|$)/,
      /^\/node_modules(\/|$)/,
      /^\/out(\/|$)/,
      /^\/frontend\/node_modules(\/|$)/,
      /^\/frontend\/src(\/|$)/,
      /^\/frontend\/public(\/|$)/,
      /^\/frontend\/README\.md$/,
      /^\/frontend\/package-lock\.json$/,
      /^\/frontend\/Dockerfile/,
      /^\/backend\/build(\/|$)/,
      /^\/backend\/.*\.spec$/,
      /^\/backend\/__pycache__(\/|$)/,
      /^\/backend\/.*\.sqlite3$/,
      /__pycache__/,
      /\.pyc$/,
      /\.DS_Store$/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: {
        name: "23rd Padel Offline",
        overwrite: true,
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [],
};

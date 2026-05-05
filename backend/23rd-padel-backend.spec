# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_submodules

hiddenimports = []
hiddenimports += collect_submodules('backend')
hiddenimports += collect_submodules('utils')

for package in [
    'api.authenticate',
    'api.category',
    'api.categorycontent',
    'api.couch',
    'api.court',
    'api.member',
    'api.reserved',
    'api.setting',
    'api.subcategory',
]:
    hiddenimports += collect_submodules(package)

hiddenimports += [
    'api.urls',
    'api.authenticate.migrations.0001_initial',
    'api.authenticate.management.commands.bootstrap_offline',
]


a = Analysis(
    ['manage.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='23rd-padel-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='23rd-padel-backend',
)

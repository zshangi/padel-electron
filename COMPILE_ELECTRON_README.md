


## In folder backend

Go to the backend folder and ideally use a virtual environment 

1. Install packages 

```
pip install -r requirements.txt
```

2. Compile the server app 
```
pyinstaller --noconfirm --onedir --console --name "padel-backend" \
--collect-submodules api \
--add-data "api:api" \
--add-data "backend:backend" \ 
--add-data "utils:utils" \ 
--add-data "config.py:." \
run_backend.py
```

This command would create a binary of the server.

## In folder frontend

1. Compile the frontend 

```
npm run build
```

## In the main folder 

1. Compile the electron app 
```
npm run package
```

I think this is instruction for the MacOS version of the app.



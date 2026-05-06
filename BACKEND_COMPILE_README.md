
## To compile the backend 

# Installed packages

1. You need to install 

    - pyinstaller 
    - waitress , I have added waitress to the requirements.txt

2. Make the modification I have done to the settings.py file. There is a IF_FROZEN variable that should if things are running via pyinstalelr packages
3. Created run_backend.py file to serve the server via waitress
4. Run this command to create a binary for the backend server (You should be in the backend folder):
    - MAC 
    ```
    pyinstaller --noconfirm --onedir --console --name "padel-backend" --add-data "api:api" --add-data "backend:backend" --add-data "config.py:." --add-data "utils:utils" run_backend.py
    pyinstaller --noconfirm --onedir --console --name "padel-backend" --add-data "api:api" --add-data "backend:backend" --add-data "utils:utils" --add-data "config.py:." run_backend.py
    ```
5. This would create a file in ./dist/padel-backend called padel-backend which is self contained and run the backend.





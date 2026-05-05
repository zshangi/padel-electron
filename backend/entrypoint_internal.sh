#!/bin/bash

python manage.py makemigrations authenticate
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

FROM python:3.10-slim

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2 dependencies
RUN apt update
RUN apt -y install build-essential libwrap0-dev libssl-dev libc-ares-dev \
    uuid-dev xsltproc python3-dev musl-dev ffmpeg libsm6 libxext6 

RUN pip install --upgrade pip setuptools wheel
COPY ./requirements.txt .
RUN pip install -r requirements.txt

#COPY ./static /usr/src/static

COPY . .

#!/bin/bash

DATEVAR=$1

echo ${DATEVAR}

cat db_data_${DATEVAR}.log | docker exec --interactive 23rd-padel-db_data-1 psql -U padel -d padel
cat db_auth_${DATEVAR}.log | docker exec --interactive 23rd-padel-db_auth-1 psql -U django -d django

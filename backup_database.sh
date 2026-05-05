#!/bin/bash


DATEVAR=`date +%Y%m%d`

echo ${DATEVAR}
docker exec --interactive 23rd-padel-db_data-1 pg_dump -U padel padel > db_data_${DATEVAR}.log
docker exec --interactive 23rd-padel-db_auth-1 pg_dump -U django django > db_auth_${DATEVAR}.log

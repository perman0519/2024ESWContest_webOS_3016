#!/bin/bash

# cd client/clientApp

npm install  --prefix ./client/clientApp
# npm install --prefix ./farm-server/service/ervice_plant_measure
for d in ./farm-server/services/*; do
	if [ -d "$d" ]; then
		npm install --prefix $d
	fi
done

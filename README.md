# STEPS TO START PROCESSING OF SSE ;

1.`cd <name_of_extract_folder>`

### make sure docker is installed and running

### check with sudo systemctl status docker.service

2. `docker build . -t <user-name>/image-name`

### Now to run start the docker container in interactive mode

2. `docker run -it <user-name>/image-name /bin/bash`

### NOW in the interactive shell run scripts for task1 or task2

3. `npm run task1`

#### for task2 run :

3. `npm run task2`

## NOTE: These steps are listed taking care of linux users;

## NOTE: run the npm server only after connecting to Internet

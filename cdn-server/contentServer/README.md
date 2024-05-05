The content server uses Nginx to server dash files

Steps to create data for CDN:
- Download mp4 files from TikTok into a folder called "data_profile" inside contentServer
- Run transcode with correct properties -> This becomes mdp file and a bunch of m4s (chunks of mp4)
- Run nginx to serve data to dash and abr-server

Note to setup nginx:
- run ./setup.sh to install dependencies
- run ./applychange.sh to modify config of nginx to serve videos on port 8080
The content server uses Nginx to server dash files

Steps to create data for CDN:
- Download mp4 files from TikTok
- Run transcode with correct properties (We break down to 5 second chunks) -> This becomes mdp file
- Run nginx to serve data to dash and abr-server
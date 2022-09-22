sudo certbot certonly --standalone -n -d smsbind.martian17.com
sudo cp /etc/letsencrypt/live/smsbind.martian17.com/cert.pem ./ssl/
sudo cp /etc/letsencrypt/live/smsbind.martian17.com/chain.pem ./ssl/
sudo cp /etc/letsencrypt/live/smsbind.martian17.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/smsbind.martian17.com/privkey.pem ./ssl/
sudo cp /etc/letsencrypt/live/smsbind.martian17.com/README ./ssl/
sudo chown yutaro ./*
sudo chgrp yutaro ./*
server {
    server_name ucms.mindgnite.com;

    client_max_body_size 6m;

    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:4173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /mongo {
    return 301 /mongo/;
}

location /mongo/ {
    proxy_pass http://127.0.0.1:8081;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/ucms.mindgnite.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/ucms.mindgnite.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = ucms.mindgnite.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name ucms.mindgnite.com;
    return 404; # managed by Certbot


}

#!/bin/bash
set -e

echo "Kod guncelleniyor..."
git pull origin main

echo "Docker containerlar yeniden build ediliyor..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Frontend build dosyalari container icinden Plesk dizinine kopyalaniyor..."
docker cp team-task-frontend:/usr/share/nginx/html/. /var/www/vhosts/suareconcept.com/panel.suareconcept.com/

echo "Dosya izinleri duzenleniyor..."
chown -R suareconcept:psacln /var/www/vhosts/suareconcept.com/panel.suareconcept.com/
chmod -R 755 /var/www/vhosts/suareconcept.com/panel.suareconcept.com/

echo "Deploy tamamlandi."

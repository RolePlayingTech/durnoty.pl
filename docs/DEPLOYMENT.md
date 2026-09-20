# Wdrożenie i utrzymanie

## Obecny serwer

Portal korzysta z portu loopback 3010, oddzielnej usługi `durnoty.service`, bazy `/var/lib/durnoty/durnoty.sqlite` i środowiska `/etc/durnoty.env` (root, 0600). Kod: `/var/www/durnoty.pl`. Node 24 jest w `/opt/durnoty-runtime/node_modules/node/bin/node`; nie zastępuje systemowego Node innych aplikacji. Ruch z Nginx ma stały Host i HTTPS. Sekrety nigdy nie są plikami statycznymi.

Konfiguracje do odtworzenia są w `deploy/`. Dostosuj ścieżkę Node na innym serwerze. Systemd uruchamia aplikację jako `www-data`, z zapisem ograniczonym do katalogu danych. Nie używamy sesji Astro.

## Środowisko

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3010
SITE_URL=https://durnoty.pl
DATABASE_PATH=/var/lib/durnoty/durnoty.sqlite
MUMRO_CMS_SECRET=<losowe minimum 32 znaki>
MUMRO_SITE_ID=
```

Pusty `MUMRO_SITE_ID` pozwala na konfigurację pierwszego połączenia i nadal wymaga zgodnej domeny oraz tokenu. Po połączeniu wpisz dokładny ID witryny. Zmiana środowiska wymaga restartu portalu.

## Pierwsze uruchomienie

1. Zainstaluj Node 24 i `npm ci`. Zbuduj `npm run build` i uruchom wymagane testy.
2. Utwórz `/var/lib/durnoty` dla `www-data`. Uruchom seed z `DATABASE_PATH` wskazującym tę bazę; nie seeduj przez HTTP. `seed` jest addytywny.
3. Utwórz środowisko z nowym tokenem, prawa 0600. Zainstaluj jednostkę `deploy/durnoty.service`, następnie `systemctl daemon-reload` i `systemctl enable --now durnoty`.
4. Sprawdź `http://127.0.0.1:3010/api/health`.
5. Dodaj osobny vhost HTTP z `/.well-known/acme-challenge/` wskazującym `/var/lib/durnoty-acme`. Uzyskaj certyfikat dla `durnoty.pl` oraz `www.durnoty.pl` przez `certbot certonly --webroot`.
6. Dopiero po uzyskaniu certyfikatu zainstaluj `deploy/nginx.conf`. `nginx -t` musi przejść przed reload. Nie nadpisuj pozostałych vhostów.
7. Zainstaluj timer kopii zapasowej, sprawdź pierwszą kopię. Certbot ma własny timer odnowienia; hook odnowienia przeładowuje Nginx po poprawnym teście konfiguracji.

## Aktualizacja

Pracuj na kopii/release directory przy zmianach wymagających dłuższego builda. Najpierw sprawdź różnice i czystość drzewa; nie rób resetu usuwającego lokalne prace. Zanotuj poprzedni SHA, wykonaj kopię bazy, zbuduj i przetestuj nową wersję przed przełączeniem. `systemctl restart durnoty` dotyczy tylko tego portalu. Zmiany kodu nie uruchamiają publikacji społecznościowych.

```sh
sudo systemctl status durnoty --no-pager
curl --fail https://durnoty.pl/api/health
sudo journalctl -u durnoty -n 40 --no-pager
sudo nginx -t
```

Sprawdź stronę, artykuł, nieistniejący URL (404), RSS, grafikę OG, poprawną odpowiedź 401 bez tokenu CMS, statyczne media i przekierowania HTTP/www. Nie loguj Authorization.

## Kopie i odzyskanie

Codzienny timer `durnoty-backup.timer` tworzy spójną kopię przez SQLite backup API. Zachowuje 14 ostatnich poprawnych kopii w `/var/backups/durnoty`; każda przechodzi `integrity_check`. Nie kopiuj samego pliku SQLite w trakcie zapisu bez uwzględnienia WAL.

Przy odtwarzaniu zatrzymaj tylko portal, zachowaj bieżącą bazę i pliki WAL/SHM jako zestaw do analizy, wstaw sprawdzoną kopię z prawami `www-data`, uruchom portal i sprawdź artykuły. Nie łącz kopii z dawnym WAL. Sekret oraz konfigurację `/etc` archiwizuj osobno w chronionym miejscu.

Kopie lokalne nie chronią przed utratą całego VPS. Zewnętrzny magazyn backupów pozostaje osobnym zadaniem operacyjnym wymagającym wskazania celu. Przy zmianie schematu rollback kodu może wymagać odtworzenia kompatybilnej kopii; sama zmiana SHA nie cofa migracji.

## Logi i retencja

Dla Durnot wyłączono zwykły access log. Błędy Nginx trafiają do `/var/log/nginx/durnoty.error.log` i podlegają istniejącej rotacji `/var/log/nginx/*.log`. Systemd przechowuje techniczne logi usługi zgodnie z retencją journald serwera. Aplikacja nie loguje payloadów CMS ani tokenów.

## Cel wydajności i ograniczenia

Bez globalnej hydratacji i zewnętrznych fontów. Cover WebP ma mały wariant mobilny, pozostałe obrazy to SVG, wideo ładuje tylko metadane. Wyniki gier są lokalne, nie odporne na manipulację — nie udajemy turnieju. SQLite jest odpowiedni dla jednego procesu publikacyjnego na tym VPS; skalowanie na wiele hostów wymaga osobnego magazynu i uzgodnienia idempotencji.

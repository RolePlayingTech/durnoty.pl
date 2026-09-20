# Bezpieczeństwo

Nie zgłaszaj publicznie sekretów ani danych użytkowników. Skorzystaj z prywatnego zgłoszenia podatności GitHub, jeśli jest dostępne, lub kanału kontaktowego operatora na https://roleplayingtech.pl. W publicznym issue można opisać problem bez szczegółów umożliwiających wykorzystanie.

Granice: wszystkie zapisy CMS wymagają serwerowego tokenu. HTML jest sanitizowany przed zapisem. Obrazy dopuszczają lokalne zasoby `/art/` i HTTPS, bez pobierania na serwerze. API nie korzysta z cookies do autoryzacji zapisu. Bazy testowe są izolowane.

Po ujawnieniu tokenu wymień `MUMRO_CMS_SECRET` zarówno w konfiguracji CMS Mumro, jak i w środowisku serwera, a następnie zrestartuj tylko portal. Nie publikuj logów żądań zawierających Authorization.

Regularnie uruchamiaj `npm audit`, aktualizuj zależności z lockfile i sprawdzaj CI. Audyt z daty wdrożenia nie jest gwarancją braku przyszłych podatności.

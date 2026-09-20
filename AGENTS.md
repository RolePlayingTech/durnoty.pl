# Durnoty.pl — instrukcje projektu

Przeczytaj README oraz `docs/PLAN.md`. Zachowuj gazetowy charakter i czytelność. Nie zmieniaj portalu w landing page ani nie twórz nieprawdziwych statystyk popularności.

- Wymagany Node 24. Na obecnym VPS jest pod `/opt/durnoty-runtime/node_modules/node/bin/node`; systemowy Node obsługuje inne strony i nie powinien być podmieniany przy pracy nad Durnotami.
- Zmiany ogranicz do tego projektu. Sąsiednie Mumro ma własne instrukcje, tenant boundaries i proces wdrożenia. Czytanie jego kodu nie uprawnia do restartu, migracji, publikacji ani modyfikacji jego bazy.
- Sekrety produkcyjne: `/etc/durnoty.env`. Nie loguj ich. Publiczny Git nie zawiera referencyjnej grafiki ani źródłowego prywatnego briefu.
- Baza produkcyjna: `/var/lib/durnoty/durnoty.sqlite`. Testy tylko w pamięci albo w `test-results/`; nigdy przeciw bazie produkcyjnej.
- Mutacje CMS są autoryzowane tokenem i idempotentne. Nie usuwaj sanitizacji, walidacji witryny, kontroli kolizji ani zasady zachowania istniejącego permalinku.
- Artykuły faktograficzne mają źródła. Satyra i ilustracje AI mają widoczne oznaczenie. Lokalne rekordy nie są rankingiem użytkowników.
- Gry mają obsługiwać klawiaturę i dotyk. Reduced motion, brak samoistnego dźwięku, focus i prawidłowy status 404 pozostają wymaganiami.
- Testy odpowiednie do kodu: `npm run check`, `npm run lint`, `npm test`, `npm run build`; dla zachowania strony `npm run test:e2e`. Zmiany wyłącznie w dokumentacji: sprawdzenie diff i formatowania.
- Dokumentuj bieżącą architekturę i operacje, nie dziennik rozmowy. Pomysły dla Mumro pozostają propozycjami w `docs/MUMRO-PROPOZYCJE.md`, dopóki nie zostaną przyjęte w tamtym projekcie.
- Nie publikuj automatycznie treści społecznościowych podczas deployu. Wdrożenie portalu nie jest zgodą na zmianę strategii Mumro.

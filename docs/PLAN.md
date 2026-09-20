# Durnoty.pl — plan i decyzje projektowe

## Cel

Portal do czytania, zabawy i błądzenia. Własne formaty redakcyjne, źródła przy faktach, jawne oznaczanie fikcji. Bez kont, komentarzy i sztucznych liczników popularności w pierwszym wydaniu.

## Trzy rozważone pierwsze strony

1. **Gazeta przejęta przez ptaki (wybrana).** Papierowa płachta, wielka typografia, czerwony stempel, jeden duży materiał i asymetryczne ogłoszenia. Obok redakcji działają gry. Najbliżej materiału referencyjnego, dobrze skaluje się na telefon.
2. **Dyżurka internetu.** Pulpit telegazety, program dnia, wskaźniki, numery kanałów. Zachowujemy ten pomysł dla Durnoty TV; na całym portalu zbyt ograniczałby czytelność.
3. **Urząd rzeczy niepotrzebnych.** Formularze, pieczątki i protokoły. Zachowujemy jako język laboratorium oraz generatora wymówek; jako główna konwencja szybko stałby się monotonny.

## System wizualny

Papier #f1eedf, druk #20211d, czerwień #db3427, żółć #f8d94d. Kondensowany font nagłówkowy Oswald, tekst Barlow, etykiety systemowym monospace. Fonty lokalne z licencjami. Ostre krawędzie, kreski drukarskie, półton, drobne stałe obroty. Brak losowych przesunięć układu, automatycznego dźwięku i migających efektów. Dostępność wygrywa z żartem. Ilustracja emu jest oznaczona jako ilustracja, nie dokumentacja historyczna.

## Mapa

- `/` — wydanie dzisiejsze, Durnota Dnia, gry, ostatnie artykuły.
- `/artykuly`, `/artykul/{slug}` — wyszukiwane i filtrowane archiwum, czytelny artykuł ze źródłami i Durnometrem.
- `/gry`, `/gra/{slug}` — ziemniak, quiz, refleks, pamięć, generator wymówek.
- `/tv` — lokalny odtwarzacz oryginalnych mikroprogramów z pilotem i playlistą.
- `/laboratorium`, `/rankingi`, `/o-nas`, `/prywatnosc` — eksperymenty, jawne rankingi redakcji i wyniki lokalne, zasady.
- `/losowe`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/404`.
- `/api/mumro/articles` — uwierzytelniony kontrakt custom CMS Mumro.

## Architektura

Astro 7 SSR na wydzielonym Node 24 LTS (aktualizacja po audycie zależności), TypeScript strict, małe moduły DOM zamiast hydratacji całej strony. SQLite z WAL i migracją startową, Zod na granicy API, allowlista HTML. Mumro jest panelem redakcyjnym; portal nie dubluje jego edytora i harmonogramu. Upsert według witryny i identyfikatora źródłowego, idempotency key z kontrolą konfliktu treści, sekrety poza repozytorium. Nginx + systemd + HTTPS na obecnym VPS. Konfiguracja portalu niezależna od uruchomionego Mumro.

## Kolejność wykonania

1. Fundament, oryginalne assety, źródłowe treści startowe.
2. Pierwsza strona i mobilna nawigacja, strony artykułów i SEO.
3. Pięć interakcji/grup gier, TV, osiągnięcia lokalne.
4. Kontrakt Mumro, sanityzacja, izolowane testy integracyjne.
5. Testy przeglądarkowe desktop/mobile, dokumentacja i licencja.
6. Publiczne repozytorium, wdrożenie domeny, TLS i weryfikacja z zewnątrz.

## Granice pierwszego wydania

Wyniki gier i osiągnięcia są lokalne, nigdy udawane jako globalne. Temperatura internetu jest żartem redakcyjnym. Brak publicznych komentarzy bez moderacji. Telewizja to własne krótkie animacje, nie obietnica nieistniejącej transmisji na żywo. Analityka pierwszej wersji to jawne zdarzenia DOM bez wysyłania danych; integrację pomiarową projektuje osobny dokument Mumro. Rejestracja witryny w konkretnym workspace Mumro wymaga prawidłowo wybranego workspace i uprawnionego API; sama zgodność endpointu tego nie zastępuje.

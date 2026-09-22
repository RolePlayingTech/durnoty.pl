# Durnoty.pl

**Internet nie musiał taki być.** Gazetowy portal z prawdziwymi osobliwościami, autorską satyrą, siedmioma grami i telewizorem, który nie udaje transmisji na żywo.

[Portal](https://durnoty.pl) · [Instagram (@durnoty.pl)](https://www.instagram.com/durnoty.pl/) · [Facebook (Durnoty.pl)](https://www.facebook.com/people/Durnotypl/61592992569062/) · [Plan i kierunek wizualny](docs/PLAN.md) · [Integracja Mumro](docs/MUMRO.md) · [Propozycje dla Mumro](docs/MUMRO-PROPOZYCJE.md) · [Wdrożenie](docs/DEPLOYMENT.md)

## Co działa

- Serwerowe strony artykułów, wyszukiwarka, kategorie, źródła, Durnometr i losowanie bez natychmiastowych powtórzeń.
- Siedem gier bez instalacji i logowania: Ziemniak na czas, Czerwony Guzik (reaktancja psychologiczna), quiz z wyjaśnieniami, pomiar refleksu, pamięć, generator wymówek oraz Fizyka kieszeni (rozplątywanie kabli na grafie planarnym).
- Osiągnięcia i rekordy lokalne. Bez kont, fałszywych statystyk i publicznych komentarzy.
- Durnoty TV: trzy oryginalne 15-sekundowe programy MP4, pilot, napisy, opcjonalna ciągła playlista.
- Odbiornik custom CMS zgodny z Mumro: token Bearer, walidacja, sanitizacja, draft/publish/future, idempotencja, zachowanie adresów artykułów.
- RSS, sitemap, canonical, Article JSON-LD i dynamiczne grafiki OpenGraph.
- Responsywność, sterowanie klawiaturą, widoczny fokus, ograniczone animacje i czytanie artykułów bez JavaScript.

## Lokalnie

Wymagany **Node 24 LTS**, npm i narzędzia kompilacji C++ na platformach bez gotowego modułu SQLite. `ffmpeg` jest potrzebny tylko do ponownego wygenerowania filmów; gotowe pliki są w repozytorium.

```sh
npm ci
cp .env.example .env
npm run seed
npm run dev
```

Otwórz `http://localhost:4321`. Polecenia `dev`, `start` i `seed` wczytują `.env`, jeśli istnieje. Zmienne już obecne w środowisku procesu mają pierwszeństwo. `seed` używa `DATABASE_PATH` albo `./data/durnoty.sqlite` i nie nadpisuje istniejącej zawartości. Produkcja wymaga ustawienia `MUMRO_CMS_SECRET` o długości co najmniej 32 znaków.

```sh
npm run check
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

E2E uruchamia własny serwer na porcie 4322 i osobną bazę w `test-results/`. Nie korzysta z bazy produkcyjnej. Testy obejmują desktop i emulację telefonu. Node test runner używa baz SQLite w pamięci. Zależności są przypięte w `package-lock.json`.

## Architektura

Astro 7 + adapter Node, TypeScript strict, SQLite (WAL), Zod, sanitize-html. Gry to małe moduły DOM, bez dodatkowego frameworka. Fonty Barlow i Oswald są hostowane lokalnie. Nie ma zewnętrznych skryptów analitycznych.

```text
src/pages/       strony SSR, API, RSS, sitemap i grafiki OG
src/components/ nagłówek, Durnometr, materiały redakcyjne
src/layouts/    wspólny dokument i metadane
src/lib/        kontrakty, migracja, CMS, treści i zasady gier
src/scripts/    interakcje przeglądarkowe, lokalne osiągnięcia
src/styles/     papier, druk i kontrolowana niedoskonałość
public/         lokalne ilustracje, mikroprogramy i napisy
scripts/        jawne dane startowe i odtwarzanie mediów
tests/          izolowane testy logiki, CMS oraz przeglądarki
deploy/         przykładowy Nginx, systemd, kopie zapasowe
docs/           decyzje, operacje, kontrakt i propozycje Mumro
```

Migracja 001 jest transakcyjna i oznaczona przez SQLite `user_version`. Przyszłe migracje dopisujemy jako kolejne wersje w `src/lib/db.ts`. Nie usuwamy bazy, żeby „zastosować schemat”. Baza, sekrety, oryginalne prywatne materiały referencyjne i wyniki testów są ignorowane przez Git.

## Publikowanie

Mumro pełni rolę panelu redakcyjnego. Endpoint `POST /api/mumro/articles` przyjmuje rzeczywisty kontrakt adaptera custom CMS; szczegóły i status połączenia są w [MUMRO.md](docs/MUMRO.md). Dostarczenie szkicu nie pokazuje go publicznie. Artykuł przyszły staje się widoczny o podanej godzinie bez przebudowy portalu. Portal nie uruchamia publikacji społecznościowych ani nie zmienia kolejek Mumro.

## Nowa gra albo widget

1. Dodaj metadane i slug w `src/lib/games.ts`.
2. Dodaj semantyczny interfejs w `src/pages/gra/[slug].astro` i izolowaną inicjalizację w `src/scripts/games.ts`.
3. Stan trwały obsługuj przez `storage.ts`; gra ma działać również przy niedostępnym localStorage.
4. Zapewnij dotyk, klawiaturę, czytelne wyniki i brak automatycznego dźwięku. Timery zakończ po końcu rundy. Logikę punktowania sprawdź w testach.
5. Widget w artykule musi mieć jawny identyfikator na allowliście metadanych. Nie przyjmuj wykonywalnego JavaScript ani iframe w treści CMS.

## Media i licencje

Kod oraz autorskie SVG i mikroprogramy: MIT. Fonty: SIL Open Font License (licencje w pakietach Fontsource). Kolaż emu powstał przy pomocy AI i jest wyraźnie opisany jako ilustracja. Pochodzenie wszystkich mediów opisuje [ASSETS.md](docs/ASSETS.md). Źródła naukowe i historyczne pozostają własnością ich autorów; portal zawiera linki i krótkie własne opracowania, nie przedruki.

`npm run media` odtwarza oryginalne plansze TV i domyślną kartę social. Nie wywołuje płatnych API.

## Współtworzenie

Zobacz [CONTRIBUTING.md](CONTRIBUTING.md) i [SECURITY.md](SECURITY.md). Chętnie przyjmiemy poprawkę, która czyni stronę dziwniejszą i nadal czytelną. Nie dodawaj trackerów, kont ani zewnętrznych materiałów bez jawnej decyzji i licencji.

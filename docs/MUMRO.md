# Mumro → Durnoty

## Stan i granica integracji

Portal implementuje i testuje rzeczywisty kontrakt `_publish_custom` z `app/services/website_articles_service.py` w sąsiednim projekcie Mumro. Zgodność kodu nie oznacza utworzenia konfiguracji w konkretnym workspace. Wybrana przez właściciela nazwa nowego workspace: **Durnoty**. W sesji implementacyjnej nie był dostępny zalogowany klient/API Mumro do utworzenia workspace; wymaga to dokończenia w uprawnionej sesji użytkownika. Nie modyfikowano bazy, kodu, procesów ani kolejki produkcyjnego Mumro.

## Konfiguracja witryny

W nowym workspace Durnoty dodaj witrynę:

| Pole             | Wartość                                                |
| ---------------- | ------------------------------------------------------ |
| Nazwa            | Durnoty.pl                                             |
| Witryna          | `https://durnoty.pl`                                   |
| CMS              | `custom`                                               |
| Endpoint         | `https://durnoty.pl/api/mumro/articles`                |
| Szablon artykułu | `https://durnoty.pl/artykul/{slug}`                    |
| Sekret           | wartość `MUMRO_CMS_SECRET` z `/etc/durnoty.env` na VPS |

Sekret jest lokalny, nie ma go w repozytorium ani w JS strony. Administrator przekazuje go do chronionego pola konfiguracji CMS, nigdy w czacie lub URL. Po otrzymaniu identyfikatora witryny ustaw `MUMRO_SITE_ID` w pliku środowiska Durnot i zrestartuj tylko `durnoty.service`. Oprócz tokenu portal już teraz wymusza zgodność domeny. Nie należy ponownie używać sekretu dla innych witryn.

Mumro sprawdza połączenie przez autoryzowane `GET` na tym samym endpointcie. Odpowiedź poprawna: `200 {"ok":true,"cms":"durnoty","version":1}`. Brak/zły token: 401. Kod Mumro uznaje ten sposób testu za poprawny dla custom CMS.

## Żądanie

```http
POST /api/mumro/articles
Authorization: Bearer <sekret>
Content-Type: application/json
Idempotency-Key: mumro-article-17-version-1
```

```json
{
  "article": {
    "id": 17,
    "external_id": null,
    "title": "Ptaki mają inne plany",
    "slug": "ptaki-maja-inne-plany",
    "excerpt": "Krótki lead.",
    "content_html": "<h2>Co wiemy</h2><p>Sprawdzone fakty.</p>",
    "status": "publish",
    "scheduled_at": null,
    "featured_image": {
      "url": "https://app.mumro.io/public/image-example.webp",
      "alt": "Rzetelny opis obrazu",
      "caption": "Autor i pochodzenie obrazu"
    },
    "metadata": {
      "category": "historia",
      "absurdity": 91,
      "importance": 35,
      "kind": "fact",
      "author": "Redakcja Durnot",
      "sources": [
        { "title": "Opis źródła", "url": "https://example.org/source" }
      ],
      "widget": "quiz"
    }
  },
  "site": {
    "id": 2,
    "name": "Durnoty.pl",
    "site_url": "https://durnoty.pl",
    "domain": "durnoty.pl"
  }
}
```

Przykładowe URL obrazów i źródeł są poglądowe. Użyj prawdziwych publicznych URL z Mumro. Portal nie pobiera obrazów po stronie serwera; przeglądarka wyświetla zatwierdzony adres HTTPS. Nie obiecuje niezależnej kopii pliku, dlatego utrzymanie publicznego adresu mediów jest częścią kontraktu.

Odpowiedź: `{"external_id":"<uuid>","url":"https://durnoty.pl/artykul/ptaki-maja-inne-plany","status":"publish"}`. Adres jest potwierdzeniem przyjęcia przez CMS; dla `draft` i `future` sama obecność URL nie oznacza publicznej widoczności. `external_id` należy zachować w Mumro. Obecny adapter to robi.

## Reguły

- `draft` jest niewidoczny. `publish` jest publiczny po transakcji. `future` wymaga czasu ISO 8601 ze strefą; widoczność jest oceniana przy każdym żądaniu. Zalecany przepływ to harmonogram Mumro, który w terminie wysyła `publish`.
- Tożsamość: `(site.id, article.id)`. Nowa wersja treści aktualizuje ten sam artykuł. Zmiana sluga istniejącego artykułu zachowuje dotychczasowy permalink. To chroni już opublikowane linki.
- Ten sam klucz i ta sama treść zwracają poprzedni wynik. Zmieniona treść pod tym samym kluczem: `409 idempotency_conflict`. Klucz jest wymagany, 8–200 znaków ASCII z zestawu alfanumerycznego oraz `_.:-`.
- Obcy `external_id`, kolizja sluga, błędna witryna, brak daty przyszłej publikacji i niepoprawne metadane kończą się zamkniętym błędem; bez częściowego zapisu.
- Limit rzeczywistych bajtów żądania: 1 MB; HTML do 200 tys. znaków. Nginx dodatkowo ogranicza rozmiar i tempo API.
- HTML jest oczyszczany z tagów aktywnych, handlerów, dowolnego stylowania i niebezpiecznych protokołów. Nie obsługujemy osadzanych skryptów ani iframe.
- Kategorie: `historia`, `natura`, `internet`, `kosmos`, `laboratorium`. Typy: `fact`, `satire`, `experiment`. Durnometr i ważność: całkowite 0–100. Źródła: do 20 pozycji. Widget: `quiz`, `potato`, `excuse`.
- Nieznane klucze metadanych Mumro są pomijane. Znane, niepoprawne wartości są odrzucane. To pozwala przekazywać również standardowe metadane generacji Mumro bez ich publikowania w portalu.

## Publikacja i promocja

Kontrolowane przygotowanie/potwierdzenie artykułu pozostaje w Mumro. Portal nie obchodzi strategii, zatwierdzenia obrazów ani potwierdzeń. Publikacja artykułu i posty społecznościowe to niezależne operacje. Post powinien korzystać z `linked_article_id`; istniejący mechanizm Mumro potrafi poczekać na potwierdzony link przy pierwszym komentarzu. Ten projekt nie wysłał żadnych postów na kanały społecznościowe.

## Co jeszcze trzeba sprawdzić po połączeniu

Utworzenie szkicu w wybranym workspace, poprawny test CMS, dostawa kontrolnego szkicu (niewidocznego publicznie), potwierdzona publikacja wybranego artykułu i jego aktualizacja z zachowaniem `external_id`. Testy portalu sprawdzają odbiornik, lecz nie zastępują tego testu całej ścieżki na żywym koncie Mumro.

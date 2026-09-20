# Durnoty jako poligon produktu Mumro

Dokument propozycji, nie lista wdrożonych funkcji Mumro. Stan rozpoznany w lokalnym kodzie 20.09.2026. Żadna z poniższych propozycji nie zmienia samodzielnie strategii ani uprawnień istniejących workspace.

## Co istnieje i można wykorzystać

| Potrzeba portalu           | Obecny punkt w Mumro                                               | Wniosek                                                                                               |
| -------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Zewnętrzny portal          | custom CMS w `website_articles_service.py::_publish_custom`        | Durnoty mogą działać bez WordPressa i bez osobnego panelu redakcyjnego.                               |
| Identyfikacja aktualizacji | `external_id`, `Idempotency-Key`, stan `cms_update_pending`        | Trzeba eksponować różnicę między zmianą szkicu w Mumro a opublikowaną wersją strony.                  |
| Obraz główny               | obiekt `featured_image` z URL, alt i caption                       | Działa podstawowy cover; pochodzenie i trwałość mediów wymagają wyraźnej umowy.                       |
| Dodatkowe dane             | przekazanie `metadata_json` jako `metadata`                        | Można już przenieść Durnometr, kategorię, źródła i typ fakt/satyra bez migracji core.                 |
| Terminy                    | harmonogramy artykułów i worker                                    | Portal nie potrzebuje drugiego edytora kolejki.                                                       |
| Artykuł → social           | powiązanie artykułu, featured image i odroczony pierwszy komentarz | Promocja powinna opierać się na potwierdzonym adresie CMS.                                            |
| Ruch WWW                   | witryny, pageviews, visitors, referrers w `website_analytics`      | Nie jest to jeszcze pełny pomiar quizów, gier i ich wyników.                                          |
| Materiał wideo z artykułu  | schematy wizualne i ścieżka article → reel                         | Integrację należy zweryfikować na konkretnej powierzchni; obecność kodu nie dowodzi gotowości kanału. |

## Priorytet 1 — przepływ redakcyjny, który można pokazać

### 1. Schemat metadanych konkretnej witryny

**Problem:** redaktor potrzebuje formularza Durnometr/ważność/źródła/fakt-satyra, nie ręcznej edycji JSON.

**Propozycja:** deklarowany schemat custom CMS z wersją. Mumro pokazuje pola z allowlisty, waliduje je i przechowuje w istniejących metadanych. Nie dopisywać pól Durnot na sztywno do globalnego modelu artykułu.

**Gotowe, gdy:** redaktor nie może opublikować faktu bez źródła, satyra ma widoczne oznaczenie, wartości procentowe nie wychodzą poza 0–100, a test między workspace dowodzi izolacji schematów i danych.

### 2. Podgląd rzeczywistej strony przed publikacją

**Problem:** poprawny podgląd HTML w Mumro nie pokazuje łamania tytułu i kolażu na telefonie.

**Propozycja:** krótko ważny podpisany preview URL wygenerowany przez CMS, związany z konkretną wersją artykułu. Bez publicznego szkicu i bez klucza CMS w URL. Durnoty muszą dodać osobny endpoint podglądu; obecnie go nie mają.

**Gotowe, gdy:** wygasły link nie działa, obcy workspace nie może go wydać, po edycji widać, którą wersję oceniono; robot dostaje noindex i brak cache.

### 3. Paczka artykuł + quiz + posty

**Problem:** portal potrzebuje powtarzalnego formatu, a każdy kanał innego fragmentu historii.

**Propozycja:** pakiet redakcyjny: artykuł ze źródłami, 3–5 pytań z wyjaśnieniami, opcjonalna plansza TV i posty z różnymi haczykami. Wszystkie pozycje zachowują własne stany i potwierdzenia, a graf zależności pokazuje, co czeka na potwierdzony URL.

**Gotowe, gdy:** publikacja społecznościowa nie reklamuje nieistniejącej strony; awaria jednego kanału nie duplikuje sukcesów pozostałych; autor może odrzucić sam quiz.

## Priorytet 2 — zamknięcie pętli pomiaru

### 4. Zdarzenia treści zamiast samych wejść

Portal emituje lokalnie `durnoty:event`: `article_open`, `article_read_90`, `random_clicked`, `game_started`, `game_completed`, `quiz_completed`, `tv_started`, `tv_channel_changed`, `video_complete`, `red_button_clicked`, `excuse_generated`. W tym wydaniu nie wysyła ich do serwera.

Proponowany endpoint Mumro powinien przyjmować allowlistę zdarzeń i metryk liczbowych, identyfikator witryny i treści, kampanię oraz wersję formatu. Nie przyjmować dowolnego tekstu, e-maili ani fingerprintu. Udokumentować retencję, consent/opt-out i anonimizację przed uruchomieniem pomiaru. Zmiany wymagają aktualizacji informacji prywatności portalu.

**KPI:** ukończenia quizu / starty, zakończenia gier / starty, przejścia artykuł → gra, zaangażowane wizyty z promocji i kliknięcia w Mumro. Nie optymalizować samego czasu, który można sztucznie wydłużyć trudnym interfejsem.

### 5. Ocena kampanii przy małym ruchu

Zestawiać warianty według porównywalnego okna publikacji, kanału, formatu i kohorty. Pokazywać liczebność, nie tylko procenty. Oznaczać „za mało danych”, zamiast rekomendować zmianę strategii po trzech wejściach. Rejestrować ręczne decyzje redakcji i oddzielać je od rekomendacji modelu.

### 6. Cel promocyjny Mumro bez zamiany portalu w reklamę

Stała, dyskretna informacja o narzędziu publikacji, publiczny opis „jak powstał ten materiał”, okresowe studium przypadku ze zweryfikowanymi wynikami. Link Durnoty → Mumro ma UTM `source=durnoty.pl`, `medium=referral`, `campaign=portal`. Nie podawać wymyślonych oszczędności czasu ani fikcyjnych klientów.

## Priorytet 3 — media, formaty, niezawodność

- **Biblioteka własnej marki:** lokalne fonty, paleta, bezpieczne pola tekstu, kolaże i szablony video specyficzne dla witryny. Wersjonowanie szablonów; odrzucenie wariantu z nieczytelnym polskim tekstem.
- **Kadrowanie:** focal point i rozmiary cover/OG/mobile. Powinny pochodzić z danych obrazu, a nie globalnej reguły `center`.
- **Trwałość obrazów:** jawna retencja publicznych URL, checksum, licencja, autor, pochodzenie AI i proces wycofania. Ewentualny import mediów przez CMS wymaga zabezpieczenia SSRF, limitów i walidacji rzeczywistych bajtów.
- **Korekta i wycofanie:** osobny kontrolowany proces archiwizacji artykułu i komunikowania poprawek. Obecny kontrakt portalu pozwala ukryć materiał przez `draft`, ale nie daje jeszcze pełnej historii redakcyjnej.
- **Stan integracji:** test kontraktu, ostatnia udana dostawa, numer wersji, przyczyna odrzucenia, ponowienie tylko konkretnej nieudanej operacji. Bez logowania kluczy i treści odpowiedzi dostawcy.
- **Plan TV:** model prawdziwej playlisty wideo z czasem, prawami i napisami; nie wpychać dowolnych embedów w HTML artykułu.

## Proponowana kolejność pracy

Najpierw połączyć nowy workspace i przejść jeden rzeczywisty artykuł od szkicu do aktualizacji. Następnie formularz metadanych i bezpieczny podgląd. Dopiero potem pakiety treści, pomiar zdarzeń oraz rekomendacje. Autonomia pozostaje ograniczona zatwierdzoną strategią, budżetem, dokładnymi kanałami i wyłącznikiem. Nie włączać samoczynnych publikacji jako efektu ubocznego konfiguracji portalu.

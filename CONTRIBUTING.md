# Współtworzenie

Zacznij od README i `docs/PLAN.md`. Mała, konkretna zmiana jest łatwiejsza do oceny niż przebudowa całej gazety.

1. Zgłoś problem lub pomysł. W przypadku faktu dołącz źródło pierwotne.
2. Utwórz branch, zrób zmianę, uruchom `npm run check`, `npm run lint`, `npm test`, `npm run build`. Dla zmiany interakcji również `npm run test:e2e`.
3. Uruchom `npm run format`. Sprawdź mobile, klawiaturę i reduced motion.
4. W PR opisz zachowanie przed/po i sposób sprawdzenia. Do widocznych zmian dołącz screenshot.

Nie commituj sekretów, baz danych, logów ani zdjęć bez praw. Nie wprowadzaj dowolnego HTML/JS do metadanych widgetów. Lokalny rekord musi pozostać opisany jako lokalny. Humor nie powinien zmieniać faktów, blokować nawigacji ani obrażać przypadkowych ludzi.

Zachowaj semantyczne HTML, małe moduły i progresywne ulepszanie. Nie dodawaj biblioteki, jeśli zadanie czytelnie rozwiązuje natywne API. Nowa migracja musi zachować istniejące artykuły i mieć test na osobnej bazie.

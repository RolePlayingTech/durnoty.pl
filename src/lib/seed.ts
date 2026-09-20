import type Database from 'better-sqlite3';
import { metadataSchema, type Article } from './schema';
import { cleanHtml } from './content';

const entries = [
  {
    slug: 'australia-kontra-emu',
    title: 'Australia wysłała wojsko przeciwko ptakom. Ptaki miały inne plany.',
    excerpt:
      'Dwa karabiny maszynowe, tysiące emu i plan, który na papierze wyglądał lepiej. Rok 1932. To naprawdę się wydarzyło.',
    image: '/art/emu.webp',
    image_alt:
      'Emu w wojskowym hełmie na tle australijskiego krajobrazu — kolaż ilustracyjny',
    image_caption:
      'Ilustracja redakcyjna wygenerowana z pomocą AI. Emu nie pozowało do zdjęcia i nie otrzymało stopnia wojskowego.',
    metadata: {
      category: 'historia',
      absurdity: 98,
      importance: 34,
      sources: [
        {
          title:
            'Emu War — opis operacji i odnośniki do australijskiej prasy z 1932 r.',
          url: 'https://en.wikipedia.org/wiki/Emu_War',
        },
      ],
      widget: 'quiz',
    },
    content_html: `<p>Istnieją decyzje, które po latach wymagają długiego wyjaśnienia. Wysłanie żołnierzy z karabinami maszynowymi przeciwko wielkim nielotom należy do tej kategorii.</p><h2>Plan był prosty. Ptaki nie czytały planu.</h2><p>W 1932 roku emu niszczyły uprawy w Australii Zachodniej. Do rozwiązania problemu skierowano wojskowy oddział z bronią maszynową. Miała to być operacja ograniczająca populację ptaków, nie formalnie wypowiedziana wojna. Nazwa „wojna z emu” to medialny skrót.</p><p>Emu rozpraszały się i uciekały. Zamiast zwartego celu żołnierze mieli przed sobą mnóstwo ruchomych problemów. Karabin maszynowy okazał się kiepskim narzędziem do zarządzania ptasim chaosem.</p><h2>Czy ptaki naprawdę wygrały?</h2><p>To puenta, nie zapis traktatu pokojowego. Ptaki ginęły, ale operacja nie rozwiązała problemu rolników w oczekiwany sposób. Mówienie o bezkrwawym triumfie emu byłoby równie mylące jak nazywanie ich regularną armią.</p><blockquote>Historia jest wystarczająco dziwna. Nie trzeba jej dopisywać generała z dziobem.</blockquote><p>Nasza ilustracja robi to wyłącznie na własną odpowiedzialność.</p>`,
  },
  {
    slug: 'osmiornica-trzy-serca',
    title: 'Trzy serca. Osiem ramion. I nadal nie odpisuje.',
    excerpt:
      'Ośmiornica ma układ krążenia, który wygląda jak projekt z zapasowym zasilaniem. Natura nie konsultowała tego z księgowością.',
    image: '/art/octopus.svg',
    image_alt: 'Autorska ilustracja ośmiornicy i trzech serc',
    image_caption: 'Schemat redakcyjny. Nie używać do naprawy ośmiornicy.',
    metadata: {
      category: 'natura',
      absurdity: 83,
      importance: 48,
      sources: [
        {
          title: 'Natural History Museum — osiem zaskakujących cech ośmiornic',
          url: 'https://www.nhm.ac.uk/discover/octopuses-keep-surprising-us-here-are-eight-examples-how.html',
        },
      ],
    },
    content_html: `<p>Ośmiornica ma trzy serca. Dwa kierują krew przez skrzela, a trzecie obsługuje resztę ciała. Nie jest to zapas na wypadek zawodu miłosnego, choć tytuł bardzo chciałby to sugerować.</p><h2>Jeszcze niebieska krew</h2><p>W transporcie tlenu pomaga jej hemocyjanina, białko zawierające miedź. To ono odpowiada za niebieskawy kolor natlenionej krwi. Nasza hemoglobina korzysta z żelaza. Dwa różne rozwiązania tego samego logistycznego problemu.</p><h2>Ramiona mają sporo do powiedzenia</h2><p>Duża część układu nerwowego ośmiornicy znajduje się w ramionach. Mogą wykonywać część zadań bez szczegółowych poleceń z centralnego mózgu. Nie oznacza to jednak ośmiu osobnych ośmiornic ani zebrania zarządu przy każdym kroku.</p><blockquote>Natura wdrożyła pracę rozproszoną, zanim pojawiło się pierwsze spotkanie, które mogło być mailem.</blockquote>`,
  },
  {
    slug: 'prawdziwy-bug-w-komputerze',
    title: 'Ten bug naprawdę miał skrzydła. I trafił do zeszytu.',
    excerpt:
      'W 1947 roku w komputerze znaleziono ćmę. Ale historia o tym, że wtedy wymyślono słowo „bug”, wymaga małej poprawki.',
    image: '/art/bug.svg',
    image_alt: 'Ćma na kartce z dziennika napraw, ilustracja',
    image_caption: 'Ilustracja, nie skan oryginalnego dziennika.',
    metadata: {
      category: 'internet',
      absurdity: 77,
      importance: 55,
      sources: [
        {
          title: 'Smithsonian — Log Book With Computer Bug',
          url: 'https://americanhistory.si.edu/collections/object/nmah_334663',
        },
      ],
    },
    content_html: `<p>Mark II na Harvardzie miał w 1947 roku bardzo dosłowny problem sprzętowy. W jednym z elementów znaleziono ćmę. Owad został wklejony do dziennika, a wpis stał się klasykiem historii informatyki.</p><h2>Ładna opowieść. Tylko poprawmy podpis.</h2><p>Słowo „bug” w znaczeniu usterki było używane przez inżynierów dużo wcześniej. Smithsonian wskazuje choćby Thomasa Edisona i lata 70. XIX wieku. Ćma nie wynalazła więc błędów komputerowych. Dostarczyła im świetnej ilustracji.</p><p>Oryginalny dziennik znajduje się w zbiorach National Museum of American History. To rzadki przypadek, kiedy błąd można zachować, pokazać publiczności i nie dostać za to zgłoszenia od klienta.</p><blockquote>Rozwiązanie: usunięto owada. Testy regresji: historia milczy.</blockquote>`,
  },
  {
    slug: 'wenus-nie-spieszy-sie',
    title: 'Wenus obraca się wolniej, niż obiega Słońce. Ma czas.',
    excerpt:
      'Pełny obrót: około 243 ziemskich dni. Rok: około 225. Uwaga na haczyk ze słowem „doba”.',
    image: '/art/venus.svg',
    image_alt: 'Żółta Wenus i orbita na czarnym tle, ilustracja',
    image_caption: 'Schemat poglądowy, skala poszła na przerwę.',
    metadata: {
      category: 'kosmos',
      absurdity: 89,
      importance: 61,
      sources: [
        {
          title: 'NASA — Venus Facts',
          url: 'https://science.nasa.gov/venus/venus-facts/',
        },
        {
          title:
            'NASA — informator o Wenus, rozróżnienie doby słonecznej i obrotu',
          url: 'https://www.nasa.gov/wp-content/uploads/2009/12/Venus_Lithograph_h.pdf',
        },
      ],
    },
    content_html: `<p>Wenus potrzebuje około 243 ziemskich dni na obrót względem odległych gwiazd. Obieg Słońca zajmuje jej około 225 dni. Zanim skończy się obracać, ma już za sobą kolejny rok.</p><h2>Internet zgubił jeden szczegół</h2><p>Popularne „dzień na Wenus jest dłuższy od roku” odnosi się do doby gwiazdowej. Doba słoneczna, czyli odstęp między kolejnymi górowaniami Słońca, to około 117 ziemskich dni. Ruch orbitalny i obrót w przeciwnym kierunku robią różnicę.</p><p>Jeśli ktoś używa tej ciekawostki jako dowodu, że na Wenus czeka się od wschodu do wschodu przez 243 dni, warto dopisać przypis. Kosmos bywa absurdalny, ale definicje nadal obowiązują.</p><blockquote>Na plus: jeszcze nigdy nie spóźniliśmy się na spotkanie na Wenus.</blockquote>`,
  },
  {
    slug: 'protokol-czerwonego-guzika',
    title: 'Postawiliśmy guzik z napisem „nie klikaj”. Protokół z porażki.',
    excerpt:
      'Hipoteza: człowiek potrafi się powstrzymać. Metoda: dać mu guzik. Problem: również go kliknęliśmy.',
    image: '/art/dispatch.svg',
    image_alt: 'Czerwony przycisk na żółtym formularzu',
    image_caption:
      'Laboratorium Durnot. Literatura eksperymentalna, nie badanie naukowe.',
    metadata: {
      category: 'laboratorium',
      absurdity: 96,
      importance: 2,
      kind: 'satire',
      widget: 'excuse',
    },
    content_html: `<p><strong>Satyra redakcyjna.</strong> Poniższy protokół nie opisuje badania naukowego. Nie było komisji etycznej. Był wtorek.</p><h2>Hipoteza</h2><p>Człowiek czyta instrukcje i postępuje zgodnie z ich treścią. Szczególnie kiedy instrukcja składa się z dwóch słów.</p><h2>Metoda</h2><p>Na stronie umieszczono czerwony przycisk. Obok napisano, żeby go nie klikać. Założono, że to wyczerpuje zagadnienie komunikacji.</p><h2>Co poszło źle</h2><p>Osoba odpowiedzialna za umieszczenie przycisku kliknęła go „żeby sprawdzić”. Następnie sprawdziła jeszcze raz. Komisja, złożona z tej samej osoby, uznała to za procedurę techniczną.</p><h2>Werdykt</h2><p>Guzik działa. Hipoteza nie. Zamówiono większy napis.</p><blockquote>Dalsze badania odłożono, ponieważ ktoś znowu nacisnął.</blockquote>`,
  },
];

export const seedArticles: Article[] = entries.map((entry, i) => ({
  ...entry,
  id: `seed-${i + 1}`,
  metadata: metadataSchema.parse(entry.metadata),
  status: 'publish',
  published_at: new Date(
    Date.UTC(2026, 8, 20, 5, 0) - i * 86400000,
  ).toISOString(),
  updated_at: '2026-09-20T05:00:00.000Z',
}));
export function seed(db: Database.Database): void {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO articles VALUES (@id, NULL, NULL, @slug, @title, @excerpt, @content_html, @image, @image_alt, @image_caption, @metadata, @status, @published_at, @updated_at)',
  );
  db.transaction(() => {
    for (const article of seedArticles)
      insert.run({
        ...article,
        content_html: cleanHtml(article.content_html),
        metadata: JSON.stringify(article.metadata),
      });
  })();
}

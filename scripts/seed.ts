import { getDb } from '../src/lib/db';
import { seed } from '../src/lib/seed';
seed(getDb());
console.log(
  'Treści startowe gotowe. Istniejące artykuły pozostawiono bez zmian.',
);
getDb().close();

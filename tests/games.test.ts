import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, pickRandom, questions, quizVerdict } from '../src/lib/games';
import { nextChannel } from '../src/lib/tv';
import { wrapTitle } from '../src/lib/og';
import { metadataSchema } from '../src/lib/schema';

test('shuffling preserves cards and never mutates original', () => {
  const cards = ['a', 'a', 'b', 'b', 'c', 'c'];
  const original = [...cards];
  const shuffled = shuffle(cards, () => 0.25);
  assert.deepEqual(cards, original);
  assert.deepEqual([...shuffled].sort(), [...cards].sort());
  assert.notDeepEqual(cards, shuffled);
});
test('random avoids the immediately previous article and handles empty/single pools', () => {
  assert.equal(pickRandom([]), undefined);
  assert.equal(pickRandom([{ id: 'a' }], 'a')?.id, 'a');
  for (let i = 0; i < 20; i++)
    assert.equal(pickRandom([{ id: 'a' }, { id: 'b' }], 'a')?.id, 'b');
});
test('quiz has real sources and a stable correct result', () => {
  assert.equal(questions.length, 5);
  assert.ok(
    questions.every(
      (q) => q.source.startsWith('https://') && q.explanation.length > 20,
    ),
  );
  assert.equal(quizVerdict(5), 'Internet jeszcze Cię nie pokonał.');
  assert.notEqual(quizVerdict(0), quizVerdict(5));
});
test('playlist wraps, editorial meter validates bounds, social title stays bounded', () => {
  assert.equal(nextChannel(2, 3), 0);
  assert.equal(nextChannel(0, 0), 0);
  assert.equal(nextChannel(0, 3), 1);
  assert.equal(metadataSchema.safeParse({ absurdity: 101 }).success, false);
  assert.equal(metadataSchema.safeParse({ importance: -1 }).success, false);
  assert.ok(wrapTitle('Długie słowo '.repeat(25)).length <= 4);
});

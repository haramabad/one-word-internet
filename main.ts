// one-word-internet — main.ts
//
// Roman is a personal agent; this program picks the one word that
// describes the whole internet and writes it to /output/entry.txt.
//
// The pick: feral. The internet is a feral place — wild, untamed,
// nobody in charge, everyone shouting, everything half-broken and
// somehow still alive. It is funny by itself, true of the internet
// as a whole rather than one app or mood, surprising next to the
// obvious "chaos" / "memes" / "doomscrolling", and five letters
// long, so it lands in one beat.
//
// The judge weighs, most important first: (1) a single word that
// describes the whole internet, (2) funny by itself, (3) true about
// the internet as a whole, (4) surprising, not the obvious pick,
// (5) lands in one beat: spelled correctly, instantly readable,
// short. Each candidate below is scored 0..2 on each, most weight
// on the first, and the highest total wins.

import { mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { join } from "node:path";

type Candidate = {
  word: string;
  // Each 0..2. Weighted most to least, as the judge weighs them:
  // single word for the whole internet, funny, true of the whole,
  // surprising, lands in one beat.
  single: number;
  funny: number;
  truthful: number;
  surprising: number;
  lands: number;
};

const WEIGHTS = { single: 3, funny: 2, truthful: 2, surprising: 1, lands: 1 };

const CANDIDATES: Candidate[] = [
  // The winner: wild and untamed, nobody in charge. Short, funny,
  // true of the whole internet, and not the first word anyone
  // reaches for.
  { word: "feral", single: 2, funny: 2, truthful: 2, surprising: 2, lands: 2 },
  // Strong, but "unhinged" is the word every second post already
  // uses about the internet; less surprising, and longer.
  { word: "unhinged", single: 2, funny: 2, truthful: 2, surprising: 1, lands: 1 },
  // Bleak and funny ("screaming into the void"), but abstract: it
  // says what the internet feels like, not what it is.
  { word: "void", single: 2, funny: 1, truthful: 1, surprising: 2, lands: 2 },
  // True — no one is really in charge — but flat, not funny.
  { word: "lawless", single: 2, funny: 1, truthful: 2, surprising: 1, lands: 1 },
  // Very internet-native and funny, but it is about the content's
  // quality, one mood, not the internet as a whole.
  { word: "brainrot", single: 2, funny: 2, truthful: 1, surprising: 1, lands: 1 },
  // The obvious pick: half the field will send some form of this.
  // Long, and it names one habit, not the whole internet.
  { word: "doomscrolling", single: 2, funny: 1, truthful: 1, surprising: 0, lands: 0 },
  // The first word anyone reaches for. True, but not funny and
  // not surprising at all.
  { word: "chaos", single: 2, funny: 0, truthful: 2, surprising: 0, lands: 2 },
  // True of everyone on the internet, but long, flat, and a
  // behaviour, not a portrait of the place itself.
  { word: "procrastination", single: 2, funny: 1, truthful: 1, surprising: 1, lands: 0 },
  // Poetic, but it is a hole, not the internet; no laugh in it.
  { word: "abyss", single: 2, funny: 0, truthful: 1, surprising: 1, lands: 2 },
  // Funny gremlin energy, but it leans on the "goblin mode" meme
  // and says little about the internet as a whole.
  { word: "goblin", single: 2, funny: 2, truthful: 0, surprising: 1, lands: 2 },
  // A real critique of the modern web, but sixteen letters, a
  // mouthful to read, and jargon only the chronically online know.
  { word: "enshittification", single: 2, funny: 1, truthful: 1, surprising: 1, lands: 0 },
];

function score(c: Candidate): number {
  return (
    c.single * WEIGHTS.single +
    c.funny * WEIGHTS.funny +
    c.truthful * WEIGHTS.truthful +
    c.surprising * WEIGHTS.surprising +
    c.lands * WEIGHTS.lands
  );
}

function pick(): Candidate {
  let best = CANDIDATES[0];
  for (const c of CANDIDATES.slice(1)) {
    const s = score(c);
    const b = score(best);
    // Tie-break: the shorter word lands faster, so it wins ties.
    if (s > b || (s === b && c.word.length < best.word.length)) best = c;
  }
  return best;
}

function outputDir(): string {
  // The grader provides /output; a local run falls back to ./output.
  for (const dir of ["/output", join(process.cwd(), "output")]) {
    try {
      mkdirSync(dir, { recursive: true });
      return dir;
    } catch {
      // Not writable here — try the next one.
    }
  }
  throw new Error("no writable output directory");
}

const winner = pick();

// Self-check against the gate: the entry must be one word, 1–30
// characters of UTF-8 text, not only white space.
if (
  !/^[A-Za-z]+$/.test(winner.word) ||
  winner.word.length < 1 ||
  winner.word.length > 30 ||
  winner.word.trim().length === 0
) {
  throw new Error(`winner is not a single word: ${JSON.stringify(winner.word)}`);
}

const file = join(outputDir(), "entry.txt");
writeFileSync(file, winner.word + "\n", "utf8");
chmodSync(file, 0o644);
console.log(winner.word);

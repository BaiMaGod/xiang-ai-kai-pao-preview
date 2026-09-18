const partUrls = [
  './game.part1.txt',
  './game.part2.txt',
  './game.part3.txt',
  './game.part4.txt'
];

const parts = await Promise.all(
  partUrls.map(async (url) => {
    const resolved = new URL(url, import.meta.url);
    const res = await fetch(resolved);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.text();
  })
);

const logicUrl = new URL('./logic.js', import.meta.url).href;
const source = parts.join('').replace(
  "from './logic.js'",
  `from '${logicUrl}'`
);

const blobUrl = URL.createObjectURL(
  new Blob([source], { type: 'text/javascript' })
);

try {
  await import(blobUrl);
} finally {
  URL.revokeObjectURL(blobUrl);
}

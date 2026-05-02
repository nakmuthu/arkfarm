#!/usr/bin/env node
const fs = require('fs');
const https = require('https');

function translate(text) {
  return new Promise((resolve) => {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=' + encodeURIComponent(text);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)[0].map(x => x[0]).join('')); }
        catch(e) { resolve(text); }
      });
    });
    req.on('error', () => resolve(text));
    req.on('timeout', () => { req.destroy(); resolve(text); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const SPECIES = [
  { slug: 'wandering-violin-mantis',    desc: 'Ambush predator that controls pest insects with remarkable camouflage.' },
  { slug: 'brown-marmorated-stink-bug', desc: 'Invasive pest that damages fruit crops by piercing and feeding.' },
  { slug: 'speckled-bush-cricket',      desc: 'Nocturnal cricket; indicator of a healthy low-pesticide orchard.' },
  { slug: 'lime-butterfly',             desc: 'Larvae defoliate citrus; adults are important pollinators.' },
  { slug: 'red-spotted-assassin-bug',   desc: 'Controls pest insects; delivers a very painful bite if disturbed.' },
  { slug: 'sandalwood-defoliator-moth', desc: 'Day-flying wasp moth whose larvae defoliate sandalwood and pulse crops.' },
  { slug: 'lychee-shield-bug',          desc: 'Brilliantly coloured jewel bug that feeds on pigeon pea, pongamia, and other crops.' },
  { slug: 'red-cotton-stainer',         desc: 'Serious pest of cotton that stains lint by transmitting fungi while feeding.' },
  { slug: 'brown-stink-bug',            desc: 'Shield-shaped pest that damages fruit, grain, and nut crops by piercing and feeding.' },
  { slug: 'indian-black-scorpion',      desc: 'Large Indian scorpion with a painful sting; preys on pest insects in orchards.' },
];

async function main() {
  const ta = JSON.parse(fs.readFileSync('data/i18n-ta.json', 'utf8'));

  for (const s of SPECIES) {
    // Sync fauna_name from per-species file to global dict
    const f = 'data/i18n-fauna-' + s.slug + '.json';
    if (fs.existsSync(f)) {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (d.fauna_name) {
        ta['fauna_name_' + s.slug] = d.fauna_name;
        console.log('name: ' + s.slug + ' -> ' + d.fauna_name);
      }
    }

    // Translate description for category card
    const descKey = 'fauna_desc_' + s.slug;
    if (!ta[descKey]) {
      ta[descKey] = await translate(s.desc);
      console.log('desc: ' + s.slug + ' -> ' + ta[descKey]);
      await sleep(300);
    }
  }

  fs.writeFileSync('data/i18n-ta.json', JSON.stringify(ta, null, 2));
  console.log('Done');
}

main().catch(console.error);

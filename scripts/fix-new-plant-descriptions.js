// Fix description field in plants.json for new plants that have keyword-style descriptions
const fs = require('fs');
const plants = JSON.parse(fs.readFileSync('data/plants.json', 'utf8'));

const fixes = {
  'adathodai':        'Medicinal shrub used for asthma, bronchitis, and respiratory conditions in Siddha and Ayurveda.',
  'vasambu':          'Aromatic rhizome used in Siddha medicine for digestive issues, speech disorders, and memory enhancement.',
  'vathanarayanan':   'Ornamental shrub with showy orange-red flowers; bark and leaves used in traditional medicine for fever.',
  'karunochi':        'Aromatic shrub used in Siddha and Ayurveda for joint pain, fever, and headache.',
  'maha-vilvam':      'Sacred bael tree; fruit used for digestive disorders and dysentery; leaves offered in Hindu worship.',
  'vetiver':          'Deep-rooted aromatic grass; roots used for cooling, fever, and skin conditions; used in perfumery.',
  'aloe-vera':        'Succulent herb with gel-filled leaves used for burns, skin conditions, and digestive health.',
  'aloe-vera-red':    'Ornamental red aloe that turns vivid red in full sun; similar medicinal properties to Aloe vera.',
  'ranakalli':        'Succulent herb that propagates from leaf margins; used for wounds, burns, and kidney stones.',
  'pirandai':         'Succulent climber with four-angled stems; used for bone fractures, joint pain, and digestive issues.',
  'elumbu-otti-ilai': 'Climbing herb whose leaves are applied as poultice for bone fractures and joint pain.',
  'thippili':         'Climbing shrub with pungent fruits; key ingredient in Trikatu; used for respiratory and digestive conditions.',
  'poonai-meesai':    'Herb with cat-whisker flowers; widely used as a diuretic and for kidney stones in traditional medicine.',
  'murungai-kalyana': 'Coral tree with brilliant scarlet flowers; bark and leaves used for joint pain and skin diseases.',
  'murungai-karumbu': 'Dark-stem Moringa variety; all parts edible and medicinal; highly nutritious leaves and pods.',
  'chitharathai':     'Aromatic rhizome used in Siddha medicine for indigestion, flatulence, and respiratory infections.',
  'banana-karpuravalli': 'Aromatic Karpuravalli banana with camphor-like fragrance; popular in Tamil Nadu.',
  'banana-nendran':   'Kerala\'s iconic plantain banana; used for cooking, chips, and as a staple fruit.',
  'banana-peyan':     'Large cooking banana variety; used for chips, halwa, and traditional Tamil cuisine.',
  'banana-poongathali': 'Small aromatic banana variety with delicate flavour; grown in Tamil Nadu.',
  'banana-poovan':    'Popular South Indian banana with sweet flavour; widely used in rituals and daily consumption.',
  'banana-rasthali':  'Sweet, soft banana with silky texture; one of the most popular dessert bananas in Tamil Nadu.',
  'banana-red':       'Red-skinned banana with sweet, creamy flesh; rich in antioxidants and beta-carotene.',
  'banana-sirumalai': 'GI-tagged hill banana from Sirumalai, Dindigul; small, sweet, and highly aromatic.',
  'banana-yelakki':   'Small, sweet cardamom banana with intense flavour; popular as a snack and in desserts.',
  'cashew-nut':       'Tropical tree producing cashew nuts and cashew apple; widely cultivated in coastal India.',
  'dragon-fruit-purple': 'Purple-skinned dragon fruit with sweet, magenta flesh; rich in antioxidants.',
  'dragon-fruit-yellow': 'Yellow-skinned dragon fruit with white flesh and intense sweetness; rare tropical variety.',
  'fig-brown-turkey': 'Brown Turkey fig with sweet, rich flavour; one of the most popular fig varieties for home gardens.',
  'fig-elephant-ear': 'Giant Roxburgh fig with large edible fruits; used as vegetable and in traditional medicine.',
  'fig-pune-red':     'Red-fleshed Pune fig variety with sweet flavour; popular in Maharashtra and South India.',
  'orange-kamala':    'Mandarin orange with loose skin and sweet, juicy segments; widely grown in India.',
  'pomegranate':      'Ruby-red fruit with sweet-tart arils; rich in antioxidants and widely used in Ayurveda.',
  'sweet-tamarind':   'Sweet variety of tamarind with low acidity; eaten fresh as a snack and used in cooking.',
  'cat-eye-fruit':    'Tropical evergreen tree with small white-pink fruits resembling a cat\'s eye; native to Sri Lanka.',
  'grape-black':      'Dark purple to black grape variety rich in resveratrol and anthocyanins; used fresh and for wine.',
  'allamanda-purple': 'Tropical shrub with large purple trumpet flowers; ornamental climber for fences and pergolas.',
  'allamanda-yellow': 'Golden trumpet vine with large bright yellow flowers; popular ornamental for tropical gardens.',
  'bougainvillea-red': 'Vigorous thorny climber with brilliant red bracts; one of the most popular ornamental vines.',
  'bougainvillea-white': 'White-bracted bougainvillea with elegant appearance; popular for arches and garden walls.',
  'butterfly-pea':    'Blue-flowered climber used for natural food colouring, herbal tea, and traditional medicine.',
  'cypress-vine':     'Delicate feathery vine with star-shaped scarlet flowers; attracts sunbirds and hummingbirds.',
  'hibiscus-red':     'Tropical shrub with large red flowers; used in herbal tea, hair care, and traditional medicine.',
  'manoranjitham':    'Climbing ylang-ylang with intensely fragrant flowers; used in perfumery and garlands.',
  'petrea-creeper':   'Woody vine with cascading purple flower clusters; blooms profusely in warm seasons.',
  'touch-me-not':     'Sensitive plant whose leaves fold when touched; used in traditional medicine for skin conditions.',
  'neem-tree':        'Sacred multipurpose tree with antibacterial properties; used in Ayurveda, agriculture, and cosmetics.',
  'purple-heart':     'Low-growing succulent with striking deep purple leaves; excellent ground cover and container plant.',
  'areca-palm':       'Elegant clumping palm with golden-green fronds; popular ornamental for gardens and interiors.',
  'norfolk-island-pine': 'Symmetrical conifer with tiered horizontal branches; popular ornamental and indoor plant.',
  'curtain-creeper':  'Fast-growing vine with pendulous branches forming a dense green curtain; low maintenance.',
  'rubber-plant':     'Bold foliage plant with large glossy leaves; popular indoor plant and excellent air purifier.',
  'mint':             'Aromatic spreading herb with strong menthol scent; used in cooking, beverages, and medicine.',
  'coriander':        'Versatile annual herb; leaves used as cilantro, seeds as spice; essential in Indian cooking.',
  'sweet-basil':      'Aromatic culinary herb with sweet clove-like scent; used in cooking and traditional medicine.',
  'basil-black':      'Sacred holy basil with dark purple leaves; adaptogenic herb central to Ayurveda and Hindu worship.',
  'karpuravalli':     'Succulent aromatic herb with camphor-oregano scent; used for coughs and respiratory conditions.',
};

let updated = 0;
for (const p of plants) {
  const slug = p.url.split('/').pop().replace('.html', '');
  if (fixes[slug]) {
    p.description = fixes[slug];
    updated++;
  }
}

fs.writeFileSync('data/plants.json', JSON.stringify(plants, null, 2), 'utf8');
console.log('Updated', updated, 'plant descriptions in plants.json');

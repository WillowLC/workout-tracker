// Things to compare lifted volume with. Weights are approximate, well-known
// figures (shown as "approx." in the UI). Spread evenly from ~10 kg up to
// billions of kg so every workout, month, year and lifetime total fits one.

export interface VolumeComparison {
  id: string;
  singular: string;
  plural: string;
  kg: number;
  emoji: string;
  category: 'animal' | 'dinosaur' | 'vehicle' | 'object' | 'food' | 'landmark' | 'space';
}

const c = (id: string, singular: string, plural: string, kg: number, emoji: string, category: VolumeComparison['category']): VolumeComparison => ({ id, singular, plural, kg, emoji, category });

export const VOLUME_COMPARISONS: VolumeComparison[] = [
  // Up to 100 kg
  c('bowling-ball', 'bowling ball', 'bowling balls', 7, '🎳', 'object'),
  c('watermelon', 'giant watermelon', 'giant watermelons', 9, '🍉', 'food'),
  c('car-tyre', 'car tyre', 'car tyres', 11, '🛞', 'object'),
  c('mountain-bike', 'mountain bike', 'mountain bikes', 14, '🚲', 'vehicle'),
  c('microwave', 'microwave oven', 'microwave ovens', 15, '📦', 'object'),
  c('olympic-barbell', 'Olympic barbell', 'Olympic barbells', 20, '🏋️', 'object'),
  c('emperor-penguin', 'emperor penguin', 'emperor penguins', 23, '🐧', 'animal'),
  c('kayak', 'sea kayak', 'sea kayaks', 25, '🛶', 'vehicle'),
  c('golden-retriever', 'golden retriever', 'golden retrievers', 30, '🐕', 'animal'),
  c('concert-harp', 'concert harp', 'concert harps', 40, '🎻', 'object'),
  c('parmesan', 'wheel of Parmesan', 'wheels of Parmesan', 40, '🧀', 'food'),
  c('punching-bag', 'heavy punching bag', 'heavy punching bags', 45, '🥊', 'object'),
  c('dishwasher', 'dishwasher', 'dishwashers', 50, '🍽️', 'object'),
  c('chimpanzee', 'chimpanzee', 'chimpanzees', 50, '🐒', 'animal'),
  c('cheetah', 'cheetah', 'cheetahs', 55, '🐆', 'animal'),
  c('beer-keg', 'full beer keg', 'full beer kegs', 60, '🍺', 'object'),
  c('adult-human', 'adult human', 'adult humans', 70, '🧍', 'animal'),
  c('anvil', "blacksmith's anvil", "blacksmith's anvils", 70, '⚒️', 'object'),
  c('washing-machine', 'washing machine', 'washing machines', 70, '🧺', 'object'),
  c('red-kangaroo', 'red kangaroo', 'red kangaroos', 85, '🦘', 'animal'),
  c('fridge', 'fridge', 'fridges', 90, '🧊', 'object'),
  c('giant-panda', 'giant panda', 'giant pandas', 100, '🐼', 'animal'),
  c('newborn-elephant', 'newborn elephant', 'newborn elephants', 100, '🐘', 'animal'),

  // 100–1,000 kg
  c('reindeer', 'reindeer', 'reindeer', 120, '🦌', 'animal'),
  c('sumo-wrestler', 'sumo wrestler', 'sumo wrestlers', 150, '🤼', 'animal'),
  c('gorilla', 'gorilla', 'gorillas', 160, '🦍', 'animal'),
  c('lion', 'lion', 'lions', 190, '🦁', 'animal'),
  c('tiger', 'tiger', 'tigers', 220, '🐅', 'animal'),
  c('upright-piano', 'upright piano', 'upright pianos', 230, '🎹', 'object'),
  c('motorcycle', 'motorcycle', 'motorcycles', 250, '🏍️', 'vehicle'),
  c('donkey', 'donkey', 'donkeys', 250, '🫏', 'animal'),
  c('dolphin', 'bottlenose dolphin', 'bottlenose dolphins', 300, '🐬', 'animal'),
  c('vending-machine', 'vending machine', 'vending machines', 300, '🥤', 'object'),
  c('grizzly', 'grizzly bear', 'grizzly bears', 300, '🐻', 'animal'),
  c('zebra', 'zebra', 'zebras', 350, '🦓', 'animal'),
  c('hay-bale', 'round hay bale', 'round hay bales', 400, '🌾', 'object'),
  c('grand-piano', 'grand piano', 'grand pianos', 450, '🎹', 'object'),
  c('polar-bear', 'polar bear', 'polar bears', 450, '🐻‍❄️', 'animal'),
  c('horse', 'horse', 'horses', 500, '🐎', 'animal'),
  c('moose', 'moose', 'moose', 500, '🫎', 'animal'),
  c('manatee', 'manatee', 'manatees', 500, '🌊', 'animal'),
  c('camel', 'camel', 'camels', 600, '🐫', 'animal'),
  c('leatherback', 'leatherback turtle', 'leatherback turtles', 600, '🐢', 'animal'),
  c('dairy-cow', 'dairy cow', 'dairy cows', 650, '🐄', 'animal'),
  c('hot-air-balloon', 'hot-air balloon', 'hot-air balloons', 700, '🎈', 'vehicle'),
  c('vw-beetle', 'classic VW Beetle', 'classic VW Beetles', 800, '🚗', 'vehicle'),
  c('smart-car', 'Smart car', 'Smart cars', 900, '🚙', 'vehicle'),
  c('bison', 'American bison', 'American bison', 900, '🦬', 'animal'),

  // 1–10 tonnes
  c('saltwater-croc', 'saltwater crocodile', 'saltwater crocodiles', 1_000, '🐊', 'animal'),
  c('giraffe', 'giraffe', 'giraffes', 1_000, '🦒', 'animal'),
  c('great-white', 'great white shark', 'great white sharks', 1_100, '🦈', 'animal'),
  c('walrus', 'walrus', 'walruses', 1_200, '🦭', 'animal'),
  c('mini-cooper', 'Mini Cooper', 'Mini Coopers', 1_250, '🚗', 'vehicle'),
  c('beluga', 'beluga whale', 'beluga whales', 1_400, '🐳', 'animal'),
  c('hippo', 'hippo', 'hippos', 1_500, '🦛', 'animal'),
  c('lamborghini', 'Lamborghini', 'Lamborghinis', 1_600, '🏎️', 'vehicle'),
  c('tesla-model-3', 'Tesla Model 3', 'Tesla Model 3s', 1_800, '🚘', 'vehicle'),
  c('black-cab', 'London black cab', 'London black cabs', 2_000, '🚕', 'vehicle'),
  c('white-rhino', 'white rhino', 'white rhinos', 2_300, '🦏', 'animal'),
  c('pickup-truck', 'pickup truck', 'pickup trucks', 2_500, '🛻', 'vehicle'),
  c('minibus', 'minibus', 'minibuses', 3_000, '🚐', 'vehicle'),
  c('asian-elephant', 'Asian elephant', 'Asian elephants', 4_000, '🐘', 'animal'),
  c('ambulance', 'ambulance', 'ambulances', 4_500, '🚑', 'vehicle'),
  c('stegosaurus', 'Stegosaurus', 'Stegosauruses', 5_000, '🦕', 'dinosaur'),
  c('helicopter', 'Black Hawk helicopter, empty', 'Black Hawk helicopters', 5_000, '🚁', 'vehicle'),
  c('orca', 'orca', 'orcas', 5_500, '🐋', 'animal'),
  c('african-elephant', 'African elephant', 'African elephants', 6_000, '🐘', 'animal'),
  c('t-rex', 'T. rex', 'T. rexes', 8_000, '🦖', 'dinosaur'),
  c('semi-truck', 'semi truck, no trailer', 'semi trucks', 9_000, '🚛', 'vehicle'),
  c('triceratops', 'Triceratops', 'Triceratopses', 9_000, '🦕', 'dinosaur'),

  // 10–100 tonnes
  c('school-bus', 'school bus', 'school buses', 11_000, '🚌', 'vehicle'),
  c('double-decker', 'double-decker bus', 'double-decker buses', 12_000, '🚌', 'vehicle'),
  c('big-ben-bell', "Big Ben's bell", "Big Ben's bells", 13_700, '🔔', 'landmark'),
  c('fire-truck', 'fire truck', 'fire trucks', 14_000, '🚒', 'vehicle'),
  c('whale-shark', 'whale shark', 'whale sharks', 19_000, '🦈', 'animal'),
  c('garbage-truck', 'garbage truck', 'garbage trucks', 20_000, '🚛', 'vehicle'),
  c('sarsen-stone', 'Stonehenge sarsen stone', 'Stonehenge sarsen stones', 25_000, '🪨', 'landmark'),
  c('humpback', 'humpback whale', 'humpback whales', 30_000, '🐋', 'animal'),
  c('cement-mixer', 'loaded cement mixer', 'loaded cement mixers', 30_000, '🚚', 'vehicle'),
  c('gray-whale', 'gray whale', 'gray whales', 36_000, '🐋', 'animal'),
  c('subway-car', 'subway car', 'subway cars', 38_000, '🚇', 'vehicle'),
  c('brachiosaurus', 'Brachiosaurus', 'Brachiosauruses', 40_000, '🦕', 'dinosaur'),
  c('boeing-737', 'Boeing 737, empty', 'empty Boeing 737s', 41_000, '✈️', 'vehicle'),
  c('sperm-whale', 'sperm whale', 'sperm whales', 45_000, '🐳', 'animal'),
  c('tram', 'city tram', 'city trams', 50_000, '🚋', 'vehicle'),
  c('battle-tank', 'battle tank', 'battle tanks', 60_000, '🪖', 'vehicle'),
  c('argentinosaurus', 'Argentinosaurus', 'Argentinosauruses', 70_000, '🦕', 'dinosaur'),
  c('space-shuttle', 'Space Shuttle orbiter', 'Space Shuttle orbiters', 78_000, '🚀', 'space'),

  // 100+ tonnes
  c('locomotive', 'diesel locomotive', 'diesel locomotives', 120_000, '🚂', 'vehicle'),
  c('blue-whale', 'blue whale', 'blue whales', 150_000, '🐋', 'animal'),
  c('boeing-747', 'Boeing 747, empty', 'empty Boeing 747s', 180_000, '✈️', 'vehicle'),
  c('statue-of-liberty', 'Statue of Liberty', 'Statues of Liberty', 204_000, '🗽', 'landmark'),
  c('a380', 'Airbus A380, empty', 'empty Airbus A380s', 277_000, '✈️', 'vehicle'),
  c('iss', 'Space Station', 'Space Stations', 420_000, '🛰️', 'space'),
  c('christ-redeemer', 'Christ the Redeemer statue', 'Christ the Redeemer statues', 635_000, '🗿', 'landmark'),
  c('saturn-v', 'fuelled Saturn V rocket', 'fuelled Saturn V rockets', 2_900_000, '🚀', 'space'),
  c('eiffel-tower', 'Eiffel Tower (iron)', 'Eiffel Towers', 7_300_000, '🗼', 'landmark'),
  c('freight-train', 'loaded 100-car freight train', 'loaded 100-car freight trains', 10_000_000, '🚆', 'vehicle'),
  c('pisa', 'Leaning Tower of Pisa', 'Leaning Towers of Pisa', 14_500_000, '🏛️', 'landmark'),
  c('titanic', 'Titanic', 'Titanics', 52_000_000, '🚢', 'vehicle'),
  c('aircraft-carrier', 'Nimitz aircraft carrier', 'Nimitz aircraft carriers', 100_000_000, '🛳️', 'vehicle'),
  c('empire-state', 'Empire State Building', 'Empire State Buildings', 331_000_000, '🏙️', 'landmark'),
  c('great-pyramid', 'Great Pyramid of Giza', 'Great Pyramids of Giza', 5_900_000_000, '🔺', 'landmark'),
];

export const COMPARISON_BY_ID = new Map(VOLUME_COMPARISONS.map((x) => [x.id, x]));

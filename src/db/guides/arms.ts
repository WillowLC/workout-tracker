import { g, variant, type GuideMap } from './types';

const curl = g(
  [
    'Stand tall holding the weight with an underhand grip at about shoulder width, arms straight.',
    'Keep your elbows at your sides.',
    'Curl the weight up until your forearms are nearly vertical, then squeeze.',
    'Lower slowly to fully straight arms.',
  ],
  ['Imagine your elbows are nailed to your sides.', 'Take 2–3 seconds to lower each rep.'],
  ['Swinging the weight up with your hips and back.', 'Elbows drifting forward.', 'Cutting the bottom of the rep short.'],
);

const preacher = g(
  [
    'Sit at the preacher bench with your armpits snug against the top of the pad and the backs of your arms flat on it.',
    'Hold the weight with straight arms.',
    'Curl it up until your forearms are about vertical.',
    'Lower slowly until your arms are nearly straight.',
  ],
  ['Keep the backs of your arms glued to the pad.', 'Slow down at the bottom. That is where this curl is hardest.'],
  ['Lifting the elbows off the pad.', 'Dropping quickly into a straight arm, which strains the elbow.'],
);

const pushdown = g(
  [
    'Stand facing a high pulley holding the attachment with your elbows at your sides.',
    'Lean forward slightly and brace.',
    'Push down until your arms are straight, and squeeze your triceps.',
    'Let the attachment rise until your forearms are about parallel to the floor.',
  ],
  ['Imagine your upper arms are glued to your ribs. Only your forearms move.', 'Keep your shoulders down.'],
  ['Elbows flaring out or drifting forward.', 'Leaning over the bar and pushing with your bodyweight.'],
);

const skull = g(
  [
    'Lie on a bench holding the weight over your shoulders with straight arms.',
    'Keep your upper arms still and bend your elbows to lower the weight toward your forehead, or just behind your head.',
    'Stop when you feel a deep triceps stretch.',
    'Extend your elbows to straighten your arms again.',
  ],
  ['Keep your elbows pointing up at the ceiling, not out to the sides.', 'Angling your arms slightly back toward your head keeps tension at the top.'],
  ['Elbows flaring out.', 'Moving the upper arms so it turns into a press.'],
);

const dip = g(
  [
    'Grip parallel bars and lift yourself up to straight arms.',
    'Keep your torso upright with your chest up.',
    'Lower until your elbows are at about 90°.',
    'Press back up to full lockout.',
  ],
  ['Keep your elbows pointing back, not out.', 'Staying upright keeps the work on your triceps rather than your chest.'],
  ['Going too deep so the shoulders roll forward.', 'Shrugging.'],
);

const wrist = g(
  [
    'Sit with your forearms on your thighs or a bench, wrists just past the edge, holding a barbell.',
    'Let the bar lower as far as your wrists allow.',
    'Curl your wrists up as far as possible.',
    'Lower slowly.',
  ],
  ['Only your wrists move. Your forearms stay flat.', 'Use light weight and higher reps.'],
  ['Lifting the forearms to help.', 'Bouncing the bar.'],
);

export const armGuides: GuideMap = {
  'seed-bicep-curl-barbell': curl,
  'seed-bicep-curl-dumbbell': variant(curl, {
    setup: 'Stand tall with a dumbbell at each side, palms facing in.',
    cues: ['Rotate your palms to face up as you curl.'],
  }),
  'seed-bicep-curl-cable': variant(curl, { setup: 'Stand facing a low pulley holding a straight bar with an underhand grip, arms straight.', cues: ['The cable keeps tension on the muscle through the whole range.'] }),
  'seed-bayesian-curl-cable': variant(curl, {
    setup: 'Set a pulley at the lowest position with a single handle. Stand facing away from it, holding the handle in one hand, and step forward until the cable pulls your arm behind your body.',
    steps: [
      'Stagger your stance, with the foot opposite your working arm forward, and stand tall.',
      'Let your working arm hang slightly behind your torso, palm facing forward, until you feel a stretch in your biceps.',
      'Curl the handle forward and up, keeping your elbow back, until your forearm is about vertical, then squeeze.',
      'Lower slowly until your arm is straight and back behind you again.',
    ],
    cues: [
      'The stretched start, with the arm behind the body, is the point of this curl. Use the full range.',
      'Keep your elbow pinned back; letting it swing forward turns it into a front raise.',
      'Train one arm at a time and start with your weaker arm.',
    ],
    mistakes: ['Standing too close, so there is no tension or stretch at the bottom.', 'Leaning forward to help the weight up.'],
  }),
  'seed-bicep-curl-machine': variant(preacher, { setup: 'Sit at the machine with your elbows lined up with the pivot and the backs of your arms on the pad.' }),
  'seed-ez-bar-curl': variant(curl, { setup: 'Stand tall holding an EZ bar on its angled grips, arms straight.', cues: ['The angled grip is easier on the wrists and elbows.'] }),
  'seed-hammer-curl-dumbbell': variant(curl, {
    setup: 'Stand tall with a dumbbell at each side, palms facing each other.',
    cues: ['Keep your palms facing in the whole time, like holding a hammer. This works the brachialis and forearms.'],
  }),
  'seed-hammer-curl-cable': variant(curl, {
    setup: 'Attach a rope to a low pulley and hold it with your palms facing each other.',
    cues: ['Keep a neutral (palms-in) grip throughout.'],
  }),
  'seed-preacher-curl-barbell': preacher,
  'seed-preacher-curl-dumbbell': variant(preacher, { setup: 'Sit at the preacher bench with one arm on the pad, holding a dumbbell with your palm up.' }),
  'seed-preacher-curl-machine': variant(preacher, { setup: 'Sit at the machine with your armpits against the top of the pad and your elbows lined up with the pivot.' }),
  'seed-incline-curl-dumbbell': variant(curl, {
    setup: 'Sit on a bench set to 45–60° with your arms hanging straight down behind your torso.',
    cues: ['Don\'t let your elbows come forward. The stretched position is the point of this curl.'],
  }),
  'seed-concentration-curl-dumbbell': variant(curl, {
    setup: 'Sit with the back of your upper arm braced against your inner thigh, arm hanging straight.',
    cues: ['Curl toward your shoulder and squeeze hard at the top.'],
  }),
  'seed-spider-curl-dumbbell': variant(curl, {
    setup: 'Lie face down on an incline bench with your arms hanging straight down, a dumbbell in each hand.',
    cues: ['Your upper arms stay vertical, so you can\'t swing.'],
  }),
  'seed-reverse-curl-barbell': variant(curl, {
    setup: 'Stand tall holding the bar with an overhand (palms down) grip at shoulder width.',
    cues: ['This works the forearms and brachialis. Expect to use less weight than a normal curl.'],
  }),
  'seed-triceps-pushdown-cable-straight-bar': pushdown,
  'seed-triceps-rope-pushdown-cable': variant(pushdown, { cues: ['Pull the rope apart at the bottom so your hands finish beside your thighs.'] }),
  'seed-skullcrusher-barbell': skull,
  'seed-skullcrusher-dumbbell': variant(skull, {
    setup: 'Lie on a bench holding a dumbbell in each hand over your shoulders, palms facing each other.',
    cues: ['Lower the dumbbells beside your head.'],
  }),
  'seed-triceps-extension-dumbbell': g(
    [
      'Sit or stand holding one dumbbell overhead with both hands under the top plate.',
      'Keep your upper arms close to your head, elbows pointing forward.',
      'Lower the dumbbell behind your head by bending your elbows until you feel a deep stretch.',
      'Extend back up to straight arms.',
    ],
    ['Keep your ribs down. Don\'t arch your back.', 'Imagine your elbows are pinned in place.'],
    ['Elbows flaring wide.', 'Arching the lower back.'],
  ),
  'seed-overhead-triceps-extension-cable': g(
    [
      'Hold a rope on a cable and turn away from the pulley so the rope sits behind your head.',
      'Step forward into a staggered stance with your elbows pointing forward.',
      'Extend your arms forward and up until they are straight.',
      'Return slowly to a deep stretch.',
    ],
    ['Only your forearms move.', 'Pull the rope apart at the end.'],
    ['Letting the elbows drift apart.', 'Using the torso to push.'],
  ),
  'seed-triceps-extension-machine': variant(pushdown, {
    setup: 'Sit at the machine with your elbows lined up with the pivot and the backs of your arms on the pad.',
    mistakes: [],
  }),
  'seed-triceps-kickback-dumbbell': g(
    [
      'Hinge forward with one hand on a bench, holding a dumbbell in the other hand.',
      'Raise that upper arm so it is parallel to the floor, elbow at your side.',
      'Extend your elbow until your arm is straight, and squeeze.',
      'Lower back to 90°.',
    ],
    ['Your upper arm stays completely still.', 'Use a weight you can hold at the top for a second.'],
    ['Swinging the weight.', 'Letting the elbow drop.'],
  ),
  'seed-close-grip-bench-press-barbell': g(
    [
      'Lie on the bench and grip the bar at about shoulder width.',
      'Unrack with your shoulder blades pulled back and down.',
      'Lower the bar to your lower chest with your elbows tucked close to your body.',
      'Press back up to lockout.',
    ],
    ['Imagine bending the bar in half to keep your elbows tucked.', 'Shoulder width is close enough. Narrower strains the wrists.'],
    ['Grip too narrow.', 'Elbows flaring out.'],
  ),
  'seed-triceps-dip': dip,
  'seed-triceps-dip-assisted': variant(dip, { setup: 'On an assisted dip machine, kneel on the pad and grip the handles with your arms straight. More counterweight means more help.' }),
  'seed-bench-dip': g(
    [
      'Sit on the edge of a bench, hands beside your hips, then slide your hips off with your legs out in front.',
      'Keep your back close to the bench.',
      'Lower by bending your elbows to about 90°.',
      'Press back up to straight arms.',
    ],
    ['Bend your knees to make it easier; put your feet up on a second bench to make it harder.', 'Keep your shoulders down.'],
    ['Going too deep, which strains the front of the shoulders.', 'Drifting away from the bench.'],
  ),
  'seed-wrist-curl-barbell': variant(wrist, { setup: 'Sit with your forearms on your thighs or a bench, palms up, wrists just past the edge.' }),
  'seed-reverse-wrist-curl-barbell': variant(wrist, {
    setup: 'Sit with your forearms on your thighs or a bench, palms down, wrists just past the edge.',
    cues: ['Use lighter weight than for wrist curls.'],
  }),
};

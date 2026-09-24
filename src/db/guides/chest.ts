import { g, variant, type GuideMap } from './types';

const bench = g(
  [
    'Lie on the bench with your eyes under the bar and your feet flat on the floor.',
    'Grip the bar slightly wider than shoulder width. Squeeze your shoulder blades together and down, then unrack the bar so it sits over your shoulders.',
    'Lower the bar under control to your lower chest, roughly at nipple height, with your forearms close to vertical.',
    'Press back up and slightly back so the bar finishes over your shoulders again.',
  ],
  [
    'Imagine bending the bar into a U. This switches on your lats and keeps your elbows at a safe 45–70° angle.',
    'Put your shoulder blades "in your back pockets" and keep them there for the whole set.',
    'Think "push yourself away from the bar" into the bench, rather than just pushing the bar up.',
    'Drive your feet into the floor for leg drive, but keep your glutes on the bench.',
  ],
  [
    'Flaring the elbows straight out to 90°, which loads the front of the shoulder.',
    'Bouncing the bar off your chest.',
    'Lifting your hips off the bench or letting your shoulder blades drift apart at the top.',
  ],
);

const dbBench = g(
  [
    'Sit on the end of the bench with the dumbbells on your thighs, lie back and use your knees to kick them up to your chest.',
    'Press the dumbbells up over your chest, palms facing forward or slightly in.',
    'Lower them to the sides of your chest until you feel a stretch, elbows about 45–70° from your body.',
    'Press back up, bringing the dumbbells slightly toward each other without clanking them together.',
  ],
  [
    'Keep your forearms stacked vertically under the dumbbells at all times.',
    'Pin your shoulder blades back and down as if pinching a pencil between them.',
    'Imagine pushing the dumbbells up along the sides of a tall, narrow triangle.',
  ],
  [
    'Letting the dumbbells drift out wide at the bottom, turning the press into a fly.',
    'Dropping the dumbbells to the floor from a pressed position instead of bringing them back to your chest first.',
  ],
);

const fly = g(
  [
    'Lie on a flat bench holding the dumbbells above your chest, palms facing each other.',
    'Keep a soft, fixed bend in your elbows.',
    'Open your arms out to the sides in a wide arc until you feel a stretch across your chest, around chest level.',
    'Bring the dumbbells back together over your chest along the same arc.',
  ],
  [
    'Imagine hugging a big barrel or a tree trunk. The motion is an arc, not a press.',
    'Lock the elbow angle in place and move only at the shoulder.',
    'Keep your chest up and shoulder blades back so the stretch lands in your chest, not your shoulders.',
  ],
  [
    'Bending and straightening the elbows, which turns it into a press.',
    'Going too heavy and letting the arms sink too far below the bench.',
  ],
);

const cableFly = g(
  [
    'Set both pulleys high and hold a handle in each hand.',
    'Step forward into a split stance with a slight forward lean and a soft bend in your elbows.',
    'Sweep your hands down and together in front of your lower chest or hips.',
    'Let your arms return along the same arc until you feel a stretch across your chest.',
  ],
  [
    'Imagine hugging a tree in front of you.',
    'Keep the elbow bend fixed. Your chest moves the arms, not your triceps.',
    'Squeeze for a moment when your hands meet.',
  ],
  ['Using body momentum by rocking forward and back.', 'Bending the elbows more and more so it becomes a press.'],
);

const pushUp = g(
  [
    'Put your hands on the floor slightly wider than shoulder width, with your body in a straight line from head to heels.',
    'Brace your abs and squeeze your glutes.',
    'Lower your chest to just above the floor, elbows about 45° from your body.',
    'Push the floor away until your arms are straight.',
  ],
  [
    'Imagine screwing your hands into the floor, turning them outward without moving them. This keeps the elbows tucked.',
    'Hold a plank the whole time. Your body moves as one solid piece.',
    'Think "push the floor away" rather than "push yourself up".',
  ],
  ['Sagging hips or hips piking up.', 'Elbows flaring straight out to the sides.', 'Half reps that stop well short of the floor.'],
);

const dip = g(
  [
    'Grip parallel bars and lift yourself up so your arms are locked out.',
    'Lean your torso forward about 30° with your elbows slightly out.',
    'Lower yourself until your upper arms are about parallel to the floor or you feel a stretch in your chest.',
    'Press back up to straight arms.',
  ],
  [
    'Tuck your chin and look slightly down to help the forward lean.',
    'Keep your shoulders down, away from your ears, as if pushing the bars into the floor.',
  ],
  ['Sinking too deep so the shoulders roll forward.', 'Shrugging the shoulders up toward the ears.'],
);

const machinePress = g(
  [
    'Adjust the seat so the handles line up with the middle of your chest.',
    'Sit with your back flat against the pad and your shoulder blades pulled back.',
    'Press the handles forward until your arms are nearly straight.',
    'Return slowly until you feel a stretch in your chest, without letting the weight stack touch.',
  ],
  [
    'Imagine pushing a wall away from you.',
    'Keep your shoulder blades pinned to the pad. Only your arms move.',
  ],
  ['Setting the seat too low or too high so the handles are at your neck or belly.', 'Slamming into a hard lockout.'],
);

export const chestGuides: GuideMap = {
  'seed-bench-press-barbell': bench,
  'seed-bench-press-dumbbell': dbBench,
  'seed-bench-press-smith-machine': variant(bench, {
    steps: [
      'Set the bench so the bar comes down to your lower chest. The bar path is fixed, so this position matters.',
      'Grip slightly wider than shoulder width, pull your shoulder blades back and down, and unhook the bar by rotating your wrists.',
      'Lower to your lower chest under control.',
      'Press straight up and re-hook the bar at the end of the set. Set the safety stops just below chest height.',
    ],
  }),
  'seed-incline-bench-press-barbell': variant(bench, {
    steps: [
      'Set the bench to 30–45° and lie back with your eyes under the bar.',
      'Grip slightly wider than shoulder width, pull your shoulder blades back and down, and unrack.',
      'Lower the bar to your upper chest, just below the collarbones.',
      'Press straight up until the bar is over your shoulders.',
    ],
    cues: ['Keep a "proud chest" so your shoulders don\'t roll forward.'],
    mistakes: ['Using too steep an incline, which turns it into a shoulder press.'],
  }),
  'seed-incline-bench-press-dumbbell': variant(dbBench, {
    setup: 'Set the bench to 30–45°. Sit with the dumbbells on your thighs, lie back and kick them up to your shoulders.',
    cues: ['Lower the dumbbells toward your upper chest.'],
  }),
  'seed-incline-bench-press-smith-machine': variant(bench, {
    steps: [
      'Set an incline bench (30–45°) under the Smith bar so it comes down to your upper chest.',
      'Grip slightly wider than shoulder width, set your shoulder blades and unhook the bar.',
      'Lower to your upper chest, just below the collarbones.',
      'Press straight up and re-hook the bar at the end. Set the safety stops.',
    ],
  }),
  'seed-decline-bench-press-barbell': variant(bench, {
    steps: [
      'Hook your legs under the pads of a decline bench (15–30°) and lie back.',
      'Grip slightly wider than shoulder width and unrack with a spotter or with the safeties set.',
      'Lower the bar to your lower chest.',
      'Press back up over your shoulders.',
    ],
    mistakes: ['Racking or unracking without help. The decline position makes that awkward.'],
  }),
  'seed-decline-bench-press-dumbbell': variant(dbBench, {
    setup: 'Hook your legs under the decline pad and lie back holding the dumbbells against your chest.',
    cues: ['Lower the dumbbells toward your lower chest.'],
  }),
  'seed-chest-press-machine': machinePress,
  'seed-incline-chest-press-machine': variant(machinePress, {
    setup: 'Adjust the seat so the handles line up with your upper chest.',
  }),
  'seed-chest-fly-dumbbell': fly,
  'seed-incline-chest-fly-dumbbell': variant(fly, {
    setup: 'Lie on a bench set to about 30° holding the dumbbells above your upper chest, palms facing each other.',
  }),
  'seed-chest-fly-machine': g(
    [
      'Set the seat so the handles are at chest height when your arms are out to the sides.',
      'Sit tall with your back against the pad and keep a soft bend in your elbows.',
      'Bring the handles together in front of you in a wide arc.',
      'Let them return slowly until you feel a stretch across your chest.',
    ],
    ['Imagine hugging a barrel.', 'Keep your shoulders down and back against the pad.', 'Pause and squeeze when the handles meet.'],
    ['Letting the shoulders roll forward at the end of each rep.', 'Letting the weight snap back instead of controlling the stretch.'],
  ),
  'seed-cable-crossover': cableFly,
  'seed-cable-fly-cable': variant(cableFly, {
    steps: [
      'Set both pulleys at about shoulder height and hold a handle in each hand.',
      'Step forward into a split stance, chest up, with a soft bend in your elbows and your arms out to the sides.',
      'Sweep your hands forward and together in front of your chest, level with your nipples.',
      'Let your arms open back along the same arc until you feel a stretch across your chest.',
    ],
    cues: ['Keep your hands at chest height the whole way, as if sliding them along a tabletop.'],
    mistakes: ['Letting the shoulders roll forward as the hands meet.'],
  }),
  'seed-low-cable-fly-cable': variant(cableFly, {
    steps: [
      'Set both pulleys at the lowest position and hold a handle in each hand.',
      'Stand in the middle with a split stance and a soft bend in your elbows, arms down and slightly behind you.',
      'Sweep your hands up and together in front of your upper chest.',
      'Lower along the same arc under control.',
    ],
    cues: ['Think "scoop up": this angle emphasises the upper chest.'],
  }),
  'seed-floor-press-barbell': g(
    [
      'Set the bar in a rack at a low height and lie on the floor under it, knees bent or legs straight.',
      'Grip slightly wider than shoulder width and unrack.',
      'Lower the bar until your upper arms rest lightly on the floor. Pause.',
      'Press back up to straight arms.',
    ],
    ['Pause fully on the floor so you can\'t bounce.', 'Keep your elbows at about 45°.', 'Imagine bending the bar to keep your lats tight.'],
    ['Bouncing the elbows off the floor.', 'Flaring the elbows straight out.'],
  ),
  'seed-pullover-dumbbell': g(
    [
      'Lie on a bench holding one dumbbell with both hands over your chest, arms nearly straight.',
      'Keep a slight bend in your elbows.',
      'Lower the dumbbell back behind your head in an arc until you feel a stretch in your lats and chest.',
      'Pull it back over your chest along the same arc.',
    ],
    ['Keep your ribs down. Don\'t let your lower back arch to get extra range.', 'Imagine your arms are a lever swinging from your shoulders.'],
    ['Bending the elbows a lot, which turns it into a triceps extension.', 'Going deeper than your shoulders comfortably allow.'],
  ),
  'seed-push-up': pushUp,
  'seed-incline-push-up': variant(pushUp, {
    setup: 'Put your hands on a bench or box slightly wider than shoulder width, with your body in a straight line from head to heels.',
    cues: ['The higher the surface, the easier the push-up. Lower it over time.'],
  }),
  'seed-decline-push-up': variant(pushUp, {
    setup: 'Put your feet on a bench or box and your hands on the floor slightly wider than shoulder width, body straight.',
    cues: ['This angle shifts more work to the upper chest and shoulders.'],
  }),
  'seed-chest-dip': variant(dip, { cues: ['For extra load, hang a plate or dumbbell from a dip belt.'] }),
  'seed-chest-dip-weighted': variant(dip, {
    setup: 'Put on a dip belt with a plate or dumbbell hanging from the chain, step up between the bars and lift yourself to straight arms. Let the weight settle so it hangs still before the first rep.',
    cues: [
      'Squeeze your thighs together and cross your ankles so the weight hangs still instead of swinging.',
      'Keep the same depth you use without weight; if you have to cut it short, the load is too heavy.',
      'Add weight in small steps (2.5–5 kg). Dips load the shoulders hard at the bottom.',
    ],
    mistakes: ['Letting the weight swing, which pulls you out of position.', 'Bouncing out of the bottom instead of pausing and pressing.'],
  }),
  'seed-chest-dip-assisted': variant(dip, {
    setup: 'On an assisted dip machine, kneel or stand on the pad and grip the handles with your arms locked out. More counterweight means more help.',
    cues: ['Lower the assistance over time as you get stronger.'],
  }),
};

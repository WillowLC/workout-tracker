import { g, variant, type GuideMap } from './types';

const ohp = g(
  [
    'Rest the bar on the front of your shoulders with your hands just outside shoulder width and your forearms vertical.',
    'Squeeze your glutes and brace your abs.',
    'Press the bar straight up, moving your head back slightly so the bar clears your chin.',
    'Once the bar passes your forehead, push your head "through the window" and lock out with the bar over your mid-foot.',
  ],
  [
    'Squeeze your glutes as if cracking a walnut. This stops you leaning back.',
    'Keep the bar path straight. Move your face out of the way; don\'t swing the bar around it.',
    'Finish with your biceps beside your ears.',
  ],
  ['Leaning far back and turning it into an incline press.', 'Pressing the bar forward around your face.', 'Flaring the elbows out wide at the start.'],
);

const dbPress = g(
  [
    'Hold the dumbbells at shoulder height, palms facing forward or facing each other.',
    'Brace your abs.',
    'Press the dumbbells up until your arms are straight over your shoulders.',
    'Lower under control back to your shoulders.',
  ],
  ['Keep your forearms vertical under the dumbbells.', 'Keep your ribs down. Don\'t arch your back to press.'],
  ['Arching the lower back.', 'Stopping well short of shoulder height on the way down.'],
);

const lateral = g(
  [
    'Stand tall with a dumbbell at each side and a slight bend in your elbows.',
    'Raise your arms out to the sides, leading with your elbows.',
    'Stop at about shoulder height.',
    'Lower slowly.',
  ],
  ['Imagine pushing your hands out toward the walls, not up to the ceiling.', 'Lead with your elbows.', 'Keep your shoulders down, away from your ears.'],
  ['Swinging the weight up with your body.', 'Shrugging the shoulders.', 'Using weights so heavy the form turns into a swing.'],
);

const frontRaise = g(
  [
    'Stand tall holding the weight in front of your thighs.',
    'With a slight elbow bend, raise it straight in front of you to shoulder height.',
    'Pause briefly.',
    'Lower slowly.',
  ],
  ['Keep your torso still. No rocking.', 'Stop at shoulder height.'],
  ['Swinging with the hips.', 'Leaning back to lift.'],
);

const reverseFly = g(
  [
    'Hinge forward until your torso is nearly parallel to the floor, dumbbells hanging below your chest.',
    'Keep a slight bend in your elbows.',
    'Raise your arms out to the sides until they are in line with your body.',
    'Lower slowly.',
  ],
  ['Imagine spreading your arms like wings and reaching for the walls.', 'Keep the weight light. The rear delts are small muscles.'],
  ['Pulling your shoulder blades together hard so it turns into a row.', 'Using momentum from the torso.'],
);

const uprightRow = g(
  [
    'Stand tall holding the bar with an overhand grip at about shoulder width.',
    'Pull the bar up along your body, leading with your elbows.',
    'Stop when the bar reaches your lower chest and your elbows are at about shoulder height.',
    'Lower under control.',
  ],
  ['A wider grip and stopping at chest height is easier on the shoulders.', 'Keep your elbows higher than your hands.'],
  ['Using a very narrow grip.', 'Pulling up to the chin if it causes shoulder pain.'],
);

export const shoulderGuides: GuideMap = {
  'seed-overhead-press-barbell': ohp,
  'seed-overhead-press-dumbbell': variant(dbPress, { cues: ['Squeeze your glutes to keep from leaning back.'] }),
  'seed-seated-overhead-press-dumbbell': variant(dbPress, { setup: 'Sit on a bench set upright, holding the dumbbells at shoulder height.' }),
  'seed-seated-overhead-press-barbell': variant(ohp, {
    steps: [
      'Sit on an upright bench in a rack with the bar at about head height.',
      'Grip just outside shoulder width, unrack and bring the bar to your upper chest.',
      'Press straight up, moving your head back to clear the bar.',
      'Lock out overhead, then lower to your upper chest.',
    ],
  }),
  'seed-shoulder-press-machine': variant(dbPress, {
    setup: 'Adjust the seat so the handles are at about shoulder height, and sit with your back flat against the pad.',
    mistakes: ['Setting the seat so low that you start below shoulder height.'],
  }),
  'seed-arnold-press-dumbbell': g(
    [
      'Sit or stand holding the dumbbells in front of your chin, palms facing you.',
      'Rotate your palms to face forward as you press the dumbbells overhead.',
      'Finish with your arms straight, palms forward.',
      'Reverse the rotation on the way down.',
    ],
    ['Make it one smooth rotating motion.', 'Keep your ribs down.'],
    ['Rushing the rotation.', 'Arching the back.'],
  ),
  'seed-push-press-barbell': variant(ohp, {
    steps: [
      'Hold the bar in the front rack as for an overhead press.',
      'Dip by bending your knees slightly, keeping your torso upright.',
      'Drive up explosively with your legs and press the bar overhead in one motion.',
      'Lock out overhead, then lower the bar back to your shoulders.',
    ],
    cues: ['Dip straight down like an elevator, then "jump" the bar off your shoulders.'],
    mistakes: ['Dipping by pushing the hips back, which tips the torso forward.', 'Starting the press before the legs have finished driving.'],
  }),
  'seed-landmine-press-barbell': g(
    [
      'Put one end of a barbell in a landmine (or a corner) and hold the other end at shoulder height.',
      'Stand or half-kneel with your abs braced.',
      'Press the bar up and forward until your arm is straight.',
      'Lower back to your shoulder.',
    ],
    ['Reach forward at the top as if punching up and out.', 'Keep your hips and torso square. Don\'t twist.'],
    ['Leaning back to press.'],
  ),
  'seed-lateral-raise-dumbbell': lateral,
  'seed-lateral-raise-cable': variant(lateral, {
    setup: 'Stand side-on to a low pulley and hold the handle in your far hand, with the cable running across the front of your body.',
    cues: ['The cable keeps tension on the muscle even at the bottom.'],
  }),
  'seed-lateral-raise-machine': variant(lateral, {
    setup: 'Sit with your shoulders lined up with the machine\'s pivot and the pads against the outside of your arms.',
  }),
  'seed-front-raise-dumbbell': frontRaise,
  'seed-front-raise-cable': variant(frontRaise, { setup: 'Stand facing away from a low pulley holding the handle (or bar) between your legs.' }),
  'seed-reverse-fly-dumbbell': reverseFly,
  'seed-reverse-fly-machine': variant(reverseFly, {
    setup: 'Sit facing the pad with the handles at shoulder height and your arms straight out in front.',
    cues: ['Sweep your arms back in a wide arc.'],
  }),
  'seed-reverse-fly-cable': variant(reverseFly, {
    setup: 'Set two pulleys at shoulder height and cross the cables, holding the left cable in your right hand and the right cable in your left hand.',
  }),
  'seed-upright-row-barbell': uprightRow,
  'seed-upright-row-cable': variant(uprightRow, { setup: 'Stand facing a low pulley holding a straight bar attachment with an overhand grip at about shoulder width.' }),
  'seed-handstand-push-up': g(
    [
      'Kick up into a handstand against a wall, hands slightly wider than shoulder width.',
      'Brace your abs and squeeze your glutes.',
      'Lower until your head lightly touches the floor or a pad, with your head and hands forming a triangle.',
      'Press back up to straight arms.',
    ],
    ['Build up with pike push-ups or by lowering to a raised pad.', 'Keep your elbows at about 45°, not flared out.'],
    ['Arching the lower back.', 'Dropping down onto your head.'],
  ),
};

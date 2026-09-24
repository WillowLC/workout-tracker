import { g, variant, type GuideMap } from './types';

const deadlift = g(
  [
    'Stand with the bar over the middle of your feet, feet about hip-width apart.',
    'Hinge down and grip the bar just outside your legs. Bend your knees until your shins touch the bar, with your back flat and chest up.',
    'Take a big breath, brace, and pull the slack out of the bar.',
    'Push the floor away. Keep the bar in contact with your legs until you are standing tall with hips and knees locked.',
    'Lower by pushing your hips back first, then bending your knees once the bar passes them.',
  ],
  [
    'Think "push the floor away" rather than "pull the bar up".',
    'Pull the slack out first: tension the bar until you hear it click against the plates before it leaves the floor.',
    'Imagine protecting your armpits, or bending the bar around your shins. This engages your lats and keeps the bar close.',
    'Breathe into your belly and brace as if you are about to be punched.',
  ],
  [
    'Hips shooting up first, which turns the lift into a stiff-leg deadlift.',
    'Rounding the lower back.',
    'Letting the bar drift forward, away from your legs.',
    'Leaning back or overextending at the top.',
  ],
);

const bentRow = g(
  [
    'Hold the bar with an overhand grip slightly wider than shoulder width.',
    'Soften your knees and hinge forward until your torso is at about 45° or lower, back flat.',
    'Pull the bar to your lower chest or upper belly, leading with your elbows.',
    'Lower it under control until your arms are straight, keeping the same torso angle.',
  ],
  [
    'Imagine your hands are hooks and your elbows do the pulling. Drive them back toward your hips.',
    'Keep your torso as still as a table top.',
    'Squeeze your shoulder blades together at the top.',
  ],
  [
    'Standing up a bit more every rep to use momentum.',
    'Rounding the back.',
    'Jerking the weight up and dropping it.',
  ],
);

const pulldown = g(
  [
    'Adjust the thigh pad so your legs are locked in snugly.',
    'Grip the bar wider than shoulder width and sit down with your arms straight.',
    'Lean back slightly, then pull the bar to your upper chest, driving your elbows down to your sides.',
    'Let the bar rise under control until your arms are straight again.',
  ],
  [
    'Imagine pulling your elbows into your back pockets.',
    'Lift your chest up to meet the bar.',
    'Start each rep by pulling your shoulders down, away from your ears.',
  ],
  [
    'Pulling the bar behind your neck.',
    'Leaning far back and swinging the weight down.',
    'Pulling only with your arms and letting your shoulders shrug up.',
  ],
);

const pullUp = g(
  [
    'Hang from the bar with an overhand grip slightly wider than your shoulders.',
    'Start by pulling your shoulders down and back, away from your ears.',
    'Pull yourself up until your chin clears the bar.',
    'Lower all the way to a full hang under control.',
  ],
  [
    'Imagine pulling the bar down to your chest rather than lifting your body up.',
    'Drive your elbows down toward your hips.',
    'Keep your legs still: squeeze your glutes and brace your abs.',
  ],
  ['Kipping or swinging.', 'Half reps that never reach a full hang.', 'Craning your neck to get your chin over the bar.'],
);

const chinUp = variant(pullUp, {
  setup: 'Hang from the bar with an underhand (palms facing you) grip about shoulder width apart.',
  cues: ['The underhand grip brings in more biceps than a pull-up.'],
});

const shrug = g(
  [
    'Stand tall holding the weight with straight arms.',
    'Raise your shoulders straight up toward your ears as high as you can.',
    'Pause for a second at the top.',
    'Lower slowly to a full stretch.',
  ],
  ['Imagine trying to touch your ears with your shoulders.', 'Keep your arms straight. They are just hooks.'],
  ['Rolling the shoulders in circles.', 'Bending the elbows to help.', 'Pushing the head forward.'],
);

const seatedRow = g(
  [
    'Sit with your feet on the platform, knees slightly bent, and hold the handle with straight arms.',
    'Sit tall with your chest up.',
    'Pull the handle to your belly, drawing your shoulders back and down.',
    'Reach forward slowly until your arms are straight and your shoulder blades spread apart.',
  ],
  ['Imagine squeezing a pencil between your shoulder blades at the end of each rep.', 'Keep your torso nearly upright. Your arms and back do the work.'],
  ['Rocking far back to swing the weight.', 'Shrugging the shoulders up toward the ears.'],
);

const backExt = g(
  [
    'Set the pad just below your hip crease and anchor your feet.',
    'Cross your arms over your chest, with your body in a straight line.',
    'Hinge at the hips to lower your torso until you feel a stretch in your hamstrings.',
    'Squeeze your glutes to lift back up until your body is in a straight line again.',
  ],
  ['Hinge at the hips. Think of your torso as a stiff plank.', 'Finish by squeezing your glutes, not by arching your lower back.'],
  ['Overarching past straight at the top.', 'Jerking up with momentum.'],
);

export const backGuides: GuideMap = {
  'seed-deadlift-barbell': deadlift,
  'seed-deadlift-trap-bar': variant(deadlift, {
    steps: [
      'Stand in the centre of the trap bar with your feet hip-width apart.',
      'Sit down and grip the handles, back flat, chest up and arms straight.',
      'Brace and push the floor away until you are standing tall.',
      'Lower by sitting back and down along the same path.',
    ],
    cues: ['A trap bar allows more knee bend and a more upright torso than a straight bar.'],
    mistakes: ['Letting the knees cave inward.'],
  }),
  'seed-deadlift-dumbbell': variant(deadlift, {
    steps: [
      'Stand with a dumbbell in each hand at your sides or in front of your thighs, feet hip-width apart.',
      'Push your hips back and bend your knees to lower the dumbbells toward the floor, back flat.',
      'Brace and stand up by pushing the floor away, keeping the dumbbells close to your body.',
      'Lock out tall with your glutes, then lower along the same path.',
    ],
  }),
  'seed-bent-over-row-barbell': bentRow,
  'seed-bent-over-row-dumbbell': variant(bentRow, {
    setup: 'Hold a dumbbell in each hand, palms facing each other or facing back.',
    cues: ['Pull the dumbbells toward your hips, not up to your shoulders.'],
  }),
  'seed-pendlay-row-barbell': g(
    [
      'Set up like a deadlift, but with a wider overhand grip and your torso almost parallel to the floor.',
      'With a flat back, pull the bar explosively from the floor to your lower chest.',
      'Return the bar to the floor and let it settle.',
      'Reset your brace before the next rep.',
    ],
    ['Your torso stays parallel to the floor. Only your arms and upper back move.', 'Imagine throwing your elbows to the ceiling.'],
    ['Lifting the torso to help the bar up.', 'Rounding the back to reach the floor.'],
  ),
  'seed-bent-over-one-arm-row-dumbbell': g(
    [
      'Put one knee and the same-side hand on a bench, with your back flat and parallel to the floor.',
      'Let the dumbbell hang from your other hand, arm straight.',
      'Row the dumbbell toward your hip, keeping your elbow close to your body.',
      'Lower until your arm is straight and you feel a stretch in your lat.',
    ],
    ['Pull the dumbbell toward your back pocket, not straight up to your chest.', 'Think about pulling with your elbow, not your hand.'],
    ['Twisting your torso to heave the weight up.', 'Shrugging the shoulder toward the ear.'],
  ),
  'seed-t-bar-row': g(
    [
      'Straddle the bar and grip the handle.',
      'Hinge to about 45° with soft knees and a flat back.',
      'Pull the handle toward your chest, squeezing your shoulder blades together.',
      'Lower until your arms are straight.',
    ],
    ['Keep your chest up and your torso angle fixed.', 'Drive your elbows back and close to your body.'],
    ['Using a hip thrust to swing the weight up.', 'Rounding the back.'],
  ),
  'seed-seated-row-cable': seatedRow,
  'seed-seated-row-machine': variant(seatedRow, {
    setup: 'Adjust the seat and chest pad so your arms are fully extended when you grab the handles.',
    cues: ['Keep your chest against the pad for the whole set.'],
  }),
  'seed-iso-lateral-row-machine': variant(seatedRow, {
    setup: 'Adjust the seat so the handles are at about shoulder height, and put your chest against the pad.',
    cues: ['Each arm moves independently, so you can train one side at a time or both together.'],
  }),
  'seed-chest-supported-row-dumbbell': variant(bentRow, {
    steps: [
      'Set a bench to 30–45° and lie face down with your chest on the pad, a dumbbell in each hand.',
      'Let your arms hang straight down.',
      'Row the dumbbells up toward your hips, squeezing your shoulder blades together.',
      'Lower until your arms are straight.',
    ],
    cues: ['The bench takes momentum out of it. Keep your chest glued to the pad.'],
  }),
  'seed-lat-pulldown-cable': pulldown,
  'seed-lat-pulldown-close-grip-cable': variant(pulldown, {
    setup: 'Attach a close-grip (V) handle, lock your legs under the pad and hold it with your arms straight.',
    cues: ['Keep your elbows close to your body on the way down.'],
  }),
  'seed-lat-pulldown-machine': pulldown,
  'seed-straight-arm-pulldown-cable': g(
    [
      'Stand facing a high pulley holding a bar or rope with your arms nearly straight.',
      'Hinge slightly forward at the hips.',
      'Sweep the bar down in an arc to your thighs, keeping your arms straight.',
      'Let it rise slowly back to about eye level.',
    ],
    ['Your arms are just ropes. Your lats do the work.', 'Imagine pushing the bar into your pockets.'],
    ['Bending the elbows, which turns it into a triceps pushdown.', 'Swinging the torso.'],
  ),
  'seed-pull-up': pullUp,
  'seed-pull-up-weighted': variant(pullUp, { cues: ['Add weight with a dip belt or a dumbbell held between your feet.'] }),
  'seed-pull-up-assisted': variant(pullUp, {
    setup: 'On an assisted machine, kneel on the pad (or put a knee in a band looped over the bar) and grip slightly wider than your shoulders. More assistance makes it easier.',
    cues: ['Reduce the assistance over time until you can do bodyweight pull-ups.'],
  }),
  'seed-chin-up': chinUp,
  'seed-chin-up-weighted': variant(chinUp, { cues: ['Add weight with a dip belt or a dumbbell held between your feet.'] }),
  'seed-chin-up-assisted': variant(chinUp, {
    setup: 'On an assisted machine, kneel on the pad and grip underhand at shoulder width. More assistance makes it easier.',
  }),
  'seed-inverted-row': g(
    [
      'Set a bar at about waist height in a rack or Smith machine and lie underneath it.',
      'Grip the bar slightly wider than your shoulders, heels on the floor, body straight.',
      'Pull your chest to the bar.',
      'Lower until your arms are straight.',
    ],
    ['Imagine a plank that moves: keep your hips up and your glutes squeezed.', 'Bend your knees to make it easier, or raise your feet to make it harder.'],
    ['Hips sagging.', 'Only reaching halfway up.'],
  ),
  'seed-face-pull-cable': g(
    [
      'Set a rope on a cable at about upper-chest to eye height and grip it palms down.',
      'Step back so your arms are straight and the cable is under tension.',
      'Pull the rope toward your face, spreading your hands apart with your elbows high.',
      'Finish with your hands beside your ears, then return under control.',
    ],
    ['Imagine hitting a double-biceps pose at the end of each rep.', 'Keep your elbows at or above hand height.'],
    ['Using too much weight and leaning back.', 'Letting the elbows drop so it becomes a row.'],
  ),
  'seed-shrug-barbell': variant(shrug, { setup: 'Stand tall holding the bar in front of your thighs with a shoulder-width grip.' }),
  'seed-shrug-dumbbell': variant(shrug, { setup: 'Stand tall holding a dumbbell at each side, palms facing in.' }),
  'seed-rack-pull-barbell': variant(deadlift, {
    steps: [
      'Set the bar on the rack pins or blocks, usually at or just below knee height.',
      'Grip it as for a deadlift, with a flat back and your chest up.',
      'Brace and stand up, driving your hips forward until you are standing tall.',
      'Lower it back to the pins under control.',
    ],
  }),
  'seed-good-morning-barbell': g(
    [
      'Set the bar on your upper back as for a squat, with your feet hip-width apart.',
      'Soften your knees slightly and brace.',
      'Push your hips back, hinging your torso forward until you feel a strong hamstring stretch or reach almost parallel.',
      'Drive your hips forward to stand back up.',
    ],
    ['Imagine closing a car door behind you with your butt.', 'Keep your back flat. The movement happens at the hips.'],
    ['Rounding the back.', 'Bending the knees so much that it becomes a squat.', 'Going heavy too soon.'],
  ),
  'seed-back-extension': backExt,
  'seed-back-extension-weighted': variant(backExt, { cues: ['Hug a plate or dumbbell to your chest for extra load.'] }),
};

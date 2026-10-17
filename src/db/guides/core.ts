import { g, variant, type GuideMap } from './types';

const crunch = g(
  [
    'Lie on your back with your knees bent and your feet flat.',
    'Rest your fingertips lightly at your temples or cross your arms over your chest.',
    'Curl your head and shoulders off the floor by bringing your ribs toward your hips.',
    'Lower slowly.',
  ],
  ['Imagine rolling your spine up like a carpet, one vertebra at a time.', 'Breathe out as you curl up.'],
  ['Yanking on your neck with your hands.', 'Using momentum instead of your abs.'],
);

const legRaise = g(
  [
    'Hang from a pull-up bar with a firm grip and straight arms.',
    'Brace your abs to stop any swinging.',
    'Raise your legs, straight or slightly bent, to at least hip height, curling your pelvis up at the top.',
    'Lower slowly without swinging.',
  ],
  ['Curl your pelvis up at the top, as if showing your tailbone to the wall in front of you.', 'Move slowly enough that you never swing.'],
  ['Swinging to get the legs up.', 'Only lifting from the hips without curling the pelvis. That mostly works the hip flexors.'],
);

const plank = g(
  [
    'Put your forearms on the floor with your elbows under your shoulders.',
    'Step your feet back so your body forms a straight line from head to heels.',
    'Brace your abs and squeeze your glutes.',
    'Hold, breathing steadily.',
  ],
  ['Imagine pulling your elbows toward your toes without moving them. The whole front of your body switches on.', 'Squeeze your glutes as if cracking a walnut.'],
  ['Hips sagging.', 'Hips piking up high.', 'Holding your breath.'],
);

export const coreGuides: GuideMap = {
  'seed-crunch': crunch,
  'seed-cable-crunch': g(
    [
      'Kneel facing a high pulley and hold a rope beside your head.',
      'Keep your hips still, positioned over your knees.',
      'Crunch down by rounding your spine, bringing your elbows toward your thighs.',
      'Uncurl slowly back to the start.',
    ],
    ['Curl, don\'t bow. Think of rolling up, not hinging at the hips.', 'Your arms just hold the rope. Your abs do the pulling.'],
    ['Sitting back onto the heels to move the weight.', 'Pulling with the arms.'],
  ),
  'seed-crunch-machine': variant(crunch, {
    setup: 'Sit in the machine with the pads against your chest or your hands on the handles, and your feet secured.',
  }),
  'seed-decline-crunch': variant(crunch, { setup: 'Lie on a decline bench with your feet hooked under the pads.' }),
  'seed-sit-up': variant(crunch, {
    steps: [
      'Lie on your back with your knees bent and your feet flat or anchored.',
      'Cross your arms over your chest.',
      'Curl up all the way to sitting.',
      'Lower back down slowly, one vertebra at a time.',
    ],
  }),
  'seed-hanging-leg-raise': legRaise,
  'seed-knee-raise-captain-s-chair': variant(legRaise, {
    steps: [
      'Stand in the captain\'s chair with your back against the pad and your forearms on the armrests.',
      'Let your legs hang straight down.',
      'Bring your knees up toward your chest, curling your pelvis at the top.',
      'Lower slowly.',
    ],
  }),
  'seed-lying-leg-raise': g(
    [
      'Lie flat on your back with your hands under your glutes or at your sides.',
      'Keep your legs straight and together.',
      'Raise them until they are vertical.',
      'Lower slowly until they are just above the floor, keeping your lower back pressed down.',
    ],
    ['Your lower back stays glued to the floor. If it lifts, bend your knees a little.'],
    ['Lower back arching off the floor.', 'Dropping the legs quickly.'],
  ),
  'seed-russian-twist': g(
    [
      'Sit with your knees bent and lean back to about 45°, feet on the floor or raised.',
      'Hold your hands or a weight in front of your chest.',
      'Rotate your torso to one side, bringing the weight beside your hip.',
      'Rotate to the other side.',
    ],
    ['Turn from your ribcage, not just your arms.', 'Keep your chest up and your back straight.'],
    ['Rounding the back.', 'Only moving the arms.'],
  ),
  'seed-bicycle-crunch': g(
    [
      'Lie on your back with your hands lightly at your temples, your shoulders lifted and your legs raised.',
      'Bring one knee in while straightening the other leg.',
      'Rotate so the opposite elbow moves toward the bent knee.',
      'Switch sides in a slow pedalling motion.',
    ],
    ['Slow and controlled beats fast and sloppy.', 'Keep your lower back pressed into the floor.'],
    ['Pulling on the neck.', 'Rushing the reps.'],
  ),
  'seed-ab-wheel': g(
    [
      'Kneel holding the ab wheel on the floor under your shoulders.',
      'Brace your abs and tuck your ribs down.',
      'Roll forward as far as you can while keeping your back flat.',
      'Pull the wheel back with your abs.',
    ],
    ['Hold a hollow body: ribs down and glutes squeezed.', 'Only go as far as you can while keeping the lower back from sagging.'],
    ['Lower back sagging at full extension.', 'Leading with the hips on the way back.'],
  ),
  'seed-mountain-climber': g(
    [
      'Start in a high plank with your hands under your shoulders.',
      'Drive one knee toward your chest.',
      'Switch legs quickly, like running in place.',
      'Keep going for time or reps.',
    ],
    ['Keep your hips level with your shoulders.', 'Keep your shoulders stacked over your hands.'],
    ['Hips bouncing up and down.', 'Shoulders drifting behind the hands.'],
  ),
  'seed-plank': plank,
  'seed-side-plank': variant(plank, {
    steps: [
      'Lie on your side with your elbow under your shoulder and your feet stacked or staggered.',
      'Lift your hips until your body forms a straight line.',
      'Brace and hold.',
      'Switch sides.',
    ],
  }),
  'seed-hollow-hold': g(
    [
      'Lie on your back with your arms overhead.',
      'Press your lower back into the floor.',
      'Lift your shoulders and legs a few centimetres off the floor into a shallow banana shape.',
      'Hold, breathing steadily.',
    ],
    ['Your lower back stays glued to the floor. If it lifts, bend your knees or raise your legs higher.'],
    ['Lower back arching.', 'Holding your breath.'],
  ),
  'seed-dead-bug': g(
    [
      'Lie on your back with your arms pointing to the ceiling and your knees bent at 90° over your hips.',
      'Press your lower back into the floor.',
      'Slowly lower one arm and the opposite leg toward the floor.',
      'Return and switch sides.',
    ],
    ['Breathe out as you extend.', 'Your lower back must not leave the floor.'],
    ['Arching the back.', 'Moving too fast.'],
  ),
  'seed-pallof-press-cable': g(
    [
      'Stand side-on to a cable at chest height, holding the handle at your chest with both hands.',
      'Step away until the cable is taut and brace your abs.',
      'Press the handle straight out in front of you and hold for a moment.',
      'Bring it back to your chest.',
    ],
    ['Don\'t let the cable twist you. The work is in resisting the rotation.', 'Keep your hips square.'],
    ['Rotating toward the cable.', 'Leaning away from the cable.'],
  ),
  'seed-woodchopper-cable': g(
    [
      'Set a cable high and stand side-on to it, holding the handle with both hands.',
      'Pull the handle diagonally down and across your body toward the opposite hip.',
      'Rotate through your torso and pivot your back foot.',
      'Return slowly.',
    ],
    ['Keep your arms fairly straight. The rotation comes from your core.', 'Imagine chopping a log diagonally.'],
    ['Pulling with the arms only.', 'Rounding the back.'],
  ),
  'seed-hanging-knee-raise': variant(legRaise, {
    steps: [
      'Hang from a pull-up bar with your arms straight and legs together.',
      'Brace your abs and stop any swing.',
      'Bring your knees up toward your chest, rolling your pelvis up at the top.',
      'Lower your legs slowly until they are straight.',
    ],
    cues: ['A good step towards hanging leg raises.'],
  }),
  'seed-toes-to-bar': variant(legRaise, {
    steps: [
      'Hang from a pull-up bar with an overhand grip, arms straight.',
      'Pull your shoulders down slightly and brace.',
      'Lift your legs up until your toes touch the bar.',
      'Lower your legs under control without swinging.',
    ],
    cues: ['Press the bar down toward your hips with straight arms as your legs rise.'],
  }),
  'seed-reverse-crunch': g(
    [
      'Lie on your back with your hands by your sides or holding a bench behind your head.',
      'Bend your knees to 90° with your thighs vertical.',
      'Curl your hips off the floor, bringing your knees toward your chest.',
      'Lower your hips slowly back down.',
    ],
    ['Think about peeling your spine off the floor one vertebra at a time.', 'Your hips curl up, your knees just come along.'],
    ['Swinging the legs to throw the hips up.', 'Letting the lower back arch as you lower.'],
  ),
  'seed-v-up': g(
    [
      'Lie flat on your back with your arms overhead and legs straight.',
      'Brace your abs.',
      'Lift your legs and torso at the same time, reaching your hands toward your toes.',
      'Lower both back down slowly without letting them rest.',
    ],
    ['Imagine folding your body in half like a pocket knife.', 'Bend the knees slightly if you cannot keep the legs straight.'],
    ['Jerking up with momentum.', 'Crashing back down to the floor.'],
  ),
  'seed-l-sit': g(
    [
      'Sit between two parallettes or dip bars with your hands on them.',
      'Press down to lift your hips off the floor with straight arms.',
      'Lift your legs straight out in front of you, level with your hips.',
      'Hold for time.',
    ],
    ['Push your shoulders down away from your ears.', 'Tuck your knees in (tuck L-sit) until you can hold the full version.'],
    ['Letting the shoulders shrug up.', 'Bending the elbows.'],
  ),
  'seed-copenhagen-plank': variant(plank, {
    steps: [
      'Lie on your side with your forearm under your shoulder and your top leg resting on a bench.',
      'Put the inside of your top foot or knee on the bench, bottom leg underneath.',
      'Lift your hips until your body forms a straight line, using your top leg to hold you up.',
      'Hold for time, then switch sides.',
    ],
    cues: ['Support the bench at the knee to make it easier, at the ankle to make it harder.'],
  }),
  'seed-side-bend-dumbbell': g(
    [
      'Stand tall with a dumbbell in one hand at your side, the other hand on your hip or behind your head.',
      'Bend sideways toward the dumbbell, letting it slide down your leg.',
      'Pull yourself back up to standing using your opposite obliques.',
      'Finish all reps, then switch sides.',
    ],
    ['Bend straight to the side, as if between two panes of glass.', 'Move slowly and feel the stretch.'],
    ['Leaning forward or twisting.', 'Holding weights in both hands, which cancels out the load.'],
  ),
  'seed-side-bend-cable': g(
    [
      'Stand side-on to a low pulley holding a single handle in the nearer hand.',
      'Step away until the weight lifts, standing tall.',
      'Bend away from the stack, pulling the handle up your leg.',
      'Let the cable pull you slowly back toward the stack for a stretch.',
    ],
    ['Bend straight to the side, as if between two panes of glass.', 'The cable keeps tension all the way through.'],
    ['Twisting the torso.', 'Pulling with the arm instead of the obliques.'],
  ),
};

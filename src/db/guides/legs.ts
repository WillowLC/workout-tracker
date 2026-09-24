import { g, variant, type GuideMap } from './types';

const squat = g(
  [
    'Set the bar on your upper back (traps), hands just outside your shoulders, then unrack and step back.',
    'Stand with your feet about shoulder-width apart, toes turned slightly out.',
    'Take a big breath and brace, then sit down between your hips, keeping your chest up and your knees tracking over your toes.',
    'Go as deep as you can with a flat back, ideally with the hip crease below the knee.',
    'Drive back up through your whole foot.',
  ],
  [
    'Imagine spreading the floor apart with your feet. This keeps your knees out.',
    'Sit down between your heels, not back onto a chair.',
    'Breathe into your belly and brace as if you are about to be punched.',
    'Drive your upper back up into the bar as you stand.',
  ],
  [
    'Knees caving inward.',
    'Heels lifting off the floor.',
    'Hips shooting up first, so the lift turns into a good morning.',
    'Losing your brace at the bottom.',
  ],
);

const legPress = g(
  [
    'Sit with your back and hips flat against the pad and your feet hip-width apart in the middle of the platform.',
    'Push the platform up and release the safety handles.',
    'Lower it by bending your knees to about 90°, or as deep as you can without your lower back lifting off the pad.',
    'Press back up through your whole foot without locking your knees hard.',
  ],
  ['Keep your lower back glued to the pad.', 'Push through your heels and midfoot, not just your toes.', 'Placing your feet higher shifts work to the glutes; lower shifts it to the quads.'],
  ['Lower back rounding off the pad at the bottom.', 'Snapping the knees into hard lockout.', 'Bouncing out of the bottom.'],
);

const rdl = g(
  [
    'Stand tall holding the bar at hip height with an overhand grip, feet hip-width apart.',
    'Soften your knees slightly and keep them there.',
    'Push your hips back, sliding the bar down your thighs with a flat back, until you feel a strong hamstring stretch (usually around mid-shin).',
    'Drive your hips forward to stand tall again.',
  ],
  [
    'Imagine closing a car door behind you with your hips, or pushing your butt toward the wall behind you.',
    'Keep the bar shaving your legs on the way down and up.',
    'It\'s a hinge, not a squat. Your knees barely change angle.',
  ],
  ['Squatting the weight down by bending the knees a lot.', 'Rounding the lower back to reach lower.', 'Letting the bar drift away from the body.'],
);

const lunge = g(
  [
    'Stand tall with your feet hip-width apart.',
    'Take a long step forward.',
    'Lower straight down until both knees are at about 90°, back knee just above the floor.',
    'Push through your front foot to step back to the start. Alternate legs or finish one side first.',
  ],
  ['Imagine going straight down like an elevator, not forward like an escalator.', 'Keep your front knee in line with your toes.', 'Stay tall through your chest.'],
  ['Too short a step, so the front heel lifts.', 'Front knee caving inward.', 'Pushing off the back foot to stand up.'],
);

const calf = g(
  [
    'Stand with the balls of your feet on the edge of the platform, heels hanging free.',
    'Lower your heels as far as you comfortably can for a full stretch.',
    'Rise up onto your toes as high as possible.',
    'Pause at the top, then lower slowly.',
  ],
  ['Push through your big toe so your ankles don\'t roll out.', 'Pause for a second at the bottom to take out the bounce.'],
  ['Bouncing through short, fast reps.', 'Bending the knees to help.'],
);

const legCurl = g(
  [
    'Line your knees up with the machine\'s pivot point and set the ankle pad just above your heels.',
    'Curl your heels toward your glutes as far as you can.',
    'Squeeze your hamstrings for a moment at the end.',
    'Lower slowly until your legs are nearly straight.',
  ],
  ['Keep your hips pressed down into the pad.', 'Take 2–3 seconds to lower each rep.'],
  ['Hips lifting or twisting to finish the rep.', 'Jerking the weight up with momentum.'],
);

const hipThrust = g(
  [
    'Sit on the floor with your upper back against the edge of a bench, just below your shoulder blades. Roll a padded bar over your hip crease.',
    'Plant your feet flat about hip-width apart, so your shins will be vertical at the top.',
    'Drive through your heels to lift your hips until your torso and thighs form a straight line.',
    'Squeeze your glutes hard at the top, then lower under control.',
  ],
  [
    'Keep your chin tucked and eyes forward, not up at the ceiling.',
    'At the top, tuck your tail under slightly, as if zipping up tight jeans. This keeps the lower back from arching.',
    'Your ribs stay down and your upper back pivots on the bench.',
  ],
  ['Arching the lower back instead of extending the hips.', 'Feet too far forward, which moves the work into the hamstrings.'],
);

const goblet = g(
  [
    'Hold the weight vertically against your chest with both hands.',
    'Stand with your feet a little wider than shoulder width, toes slightly out.',
    'Squat down between your legs, keeping your chest up, until your elbows are between your knees.',
    'Drive up through your whole foot.',
  ],
  ['Use your elbows to nudge your knees outward at the bottom.', 'Imagine sitting straight down between your heels.'],
  ['Letting the weight drift away from your chest.', 'Heels lifting.'],
);

export const legGuides: GuideMap = {
  'seed-squat-barbell': squat,
  'seed-front-squat-barbell': variant(squat, {
    steps: [
      'Rest the bar on the front of your shoulders with your fingertips under it (clean grip) or arms crossed, elbows high.',
      'Stand with your feet about shoulder-width apart, toes slightly out.',
      'Brace and squat down with a very upright torso, knees travelling forward over your toes.',
      'Drive up, leading with your elbows.',
    ],
    cues: ['Point your elbows at the wall in front of you the whole time.'],
    mistakes: ['Elbows dropping, so the bar rolls forward.'],
  }),
  'seed-squat-smith-machine': variant(squat, {
    steps: [
      'Set the bar at shoulder height and step under it so it rests on your upper back.',
      'Place your feet slightly in front of the bar, about shoulder-width apart.',
      'Unhook the bar and squat down with your chest up and knees over your toes.',
      'Drive up and re-hook the bar at the end. Set the safety stops.',
    ],
  }),
  'seed-box-squat-barbell': variant(squat, {
    steps: [
      'Put a box behind you at about parallel height, then unrack the bar onto your upper back.',
      'Stand with a slightly wider stance than a normal squat.',
      'Sit back onto the box under control. Pause briefly without relaxing.',
      'Drive up off the box.',
    ],
    mistakes: ['Plopping down onto the box.', 'Rocking back and forth to get off the box.'],
  }),
  'seed-goblet-squat-kettlebell': variant(goblet, { setup: 'Hold the kettlebell by the horns against your chest.' }),
  'seed-goblet-squat-dumbbell': variant(goblet, { setup: 'Hold one end of a dumbbell vertically against your chest, cupping it with both hands.' }),
  'seed-hack-squat-machine': g(
    [
      'Put your shoulders under the pads and your back flat against the pad. Place your feet shoulder-width apart in the middle of the platform.',
      'Release the safety handles.',
      'Lower until your thighs are parallel to the platform or below.',
      'Press back up through your whole foot without locking your knees hard.',
    ],
    ['Keep your back flat against the pad.', 'Placing your feet lower targets the quads more; higher brings in more glutes.'],
    ['Heels lifting off the platform.', 'Lower back peeling off the pad at the bottom.'],
  ),
  'seed-pendulum-squat-machine': g(
    [
      'Put your shoulders under the pads with your back flat on the pad and your feet about hip-width apart on the platform.',
      'Release the lock.',
      'Squat down deep along the machine\'s arc.',
      'Drive back up through your whole foot.',
    ],
    ['Let your knees travel forward. The machine is built for a deep, quad-focused squat.', 'Control the lowering.'],
    ['Cutting the range short.', 'Heels lifting.'],
  ),
  'seed-leg-press': legPress,
  'seed-leg-extension-machine': g(
    [
      'Adjust the back pad so your knees line up with the machine\'s pivot, and set the ankle pad just above your feet.',
      'Hold the handles and sit tall.',
      'Extend your legs until they are straight, and squeeze your quads.',
      'Lower slowly.',
    ],
    ['Imagine kicking the pad up to the ceiling, then pause at the top.', 'Take 2–3 seconds to lower each rep.'],
    ['Swinging the weight up.', 'Lifting your hips off the seat.'],
  ),
  'seed-lying-leg-curl-machine': variant(legCurl, { setup: 'Lie face down with your knees just off the edge of the pad, lined up with the pivot, and the ankle pad just above your heels.' }),
  'seed-seated-leg-curl-machine': variant(legCurl, { setup: 'Sit with your knees lined up with the pivot, the thigh pad locked down on your thighs and the calf pad just above your heels.' }),
  'seed-romanian-deadlift-barbell': rdl,
  'seed-romanian-deadlift-dumbbell': variant(rdl, { setup: 'Stand tall holding a dumbbell in each hand in front of your thighs, feet hip-width apart.' }),
  'seed-stiff-leg-deadlift-barbell': variant(rdl, {
    steps: [
      'Stand with the bar over the middle of your feet, legs nearly straight with a slight knee bend.',
      'Hinge at the hips to grip the bar with a flat back.',
      'Stand up by driving your hips forward, keeping your legs almost straight.',
      'Hinge back down until the bar reaches the floor or your hamstrings stop you.',
    ],
    cues: ['This uses straighter legs than a Romanian deadlift, so expect a bigger hamstring stretch.'],
  }),
  'seed-sumo-deadlift-barbell': g(
    [
      'Take a wide stance with your toes turned out and your shins close to the bar.',
      'Grip the bar with straight arms inside your knees.',
      'Drop your hips, lift your chest and pull the slack out of the bar.',
      'Push the floor apart and stand up tall, keeping the bar close.',
    ],
    ['Imagine spreading the floor apart with your feet.', 'Push your knees out over your toes.', 'Keep your hips close to the bar.'],
    ['Hips rising before the bar moves.', 'Knees caving in.'],
  ),
  'seed-bulgarian-split-squat-dumbbell': g(
    [
      'Stand in front of a bench holding a dumbbell in each hand, and place the top of your rear foot on the bench.',
      'Hop your front foot forward far enough that your knee won\'t shoot past your toes too much.',
      'Lower your back knee toward the floor.',
      'Drive up through your front foot.',
    ],
    ['Imagine going straight down like an elevator.', 'A slight forward lean works the glutes more; staying upright works the quads more.'],
    ['Pushing up with the back leg.', 'Front knee caving in.', 'Front foot too close to the bench.'],
  ),
  'seed-lunge-dumbbell': variant(lunge, { setup: 'Stand tall holding a dumbbell at each side, feet hip-width apart.' }),
  'seed-lunge-barbell': variant(lunge, { setup: 'Set the bar on your upper back as for a squat and stand tall, feet hip-width apart.', cues: ['Start light. Balance is the limiter.'] }),
  'seed-walking-lunge-dumbbell': variant(lunge, {
    steps: [
      'Stand tall holding a dumbbell at each side.',
      'Step forward and lower until both knees are at about 90°.',
      'Drive through your front foot and bring your back foot straight through into the next step.',
      'Keep going for the set number of steps.',
    ],
  }),
  'seed-step-up-dumbbell': g(
    [
      'Stand facing a box or bench at about knee height, holding a dumbbell at each side.',
      'Put your whole foot on the box.',
      'Drive through that foot to stand up tall on the box.',
      'Step down under control and repeat.',
    ],
    ['The top leg does all the work. Imagine the bottom foot is too hot to push off.', 'Stand all the way up at the top.'],
    ['Springing off the bottom leg.', 'Knee caving inward.'],
  ),
  'seed-hip-thrust-barbell': hipThrust,
  'seed-hip-thrust-machine': variant(hipThrust, {
    setup: 'Sit in the machine with your upper back on the pad and the hip belt or pad across your hip crease.',
  }),
  'seed-glute-bridge': variant(hipThrust, {
    steps: [
      'Lie on your back with your knees bent and your feet flat, hip-width apart.',
      'Brace your abs and drive through your heels to lift your hips until your body forms a straight line from shoulders to knees.',
      'Squeeze your glutes for a second at the top.',
      'Lower under control.',
    ],
  }),
  'seed-glute-kickback-cable': g(
    [
      'Attach an ankle strap to a low pulley and put it around one ankle.',
      'Hold the frame and lean forward slightly.',
      'Kick that leg straight back and slightly up by extending at the hip.',
      'Return under control.',
    ],
    ['Imagine pushing a door closed behind you with your heel.', 'Keep your lower back still. The movement comes from your hip.'],
    ['Arching the lower back to kick higher.', 'Swinging the leg.'],
  ),
  'seed-hip-abductor-machine': g(
    [
      'Sit with the pads on the outside of your knees.',
      'Push your legs apart as far as you can.',
      'Pause for a moment.',
      'Return slowly without letting the weights touch.',
    ],
    ['Lean forward slightly to bring in more of the glutes.', 'Keep the movement slow and controlled.'],
    ['Letting the weight snap back.'],
  ),
  'seed-hip-adductor-machine': g(
    [
      'Sit with the pads on the inside of your knees, starting at a stretch you are comfortable with.',
      'Squeeze your legs together.',
      'Pause when the pads meet.',
      'Open slowly back to the start.',
    ],
    ['Start with a moderate stretch and widen it over time.', 'Keep your back against the pad.'],
    ['Starting too wide, which overstretches the groin.', 'Letting the weight yank your legs open.'],
  ),
  'seed-standing-calf-raise-machine': variant(calf, { setup: 'Put your shoulders under the pads and the balls of your feet on the edge of the platform.' }),
  'seed-standing-calf-raise-dumbbell': variant(calf, { setup: 'Stand on a step holding a dumbbell in one hand and a rail with the other, with the balls of your feet on the edge.', cues: ['Do one leg at a time for more load.'] }),
  'seed-seated-calf-raise-machine': variant(calf, { setup: 'Sit with the pad on your lower thighs and the balls of your feet on the platform edge.', cues: ['Bent knees shift the work to the soleus, the lower calf muscle.'] }),
  'seed-calf-press-on-leg-press': variant(calf, {
    setup: 'Sit in the leg press with your legs nearly straight and the balls of your feet on the bottom edge of the platform.',
    mistakes: ['Letting your feet slip off the platform. Keep the safety handles engaged where possible.'],
  }),
  'seed-nordic-hamstring-curl': g(
    [
      'Kneel on a pad with your ankles anchored under something solid or held by a partner.',
      'Keep your body straight from knees to head.',
      'Lower yourself forward slowly, resisting with your hamstrings for as long as you can.',
      'Catch yourself with your hands, then push off lightly and pull yourself back up with your hamstrings.',
    ],
    ['Imagine a plank that hinges only at the knees. Your hips stay extended.', 'Make the lowering as slow as possible. That is where the benefit is.'],
    ['Bending at the hips to shorten the lever.', 'Dropping quickly with no control.'],
  ),
  'seed-pistol-squat': g(
    [
      'Stand on one leg with the other leg straight out in front of you.',
      'Reach your arms forward for balance.',
      'Squat all the way down on the standing leg, heel flat.',
      'Stand back up without letting the other foot touch down.',
    ],
    ['Build up by squatting to a box, or hold a light weight out in front as a counterbalance.', 'Keep your standing knee tracking over your toes.'],
    ['Heel lifting.', 'Knee caving in.', 'Rounding the back to reach depth.'],
  ),
  'seed-air-squat': variant(squat, {
    steps: [
      'Stand with your feet about shoulder-width apart, toes slightly out.',
      'Reach your arms forward and sit down between your hips, keeping your chest up.',
      'Go as deep as you can with your heels down and your back flat.',
      'Stand up by driving through your whole foot.',
    ],
  }),
  'seed-box-jump': g(
    [
      'Stand facing the box about a foot away.',
      'Swing your arms back and dip into a quarter squat.',
      'Jump explosively and land softly on the box with your whole foot, in a quarter squat.',
      'Stand up tall on the box, then step down. Don\'t jump down.',
    ],
    ['Land as quietly as you can.', 'Pick a box you can land on comfortably, not one that forces a deep squat on landing.'],
    ['A box so high you land in a deep squat.', 'Jumping backwards off the box.', 'Knees caving in on landing.'],
  ),
};

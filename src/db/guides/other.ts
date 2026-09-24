import { g, variant, type GuideMap } from './types';

const clean = g(
  [
    'Set up like a deadlift with the bar over your mid-foot. Use a hook grip (thumb under fingers) just outside your legs.',
    'Lift the bar to your knees, keeping your back angle the same and the bar close.',
    'Once it passes your knees, explode: extend your hips, knees and ankles fully while keeping the bar close.',
    'Pull yourself under the bar and catch it on the front of your shoulders in a full front squat, elbows high.',
    'Stand up.',
  ],
  ['Jump with the bar, then pull yourself under it.', 'Get your elbows around fast.', 'Keep the bar brushing your thighs.'],
  ['Pulling with the arms too early.', 'Letting the bar swing away from the body.', 'Catching with the elbows low.'],
);

const snatch = g(
  [
    'Take a wide grip so the bar sits in your hip crease when you stand, using a hook grip. Set up over the bar with a flat back.',
    'Lift the bar past your knees, keeping it close.',
    'Explode through your hips, knees and ankles, with the bar brushing your hips.',
    'Pull yourself under and catch the bar overhead on locked arms in a deep overhead squat.',
    'Stand up with the bar overhead.',
  ],
  ['Keep the bar close. It should brush your hips.', 'Punch up into the bar as you drop under it.'],
  ['The bar looping out in front.', 'Pressing the bar out with bent arms.'],
);

const jerk = g(
  [
    'Hold the bar in the front rack.',
    'Dip by bending your knees slightly with your torso upright.',
    'Drive up explosively and split your feet, one forward and one back, while punching the bar overhead to locked arms.',
    'Recover by stepping the front foot back, then the back foot forward.',
  ],
  ['Dip straight down, not forward.', 'In the split, keep your front shin vertical and your back knee slightly bent.'],
  ['Pressing the bar out instead of dropping under it.', 'A short, unstable split.'],
);

const thruster = g(
  [
    'Hold the weight at your shoulders in a front rack.',
    'Squat down as you would for a front squat.',
    'Drive up hard, and use that momentum to press the weight overhead in one motion.',
    'Lower the weight back to your shoulders as you go into the next squat.',
  ],
  ['Use your legs to launch the weight. The press finishes what they start.', 'Keep your elbows up in the squat.'],
  ['Pausing between the squat and the press.', 'Elbows dropping at the bottom.'],
);

const cardio = (steps: string[], cues: string[], mistakes: string[]) => g(steps, cues, mistakes);

export const otherGuides: GuideMap = {
  // Olympic
  'seed-clean-barbell': clean,
  'seed-power-clean-barbell': variant(clean, {
    steps: [...clean.steps.slice(0, 3), 'Pull yourself under the bar and catch it on your shoulders in a partial squat, above parallel.', 'Stand up.'],
  }),
  'seed-hang-clean-barbell': variant(clean, {
    steps: [
      'Stand tall holding the bar with a hook grip just outside your thighs.',
      'Hinge to lower the bar to just above your knees, back flat.',
      'Explode by extending your hips, knees and ankles.',
      'Pull under and catch the bar in the front rack.',
      'Stand up.',
    ],
  }),
  'seed-clean-and-jerk-barbell': g(
    [...clean.steps.slice(0, 5), ...jerk.steps.slice(1)],
    [...clean.cues.slice(0, 2), ...jerk.cues],
    [...clean.mistakes.slice(0, 2), ...jerk.mistakes],
  ),
  'seed-snatch-barbell': snatch,
  'seed-power-snatch-barbell': variant(snatch, {
    steps: [...snatch.steps.slice(0, 3), 'Catch the bar overhead on locked arms in a partial squat, above parallel.', 'Stand up with the bar overhead.'],
  }),
  'seed-hang-snatch-barbell': variant(snatch, {
    steps: [
      'Stand tall holding the bar with a wide hook grip.',
      'Hinge to lower the bar to just above your knees.',
      'Explode through your hips, knees and ankles.',
      'Pull under and catch the bar overhead on locked arms.',
      'Stand up.',
    ],
  }),
  'seed-split-jerk-barbell': jerk,

  // Full body
  'seed-kettlebell-swing': g(
    [
      'Stand with the kettlebell a foot in front of you, feet a little wider than hip-width.',
      'Hinge and grab it with both hands, then hike it back between your legs like snapping a football.',
      'Snap your hips forward so the bell floats up to about chest height.',
      'Let it fall back between your legs, hinging at the hips, and go straight into the next rep.',
    ],
    ['It\'s a hip hinge, not a squat.', 'Your arms are just ropes. The power comes from your hips.', 'Stand tall like a plank at the top, glutes squeezed.'],
    ['Squatting the bell up.', 'Lifting with the arms.', 'Leaning back at the top.'],
  ),
  'seed-turkish-get-up-kettlebell': g(
    [
      'Lie on your back holding the kettlebell straight up in one hand, with the same-side knee bent.',
      'Roll up onto your opposite elbow, then onto your hand.',
      'Bridge your hips up and sweep your straight leg under you into a kneeling position.',
      'Stand up from the lunge.',
      'Reverse each step to get back down.',
    ],
    ['Keep your eyes on the bell and your arm locked vertical the whole time.', 'Move slowly. Every position should be stable.'],
    ['Letting the arm drift or bend.', 'Rushing the transitions.'],
  ),
  'seed-thruster-barbell': thruster,
  'seed-thruster-dumbbell': variant(thruster, { setup: 'Hold a dumbbell at each shoulder.' }),
  'seed-burpee': g(
    [
      'From standing, squat down and put your hands on the floor.',
      'Jump or step your feet back into a plank.',
      'Lower your chest to the floor and push back up.',
      'Jump your feet back in, then jump up with your arms overhead.',
    ],
    ['Keep a straight plank when your feet land back.', 'Find a pace you can hold for the whole set.'],
    ['Hips sagging in the plank.', 'Landing heavily.'],
  ),
  'seed-farmer-s-walk-dumbbell': g(
    [
      'Pick up heavy dumbbells from the floor with good deadlift form.',
      'Stand tall with your shoulders back and down.',
      'Walk with short, quick steps for the set distance or time.',
      'Set the weights down with a flat back.',
    ],
    ['Imagine walking tall between two close walls. Don\'t let the weights swing.', 'Brace your abs and grip hard.'],
    ['Leaning to one side.', 'Shrugging the shoulders.'],
  ),
  'seed-sled-push': g(
    [
      'Grip the sled poles, arms extended or bent.',
      'Lean in at about 45° with a flat back.',
      'Drive with your legs in short, powerful steps.',
      'Keep pushing for the set distance.',
    ],
    ['Push through the balls of your feet.', 'Keep your hips low and your back flat.'],
    ['Standing too upright.', 'Rounding the back.'],
  ),
  'seed-man-maker-dumbbell': g(
    [
      'Start in a plank with your hands on two dumbbells.',
      'Do a push-up, then row each dumbbell once.',
      'Jump your feet in toward the dumbbells.',
      'Clean the dumbbells to your shoulders and press or thrust them overhead.',
      'Lower them and return to the plank.',
    ],
    ['Keep your hips square during the rows. Widen your feet for balance.'],
    ['Twisting the hips during the rows.', 'Rounding the back on the clean.'],
  ),

  // Cardio
  'seed-running': cardio(
    ['Stand tall with a slight forward lean from the ankles.', 'Land with your foot under your hips.', 'Keep a quick, light cadence.', 'Swing your arms relaxed, front to back.'],
    ['Aim for about 170–180 steps per minute.', 'Relax your shoulders and hands.'],
    ['Overstriding with your heel far in front of you.', 'Increasing distance too quickly.'],
  ),
  'seed-running-treadmill': cardio(
    ['Start the belt slowly and step on.', 'Run tall with your feet landing under your hips.', 'Build up to your pace gradually.', 'Slow down before stepping off.'],
    ['A 1% incline feels closer to running outdoors.', 'Stay near the front of the belt.'],
    ['Holding the handrails.', 'Looking down at your feet.'],
  ),
  'seed-walking': cardio(
    ['Stand tall and look ahead.', 'Swing your arms naturally.', 'Land lightly on your heel and roll through to your toes.', 'Keep a brisk pace.'],
    ['Walking uphill is a great low-impact way to raise the intensity.'],
    ['Slouching.'],
  ),
  'seed-cycling': cardio(
    ['Set your saddle so your knee stays slightly bent at the bottom of the pedal stroke.', 'Keep a steady cadence.', 'Use your gears to hold your cadence on climbs.', 'Stay relaxed through your upper body.'],
    ['Aim for about 80–100 pedal revolutions per minute.'],
    ['Setting the saddle too low.', 'Grinding in too hard a gear.'],
  ),
  'seed-cycling-indoor': cardio(
    ['Set the saddle to hip height and the handlebars so you can reach them with a slight elbow bend.', 'Start with an easy warm-up.', 'Adjust the resistance to hit your target effort.', 'Cool down with easy pedalling.'],
    ['Keep your knees tracking over your feet.'],
    ['Bouncing in the saddle because the resistance is too low.'],
  ),
  'seed-rowing-machine': cardio(
    [
      'Strap your feet in and sit tall, holding the handle with straight arms.',
      'Drive: push with your legs, then swing your torso back slightly, then pull the handle to your lower ribs.',
      'Recover in reverse: arms out, torso forward, then bend your knees.',
      'Keep a steady rhythm.',
    ],
    ['Think "legs, body, arms" on the drive and "arms, body, legs" on the way back.', 'About 60% of the power comes from your legs.'],
    ['Pulling with the arms first.', 'Bending your knees before your arms are straight on the way back, so the handle has to go over them.'],
  ),
  'seed-swimming': cardio(
    ['Keep your body long and flat near the surface.', 'Breathe out steadily underwater.', 'Rotate your body with each stroke.', 'Kick from the hips with relaxed ankles.'],
    ['Reach long with each stroke.'],
    ['Lifting your head to breathe, which makes your legs sink.'],
  ),
  'seed-ski-erg': cardio(
    ['Stand tall holding the handles overhead.', 'Pull the handles down by hinging at the hips and crunching your abs, with a slight knee bend.', 'Finish with your hands by your thighs.', 'Rise back up tall.'],
    ['It\'s a hinge and crunch, not an arm pull.'],
    ['Pulling with just the arms.', 'Squatting deep.'],
  ),
  'seed-elliptical-trainer': cardio(
    ['Stand upright on the pedals and hold the handles.', 'Push and pull the handles while you stride.', 'Keep your whole foot on the pedal.', 'Adjust the resistance to your target effort.'],
    ['Stand tall. Don\'t lean on the handles.'],
    ['Leaning heavily on the handles.'],
  ),
  'seed-stair-machine': cardio(
    ['Step on and pick a steady speed.', 'Stand upright and take full steps.', 'Rest your hands lightly on the rails for balance.', 'Push through your whole foot.'],
    ['Pick a speed you can hold without hanging on the rails.'],
    ['Leaning on the rails.', 'Taking tiny steps on your toes.'],
  ),
  'seed-jump-rope': cardio(
    ['Hold the handles at hip height with your elbows close to your sides.', 'Turn the rope with your wrists.', 'Jump just high enough to clear the rope.', 'Land softly on the balls of your feet.'],
    ['Small, quick jumps beat high ones.'],
    ['Swinging the rope with your whole arms.', 'Jumping too high.'],
  ),
  'seed-assault-bike': cardio(
    ['Set the seat so your knee stays slightly bent at the bottom of the pedal stroke.', 'Push and pull the handles while you pedal.', 'Drive mostly with your legs.', 'Set your pace by effort. Harder means more resistance.'],
    ['The fan gives more resistance the harder you go, so pace yourself for longer efforts.'],
    ['Starting too fast.'],
  ),
};

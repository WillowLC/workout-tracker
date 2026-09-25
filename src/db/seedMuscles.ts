// Primary and secondary muscles for every built-in exercise.
// Format: 'primary, primary | secondary, secondary'. Keyed by exercise name.
import type { Muscle } from '../domain/types';
import { MUSCLES } from '../domain/types';

const BENCH = 'chest | front_delts, triceps';
const INCLINE = 'chest, front_delts | triceps';
const DECLINE = 'chest | triceps, front_delts';
const FLY = 'chest | front_delts';
const DIP_CHEST = 'chest, triceps | front_delts';
const ROW = 'upper_back, lats | rear_delts, biceps, lower_back';
const SEATED_ROW = 'upper_back, lats | rear_delts, biceps';
const PULLDOWN = 'lats | biceps, upper_back';
const CHIN = 'lats, biceps | upper_back';
const SQUAT = 'quads, glutes | adductors, lower_back';
const GOBLET = 'quads, glutes | adductors, abs';
const RDL = 'hamstrings, glutes | lower_back';
const LUNGE = 'quads, glutes | adductors, hamstrings';
const PRESS = 'front_delts | side_delts, triceps';
const LATERAL = 'side_delts | traps';
const FRONT_RAISE = 'front_delts | side_delts';
const REAR = 'rear_delts | upper_back';
const UPRIGHT = 'side_delts, traps | biceps, front_delts';
const CURL = 'biceps | forearms';
const HAMMER = 'biceps, forearms';
const ISO_CURL = 'biceps';
const TRI = 'triceps';
const DIP_TRI = 'triceps | chest, front_delts';
const CALF = 'calves';
const PULL_OLY = 'hamstrings, glutes, traps | quads, upper_back, lower_back';
const SNATCH_POWER = 'hamstrings, glutes, traps | quads, front_delts, upper_back';
const RUN = 'quads, calves | hamstrings, glutes';
const BIKE = 'quads | glutes, calves, hamstrings';
const THRUSTER = 'quads, front_delts | glutes, triceps';

export const SEED_MUSCLES: Record<string, string> = {
  // Chest
  'Bench Press (Barbell)': BENCH, 'Bench Press (Dumbbell)': BENCH, 'Bench Press (Smith Machine)': BENCH,
  'Incline Bench Press (Barbell)': INCLINE, 'Incline Bench Press (Dumbbell)': INCLINE, 'Incline Bench Press (Smith Machine)': INCLINE,
  'Decline Bench Press (Barbell)': DECLINE, 'Decline Bench Press (Dumbbell)': DECLINE,
  'Chest Press (Machine)': BENCH, 'Incline Chest Press (Machine)': INCLINE,
  'Chest Fly (Dumbbell)': FLY, 'Incline Chest Fly (Dumbbell)': FLY, 'Chest Fly (Machine)': FLY,
  'Cable Crossover': FLY, 'Cable Fly (Cable)': FLY, 'Low Cable Fly (Cable)': FLY,
  'Floor Press (Barbell)': 'chest, triceps | front_delts', 'Pullover (Dumbbell)': 'chest, lats | triceps',
  'Push Up': 'chest | front_delts, triceps, abs', 'Incline Push Up': BENCH, 'Decline Push Up': INCLINE,
  'Chest Dip': DIP_CHEST, 'Chest Dip (Weighted)': DIP_CHEST, 'Chest Dip (Assisted)': DIP_CHEST,

  // Back
  'Deadlift (Barbell)': 'hamstrings, glutes, lower_back | quads, traps, forearms, upper_back',
  'Deadlift (Trap Bar)': 'quads, glutes | hamstrings, lower_back, traps, forearms',
  'Deadlift (Dumbbell)': 'hamstrings, glutes | lower_back, quads, forearms',
  'Bent Over Row (Barbell)': ROW, 'Bent Over Row (Dumbbell)': ROW, 'Pendlay Row (Barbell)': ROW,
  'Bent Over One Arm Row (Dumbbell)': 'lats, upper_back | rear_delts, biceps',
  'T Bar Row': SEATED_ROW, 'Seated Row (Cable)': SEATED_ROW, 'Seated Row (Machine)': SEATED_ROW, 'Iso-Lateral Row (Machine)': SEATED_ROW,
  'Chest Supported Row (Dumbbell)': 'upper_back | lats, rear_delts, biceps',
  'Lat Pulldown (Cable)': PULLDOWN, 'Lat Pulldown - Close Grip (Cable)': PULLDOWN, 'Lat Pulldown (Machine)': PULLDOWN,
  'Straight Arm Pulldown (Cable)': 'lats | triceps',
  'Pull Up': PULLDOWN, 'Pull Up (Weighted)': PULLDOWN, 'Pull Up (Assisted)': PULLDOWN,
  'Chin Up': CHIN, 'Chin Up (Weighted)': CHIN, 'Chin Up (Assisted)': CHIN,
  'Inverted Row': 'upper_back, lats | biceps, rear_delts',
  'Face Pull (Cable)': 'rear_delts | upper_back, traps',
  'Shrug (Barbell)': 'traps | forearms', 'Shrug (Dumbbell)': 'traps | forearms',
  'Rack Pull (Barbell)': 'lower_back, glutes, traps | hamstrings, forearms, upper_back',
  'Good Morning (Barbell)': 'hamstrings, lower_back | glutes',
  'Back Extension': 'lower_back | glutes, hamstrings', 'Back Extension (Weighted)': 'lower_back | glutes, hamstrings',

  // Legs
  'Squat (Barbell)': SQUAT, 'Front Squat (Barbell)': 'quads | glutes, abs', 'Squat (Smith Machine)': 'quads, glutes | adductors',
  'Box Squat (Barbell)': 'quads, glutes | hamstrings, adductors',
  'Goblet Squat (Kettlebell)': GOBLET, 'Goblet Squat (Dumbbell)': GOBLET,
  'Hack Squat (Machine)': 'quads | glutes', 'Pendulum Squat (Machine)': 'quads | glutes',
  'Leg Press': 'quads, glutes | adductors', 'Leg Extension (Machine)': 'quads',
  'Lying Leg Curl (Machine)': 'hamstrings | calves', 'Seated Leg Curl (Machine)': 'hamstrings',
  'Romanian Deadlift (Barbell)': RDL, 'Romanian Deadlift (Dumbbell)': RDL,
  'Stiff Leg Deadlift (Barbell)': 'hamstrings | glutes, lower_back',
  'Sumo Deadlift (Barbell)': 'glutes, quads, adductors | hamstrings, lower_back, traps',
  'Bulgarian Split Squat (Dumbbell)': 'quads, glutes | adductors',
  'Lunge (Dumbbell)': LUNGE, 'Lunge (Barbell)': LUNGE, 'Walking Lunge (Dumbbell)': LUNGE,
  'Step-up (Dumbbell)': 'quads, glutes | hamstrings',
  'Hip Thrust (Barbell)': 'glutes | hamstrings', 'Hip Thrust (Machine)': 'glutes | hamstrings',
  'Glute Bridge': 'glutes | hamstrings', 'Glute Kickback (Cable)': 'glutes | hamstrings',
  'Hip Abductor (Machine)': 'abductors | glutes', 'Hip Adductor (Machine)': 'adductors',
  'Standing Calf Raise (Machine)': CALF, 'Standing Calf Raise (Dumbbell)': CALF, 'Seated Calf Raise (Machine)': CALF,
  'Calf Press on Leg Press': CALF, 'Nordic Hamstring Curl': 'hamstrings',
  'Pistol Squat': 'quads, glutes | abs', 'Air Squat': 'quads, glutes', 'Box Jump': 'quads, glutes | calves',

  // Shoulders
  'Overhead Press (Barbell)': 'front_delts | side_delts, triceps, traps', 'Overhead Press (Dumbbell)': PRESS,
  'Seated Overhead Press (Dumbbell)': PRESS, 'Seated Overhead Press (Barbell)': PRESS, 'Shoulder Press (Machine)': PRESS,
  'Arnold Press (Dumbbell)': PRESS, 'Push Press (Barbell)': 'front_delts | triceps, side_delts, quads',
  'Landmine Press (Barbell)': 'front_delts | chest, triceps',
  'Lateral Raise (Dumbbell)': LATERAL, 'Lateral Raise (Cable)': LATERAL, 'Lateral Raise (Machine)': LATERAL,
  'Front Raise (Dumbbell)': FRONT_RAISE, 'Front Raise (Cable)': FRONT_RAISE,
  'Reverse Fly (Dumbbell)': REAR, 'Reverse Fly (Machine)': REAR, 'Reverse Fly (Cable)': REAR,
  'Upright Row (Barbell)': UPRIGHT, 'Upright Row (Cable)': UPRIGHT,
  'Handstand Push Up': 'front_delts, triceps | side_delts, traps',

  // Arms
  'Bicep Curl (Barbell)': CURL, 'Bicep Curl (Dumbbell)': CURL, 'Bicep Curl (Cable)': CURL, 'Bayesian Curl (Cable)': CURL,
  'Bicep Curl (Machine)': CURL, 'EZ Bar Curl': CURL, 'Hammer Curl (Dumbbell)': HAMMER, 'Hammer Curl (Cable)': HAMMER,
  'Preacher Curl (Barbell)': ISO_CURL, 'Preacher Curl (Dumbbell)': ISO_CURL, 'Preacher Curl (Machine)': ISO_CURL,
  'Incline Curl (Dumbbell)': ISO_CURL, 'Concentration Curl (Dumbbell)': ISO_CURL, 'Spider Curl (Dumbbell)': ISO_CURL,
  'Reverse Curl (Barbell)': 'forearms, biceps',
  'Triceps Pushdown (Cable - Straight Bar)': TRI, 'Triceps Rope Pushdown (Cable)': TRI,
  'Skullcrusher (Barbell)': TRI, 'Skullcrusher (Dumbbell)': TRI, 'Triceps Extension (Dumbbell)': TRI,
  'Overhead Triceps Extension (Cable)': TRI, 'Triceps Extension (Machine)': TRI, 'Triceps Kickback (Dumbbell)': TRI,
  'Close Grip Bench Press (Barbell)': 'triceps, chest | front_delts',
  'Triceps Dip': DIP_TRI, 'Triceps Dip (Assisted)': DIP_TRI, 'Bench Dip': 'triceps | front_delts, chest',
  'Wrist Curl (Barbell)': 'forearms', 'Reverse Wrist Curl (Barbell)': 'forearms',

  // Core
  Crunch: 'abs', 'Cable Crunch': 'abs | obliques', 'Crunch (Machine)': 'abs', 'Decline Crunch': 'abs',
  'Sit Up': 'abs | obliques', 'Hanging Leg Raise': 'abs | obliques, forearms', "Knee Raise (Captain's Chair)": 'abs | obliques',
  'Lying Leg Raise': 'abs', 'Russian Twist': 'obliques | abs', 'Bicycle Crunch': 'abs, obliques',
  'Ab Wheel': 'abs | lats, obliques', 'Mountain Climber': 'abs | front_delts, quads',
  Plank: 'abs | obliques', 'Side Plank': 'obliques | abs, abductors', 'Hollow Hold': 'abs', 'Dead Bug': 'abs | obliques',
  'Pallof Press (Cable)': 'obliques | abs', 'Woodchopper (Cable)': 'obliques | abs',

  // Olympic
  'Clean (Barbell)': 'quads, glutes, traps | hamstrings, upper_back, lower_back',
  'Power Clean (Barbell)': PULL_OLY, 'Hang Clean (Barbell)': PULL_OLY,
  'Clean and Jerk (Barbell)': 'quads, glutes, front_delts | traps, triceps, hamstrings',
  'Snatch (Barbell)': 'quads, glutes, traps | hamstrings, front_delts, upper_back, lower_back',
  'Power Snatch (Barbell)': SNATCH_POWER, 'Hang Snatch (Barbell)': SNATCH_POWER,
  'Split Jerk (Barbell)': 'front_delts, triceps | quads, glutes',

  // Full body
  'Kettlebell Swing': 'glutes, hamstrings | lower_back, front_delts',
  'Turkish Get Up (Kettlebell)': 'front_delts, abs | glutes, obliques, quads',
  'Thruster (Barbell)': THRUSTER, 'Thruster (Dumbbell)': THRUSTER,
  Burpee: 'quads, chest | front_delts, triceps, abs',
  "Farmer's Walk (Dumbbell)": 'forearms, traps | abs, obliques',
  'Sled Push': 'quads, glutes | calves, hamstrings',
  'Man Maker (Dumbbell)': 'front_delts, chest | upper_back, quads, triceps',

  // Cardio (counts for recency on the muscle map, not for weekly sets)
  Running: RUN, 'Running (Treadmill)': RUN, Walking: RUN, Cycling: BIKE, 'Cycling (Indoor)': BIKE,
  'Rowing (Machine)': 'upper_back, quads | lats, hamstrings, biceps', Swimming: 'lats | front_delts, triceps',
  'Ski Erg': 'lats | triceps, abs', 'Elliptical Trainer': 'quads | glutes, hamstrings',
  'Stair Machine': 'glutes, quads | calves', 'Jump Rope': 'calves | quads', 'Assault Bike': 'quads | front_delts, glutes',
};

const parseList = (s: string | undefined): Muscle[] =>
  (s ?? '').split(',').map((x) => x.trim()).filter((x): x is Muscle => (MUSCLES as readonly string[]).includes(x));

export function seedMusclesFor(name: string): { primaryMuscles: Muscle[]; secondaryMuscles: Muscle[] } | undefined {
  const spec = SEED_MUSCLES[name];
  if (!spec) return undefined;
  const [p, s] = spec.split('|');
  return { primaryMuscles: parseList(p), secondaryMuscles: parseList(s) };
}

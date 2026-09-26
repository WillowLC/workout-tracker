// Primary and secondary muscles for every built-in exercise.
// Format: 'primary, primary | secondary, secondary'. Keyed by exercise name.
import type { Muscle } from '../domain/types';
import { MUSCLES } from '../domain/types';

// Heads: pressing mostly hits the lateral triceps head, overhead and
// stretched work the long head; curls hit both biceps heads, with the long
// head favoured when the arm is behind the body (incline) and the short head
// when it's in front (preacher, spider); neutral grips favour the brachialis.
const BI = 'biceps_long, biceps_short, brachialis';
const BENCH = 'chest_mid, chest_lower | chest_upper, front_delts, triceps_lateral';
const INCLINE = 'chest_upper, front_delts | chest_mid, triceps_lateral';
const DECLINE = 'chest_lower, chest_mid | triceps_lateral, front_delts';
const FLY = 'chest_mid | chest_upper, chest_lower, front_delts';
const FLY_HIGH_TO_LOW = 'chest_lower, chest_mid | front_delts';
const FLY_LOW_TO_HIGH = 'chest_upper | chest_mid, front_delts';
const DIP_CHEST = 'chest_lower, triceps_lateral | chest_mid, front_delts, triceps_long';
const ROW = `upper_back, lats | rear_delts, ${BI}, lower_back`;
const SEATED_ROW = `upper_back, lats | rear_delts, ${BI}`;
const PULLDOWN = `lats | ${BI}, upper_back`;
const CHIN = 'lats, biceps_long, biceps_short | brachialis, upper_back';
const SQUAT = 'quads, glutes | adductors, lower_back';
const GOBLET = 'quads, glutes | adductors, abs';
const RDL = 'hamstrings, glutes | lower_back';
const LUNGE = 'quads, glutes | adductors, hamstrings';
const PRESS = 'front_delts | side_delts, triceps_lateral, chest_upper';
const LATERAL = 'side_delts | traps';
const FRONT_RAISE = 'front_delts | side_delts, chest_upper';
const REAR = 'rear_delts | upper_back';
const UPRIGHT = 'side_delts, traps | brachialis, front_delts';
const CURL = 'biceps_long, biceps_short | brachialis, forearms';
const CURL_LONG = 'biceps_long | biceps_short, brachialis';
const CURL_SHORT = 'biceps_short | biceps_long, brachialis';
const HAMMER = 'brachialis, forearms | biceps_long';
const PUSHDOWN = 'triceps_lateral | triceps_long';
const OVERHEAD_TRI = 'triceps_long | triceps_lateral';
const SKULL = 'triceps_long, triceps_lateral';
const DIP_TRI = 'triceps_lateral, triceps_long | chest_lower, front_delts';
const CALF = 'calves';
const PULL_OLY = 'hamstrings, glutes, traps | quads, upper_back, lower_back';
const SNATCH_POWER = 'hamstrings, glutes, traps | quads, front_delts, upper_back';
const RUN = 'quads, calves | hamstrings, glutes';
const BIKE = 'quads | glutes, calves, hamstrings';
const THRUSTER = 'quads, front_delts | glutes, triceps_lateral';

export const SEED_MUSCLES: Record<string, string> = {
  // Chest
  'Bench Press (Barbell)': BENCH, 'Bench Press (Dumbbell)': BENCH, 'Bench Press (Smith Machine)': BENCH,
  'Incline Bench Press (Barbell)': INCLINE, 'Incline Bench Press (Dumbbell)': INCLINE, 'Incline Bench Press (Smith Machine)': INCLINE,
  'Decline Bench Press (Barbell)': DECLINE, 'Decline Bench Press (Dumbbell)': DECLINE,
  'Chest Press (Machine)': BENCH, 'Incline Chest Press (Machine)': INCLINE,
  'Chest Fly (Dumbbell)': FLY, 'Incline Chest Fly (Dumbbell)': FLY_LOW_TO_HIGH, 'Chest Fly (Machine)': FLY,
  'Cable Crossover': FLY_HIGH_TO_LOW, 'Cable Fly (Cable)': FLY, 'Low Cable Fly (Cable)': FLY_LOW_TO_HIGH,
  'Floor Press (Barbell)': 'chest_mid, triceps_lateral | chest_lower, front_delts', 'Pullover (Dumbbell)': 'chest_mid, lats | triceps_long, chest_lower',
  'Push Up': 'chest_mid, chest_lower | chest_upper, front_delts, triceps_lateral, abs', 'Incline Push Up': DECLINE, 'Decline Push Up': INCLINE,
  'Chest Dip': DIP_CHEST, 'Chest Dip (Weighted)': DIP_CHEST, 'Chest Dip (Assisted)': DIP_CHEST,

  // Back
  'Deadlift (Barbell)': 'hamstrings, glutes, lower_back | quads, traps, forearms, upper_back',
  'Deadlift (Trap Bar)': 'quads, glutes | hamstrings, lower_back, traps, forearms',
  'Deadlift (Dumbbell)': 'hamstrings, glutes | lower_back, quads, forearms',
  'Bent Over Row (Barbell)': ROW, 'Bent Over Row (Dumbbell)': ROW, 'Pendlay Row (Barbell)': ROW,
  'Bent Over One Arm Row (Dumbbell)': `lats, upper_back | rear_delts, ${BI}`,
  'T Bar Row': SEATED_ROW, 'Seated Row (Cable)': SEATED_ROW, 'Seated Row (Machine)': SEATED_ROW, 'Iso-Lateral Row (Machine)': SEATED_ROW,
  'Chest Supported Row (Dumbbell)': `upper_back | lats, rear_delts, ${BI}`,
  'Lat Pulldown (Cable)': PULLDOWN, 'Lat Pulldown - Close Grip (Cable)': PULLDOWN, 'Lat Pulldown (Machine)': PULLDOWN,
  'Straight Arm Pulldown (Cable)': 'lats | triceps_long',
  'Pull Up': PULLDOWN, 'Pull Up (Weighted)': PULLDOWN, 'Pull Up (Assisted)': PULLDOWN,
  'Chin Up': CHIN, 'Chin Up (Weighted)': CHIN, 'Chin Up (Assisted)': CHIN,
  'Inverted Row': `upper_back, lats | ${BI}, rear_delts`,
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
  'Overhead Press (Barbell)': 'front_delts | side_delts, triceps_lateral, traps, chest_upper', 'Overhead Press (Dumbbell)': PRESS,
  'Seated Overhead Press (Dumbbell)': PRESS, 'Seated Overhead Press (Barbell)': PRESS, 'Shoulder Press (Machine)': PRESS,
  'Arnold Press (Dumbbell)': PRESS, 'Push Press (Barbell)': 'front_delts | triceps_lateral, side_delts, quads',
  'Landmine Press (Barbell)': 'front_delts, chest_upper | triceps_lateral',
  'Lateral Raise (Dumbbell)': LATERAL, 'Lateral Raise (Cable)': LATERAL, 'Lateral Raise (Machine)': LATERAL,
  'Front Raise (Dumbbell)': FRONT_RAISE, 'Front Raise (Cable)': FRONT_RAISE,
  'Reverse Fly (Dumbbell)': REAR, 'Reverse Fly (Machine)': REAR, 'Reverse Fly (Cable)': REAR,
  'Upright Row (Barbell)': UPRIGHT, 'Upright Row (Cable)': UPRIGHT,
  'Handstand Push Up': 'front_delts, triceps_lateral | side_delts, traps, triceps_long',

  // Arms
  'Bicep Curl (Barbell)': CURL, 'Bicep Curl (Dumbbell)': CURL, 'Bicep Curl (Cable)': CURL, 'Bayesian Curl (Cable)': CURL_LONG,
  'Bicep Curl (Machine)': CURL, 'EZ Bar Curl': CURL, 'Hammer Curl (Dumbbell)': HAMMER, 'Hammer Curl (Cable)': HAMMER,
  'Preacher Curl (Barbell)': CURL_SHORT, 'Preacher Curl (Dumbbell)': CURL_SHORT, 'Preacher Curl (Machine)': CURL_SHORT,
  'Incline Curl (Dumbbell)': CURL_LONG, 'Concentration Curl (Dumbbell)': CURL_SHORT, 'Spider Curl (Dumbbell)': CURL_SHORT,
  'Reverse Curl (Barbell)': 'brachialis, forearms | biceps_long',
  'Triceps Pushdown (Cable - Straight Bar)': PUSHDOWN, 'Triceps Rope Pushdown (Cable)': PUSHDOWN,
  'Skullcrusher (Barbell)': SKULL, 'Skullcrusher (Dumbbell)': SKULL, 'Triceps Extension (Dumbbell)': OVERHEAD_TRI,
  'Overhead Triceps Extension (Cable)': OVERHEAD_TRI, 'Triceps Extension (Machine)': SKULL, 'Triceps Kickback (Dumbbell)': PUSHDOWN,
  'Close Grip Bench Press (Barbell)': 'triceps_lateral, chest_mid | triceps_long, front_delts, chest_lower',
  'Triceps Dip': DIP_TRI, 'Triceps Dip (Assisted)': DIP_TRI, 'Bench Dip': 'triceps_lateral | triceps_long, front_delts, chest_lower',
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
  'Clean and Jerk (Barbell)': 'quads, glutes, front_delts | traps, triceps_lateral, hamstrings',
  'Snatch (Barbell)': 'quads, glutes, traps | hamstrings, front_delts, upper_back, lower_back',
  'Power Snatch (Barbell)': SNATCH_POWER, 'Hang Snatch (Barbell)': SNATCH_POWER,
  'Split Jerk (Barbell)': 'front_delts, triceps_lateral | quads, glutes',

  // Full body
  'Kettlebell Swing': 'glutes, hamstrings | lower_back, front_delts',
  'Turkish Get Up (Kettlebell)': 'front_delts, abs | glutes, obliques, quads',
  'Thruster (Barbell)': THRUSTER, 'Thruster (Dumbbell)': THRUSTER,
  Burpee: 'quads, chest_mid | front_delts, triceps_lateral, abs',
  "Farmer's Walk (Dumbbell)": 'forearms, traps | abs, obliques',
  'Sled Push': 'quads, glutes | calves, hamstrings',
  'Man Maker (Dumbbell)': 'front_delts, chest_mid | upper_back, quads, triceps_lateral',

  // Cardio (counts for recency on the muscle map, not for weekly sets)
  Running: RUN, 'Running (Treadmill)': RUN, Walking: RUN, Cycling: BIKE, 'Cycling (Indoor)': BIKE,
  'Rowing (Machine)': 'upper_back, quads | lats, hamstrings, biceps_long, brachialis', Swimming: 'lats | front_delts, triceps_long',
  'Ski Erg': 'lats | triceps_long, abs', 'Elliptical Trainer': 'quads | glutes, hamstrings',
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

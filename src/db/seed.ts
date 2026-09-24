import type { BodyPart, Equipment, Exercise, TrackingType } from '../domain/types';

// Strong naming convention: "Movement (Equipment)". Tracking type is
// weight_reps unless given. Equipment is derived from the parenthetical unless given.
type Row = [name: string, tracking?: TrackingType, equipment?: Equipment];

const R: TrackingType = 'reps_only';
const WB: TrackingType = 'weighted_bodyweight';
const AB: TrackingType = 'assisted_bodyweight';
const D: TrackingType = 'duration';
const DD: TrackingType = 'distance_duration';

const LIBRARY: Record<BodyPart, Row[]> = {
  Chest: [
    ['Bench Press (Barbell)'], ['Bench Press (Dumbbell)'], ['Bench Press (Smith Machine)'],
    ['Incline Bench Press (Barbell)'], ['Incline Bench Press (Dumbbell)'], ['Incline Bench Press (Smith Machine)'],
    ['Decline Bench Press (Barbell)'], ['Decline Bench Press (Dumbbell)'], ['Chest Press (Machine)'],
    ['Incline Chest Press (Machine)'], ['Chest Fly (Dumbbell)'], ['Incline Chest Fly (Dumbbell)'],
    ['Chest Fly (Machine)'], ['Cable Crossover', undefined, 'Cable'], ['Cable Fly (Cable)'], ['Low Cable Fly (Cable)'],
    ['Floor Press (Barbell)'], ['Pullover (Dumbbell)'],
    ['Push Up', R, 'Bodyweight'], ['Incline Push Up', R, 'Bodyweight'], ['Decline Push Up', R, 'Bodyweight'],
    ['Chest Dip', WB, 'Bodyweight'], ['Chest Dip (Weighted)', WB, 'Bodyweight'], ['Chest Dip (Assisted)', AB],
  ],
  Back: [
    ['Deadlift (Barbell)'], ['Deadlift (Trap Bar)', undefined, 'Barbell'], ['Deadlift (Dumbbell)'],
    ['Bent Over Row (Barbell)'], ['Bent Over Row (Dumbbell)'], ['Pendlay Row (Barbell)'],
    ['Bent Over One Arm Row (Dumbbell)'], ['T Bar Row', undefined, 'Barbell'], ['Seated Row (Cable)'],
    ['Seated Row (Machine)'], ['Iso-Lateral Row (Machine)'], ['Chest Supported Row (Dumbbell)'],
    ['Lat Pulldown (Cable)'], ['Lat Pulldown - Close Grip (Cable)'], ['Lat Pulldown (Machine)'],
    ['Straight Arm Pulldown (Cable)'], ['Pull Up', R, 'Bodyweight'], ['Pull Up (Weighted)', WB, 'Bodyweight'],
    ['Pull Up (Assisted)', AB], ['Chin Up', R, 'Bodyweight'], ['Chin Up (Weighted)', WB, 'Bodyweight'],
    ['Chin Up (Assisted)', AB], ['Inverted Row', R, 'Bodyweight'], ['Face Pull (Cable)'],
    ['Shrug (Barbell)'], ['Shrug (Dumbbell)'], ['Rack Pull (Barbell)'], ['Good Morning (Barbell)'],
    ['Back Extension', R, 'Bodyweight'], ['Back Extension (Weighted)', WB, 'Bodyweight'],
  ],
  Legs: [
    ['Squat (Barbell)'], ['Front Squat (Barbell)'], ['Squat (Smith Machine)'], ['Box Squat (Barbell)'],
    ['Goblet Squat (Kettlebell)'], ['Goblet Squat (Dumbbell)'], ['Hack Squat (Machine)'], ['Pendulum Squat (Machine)'],
    ['Leg Press', undefined, 'Machine'], ['Leg Extension (Machine)'], ['Lying Leg Curl (Machine)'],
    ['Seated Leg Curl (Machine)'], ['Romanian Deadlift (Barbell)'], ['Romanian Deadlift (Dumbbell)'],
    ['Stiff Leg Deadlift (Barbell)'], ['Sumo Deadlift (Barbell)'], ['Bulgarian Split Squat (Dumbbell)'],
    ['Lunge (Dumbbell)'], ['Lunge (Barbell)'], ['Walking Lunge (Dumbbell)'], ['Step-up (Dumbbell)'],
    ['Hip Thrust (Barbell)'], ['Hip Thrust (Machine)'], ['Glute Bridge', R, 'Bodyweight'],
    ['Glute Kickback (Cable)'], ['Hip Abductor (Machine)'], ['Hip Adductor (Machine)'],
    ['Standing Calf Raise (Machine)'], ['Standing Calf Raise (Dumbbell)'], ['Seated Calf Raise (Machine)'],
    ['Calf Press on Leg Press', undefined, 'Machine'], ['Nordic Hamstring Curl', R, 'Bodyweight'],
    ['Pistol Squat', R, 'Bodyweight'], ['Air Squat', R, 'Bodyweight'], ['Box Jump', R, 'Bodyweight'],
  ],
  Shoulders: [
    ['Overhead Press (Barbell)'], ['Overhead Press (Dumbbell)'], ['Seated Overhead Press (Dumbbell)'],
    ['Seated Overhead Press (Barbell)'], ['Shoulder Press (Machine)'], ['Arnold Press (Dumbbell)'],
    ['Push Press (Barbell)'], ['Landmine Press (Barbell)'], ['Lateral Raise (Dumbbell)'], ['Lateral Raise (Cable)'],
    ['Lateral Raise (Machine)'], ['Front Raise (Dumbbell)'], ['Front Raise (Cable)'], ['Reverse Fly (Dumbbell)'],
    ['Reverse Fly (Machine)'], ['Reverse Fly (Cable)'], ['Upright Row (Barbell)'], ['Upright Row (Cable)'],
    ['Handstand Push Up', R, 'Bodyweight'],
  ],
  Arms: [
    ['Bicep Curl (Barbell)'], ['Bicep Curl (Dumbbell)'], ['Bicep Curl (Cable)'], ['Bicep Curl (Machine)'],
    ['EZ Bar Curl', undefined, 'Barbell'], ['Hammer Curl (Dumbbell)'], ['Hammer Curl (Cable)'],
    ['Preacher Curl (Barbell)'], ['Preacher Curl (Dumbbell)'], ['Preacher Curl (Machine)'],
    ['Incline Curl (Dumbbell)'], ['Concentration Curl (Dumbbell)'], ['Spider Curl (Dumbbell)'],
    ['Reverse Curl (Barbell)'], ['Triceps Pushdown (Cable - Straight Bar)'], ['Triceps Rope Pushdown (Cable)'],
    ['Skullcrusher (Barbell)'], ['Skullcrusher (Dumbbell)'], ['Triceps Extension (Dumbbell)'],
    ['Overhead Triceps Extension (Cable)'], ['Triceps Extension (Machine)'], ['Triceps Kickback (Dumbbell)'],
    ['Close Grip Bench Press (Barbell)'], ['Triceps Dip', WB, 'Bodyweight'], ['Triceps Dip (Assisted)', AB],
    ['Bench Dip', R, 'Bodyweight'], ['Wrist Curl (Barbell)'], ['Reverse Wrist Curl (Barbell)'],
  ],
  Core: [
    ['Crunch', R, 'Bodyweight'], ['Cable Crunch', undefined, 'Cable'], ['Crunch (Machine)'],
    ['Decline Crunch', R, 'Bodyweight'], ['Sit Up', R, 'Bodyweight'], ['Hanging Leg Raise', R, 'Bodyweight'],
    ["Knee Raise (Captain's Chair)", R, 'Bodyweight'], ['Lying Leg Raise', R, 'Bodyweight'],
    ['Russian Twist', R, 'Bodyweight'], ['Bicycle Crunch', R, 'Bodyweight'], ['Ab Wheel', R, 'Other'],
    ['Mountain Climber', R, 'Bodyweight'], ['Plank', D, 'Bodyweight'], ['Side Plank', D, 'Bodyweight'],
    ['Hollow Hold', D, 'Bodyweight'], ['Dead Bug', R, 'Bodyweight'], ['Pallof Press (Cable)'],
    ['Woodchopper (Cable)'],
  ],
  Olympic: [
    ['Clean (Barbell)'], ['Power Clean (Barbell)'], ['Hang Clean (Barbell)'], ['Clean and Jerk (Barbell)'],
    ['Snatch (Barbell)'], ['Power Snatch (Barbell)'], ['Hang Snatch (Barbell)'], ['Split Jerk (Barbell)'],
  ],
  'Full Body': [
    ['Kettlebell Swing', undefined, 'Kettlebell'], ['Turkish Get Up (Kettlebell)'], ['Thruster (Barbell)'],
    ['Thruster (Dumbbell)'], ['Burpee', R, 'Bodyweight'], ["Farmer's Walk (Dumbbell)"], ['Sled Push', undefined, 'Other'],
    ['Man Maker (Dumbbell)'],
  ],
  Cardio: [
    ['Running', DD, 'Other'], ['Running (Treadmill)', DD, 'Machine'], ['Walking', DD, 'Other'],
    ['Cycling', DD, 'Other'], ['Cycling (Indoor)', DD, 'Machine'], ['Rowing (Machine)', DD],
    ['Swimming', DD, 'Other'], ['Ski Erg', DD, 'Machine'], ['Elliptical Trainer', D, 'Machine'],
    ['Stair Machine', D, 'Machine'], ['Jump Rope', D, 'Other'], ['Assault Bike', D, 'Machine'],
  ],
  Other: [],
};

const PAREN_EQUIPMENT: Record<string, Equipment> = {
  Barbell: 'Barbell', Dumbbell: 'Dumbbell', Machine: 'Machine', Cable: 'Cable', Kettlebell: 'Kettlebell',
  'Smith Machine': 'Smith Machine', Band: 'Band', Assisted: 'Assisted', Weighted: 'Bodyweight',
};

export function equipmentFromName(name: string): Equipment {
  const m = /\(([^)]+)\)\s*$/.exec(name);
  if (!m) return 'Other';
  const inner = m[1].split(' - ')[0].trim();
  return PAREN_EQUIPMENT[inner] ?? 'Other';
}

/** Stable, human-readable IDs so re-seeding and backup merges are idempotent. */
export function seedId(name: string): string {
  return 'seed-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const SEED_EXERCISES: Exercise[] = (Object.entries(LIBRARY) as [BodyPart, Row[]][]).flatMap(([bodyPart, rows]) =>
  rows.map(([name, tracking, equipment]) => ({
    id: seedId(name),
    name,
    bodyPart,
    equipment: equipment ?? equipmentFromName(name),
    trackingType: tracking ?? 'weight_reps',
    isCustom: false,
  })),
);

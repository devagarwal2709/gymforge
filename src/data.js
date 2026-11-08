export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const MAIN = ['squat', 'bench', 'row', 'ohp', 'rdl']

export const WARMUP = { id: 'warmup', name: 'Treadmill Walk', muscles: 'Cardiovascular warm up', sets: 1, label: 'Duration', reps: '5 min' }

const ex = (id, name, muscles, tip) => ({ id, name, muscles, sets: 3, reps: 10, tip })
export const WORKOUT = [
  ex('squat', 'Barbell Back Squat', 'Quads · Glutes · Hamstrings · Core', 'Keep your chest up and push your knees out over your toes. If depth is hard, elevate your heels slightly with plates.'),
  ex('bench', 'Barbell Bench Press', 'Chest · Front Delts · Triceps', 'Retract your shoulder blades before you unrack. Keep them pinched together through every rep — this protects your shoulders.'),
  ex('row', 'Barbell Bent-Over Row', 'Lats · Rhomboids · Rear Delts · Biceps', 'Hinge at the hips until your torso is near parallel. Pull the bar to your lower chest — not your chin. Control the descent.'),
  ex('ohp', 'Overhead Press', 'Front Delts · Lateral Delts · Triceps', "Squeeze your glutes and brace your core before pressing. This prevents lower back arch. Press in a straight line — don't push forward."),
  ex('rdl', 'Romanian Deadlift', 'Hamstrings · Glutes · Lower Back', "Push your hips back, not down. Feel the stretch in your hamstrings — that's the cue you've gone far enough. Keep the bar close to your legs."),
]

// Full detail for the squat; the rest get muscles only until checkpoint 2 (full library).
export const EXERCISES = {
  squat: {
    eyebrow: 'Compound · Lower Body',
    tags: [['amber', 'Beginner friendly'], ['green', 'Full gym'], ['blue', 'Bilateral'], ['muted', 'Barbell · Rack']],
    primary: ['Quadriceps', 'Glutes', 'Hamstrings'], secondary: ['Core / Abs', 'Adductors', 'Calves'],
    steps: [
      ['Set the bar on the rack', ' at upper chest height. Step under it so the bar rests across your upper traps — not your neck. Grip slightly wider than shoulder width.'],
      ['Unrack and step back', ' with two steps — one foot at a time. Feet shoulder-width apart, toes pointed out 15–30 degrees. This is your stance.'],
      ['Brace before you move.', " Take a big breath into your belly, brace your core like you're about to take a punch, and squeeze your lats. This stiffens your torso and protects your spine."],
      ['Descend', ' by pushing your hips back and bending your knees simultaneously. Keep your chest up. Push your knees out in the direction your toes point. Go until your hips are at or below parallel.'],
      ['Drive back up', ' by pushing the floor away. Think "chest up, hips forward." Keep your knees tracking over your toes. Exhale as you pass the hard point.'],
      ['Re-brace between reps.', " At the top, take a breath and re-brace before the next rep. Don't rush the turnaround — this is where most beginners lose tension."],
    ],
    cues: ['"Chest up"', '"Knees out"', '"Push the floor away"', '"Big breath, brace, then move"'],
    mistakes: [
      { title: 'Knees caving inward', desc: 'The most common beginner mistake. Your knees collapse toward each other on the way up, especially when the weight gets heavy.', fix: 'Actively push your knees out as you ascend. Think "spread the floor" with your feet.' },
      { title: 'Good morning squat', desc: 'Your hips shoot up faster than your chest on the ascent. Usually caused by weak quads or going too heavy too soon.', fix: 'Think "chest up" on the way up. Reduce the weight until your torso angle stays consistent.' },
      { title: 'Not bracing before the rep', desc: "Squatting without a proper brace leaves your spine unsupported under load. You might get away with it light — you won't when you progress.", fix: 'Make it a ritual. Breath → brace → descend. Every rep, every set.' },
    ],
    alt: { name: 'Goblet Squat', reason: 'Easier to learn the squat pattern. The weight in front acts as a counterbalance, making it natural to sit upright.' },
  },
  bench: { eyebrow: 'Compound · Upper Body', tags: [['amber', 'Beginner friendly'], ['green', 'Full gym'], ['muted', 'Barbell · Bench']], primary: ['Chest', 'Front Delts', 'Triceps'], secondary: ['Serratus', 'Core / Abs'] },
  row: { eyebrow: 'Compound · Upper Body', tags: [['amber', 'Beginner friendly'], ['green', 'Full gym'], ['muted', 'Barbell']], primary: ['Lats', 'Rhomboids'], secondary: ['Rear Delts', 'Biceps', 'Lower Back'] },
  ohp: { eyebrow: 'Compound · Upper Body', tags: [['green', 'Full gym'], ['muted', 'Barbell · Rack']], primary: ['Front Delts', 'Lateral Delts'], secondary: ['Triceps', 'Core / Abs'] },
  rdl: { eyebrow: 'Compound · Lower Body', tags: [['green', 'Full gym'], ['muted', 'Barbell']], primary: ['Hamstrings', 'Glutes'], secondary: ['Lower Back', 'Core / Abs'] },
}

export const SPLITS = {
  3: {
    name: 'Full Body Split', days: 'Monday · Wednesday · Friday', h1: ['Full Body', '3 Days.'],
    schedule: ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Rest'],
    sessions: [['Monday', 'Full Body A', 'Squat · Bench · Row · OHP · Romanian Deadlift'], ['Wednesday', 'Full Body B', 'Deadlift · Incline Press · Pull-up · Lateral Raise · Curl'], ['Friday', 'Full Body A', 'Squat · Bench · Row · OHP · Romanian Deadlift']],
    whyTitle: 'Why Full Body works best right now',
    why: ['At the beginner stage, your nervous system adapts faster than your muscles. Full body training hits every muscle group every session, so you practice each movement three times a week instead of once.', "As you get stronger and your technique improves, you'll outgrow this split — that's the goal. When you do, GymForge will recommend Upper/Lower."],
  },
  4: {
    name: 'Upper / Lower Split', days: 'Mon · Tue · Thu · Fri', h1: ['Upper / Lower', '4 Days.'],
    schedule: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
    sessions: [['Monday', 'Upper A', 'Bench · Row · OHP · Pull-up · Curl'], ['Tuesday', 'Lower A', 'Squat · Romanian Deadlift · Leg Press · Calf Raise'], ['Thursday', 'Upper B', 'Incline Press · Cable Row · Lateral Raise · Tricep Dip'], ['Friday', 'Lower B', 'Deadlift · Bulgarian Split Squat · Leg Curl']],
    whyTitle: 'Why Upper / Lower at 4 days',
    why: ['Four days lets you split the body in half. Each half gets trained twice a week — enough frequency to keep progressing with adequate recovery.', 'Upper/Lower is a step up from Full Body in volume and specificity. It works for anyone who can commit to four consistent sessions per week.'],
  },
  5: {
    name: 'Push / Pull / Legs', days: 'Mon · Tue · Wed · Fri · Sat', h1: ['Push / Pull', '/ Legs.'],
    schedule: ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull', 'Rest'],
    sessions: [['Monday', 'Push A', 'Bench · OHP · Incline DB · Lateral Raise · Tricep'], ['Tuesday', 'Pull A', 'Deadlift · Row · Pull-up · Face Pull · Curl'], ['Wednesday', 'Legs A', 'Squat · Romanian DL · Leg Press · Leg Curl · Calf'], ['Friday', 'Push B', 'Incline Press · DB OHP · Cable Fly · Skull Crusher'], ['Saturday', 'Pull B', 'Rack Pull · Cable Row · Lat Pulldown · Hammer Curl']],
    whyTitle: 'Why Push / Pull / Legs at 5 days',
    why: ['PPL groups muscles by movement pattern. Each group gets trained twice a week across 5 sessions — the highest volume of the three splits.', "It's demanding. Don't miss sessions, or the frequency drops and the plan loses its edge."],
  },
}

export const FOODS = [
  ['🍗', 'Chicken Breast', '150g cooked → ~45g protein', 'The benchmark. Cheap, versatile, nearly all protein. Batch cook at the start of the week.'],
  ['🥚', 'Eggs', '3 whole eggs → ~18g protein', 'Complete protein with fat included. Fast to make and keeps you full.'],
  ['🫙', 'Greek Yogurt', '200g → ~20g protein', 'One of the easiest sources — no cooking needed.'],
  ['🐟', 'Canned Tuna / Salmon', '1 can (~130g) → ~30g protein', 'No prep required. Keep a few tins stocked.'],
  ['🧀', 'Cottage Cheese', '250g → ~28g protein', 'Slow-digesting casein — good before bed.'],
  ['🫘', 'Lentils / Dal', '200g cooked → ~18g protein', 'Plant protein with carbs built in. Pair with rice or roti.'],
]

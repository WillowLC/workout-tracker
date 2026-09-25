// Post-workout quotes and gym fun facts, shown one at a time on the summary
// screen. Rotation is a shuffle bag (see drawInspiration) so nothing repeats
// until every entry has been seen. Append new entries at the end — the saved
// bag stores indices.

export type Inspiration =
  | { kind: 'quote'; text: string; author: string }
  | { kind: 'fact'; text: string };

const q = (text: string, author: string): Inspiration => ({ kind: 'quote', text, author });
const f = (text: string): Inspiration => ({ kind: 'fact', text });

export const INSPIRATIONS: Inspiration[] = [
  // Quotes
  q('We are what we repeatedly do. Excellence, then, is not an act, but a habit.', 'Will Durant'),
  q('The resistance that you fight physically in the gym and the resistance that you fight in life can only build a strong character.', 'Arnold Schwarzenegger'),
  q('Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights.', 'Ronnie Coleman'),
  q('Yeah buddy! Light weight, baby!', 'Ronnie Coleman'),
  q('Take care of your body. It’s the only place you have to live.', 'Jim Rohn'),
  q('Motivation is what gets you started. Habit is what keeps you going.', 'Jim Ryun'),
  q('What a disgrace it is for a man to grow old without ever seeing the beauty and strength of which his body is capable.', 'Socrates'),
  q('A journey of a thousand miles begins with a single step.', 'Lao Tzu'),
  q('Fall seven times, stand up eight.', 'Japanese proverb'),
  q('It does not matter how slowly you go as long as you do not stop.', 'Attributed to Confucius'),
  q('Hard work beats talent when talent doesn’t work hard.', 'Tim Notke'),
  q('I hated every minute of training, but I said, “Don’t quit. Suffer now and live the rest of your life as a champion.”', 'Muhammad Ali'),
  q('Don’t count the days, make the days count.', 'Muhammad Ali'),
  q('Rome wasn’t built in a day.', 'Proverb'),
  q('You miss 100% of the shots you don’t take.', 'Wayne Gretzky'),
  q('Champions keep playing until they get it right.', 'Billie Jean King'),
  q('The difference between the impossible and the possible lies in a person’s determination.', 'Tommy Lasorda'),
  q('Energy and persistence conquer all things.', 'Benjamin Franklin'),
  q('Well done is better than well said.', 'Benjamin Franklin'),
  q('Our greatest glory is not in never falling, but in rising every time we fall.', 'Oliver Goldsmith'),
  q('The man who moves a mountain begins by carrying away small stones.', 'Attributed to Confucius'),
  q('If it doesn’t challenge you, it doesn’t change you.', 'Fred DeVito'),
  q('Strength and growth come only through continuous effort and struggle.', 'Napoleon Hill'),
  q('Whether you think you can, or you think you can’t — you’re right.', 'Attributed to Henry Ford'),
  q('I’ve failed over and over and over again in my life. And that is why I succeed.', 'Michael Jordan'),
  q('The harder the battle, the sweeter the victory.', 'Les Brown'),
  q('Small daily improvements over time lead to stunning results.', 'Robin Sharma'),
  q('You do not rise to the level of your goals. You fall to the level of your systems.', 'James Clear'),
  q('Every action you take is a vote for the type of person you wish to become.', 'James Clear'),
  q('Habits are the compound interest of self-improvement.', 'James Clear'),
  q('The Iron never lies to you.', 'Henry Rollins'),
  q('Two hundred pounds is always two hundred pounds.', 'Henry Rollins'),
  q('The only bad workout is the one that didn’t happen.', 'Gym proverb'),
  q('Be stronger than your excuses.', 'Gym proverb'),
  q('A year from now you may wish you had started today.', 'Karen Lamb'),
  q('Excellence is the gradual result of always striving to do better.', 'Pat Riley'),
  q('Once you learn to quit, it becomes a habit.', 'Vince Lombardi'),
  q('The price of excellence is discipline. The cost of mediocrity is disappointment.', 'William Arthur Ward'),
  q('It’s not about having time. It’s about making time.', 'Unknown'),
  q('Physical fitness is not only one of the most important keys to a healthy body, it is the basis of dynamic and creative intellectual activity.', 'John F. Kennedy'),
  q('To enjoy the glow of good health, you must exercise.', 'Gene Tunney'),
  q('Discipline is the bridge between goals and accomplishment.', 'Jim Rohn'),
  q('Don’t wish it were easier. Wish you were better.', 'Jim Rohn'),
  q('Success is the sum of small efforts, repeated day in and day out.', 'Robert Collier'),
  q('Mind is everything. Muscle — pieces of rubber. All that I am, I am because of my mind.', 'Paavo Nurmi'),
  q('I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.', 'Bruce Lee'),
  q('Knowing is not enough, we must apply. Willing is not enough, we must do.', 'Bruce Lee'),
  q('It never gets easier. You just get better.', 'Unknown'),
  q('Discipline is choosing between what you want now and what you want most.', 'Unknown'),
  q('Do something today that your future self will thank you for.', 'Unknown'),
  q('The pain you feel today will be the strength you feel tomorrow.', 'Unknown'),
  q('Success isn’t always about greatness. It’s about consistency.', 'Dwayne Johnson'),
  q('The last three or four reps is what makes the muscle grow.', 'Arnold Schwarzenegger'),
  q('Everything you’ve ever wanted is on the other side of fear.', 'George Addair'),
  q('Nothing will work unless you do.', 'Maya Angelou'),
  q('The body achieves what the mind believes.', 'Unknown'),
  q('Continuous improvement is better than delayed perfection.', 'Unknown'),
  q('Some people want it to happen, some wish it would happen, others make it happen.', 'Michael Jordan'),
  q('Obsessed is a word the lazy use to describe the dedicated.', 'Unknown'),
  q('The groundwork for all happiness is good health.', 'Leigh Hunt'),
  q('Exercise should be regarded as tribute to the heart.', 'Gene Tunney'),
  q('The only way of discovering the limits of the possible is to venture a little way past them into the impossible.', 'Arthur C. Clarke'),
  q('Train insane or remain the same.', 'Gym proverb'),
  q('Strong people are harder to kill than weak people, and more useful in general.', 'Mark Rippetoe'),
  q('Show up. Do the work. Go home. Repeat.', 'Gym proverb'),

  // Fun facts
  f('“Gymnasium” comes from the Greek gymnos, meaning naked — athletes in ancient Greece trained nude.'),
  f('Legend says the wrestler Milo of Croton carried a newborn calf every day until it was a full-grown bull — history’s first story of progressive overload.'),
  f('The human body has more than 600 skeletal muscles.'),
  f('The gluteus maximus is the largest muscle in the human body.'),
  f('The smallest skeletal muscle is the stapedius, in the middle ear. It’s about a millimetre long.'),
  f('Resistance training loads your bones too, and can increase bone mineral density over time.'),
  f('Muscle protein synthesis stays elevated for up to about 48 hours after a resistance training session.'),
  f('Muscles grow while you recover, not during the workout. Training is the signal; rest is when the building happens.'),
  f('Jim estimates your 1RM with the Epley formula, which strength coach Boyd Epley published in 1985.'),
  f('Eugen Sandow, the “father of modern bodybuilding”, held the first major bodybuilding contest at London’s Royal Albert Hall in 1901.'),
  f('Lee Haney and Ronnie Coleman share the record for most Mr. Olympia titles: eight each.'),
  f('Arnold Schwarzenegger won the Mr. Olympia title seven times.'),
  f('The first Mr. Olympia contest was held in 1965. Larry Scott won it.'),
  f('Muscle can’t turn into fat, or fat into muscle. They are completely different tissues.'),
  f('A men’s Olympic barbell weighs 20 kg. The women’s bar weighs 15 kg and has a thinner grip.'),
  f('Competition bumper plates are colour-coded: red is 25 kg, blue 20 kg, yellow 15 kg and green 10 kg.'),
  f('Weightlifting was part of the first modern Olympics in 1896, including a one-handed lift.'),
  f('Your heart is a muscle that beats about 100,000 times a day.'),
  f('Most early strength gains come from your nervous system learning to recruit muscle better, before the muscles themselves grow much.'),
  f('Delayed onset muscle soreness (DOMS) usually peaks 24 to 72 hours after a workout.'),
  f('Soreness doesn’t tell you how good a workout was. Progress over weeks does.'),
  f('Muscles are stronger lowering a weight (eccentric) than lifting it (concentric).'),
  f('Your body releases most of its growth hormone during deep sleep, especially early in the night.'),
  f('Stretching before or after exercise doesn’t reliably prevent muscle soreness.'),
  f('In 2020, Hafþór Júlíus Björnsson deadlifted 501 kg, the heaviest deadlift ever recorded at the time.'),
  f('Grip strength is a surprisingly strong predictor of overall health and longevity in large population studies.'),
  f('Muscles can only pull, never push. Every “push” is a muscle pulling on a bone.'),
  f('Skeletal muscle makes up roughly 30 to 40% of an adult’s body mass.'),
  f('Creatine is one of the most thoroughly researched sports supplements in the world.'),
  f('Powerlifting has three lifts: squat, bench press and deadlift. Olympic weightlifting has two: the snatch and the clean & jerk.'),
  f('“Muscle memory” is real: muscles you trained before regrow faster, partly because they keep extra nuclei gained from training.'),
  f('The “six-pack” is one muscle, the rectus abdominis, crossed by bands of tendon.'),
  f('Tendons adapt more slowly than muscles, which is one reason to add load gradually.'),
  f('You don’t have to train to failure to grow. Sets that stop 1 to 3 reps short build muscle about as well.'),
  f('Muscle grows across a wide range of reps, roughly 6 to 30, as long as sets are taken close to failure.'),
  f('Beginners can make great progress training each muscle just two or three times a week.'),
  f('Kettlebells go back to 18th-century Russian markets, where they were used as counterweights to weigh goods.'),
  f('Dumbbells get their name from practice devices for bell-ringers: bells with no clapper, so they were “dumb” (silent).'),
  f('Joseph Pilates developed much of his method while he was interned during World War I.'),
  f('Jack LaLanne opened one of America’s first modern health clubs, in Oakland, in 1936.'),
  f('On his 70th birthday, Jack LaLanne towed 70 boats carrying 70 people through Long Beach Harbor while handcuffed and shackled.'),
  f('Your body weight can swing by 1 to 2 kg in a single day from water, food and stored glycogen.'),
  f('Every gram of glycogen stored in your muscles is stored with about 3 grams of water.'),
  f('Muscle is denser than fat, so a kilo of muscle takes up less space than a kilo of fat.'),
  f('For most people, the muscle-building benefit of protein levels off at around 1.6 g per kg of body weight per day.'),
  f('Caffeine has been shown to improve strength and power performance.'),
  f('Warming up raises muscle temperature, which helps muscles contract faster and more forcefully.'),
  f('Resistance training improves insulin sensitivity, helping your body manage blood sugar.'),
  f('Studies link resistance training with a meaningful reduction in symptoms of depression.'),
  f('Ancient Greek long jumpers swung stone or metal weights called halteres to jump farther.'),
  f('Swinging heavy clubs for strength goes back centuries in Persia and India. The Victorians later adopted them as “Indian clubs”.'),
  f('Without training, adults lose roughly 3 to 8% of their muscle mass per decade after 30.'),
  f('In a 1990 study, people in their 90s who did 8 weeks of strength training increased their leg strength by an average of 174%.'),
  f('Longer rests of 2 to 3 minutes between heavy sets tend to build more strength and size than very short rests.'),
  f('The “pump” comes from blood and fluid rushing into working muscle. It’s temporary, but it feels great.'),
  f('Lifting chalk is magnesium carbonate. It dries sweat so you can grip the bar better.'),
  f('The Smith machine is often traced back to a sliding-bar rig Jack LaLanne built in the 1950s.'),
  f('The “10,000 steps a day” target started as a 1960s Japanese marketing slogan for a pedometer.'),
  f('Regular exercise tends to lower your resting heart rate, because each beat pumps more blood.'),
  f('Exercise raises levels of BDNF, a protein that helps brain cells grow and connect.'),
  f('The masseter, your main chewing muscle, is one of the strongest muscles in the body for its size.'),
  f('In a squat, your core and back work hard to stabilise the bar, not just your legs.'),
  f('Deep squats are not inherently bad for healthy knees. With good control, going below parallel is safe.'),
  f('Training even one side of your body can make the untrained side slightly stronger, thanks to your nervous system. This is called cross-education.'),
  f('Walking lunges, step-ups and split squats train each leg on its own, which helps even out left-right imbalances.'),
  f('The bench press arch is legal in powerlifting as long as your head, shoulders and glutes stay in contact with the bench.'),
];

/**
 * Shuffle-bag draw: take the next index from `deck`; when it runs out, reshuffle
 * all indices (never putting `last` first, so the same entry never shows twice
 * in a row). Returns the drawn index and the remaining deck.
 */
export function drawInspiration(deck: number[] | undefined, last: number | undefined, total = INSPIRATIONS.length, rand = Math.random): { index: number; deck: number[] } {
  let bag = (deck ?? []).filter((i) => i >= 0 && i < total);
  if (!bag.length) {
    bag = Array.from({ length: total }, (_, i) => i);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (bag.length > 1 && bag[0] === last) [bag[0], bag[1]] = [bag[1], bag[0]];
  }
  const [index, ...rest] = bag;
  return { index, deck: rest };
}

/** 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd". */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  const suffix = mod100 >= 11 && mod100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

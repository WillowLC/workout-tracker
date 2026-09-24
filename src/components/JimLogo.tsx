/** "Jim" wordmark: Space Grotesk Bold "J" and "m" with a dumbbell standing in for
 *  the "i". Glyphs are outlined paths so it renders offline with no web font.
 *  Text follows --color-text, plates follow --color-accent (light + dark). */
const TEXT = "var(--color-text)";
const PLATE = "var(--color-accent)";

export function JimLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="32 -700 1801 714" className={className} role="img" aria-label="Jim">
      <path d="M267 14Q159 14 95.5-45Q32-104 32-210L32-276L164-276L164-210Q164-163 190-136.5Q216-110 263-110Q307-110 331.5-136Q356-162 356-210L356-580L236-580L236-700L568-700L568-580L488-580L488-210Q488-101 429-43.5Q370 14 267 14M1241 0L1115 0L1115-496L1239-496L1239-442L1257-442Q1270-467 1300-485.5Q1330-504 1379-504Q1432-504 1464-483.5Q1496-463 1513-430L1531-430Q1548-462 1579-483Q1610-504 1667-504Q1713-504 1750.5-484.5Q1788-465 1810.5-425.5Q1833-386 1833-326L1833 0L1707 0L1707-317Q1707-358 1686-378.5Q1665-399 1627-399Q1584-399 1560.5-371.5Q1537-344 1537-293L1537 0L1411 0L1411-317Q1411-358 1390-378.5Q1369-399 1331-399Q1288-399 1264.5-371.5Q1241-344 1241-293" fill={TEXT} />
      <rect x="693.8" y="-700" width="247.5" height="81.9" rx="30" fill={PLATE} />
      <rect x="645" y="-596.1" width="345" height="117" rx="30" fill={PLATE} />
      <rect x="742.5" y="-479.1" width="150" height="258.2" fill={TEXT} />
      <rect x="645" y="-220.9" width="345" height="117" rx="30" fill={PLATE} />
      <rect x="693.8" y="-81.9" width="247.5" height="81.9" rx="30" fill={PLATE} />
    </svg>
  );
}

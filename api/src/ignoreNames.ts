import micromatch from 'micromatch';

import { Marker } from './siriusDeeplink';

const ignorePaterns = [
  '@MorningMashUp',
  'siriusxm.com/hits1',
  'WeekendCountdown',
  'on SiriusXM',
  'social@soul-cycle.com',
  '@SiriusXMVenus',
  'Venus!',
  '*SXM.com*',
  'Ch179 On Now!',
  'Ch 19',
  '@CalienteSXM',
  '87785-SALSA',
  'Wed 10pET',
  '*FlowNacion*',
  '*TumbaLaCasa*',
  'Spectrum',
  '*LIVE@SiriusXM',
  '#**SXM',
  '@**SXM',
  'Yacht Rock Radio',
  'SiriusXM',
  '**@SiriusXM**',
  '#SXM**',
  'Vocalists',
  'rockhall.com',
  '@icecube',
  '#RockHall*',
  'This Day In History',
  '*RockHall*',
  '*fb.com*',
  '@RadioFaction',
  'Faction Punk',
  'Pulse Morning Show',
  'Top 15 Countdown',
  '*PUL_AM_Hometown*',
  '*SiriusXM*',
  '*50son5*',
  '& Booze',
  'NewMusicShowcase',
  'to 2000s',
  'ONEderland',
  '#OneBigPopHit',
  'Today\'s Top',
  'Pitbull\'s Globalization',
  'Prime Country',
  'sirius*xm',
  'Studio 54',
  'KidzBop.com',
  '**@SXM**',
  '#Throwback30',
  '2004 Events',
  'Homecoming Radio',
  'Like and Follow!',
  '#GoldenHourBPM',
  '#InTheAir',
  '#betaBPM',
  'EAS Monthly Test',
  '#RecordsOnRecords',
  '#*SXM',
  '#ThrowbackHour',
  'Classic Dance Hits',
  'Marc & Myra',
  '#Top*Countdown',
  '#60sOn6',
  'All 60s Hits',
  '*Cousin Brucie*',
  'Critical Workers',
  'Alt**Discovery',
  'Tmrw*',
  '**@altnation**',
  '#AdvancedPlacement',
  'Inside Tracks',
  'Dave Koz Lounge',
  'The Craft Room',
  '@watercolorsjazz',
  'Euge Groove',
  '*New*Trending*',
  'Pandora*Now',
  '*SoulCycle*',
  'Best On Hits 1',
  'Hit-Bound',
  'And on Instagram',
  'And on Facebook',
  'Blend News Bites',
  '*sCommercial Free*',
  'You May Also Like',
  '#TheCalmChannel',
  '*siriusmx*',
  '*SwayInTheMorning*',
  '*SWAY IN THE MORNING*',
  'The Lord Sear Special',
  'Feel Good Friday',
  'Shade45',
  '*onemorejude*',
  '*TheHYPEisREAL*',
  '*fastcashboyz*',
  '*djgodfatherdetroit*',
  '*EminemShow*',
  '*Prime Country*',
  '*80s & 90s*',
  'Grand Ole Opry',
  'Ranger Doug',
  '*Prime Country*',
  '*Prime 30*',
  'On App/Online',
  'enLighten',
  '*SXMenLighten*',
  'Kirk Franklin\'s Praise',
  'Lee DeWyze',
  '*TheCoffeeHouse*',
  'Essential Workers',
  'THANK YOU',
  '*George Floyd*',
  '*AokisHouse*',
];

export function matchesGarbage(marker: Marker): boolean {
  return (
    micromatch([marker.cut?.artists?.[0]?.name ?? '', marker.cut?.title ?? ''], ignorePaterns, {
      nocase: true,
    }).length > 0
  );
}

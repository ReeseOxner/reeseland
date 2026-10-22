// ─────────────────────────────────────────────────────────────
//  YOUR GALLERY: edit this list to change the art on the walls.
//
//  Each piece:
//    src      local image file in art/
//    remote   (optional) where get-slate-art.sh downloads it from
//    title    short name for the wall label
//    artist   illustrator
//    year
//    note     one-line hook (keep it short; Space opens the full story)
//    url      the story it illustrates; press Space while looking at it
//
//  Up to 15 pieces fit. The first gets the place of honor
//  (center of the far wall), then it fills outward.
//
//  Quick try without editing: drag image files onto the window.
// ─────────────────────────────────────────────────────────────

window.MUSEUM_TITLE = 'Slate Illustrated';

const IMG = 'https://compote.slate.com/images/';

window.GALLERY = [
  { src: 'art/slate-01.jpg', remote: IMG + '838f2db8-eec8-4001-bd44-4af1eca49230.jpeg',
    title: 'Rewind', artist: 'Tolga Akdoğan', year: '2026',
    note: 'Something good we left in the ’90s',
    url: 'https://slate.com/life/2026/08/iphone-90s-smartphone-make-friends-happiness-loneliness.html' },

  { src: 'art/slate-02.jpg', remote: IMG + '65782ebb-70c9-4c62-a9a8-1a8672268ef4.jpeg',
    title: 'Lost Boys of Bitcoin', artist: 'Tolga Akdoğan', year: '2026',
    note: 'Crypto as an emotional tether',
    url: 'https://slate.com/business/2026/09/bitcoin-cryptocurrency-masculinity-economy-emotional-tether.html' },

  { src: 'art/slate-03.jpg', remote: IMG + 'c94c8d98-9aa3-4cc7-94bc-8ab1b0b6fabe.jpeg',
    title: 'The Apple Quest', artist: 'Logan Guo', year: '2024',
    note: 'Are heirloom apples really special?',
    url: 'https://slate.com/life/2024/12/heirloom-apples-milton-calville-grafting-history.html' },

  { src: 'art/slate-04.jpg', remote: IMG + '609a9ee2-5f07-4fa5-8f0e-daab15f06824.jpeg',
    title: 'Thirty Years of Lists', artist: 'Robert Neubecker', year: '2026',
    note: 'Slate’s birthday time capsule',
    url: 'https://slate.com/business/2026/10/slate-anniversary-lists.html' },

  { src: 'art/slate-05.jpg', remote: IMG + 'b1cfe207-ed01-4c2e-a67f-f283f5edb2cc.jpeg',
    title: 'Inside His Head', artist: 'Jason Seiler', year: '2026',
    note: 'One big clue, hiding in plain sight',
    url: 'https://slate.com/news-and-politics/2026/06/donald-trump-news-age-birthday-ufc.html' },

  { src: 'art/slate-06.jpg', remote: IMG + '8523b7e3-53ec-441f-8eff-0141e9b3d2ff.jpeg',
    title: 'Pizza + Bagel', artist: 'Fangyu Ma', year: '2026',
    note: 'America’s greatest snack?',
    url: 'https://slate.com/life/2026/03/pizza-bagel-recipe-cooking-instructions-air-fryer.html' },

  { src: 'art/slate-07.jpg', remote: IMG + 'e684698c-3547-42b3-89cd-ba03ef5fd9fd.jpeg',
    title: 'Ring of Watchers', artist: 'Hua Ye', year: '2025',
    note: 'Why some women are ditching Oura',
    url: 'https://slate.com/technology/2025/10/oura-ring-pentagon-department-of-defense-health-wearable.html' },

  { src: 'art/slate-08.png', remote: IMG + 'ecbe6ca8-4bfa-4689-b3a6-bf817e63fc20.png',
    title: 'Jackpot', artist: 'Chris Whetzel', year: '2025',
    note: 'The scam unfolding in front of us',
    url: 'https://slate.com/technology/2025/03/donald-trump-news-elon-musk-doge-crypto-trumpcoin.html' },

  { src: 'art/slate-09.jpg', remote: IMG + '263cd0a6-d1fc-41b1-8014-d7bb3c2501e3.jpeg',
    title: 'The Forever Trip', artist: 'Fangyu Ma', year: '2026',
    note: 'Longevity tourism is coming',
    url: 'https://slate.com/technology/2026/03/longevity-tourism-rfk-jr-gene-therapy.html' },

  { src: 'art/slate-10.gif', remote: IMG + '1e651cb8-149f-48b6-855b-eb743c68e595.gif',
    title: 'Bowl Culture', artist: 'Hua Ye', year: '2025',
    note: 'How to sort America’s lunch bowls',
    url: 'https://slate.com/life/2025/09/lunch-restaurants-near-me-bowls-chipotle-sweetgreen-dig.html' },

  { src: 'art/slate-11.jpg', remote: IMG + '91b1574a-2fe5-4fa8-bd88-bb0e90bc53ea.jpeg',
    title: 'Down the River', artist: 'Natalie Matthews-Ramo', year: '2024',
    note: 'Huck Finn, retold by Jim',
    url: 'https://slate.com/culture/2024/03/james-book-percival-everett-huck-finn.html' },

  { src: 'art/slate-12.jpg', remote: IMG + 'b738fcb1-3f7e-4bac-a303-5625164706b1.jpeg',
    title: 'Daughters Wanted', artist: 'Anna Kim', year: '2024',
    note: 'A choice most of the world bans',
    url: 'https://slate.com/technology/2024/05/ivf-daughters-toxic-masculinity-sex-selection.html' },

  { src: 'art/slate-13.jpg', remote: IMG + 'e2513b07-2167-4a18-b99c-b2e52ef873e3.jpeg',
    title: 'Two Lines', artist: 'Anna Kim', year: '2025',
    note: 'The stark math of wanting kids',
    url: 'https://slate.com/technology/2025/01/ivf-infertility-insurance-parenthood-debt.html' },

  { src: 'art/slate-14.jpg', remote: IMG + '7dd6d1e3-3812-4bb1-92ff-cbf14b652581.jpeg',
    title: 'The Phone Call', artist: 'Natalie Matthews-Ramo', year: '2026',
    note: 'A 1995 scandal that haunted America',
    url: 'https://slate.com/life/2026/05/baby-medical-doctor-eggs-fertility-california.html' },
];

// ── Theater: the video on the big screen (put the file in media/, then run get-slate-art.sh) ──
window.THEATER_VIDEO = {
  src: 'media/slow-burn-s11-trailer.mp4',
  title: 'Slow Burn, Season 11: Becoming Justice Gorsuch (trailer)',
  subtitle: 'Season 11',
};

// ── The crossword on the phone (any Crosshare embed link works) ──
window.CROSSHARE_MINI = {
  embed: 'https://crosshare.org/embed/yuoAmcdE6CUzjDEHtpn8/YRxqkyqR28RmiMP9wGQgjyYdMzt1?removeHeader=true',
  link: 'https://crosshare.org/crosswords/yuoAmcdE6CUzjDEHtpn8',
  title: 'A Slate crossword',
};

// ── Listening room: Slate podcast feeds (the station plays each show's latest episode) ──
window.PODCASTS = [
  { id: 'political-gabfest', name: 'Political Gabfest', hosts: 'Emily Bazelon, John Dickerson & co.', feed: 'https://feeds.megaphone.fm/slatespoliticalgabfest' },
  { id: 'what-next', name: 'What Next', hosts: 'Mary Harris', feed: 'https://feeds.megaphone.fm/whatnext' },
  { id: 'culture-gabfest', name: 'Culture Gabfest', hosts: 'Stephen Metcalf, Dana Stevens & co.', feed: 'https://feeds.megaphone.fm/slatesculturegabfest' },
  { id: 'slate-money', name: 'Slate Money', hosts: 'Felix Salmon', feed: 'https://feeds.megaphone.fm/slatemoney' },
  { id: 'amicus', name: 'Amicus', hosts: 'Dahlia Lithwick', feed: 'https://feeds.megaphone.fm/slatesamicuswithdahlialithwick' },
  { id: 'decoder-ring', name: 'Decoder Ring', hosts: 'Willa Paskin', feed: 'https://feeds.megaphone.fm/decoderring' },
  { id: 'hang-up-and-listen', name: 'Hang Up and Listen', hosts: 'Slate’s sports podcast', feed: 'https://feeds.megaphone.fm/slateshangupandlisten' },
  { id: 'death-sex-money', name: 'Death, Sex & Money', hosts: 'Slate Podcasts', feed: 'https://feeds.megaphone.fm/SLT2123367297' },
  { id: 'slow-burn', name: 'Slow Burn', hosts: 'Season 11', feed: 'https://feeds.megaphone.fm/watergate' },
  { id: 'how-to', name: 'How To!', hosts: 'Slate Podcasts', feed: 'https://feeds.megaphone.fm/SLT1859464427' },
];

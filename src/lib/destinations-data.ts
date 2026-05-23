export type Destination = {
  id: string;
  name: string;
  image: string;
  gallery: string[];
  videoUrl?: string;
  description: string;
  recommendedSeason: string;
  estimatedBudget: string;
  suitableFor: string[];
  attractions: string[];
  restaurants: string[];
  stayAreas: string[];
  tips: string[];
  weather: string;
  recommendedDays: string;
};

export type TravelType = {
  title: string;
  description: string;
  destinations: string[];
};

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const destinations: Destination[] = [
  {
    id: "paris",
    name: "פריז",
    image: image("photo-1502602898657-3e91760cbb34"),
    gallery: [
      image("photo-1499856871958-5b9627545d1a"),
      image("photo-1431274172761-fca41d930114"),
      image("photo-1522093007474-d86e9bf7ba6f"),
    ],
    videoUrl: "https://www.youtube.com/embed/REDVbTQxMXo",
    description: "עיר אלגנטית לרומנטיקה, מוזיאונים, קולינריה ושיטוטים יפים בין שכונות קלאסיות.",
    recommendedSeason: "אביב וסתיו",
    estimatedBudget: "€180-€320 ליום לזוג",
    suitableFor: ["זוגות", "משפחות", "חברים", "טיול לבד"],
    attractions: ["מגדל אייפל", "הלובר", "מונמארטר", "שייט על הסיין"],
    restaurants: ["Le Relais de l'Entrecote", "L'As du Fallafel", "Bouillon Chartier"],
    stayAreas: ["מארה", "סן ז'רמן", "האופרה"],
    tips: ["להזמין מוזיאונים מראש", "להשתמש במטרו", "לשלב שכונה אחת רגועה בכל יום"],
    weather: "חורף קריר, קיץ נעים עד חם, גשם אפשרי לאורך השנה.",
    recommendedDays: "4-6 ימים",
  },
  {
    id: "rome",
    name: "רומא",
    image: image("photo-1552832230-c0197dd311b5"),
    gallery: [
      image("photo-1525874684015-58379d421a52"),
      image("photo-1515542622106-78bda8ba0e5b"),
      image("photo-1529260830199-42c24126f198"),
    ],
    videoUrl: "https://www.youtube.com/embed/DEJx0CYrDHk",
    description: "שילוב מושלם של היסטוריה, אוכל איטלקי, רחובות ציוריים ואווירה חמה.",
    recommendedSeason: "מרץ-יוני, ספטמבר-נובמבר",
    estimatedBudget: "€140-€260 ליום לזוג",
    suitableFor: ["זוגות", "משפחות", "חברים"],
    attractions: ["הקולוסיאום", "הוותיקן", "פיאצה נבונה", "טרסטוורה"],
    restaurants: ["Tonnarello", "Roscioli", "Emma Pizzeria"],
    stayAreas: ["המרכז ההיסטורי", "טרסטוורה", "מונטי"],
    tips: ["לנעול נעליים נוחות", "להזמין קולוסיאום והוותיקן מראש", "להימנע מנהיגה במרכז"],
    weather: "קיץ חם, חורף מתון, אביב וסתיו אידיאליים להליכה.",
    recommendedDays: "3-5 ימים",
  },
  {
    id: "barcelona",
    name: "ברצלונה",
    image: image("photo-1539037116277-4db20889f2d4"),
    gallery: [
      image("photo-1583422409516-2895a77efded"),
      image("photo-1523531294919-4bcd7c65e216"),
      image("photo-1599813063431-35f98c25ef2b"),
    ],
    videoUrl: "https://www.youtube.com/embed/s1XoYkn3osE",
    description: "ים, אדריכלות, שווקים, שופינג וחיי לילה בעיר אחת קלה וכיפית.",
    recommendedSeason: "אפריל-יוני, ספטמבר-אוקטובר",
    estimatedBudget: "€150-€280 ליום לזוג",
    suitableFor: ["זוגות", "משפחות", "חברים", "טיול לבד"],
    attractions: ["סגרדה פמיליה", "פארק גואל", "הרובע הגותי", "חוף ברצלונטה"],
    restaurants: ["Ciudad Condal", "El Nacional", "La Boqueria"],
    stayAreas: ["אישמפלה", "הרובע הגותי", "אל בורן"],
    tips: ["לשמור על תיקים באזורים עמוסים", "לקנות כרטיסים לגאודי מראש", "לשלב חוף בשעות אחר הצהריים"],
    weather: "אקלים ים תיכוני, קיץ לח וחם, חורף מתון.",
    recommendedDays: "4-6 ימים",
  },
  {
    id: "dubai",
    name: "דובאי",
    image: image("photo-1512453979798-5ea266f8880c"),
    gallery: [
      image("photo-1526495124232-a04e1849168c"),
      image("photo-1546412414-e1885259563a"),
      image("photo-1580674684081-7617fbf3d745"),
    ],
    videoUrl: "https://www.youtube.com/embed/ahy3uRzRG9w",
    description: "יעד יוקרתי, נוח ומסודר עם אטרקציות גדולות, קניונים, חופים ומלונות ברמה גבוהה.",
    recommendedSeason: "נובמבר-מרץ",
    estimatedBudget: "$220-$450 ליום לזוג",
    suitableFor: ["זוגות", "משפחות", "חברים"],
    attractions: ["בורג' חליפה", "Dubai Mall", "מרינה", "סיור מדבר"],
    restaurants: ["Arabian Tea House", "Zuma", "The Beach JBR"],
    stayAreas: ["מרינה", "Downtown", "Jumeirah Beach"],
    tips: ["בקיץ חם מאוד", "להזמין אטרקציות ערב מראש", "מוניות ואפליקציות נסיעה נוחות"],
    weather: "חורף חמים ונעים, קיץ חם מאוד עם לחות גבוהה.",
    recommendedDays: "4-7 ימים",
  },
  {
    id: "london",
    name: "לונדון",
    image: image("photo-1513635269975-59663e0ac1ad"),
    gallery: [
      image("photo-1529655683826-aba9b3e77383"),
      image("photo-1517394834181-95ed159986c7"),
      image("photo-1486299267070-83823f5448dd"),
    ],
    videoUrl: "https://www.youtube.com/embed/45ETZ1xvHS0",
    description: "עיר גדולה ומגוונת עם מוזיאונים, פארקים, שווקים, מחזות זמר ושופינג מעולה.",
    recommendedSeason: "מאי-ספטמבר ודצמבר",
    estimatedBudget: "£190-£360 ליום לזוג",
    suitableFor: ["משפחות", "חברים", "טיול לבד", "זוגות"],
    attractions: ["ביג בן", "British Museum", "Camden Market", "Hyde Park"],
    restaurants: ["Dishoom", "Borough Market", "Flat Iron"],
    stayAreas: ["Covent Garden", "South Bank", "Kensington"],
    tips: ["להשתמש באויסטר או כרטיס אשראי בתחבורה", "לתכנן אזורים לפי ימים", "לקחת מטרייה קלה"],
    weather: "מזג אוויר משתנה, גשמים קלים אפשריים כמעט תמיד.",
    recommendedDays: "5-7 ימים",
  },
  {
    id: "amsterdam",
    name: "אמסטרדם",
    image: image("photo-1512470876302-972faa2aa9a4"),
    gallery: [
      image("photo-1534351590666-13e3e96b5017"),
      image("photo-1584003564911-a7a321c84e1c"),
      image("photo-1576924542622-772281b13aa8"),
    ],
    videoUrl: "https://www.youtube.com/embed/ey_L_VzPwEI",
    description: "תעלות, מוזיאונים, אופניים, קפה ושכונות רגועות שמתאימות לחופשה קלילה.",
    recommendedSeason: "אפריל-יוני, ספטמבר",
    estimatedBudget: "€160-€300 ליום לזוג",
    suitableFor: ["זוגות", "חברים", "טיול לבד"],
    attractions: ["מוזיאון ואן גוך", "בית אנה פרנק", "שייט תעלות", "Vondelpark"],
    restaurants: ["Foodhallen", "De Kas", "Pancakes Amsterdam"],
    stayAreas: ["Jordaan", "De Pijp", "Museum Quarter"],
    tips: ["להזמין את בית אנה פרנק מוקדם", "להיזהר משבילי אופניים", "ללון ליד תחנת טראם"],
    weather: "קריר ונעים רוב השנה, גשם ורוח נפוצים.",
    recommendedDays: "3-5 ימים",
  },
  {
    id: "greece",
    name: "יוון",
    image: image("photo-1533105079780-92b9be482077"),
    gallery: [
      image("photo-1601581875309-fafbf2d3ed3a"),
      image("photo-1504512485720-7d83a16ee930"),
      image("photo-1516483638261-f4dbaf036963"),
    ],
    videoUrl: "https://www.youtube.com/embed/2WN0T-Ee3q4",
    description: "חופים, איים, אוכל ים תיכוני, שקיעות וכפרים לבנים עם קצב רגוע.",
    recommendedSeason: "מאי-יוני, ספטמבר-אוקטובר",
    estimatedBudget: "€120-€280 ליום לזוג",
    suitableFor: ["זוגות", "משפחות", "חברים"],
    attractions: ["אתונה", "סנטוריני", "כרתים", "מיקונוס"],
    restaurants: ["Taverna Klimataria", "To Kati Allo", "מסעדות חוף מקומיות"],
    stayAreas: ["פלאקה באתונה", "פירה בסנטוריני", "חאניה בכרתים"],
    tips: ["לא לדחוס יותר מדי איים", "לבדוק זמני מעבורות", "להשאיר זמן לחופים"],
    weather: "קיץ חם ויבש, אביב וסתיו נעימים מאוד.",
    recommendedDays: "5-10 ימים",
  },
  {
    id: "thailand",
    name: "תאילנד",
    image: image("photo-1508009603885-50cf7c579365"),
    gallery: [
      image("photo-1528181304800-259b08848526"),
      image("photo-1519451241324-20b4ea2c4220"),
      image("photo-1552465011-b4e21bf6e79a"),
    ],
    videoUrl: "https://www.youtube.com/embed/vNQR3ixE8AE",
    description: "שילוב של איים, טבע, שווקים, אוכל רחוב, מלונות מפנקים ומסלולי משפחות או תרמילאים.",
    recommendedSeason: "נובמבר-מרץ",
    estimatedBudget: "$90-$260 ליום לזוג",
    suitableFor: ["זוגות", "משפחות", "חברים", "טיול לבד"],
    attractions: ["בנגקוק", "צ'אנג מאי", "קוסמוי", "פוקט", "קו פנגן"],
    restaurants: ["Or Tor Kor Market", "Blue Elephant", "מסעדות חוף מקומיות"],
    stayAreas: ["סוקומוויט בבנגקוק", "צ'אוונג בקוסמוי", "Patong או Kata בפוקט"],
    tips: ["לתכנן מעברים בין איים מראש", "לבדוק עונות גשם לפי צד האיים", "להשאיר יום התאוששות אחרי טיסות פנים"],
    weather: "טרופי וחם, עם עונות גשם שונות בין האזורים.",
    recommendedDays: "10-18 ימים",
  },
];

export const inspirationImages = destinations.flatMap((destination) =>
  destination.gallery.slice(0, 2).map((src, index) => ({
    src,
    title: `${destination.name} ${index === 0 ? "ברגע מושלם" : "מזווית אחרת"}`,
  })),
);

export const travelTypes: TravelType[] = [
  {
    title: "חופשה רומנטית",
    description: "מלונות נעימים, מסעדות טובות, שקיעות וקצב רגוע.",
    destinations: ["פריז", "יוון", "רומא"],
  },
  {
    title: "משפחתי",
    description: "אטרקציות קלות, אזורי לינה נוחים וימים לא עמוסים מדי.",
    destinations: ["לונדון", "דובאי", "תאילנד"],
  },
  {
    title: "בטן גב",
    description: "חופים, ריזורטים, ספא וזמן פנוי אמיתי.",
    destinations: ["יוון", "תאילנד", "דובאי"],
  },
  {
    title: "שופינג",
    description: "קניונים, שווקים, רחובות אופנה ומותגים.",
    destinations: ["לונדון", "דובאי", "ברצלונה"],
  },
  {
    title: "טבע והרפתקאות",
    description: "נופים, איים, טיולים רגליים וחוויות מחוץ לעיר.",
    destinations: ["תאילנד", "יוון", "ברצלונה"],
  },
  {
    title: "תקציב נמוך",
    description: "יעדים עם אוכל טוב, תחבורה נוחה ואפשרויות לינה מגוונות.",
    destinations: ["רומא", "אמסטרדם", "תאילנד"],
  },
];

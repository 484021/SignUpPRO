export interface KeywordData {
  slug: string
  keyword: string
  category: string
  title: string
  metaDescription: string
  h1: string
  heroSubtitle: string
  pain_points: string[]
  benefits: string[]
  use_cases: string[]
  cta_text: string
  related_keywords: string[]
}

function toTitleCase(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export const seoKeywords: KeywordData[] = [
  // Category 1: SignUpGenius Alternatives
  {
    slug: "signup-genius-alternatives",
    keyword: "signup genius alternatives",
    category: "alternatives",
    title: "Best SignUpGenius Alternatives in 2025 - Free & Easy Event Signup",
    metaDescription:
      "Looking for SignUpGenius alternatives? SignUpPRO offers free event signup sheets, no ads, unlimited users, and mobile-friendly signup forms. Try it free today.",
    h1: "Best SignUpGenius Alternatives for 2025",
    heroSubtitle: "Simple, free event signup sheets without the complexity. No ads, no user limits, just easy signups.",
    pain_points: [
      "Tired of SignUpGenius ads and premium limitations?",
      "Need unlimited users without paying for upgrades?",
      "Want a simpler, more mobile-friendly interface?",
      "Looking for better customization options?",
    ],
    benefits: [
      "100% free with no hidden fees or user limits",
      "Clean, ad-free interface that participants love",
      "Mobile-optimized signup experience",
      "Quick setup in under 2 minutes",
    ],
    use_cases: ["Sports team signups", "Volunteer coordination", "Class scheduling", "Event registration"],
    cta_text: "Try SignUpPRO Free - No Credit Card Required",
    related_keywords: ["alternative to sign up genius", "apps like signupgenius", "free signup genius alternative"],
  },
  {
    slug: "alternative-to-sign-up-genius",
    keyword: "alternative to sign up genius",
    category: "alternatives",
    title: "Alternative to SignUpGenius - Free Event Signup Tool | SignUpPRO",
    metaDescription:
      "Discover the best alternative to SignUpGenius. SignUpPRO offers free unlimited signups, no ads, mobile-friendly forms, and instant setup. Start organizing today.",
    h1: "The Modern Alternative to SignUpGenius",
    heroSubtitle: "Everything you need for event signups, without the complexity or premium pricing.",
    pain_points: [
      "SignUpGenius feels outdated and clunky?",
      "Premium features locked behind expensive plans?",
      "Mobile app not working properly?",
      "Too many steps to create a simple signup?",
    ],
    benefits: [
      "Modern, intuitive interface",
      "All features free forever",
      "Perfect mobile experience",
      "Create events in seconds",
    ],
    use_cases: ["Team sports coordination", "Workshop registration", "Volunteer scheduling", "Community events"],
    cta_text: "Switch to SignUpPRO Today",
    related_keywords: ["signup genius alternatives", "sites like signupgenius", "signup genius vs google forms"],
  },
  {
    slug: "free-signup-genius-alternative",
    keyword: "free signup genius alternative",
    category: "alternatives",
    title: "Free SignUpGenius Alternative - No Limits, No Ads | SignUpPRO",
    metaDescription:
      "Find a completely free alternative to SignUpGenius with unlimited signups, no ads, and all features included. SignUpPRO makes event coordination effortless.",
    h1: "100% Free Alternative to SignUpGenius",
    heroSubtitle: "All the features you need without any premium upgrades or hidden costs.",
    pain_points: [
      "Hit the free tier limit on SignUpGenius?",
      "Annoyed by constant premium upgrade prompts?",
      "Need more signups without paying?",
      "Want ad-free experience for participants?",
    ],
    benefits: [
      "Truly unlimited signups forever",
      "Zero advertisements",
      "All premium features included",
      "No credit card required",
    ],
    use_cases: ["School events", "Church activities", "Sports leagues", "Community groups"],
    cta_text: "Start Using Free Forever",
    related_keywords: ["signup genius alternatives", "free online signup form creator", "online signup sheet"],
  },

  // Category 2: Sports Sign-Up Keywords - Badminton
  {
    slug: "badminton-signup-sheet",
    keyword: "badminton signup sheet",
    category: "sports-badminton",
    title: "Badminton Signup Sheet - Free Court Booking & Drop-In Manager",
    metaDescription:
      "Create free badminton signup sheets for drop-in sessions, court bookings, and tournaments. Track attendance, manage waitlists, and send automatic reminders.",
    h1: "Badminton Signup Sheet Made Simple",
    heroSubtitle: "Organize badminton sessions with easy signup sheets. Perfect for clubs, drop-ins, and tournaments.",
    pain_points: [
      "Players forgetting to confirm attendance?",
      "Court overbooked or too many no-shows?",
      "Managing waitlists manually?",
      "Lost track of who's coming?",
    ],
    benefits: [
      "Real-time court capacity tracking",
      "Automatic waitlist management",
      "Email confirmations to players",
      "Mobile-friendly for on-the-go signups",
    ],
    use_cases: ["Drop-in badminton nights", "Court reservations", "Tournament registration", "League play scheduling"],
    cta_text: "Create Your Badminton Signup Sheet",
    related_keywords: ["badminton drop in signup", "badminton court signup", "badminton attendance tracker"],
  },
  {
    slug: "badminton-drop-in-signup",
    keyword: "badminton drop in signup",
    category: "sports-badminton",
    title: "Badminton Drop-In Signup - Easy Court Management System",
    metaDescription:
      "Manage badminton drop-in sessions effortlessly. Players sign up online, you track capacity in real-time. Free signup tool for badminton clubs and gyms.",
    h1: "Streamline Your Badminton Drop-In Sessions",
    heroSubtitle: "Let players reserve spots online. No more messy group chats or overbooked courts.",
    pain_points: [
      "Group chat chaos for drop-in coordination?",
      "Courts too empty or too crowded?",
      "Players arriving without confirming?",
      "Difficult to manage skill level mixing?",
    ],
    benefits: [
      "Set capacity limits per session",
      "Players self-register instantly",
      "See who's coming in real-time",
      "Optional skill level categories",
    ],
    use_cases: ["Weekly drop-in nights", "Open play sessions", "Mixed skill play", "Club member reservations"],
    cta_text: "Set Up Drop-In Signups Now",
    related_keywords: ["badminton signup sheet", "badminton attendance tracker", "badminton registration form"],
  },

  // Category 2: Pickleball
  {
    slug: "pickleball-signup-sheet",
    keyword: "pickleball signup sheet",
    category: "sports-pickleball",
    title: "Pickleball Signup Sheet - Free Court Reservation & Open Play",
    metaDescription:
      "Free pickleball signup sheets for open play, tournaments, and lessons. Track court availability, manage waitlists, and coordinate players effortlessly.",
    h1: "Pickleball Signup Made Easy",
    heroSubtitle: "Organize pickleball sessions with simple signup sheets that players love.",
    pain_points: [
      "Courts getting too crowded during open play?",
      "Players not showing up after confirming?",
      "Difficult to rotate players fairly?",
      "Losing track of skill levels?",
    ],
    benefits: [
      "Track court capacity automatically",
      "Manage skill-based groupings",
      "Send reminder emails",
      "Mobile signup from anywhere",
    ],
    use_cases: ["Open play coordination", "Tournament signups", "Lesson registration", "Round robin events"],
    cta_text: "Create Pickleball Signup Sheet",
    related_keywords: ["pickleball drop in signup", "pickleball open play signup", "pickleball round robin signup"],
  },
  {
    slug: "pickleball-open-play-signup",
    keyword: "pickleball open play signup",
    category: "sports-pickleball",
    title: "Pickleball Open Play Signup - Coordinate Courts & Players",
    metaDescription:
      "Manage pickleball open play with online signups. Players reserve spots, you control capacity. Perfect for clubs, gyms, and community centers.",
    h1: "Organize Pickleball Open Play Sessions",
    heroSubtitle: "Simple signup system for managing open play courts and player rotation.",
    pain_points: [
      "Too many players showing up without warning?",
      "Can't balance court usage?",
      "Players arriving at wrong times?",
      "Skill level mismatches?",
    ],
    benefits: [
      "Set player limits per session",
      "Real-time availability updates",
      "Optional skill level selection",
      "Waitlist for full sessions",
    ],
    use_cases: ["Community center open play", "Club member sessions", "Public courts", "Mixed doubles coordination"],
    cta_text: "Start Open Play Signups",
    related_keywords: ["pickleball signup sheet", "pickleball class registration", "pickleball drop in signup"],
  },

  // Category 3: Event & Class Registration
  {
    slug: "excel-potluck-sign-up-sheet",
    keyword: "excel potluck sign up sheet",
    category: "events",
    title: "Excel Potluck Sign Up Sheet Alternative - Stop Emailing Spreadsheets",
    metaDescription:
      "Stop emailing Excel potluck sheets back and forth. Create one shareable link for your potluck signup. Real-time updates, no version conflicts, free forever.",
    h1: "Excel Potluck Sign Up Sheet",
    heroSubtitle: "You're tired of chasing down who's bringing what. Stop emailing spreadsheets back and forth. Create one shareable link and watch your potluck fill up automatically—no version conflicts.",
    pain_points: [
      "Five people have five different Excel versions—who has the latest one?",
      "Drowning in email attachments with 'Please find attached...'",
      "Two people signed up for the same dish because they didn't see each other's updates",
      "Spending hours copying names from emails into your spreadsheet",
    ],
    benefits: [
      "Share one link in your group chat—everyone signs up directly, no file attachments",
      "Everyone sees the same list instantly—no more version conflicts or duplicate dishes",
      "Get notified when someone signs up—no more chasing people down",
      "Works on any phone or computer—no Excel or Google Sheets required",
    ],
    use_cases: ["Office potlucks", "Holiday dinners", "Church gatherings", "School events", "Family reunions", "Team parties", "Neighborhood BBQs", "Club meetings"],
    cta_text: "Create Free Potluck Signup",
    related_keywords: ["potluck sign up sheet online", "potluck signup template", "potluck spreadsheet alternative", "online potluck organizer"],
  },
  {
    slug: "event-signup-sheet",
    keyword: "event signup sheet",
    category: "events",
    title: "Event Signup Sheet - Free Online Registration Forms | SignUpPRO",
    metaDescription:
      "Create free event signup sheets in minutes. Track RSVPs, manage capacity, send confirmations. Perfect for workshops, classes, and community events.",
    h1: "Professional Event Signup Sheets",
    heroSubtitle: "Collect RSVPs and manage event registration with beautiful, mobile-friendly signup forms.",
    pain_points: [
      "Scattered RSVPs across email and texts?",
      "Lost track of attendee count?",
      "No easy way to manage capacity?",
      "Manual confirmation emails taking forever?",
    ],
    benefits: [
      "Centralized attendee management",
      "Automatic capacity tracking",
      "Email confirmations sent instantly",
      "Export attendee lists anytime",
    ],
    use_cases: ["Workshops", "Community events", "Conferences", "Training sessions"],
    cta_text: "Create Event Signup Sheet",
    related_keywords: ["event registration form free", "online signup sheet", "free sign up sheet template"],
  },
  {
    slug: "free-online-signup-form-creator",
    keyword: "free online signup form creator",
    category: "events",
    title: "Free Online Signup Form Creator - Build Forms in 2 Minutes",
    metaDescription:
      "Create beautiful online signup forms for free. No coding required. Collect attendees, manage capacity, send confirmations automatically. Try SignUpPRO today.",
    h1: "Create Online Signup Forms in Minutes",
    heroSubtitle: "Build professional signup forms without any technical skills. Free forever.",
    pain_points: [
      "Other form builders too complicated?",
      "Expensive monthly subscriptions?",
      "Need coding knowledge to customize?",
      "Forms not mobile-friendly?",
    ],
    benefits: [
      "Drag-and-drop simplicity",
      "No credit card required",
      "Mobile-optimized automatically",
      "Collect unlimited responses",
    ],
    use_cases: ["Event registration", "Class signups", "Volunteer coordination", "Appointment booking"],
    cta_text: "Build Your First Form Free",
    related_keywords: ["online signup sheet", "free sign up form", "digital signup form"],
  },
  {
    slug: "volunteer-signup-sheet",
    keyword: "volunteer signup sheet",
    category: "events",
    title: "Volunteer Signup Sheet - Free Online Scheduling Tool",
    metaDescription:
      "Create volunteer signup sheets with time slots, shift limits, and automatic reminders. Perfect for nonprofits, schools, and community organizations.",
    h1: "Volunteer Signup Sheets That Work",
    heroSubtitle: "Coordinate volunteers effortlessly with organized signup sheets and automatic reminders.",
    pain_points: [
      "Volunteers forgetting their shifts?",
      "Over or under-staffed events?",
      "Manually tracking who signed up?",
      "Last-minute cancellations?",
    ],
    benefits: ["Time slot management", "Shift capacity limits", "Automatic reminder emails", "Easy shift changes"],
    use_cases: ["School events", "Charity fundraisers", "Community cleanups", "Event staffing"],
    cta_text: "Create Volunteer Signup",
    related_keywords: ["volunteer registration form", "time slot signup sheet", "schedule signup sheet template"],
  },

  // Category 4: Attendance Tracking
  {
    slug: "attendance-sheet-template",
    keyword: "attendance sheet template",
    category: "attendance",
    title: "Attendance Sheet Template - Free Digital Sign-In Sheets",
    metaDescription:
      "Free online attendance sheet template. Track attendance digitally, export reports, and eliminate paper sign-in sheets. Perfect for classes, events, and meetings.",
    h1: "Digital Attendance Tracking Made Simple",
    heroSubtitle: "Replace paper sign-in sheets with modern digital attendance tracking.",
    pain_points: [
      "Lost or messy paper attendance sheets?",
      "Can't track trends over time?",
      "Difficult to share attendance data?",
      "Manual data entry wasting time?",
    ],
    benefits: [
      "Digital check-in on any device",
      "Automatic attendance reports",
      "Track attendance trends",
      "Export to Excel anytime",
    ],
    use_cases: ["Class attendance", "Meeting check-ins", "Event participation", "Training sessions"],
    cta_text: "Start Tracking Attendance",
    related_keywords: ["online attendance sheet", "digital attendance sheet", "attendance sign in sheet"],
  },
  {
    slug: "sports-attendance-tracker",
    keyword: "sports attendance tracker",
    category: "attendance",
    title: "Sports Attendance Tracker - Track Practice & Game Attendance",
    metaDescription:
      "Free sports attendance tracker for teams and coaches. Track practice attendance, identify patterns, and keep players accountable. Works for all sports.",
    h1: "Track Sports Team Attendance Effortlessly",
    heroSubtitle: "Know who's showing up to practices and games with automatic attendance tracking.",
    pain_points: [
      "Players skipping practice without notice?",
      "Can't identify attendance patterns?",
      "Paper roster getting lost?",
      "Difficult to hold players accountable?",
    ],
    benefits: [
      "Real-time attendance tracking",
      "Attendance history per player",
      "Pattern identification",
      "Share reports with parents",
    ],
    use_cases: ["Team practices", "Game attendance", "Training sessions", "Tournament participation"],
    cta_text: "Track Team Attendance",
    related_keywords: ["team attendance tracker", "drop in attendance sheet", "attendance signup app"],
  },

  // More keywords abbreviated for space...
  {
    slug: "class-signup-sheet-template",
    keyword: "class signup sheet template",
    category: "education",
    title: "Class Signup Sheet Template - Free Student Registration Forms",
    metaDescription:
      "Free class signup sheet templates for workshops, courses, and training. Manage student registration, track capacity, and send confirmations automatically.",
    h1: "Class Registration Made Easy",
    heroSubtitle: "Organize class signups with professional templates. No spreadsheets required.",
    pain_points: [
      "Classes over-enrolled or under-enrolled?",
      "Manual registration taking too long?",
      "Students missing class details?",
      "Can't track who paid?",
    ],
    benefits: [
      "Automatic class capacity limits",
      "Instant confirmation emails",
      "Collect custom information",
      "Waitlist management",
    ],
    use_cases: ["Workshops", "Training courses", "Yoga classes", "Tutoring sessions"],
    cta_text: "Create Class Signup Sheet",
    related_keywords: ["workshop signup form", "tutoring session signup", "study group signup sheet"],
  },
  {
    slug: "online-signup-sheet",
    keyword: "online signup sheet",
    category: "general",
    title: "Online Signup Sheet - Free Digital Registration Forms | SignUpPRO",
    metaDescription:
      "Create free online signup sheets for any event or activity. Mobile-friendly, customizable, and easy to use. No downloads or installations required.",
    h1: "Online Signup Sheets for Every Occasion",
    heroSubtitle: "Create, share, and manage signup sheets entirely online. Works on any device.",
    pain_points: [
      "Paper signup sheets getting lost?",
      "Can't track signups in real-time?",
      "Need to manually compile responses?",
      "Difficult to share with participants?",
    ],
    benefits: [
      "Access from any device",
      "Real-time signup updates",
      "Automatic data collection",
      "Easy sharing with unique links",
    ],
    use_cases: ["Any event type", "Classes", "Sports", "Volunteer work"],
    cta_text: "Create Online Signup Sheet",
    related_keywords: ["digital signup form", "free online signup form creator", "online registration sheet"],
  },
]

const generateKeywordData = (slug: string, keyword: string, category: string): KeywordData => {
  const titleCaseKeyword = toTitleCase(keyword)

  return {
    slug,
    keyword,
    category,
    title: `${titleCaseKeyword} - Free Signup Sheets | SignUpPRO`,
    metaDescription: `Create free ${keyword} forms online. Easy signup management, automatic reminders, and real-time tracking with SignUpPRO. No credit card required.`,
    h1: titleCaseKeyword,
    heroSubtitle: `Organize ${keyword} effortlessly with SignUpPRO's free signup management platform.`,
    pain_points: [
      "Managing signups manually taking too much time?",
      "Lost track of who's coming to your event?",
      "Participants forgetting to confirm attendance?",
      "Need a better way to coordinate schedules?",
    ],
    benefits: [
      "Free forever with unlimited signups",
      "Real-time attendance tracking",
      "Automatic email confirmations",
      "Mobile-friendly signup forms",
    ],
    use_cases: ["Events", "Classes", "Sports", "Volunteer work"],
    cta_text: "Get Started Free",
    related_keywords: ["online signup sheet", "event registration form", "free signup form"],
  }
}

// All 100+ keywords organized by category
export const allKeywords: KeywordData[] = [
  ...seoKeywords,

  // Category 1: SignUpGenius Traffic Steal (15 keywords total - add remaining ones)
  generateKeywordData("apps-like-signupgenius", "apps like signupgenius", "alternatives"),
  generateKeywordData("sites-like-signupgenius", "sites like signupgenius", "alternatives"),
  generateKeywordData("signup-genius-vs-google-forms", "signup genius vs google forms", "comparison"),
  generateKeywordData("signup-genius-vs-jotform", "signup genius vs jotform", "comparison"),
  generateKeywordData("signup-genius-vs-eventbrite", "signup genius vs eventbrite", "comparison"),
  generateKeywordData("signup-genius-vs-doodle", "signup genius vs doodle", "comparison"),
  generateKeywordData("sign-up-genius-pricing", "sign up genius pricing", "alternatives"),
  generateKeywordData("sign-up-genius-problems", "sign up genius problems", "alternatives"),
  generateKeywordData("signup-genius-not-working", "signup genius not working", "alternatives"),
  generateKeywordData("signup-genius-mobile-issues", "signup genius mobile issues", "alternatives"),
  generateKeywordData("signup-genius-too-complicated", "signup genius too complicated", "alternatives"),
  generateKeywordData("signup-genius-limited-users", "signup genius limited users", "alternatives"),

  // Category 2: Sports Sign-Up Keywords - Badminton (5 keywords)
  generateKeywordData("badminton-signup-sheet", "badminton signup sheet", "sports-badminton"),
  generateKeywordData("badminton-drop-in-signup", "badminton drop in signup", "sports-badminton"),
  generateKeywordData("badminton-attendance-tracker", "badminton attendance tracker", "sports-badminton"),
  generateKeywordData("badminton-registration-form", "badminton registration form", "sports-badminton"),
  generateKeywordData("badminton-court-signup", "badminton court signup", "sports-badminton"),

  // Category 2: Sports - Pickleball (5 keywords)
  generateKeywordData("pickleball-signup-sheet", "pickleball signup sheet", "sports-pickleball"),
  generateKeywordData("pickleball-drop-in-signup", "pickleball drop in signup", "sports-pickleball"),
  generateKeywordData("pickleball-open-play-signup", "pickleball open play signup", "sports-pickleball"),
  generateKeywordData("pickleball-round-robin-signup", "pickleball round robin signup", "sports-pickleball"),
  generateKeywordData("pickleball-class-registration", "pickleball class registration", "sports-pickleball"),

  // Category 2: Sports - Volleyball (5 keywords)
  generateKeywordData("volleyball-signup-sheet", "volleyball signup sheet", "sports-volleyball"),
  generateKeywordData("volleyball-open-gym-signup", "volleyball open gym signup", "sports-volleyball"),
  generateKeywordData("volleyball-drop-in-signup", "volleyball drop in signup", "sports-volleyball"),
  generateKeywordData("volleyball-class-registration", "volleyball class registration", "sports-volleyball"),
  generateKeywordData("beach-volleyball-signup-sheet", "beach volleyball signup sheet", "sports-volleyball"),

  // Category 2: Sports - Basketball (5 keywords)
  generateKeywordData("basketball-open-gym-signup", "basketball open gym signup", "sports-basketball"),
  generateKeywordData("basketball-drop-in-signup", "basketball drop in signup", "sports-basketball"),
  generateKeywordData("basketball-practice-signup", "basketball practice signup", "sports-basketball"),
  generateKeywordData("basketball-training-signup", "basketball training signup", "sports-basketball"),
  generateKeywordData("basketball-scrimmage-signup", "basketball scrimmage signup", "sports-basketball"),

  // Category 2: Sports - Soccer (5 keywords)
  generateKeywordData("soccer-practice-signup", "soccer practice signup", "sports-soccer"),
  generateKeywordData("soccer-tryout-signup", "soccer tryout signup", "sports-soccer"),
  generateKeywordData("soccer-training-signup", "soccer training signup", "sports-soccer"),
  generateKeywordData("soccer-tournament-registration", "soccer tournament registration", "sports-soccer"),
  generateKeywordData("indoor-soccer-signup", "indoor soccer signup", "sports-soccer"),

  // Category 3: Event & Class Registration (20 keywords)
  generateKeywordData("event-signup-sheet", "event signup sheet", "events"),
  generateKeywordData("event-registration-form-free", "event registration form free", "events"),
  generateKeywordData("online-signup-sheet", "online signup sheet", "general"),
  generateKeywordData("editable-signup-sheet", "editable signup sheet", "general"),
  generateKeywordData("free-sign-up-sheet-template", "free sign up sheet template", "general"),
  generateKeywordData("time-slot-signup-sheet", "time slot signup sheet", "scheduling"),
  generateKeywordData("group-signup-sheet", "group signup sheet", "general"),
  generateKeywordData("class-signup-sheet-template", "class signup sheet template", "education"),
  generateKeywordData("workshop-signup-form", "workshop signup form", "education"),
  generateKeywordData("volunteer-signup-sheet", "volunteer signup sheet", "volunteers"),
  generateKeywordData("volunteer-registration-form", "volunteer registration form", "volunteers"),
  generateKeywordData("tutoring-session-signup", "tutoring session signup", "education"),
  generateKeywordData("study-group-signup-sheet", "study group signup sheet", "education"),
  generateKeywordData("community-event-signup", "community event signup", "events"),
  generateKeywordData("parent-teacher-conference-signup", "parent teacher conference signup", "education"),
  generateKeywordData("appointment-signup-sheet", "appointment signup sheet", "scheduling"),
  generateKeywordData("online-registration-sheet", "online registration sheet", "general"),
  generateKeywordData("digital-signup-form", "digital signup form", "general"),
  generateKeywordData("free-online-signup-form-creator", "free online signup form creator", "general"),
  generateKeywordData("schedule-signup-sheet-template", "schedule signup sheet template", "scheduling"),

  // Category 4: Attendance Tracking (10 keywords)
  generateKeywordData("attendance-sheet-template", "attendance sheet template", "attendance"),
  generateKeywordData("attendance-sign-in-sheet", "attendance sign in sheet", "attendance"),
  generateKeywordData("sports-attendance-tracker", "sports attendance tracker", "attendance"),
  generateKeywordData("online-attendance-sheet", "online attendance sheet", "attendance"),
  generateKeywordData("participant-sign-in-sheet", "participant sign in sheet", "attendance"),
  generateKeywordData("team-attendance-tracker", "team attendance tracker", "attendance"),
  generateKeywordData("drop-in-attendance-sheet", "drop in attendance sheet", "attendance"),
  generateKeywordData("attendance-signup-app", "attendance signup app", "attendance"),
  generateKeywordData("digital-attendance-sheet", "digital attendance sheet", "attendance"),
  generateKeywordData("free-attendance-tracker-online", "free attendance tracker online", "attendance"),

  // Category 5: Questions Keywords (10 keywords)
  generateKeywordData("questions-to-ask-on-signup-forms", "questions to ask on signup forms", "questions"),
  generateKeywordData("volunteer-signup-questions", "volunteer signup questions", "questions"),
  generateKeywordData("event-registration-form-questions", "event registration form questions", "questions"),
  generateKeywordData("sports-signup-form-questions", "sports signup form questions", "questions"),
  generateKeywordData("class-registration-questions", "class registration questions", "questions"),
  generateKeywordData(
    "what-information-to-collect-on-signup-form",
    "what information to collect on signup form",
    "questions",
  ),
  generateKeywordData("questions-for-participant-registration", "questions for participant registration", "questions"),
  generateKeywordData("health-questions-for-sports-signup", "health questions for sports signup", "questions"),
  generateKeywordData("parental-consent-questions-signup", "parental consent questions signup", "questions"),
  generateKeywordData("emergency-contact-questions-form", "emergency contact questions form", "questions"),

  // Category 6: High-Volume Generic (10 keywords)
  generateKeywordData("free-sign-up-form", "free sign up form", "general"),
  generateKeywordData("online-signup-form-free", "online signup form free", "general"),
  generateKeywordData("signup-sheet-creator", "signup sheet creator", "general"),
  generateKeywordData("online-signup-sheet-template", "online signup sheet template", "general"),
  generateKeywordData("signup-sheet-for-groups", "signup sheet for groups", "general"),
  generateKeywordData("simple-signup-sheet-template", "simple signup sheet template", "general"),
  generateKeywordData("time-slot-sign-up-template", "time slot sign up template", "scheduling"),
  generateKeywordData("editable-registration-form", "editable registration form", "general"),
  generateKeywordData("schedule-signup-form", "schedule signup form", "scheduling"),
  generateKeywordData("free-digital-sign-up-sheet", "free digital sign up sheet", "general"),

  // Category 7: Niche Low-Competition (10 keywords)
  generateKeywordData("sports-team-signup-sheet", "sports team signup sheet", "sports-general"),
  generateKeywordData("fitness-class-registration", "fitness class registration", "fitness"),
  generateKeywordData("yoga-class-signup-sheet", "yoga class signup sheet", "fitness"),
  generateKeywordData("pilates-signup-form", "pilates signup form", "fitness"),
  generateKeywordData("gym-class-signup-sheet", "gym class signup sheet", "fitness"),
  generateKeywordData("martial-arts-class-signup", "martial arts class signup", "fitness"),
  generateKeywordData("cycling-group-signup", "cycling group signup", "fitness"),
  generateKeywordData("running-club-signup", "running club signup", "fitness"),
  generateKeywordData("community-center-signup-sheet", "community center signup sheet", "events"),
  generateKeywordData("church-event-signup-form", "church event signup form", "events"),
]

export function getKeywordBySlug(slug: string): KeywordData | undefined {
  return allKeywords.find((kw) => kw.slug === slug)
}

export function getAllKeywordSlugs(): string[] {
  return allKeywords.map((kw) => kw.slug)
}

export const electionData = {
  india: {
    name: 'India',
    icon: 'flag',
    nextEvent: 'General Election Phase 1',
    nextDate: new Date('2026-04-19T08:00:00').getTime(),
    timeline: [
      {
        date: 'Mar 16, 2026',
        title: 'Election Announcement',
        desc: 'ECI announces polling dates.',
        passed: true,
      },
      {
        date: 'Mar 28, 2026',
        title: 'Voter Registration Closes',
        desc: 'Last day to add name to electoral roll.',
        passed: true,
      },
      {
        date: 'Apr 19, 2026',
        title: 'Phase 1 Voting',
        desc: 'First phase of polling begins.',
        passed: false,
        upcoming: true,
      },
      {
        date: 'Jun 01, 2026',
        title: 'Final Phase Voting',
        desc: 'Last phase of polling concludes.',
        passed: false,
      },
      {
        date: 'Jun 04, 2026',
        title: 'Results Day',
        desc: 'Counting of votes and declaration.',
        passed: false,
      },
    ],
    wizard: [
      {
        id: 'reg',
        title: 'Check Voter ID',
        desc: 'Ensure your name is on the electoral roll at eci.gov.in.',
      },
      {
        id: 'loc',
        title: 'Find Polling Booth',
        desc: 'Locate your designated polling station using the Voter Helpline App.',
      },
      { id: 'id', title: 'Carry Valid ID', desc: 'EPIC (Voter ID), Aadhaar, PAN, or Passport.' },
      {
        id: 'vote',
        title: 'Cast Vote via EVM',
        desc: 'Press the button next to your candidate and check the VVPAT slip.',
      },
    ],
  },
  us: {
    name: 'USA',
    icon: 'flag',
    nextEvent: 'Presidential Election',
    nextDate: new Date('2026-11-03T07:00:00').getTime(),
    timeline: [
      {
        date: 'Sep 01, 2026',
        title: 'Mail-in Ballots Sent',
        desc: 'First batch of mail ballots dispatched.',
        passed: false,
      },
      {
        date: 'Oct 05, 2026',
        title: 'Registration Deadline',
        desc: 'Varies by state, typical deadline.',
        passed: false,
      },
      {
        date: 'Oct 15, 2026',
        title: 'Early Voting Begins',
        desc: 'In-person early voting opens in many states.',
        passed: false,
      },
      {
        date: 'Nov 03, 2026',
        title: 'Election Day',
        desc: 'Final day to cast ballots in-person.',
        passed: false,
        upcoming: true,
      },
      {
        date: 'Jan 20, 2027',
        title: 'Inauguration Day',
        desc: 'Presidential swearing-in ceremony.',
        passed: false,
      },
    ],
    wizard: [
      { id: 'reg', title: 'Register to Vote', desc: 'Check registration status at vote.gov.' },
      {
        id: 'method',
        title: 'Choose Voting Method',
        desc: 'Decide between Mail-in, Early Voting, or Election Day.',
      },
      { id: 'id', title: 'Prepare ID', desc: "Check your state's specific Voter ID requirements." },
      {
        id: 'vote',
        title: 'Return Ballot / Vote',
        desc: 'Mail ballot early or find your local polling place.',
      },
    ],
  },
  uk: {
    name: 'UK',
    icon: 'flag',
    nextEvent: 'General Election',
    nextDate: new Date('2026-05-07T07:00:00').getTime(),
    timeline: [
      {
        date: 'Mar 30, 2026',
        title: 'Parliament Dissolved',
        desc: 'Official start of the campaign period.',
        passed: true,
      },
      {
        date: 'Apr 20, 2026',
        title: 'Registration Deadline',
        desc: 'Last day to register to vote.',
        passed: false,
        upcoming: true,
      },
      {
        date: 'Apr 21, 2026',
        title: 'Postal Vote Deadline',
        desc: 'Apply for a postal vote by 5pm.',
        passed: false,
      },
      {
        date: 'May 07, 2026',
        title: 'Polling Day',
        desc: 'Polls open 7am to 10pm.',
        passed: false,
      },
      {
        date: 'May 08, 2026',
        title: 'Results',
        desc: 'Counting completed and government formed.',
        passed: false,
      },
    ],
    wizard: [
      { id: 'reg', title: 'Register to Vote', desc: 'Register at gov.uk/register-to-vote.' },
      { id: 'id', title: 'Photo ID', desc: 'You now need valid photo ID to vote in person.' },
      {
        id: 'loc',
        title: 'Polling Station',
        desc: 'Check your polling card for the correct location.',
      },
      {
        id: 'vote',
        title: 'Mark Ballot',
        desc: "Use pencil provided to mark 'X' next to one candidate.",
      },
    ],
  },
  eu: {
    name: 'EU',
    icon: 'flag',
    nextEvent: 'European Elections',
    nextDate: new Date('2029-06-06T08:00:00').getTime(),
    timeline: [
      {
        date: 'Jan 01, 2029',
        title: 'Campaign Begins',
        desc: 'Transnational campaigns kick off.',
        passed: false,
      },
      {
        date: 'May 01, 2029',
        title: 'Registration Deadlines',
        desc: 'Check specific country deadlines.',
        passed: false,
      },
      {
        date: 'Jun 06, 2029',
        title: 'Voting Starts',
        desc: 'First countries open polls.',
        passed: false,
      },
      {
        date: 'Jun 09, 2029',
        title: 'Voting Ends',
        desc: 'Final countries close polls.',
        passed: false,
        upcoming: true,
      },
      {
        date: 'Jul 15, 2029',
        title: 'Parliament Plenary',
        desc: 'First session of new EU Parliament.',
        passed: false,
      },
    ],
    wizard: [
      { id: 'reg', title: 'Voter Registration', desc: 'Rules depend on your EU member state.' },
      {
        id: 'abroad',
        title: 'Voting from Abroad',
        desc: 'Register in your country of residence if applicable.',
      },
      {
        id: 'info',
        title: 'Research Candidates',
        desc: 'Review transnational parties and local candidates.',
      },
      { id: 'vote', title: 'Cast Ballot', desc: 'Follow local procedures between June 6-9.' },
    ],
  },
};

export const faqs = [
  {
    q: 'How do I register to vote?',
    a: "Registration processes vary by country. In the US, visit vote.gov. In the UK, use gov.uk/register-to-vote. In India, use the Voters' Services Portal (nvsp.in).",
    category: 'registration',
  },
  {
    q: 'What ID do I need to vote?',
    a: "ID requirements depend on your location. Many countries require government-issued photo ID (Passport, Driver's License, National ID). Always check local regulations before election day.",
    category: 'documents',
  },
  {
    q: 'Can I vote online?',
    a: 'Currently, very few countries allow online voting due to security concerns. Most voting is done in-person via paper ballots or EVMs, or via mail-in postal ballots.',
    category: 'voting',
  },
  {
    q: 'What is an EVM?',
    a: 'An Electronic Voting Machine (EVM) is used in countries like India to electronically record votes. It consists of a Control Unit and a Balloting Unit.',
    category: 'voting',
  },
  {
    q: 'How do I get an absentee ballot?',
    a: 'You must request an absentee or postal ballot from your local election office before their specified deadline, which is usually weeks before election day.',
    category: 'voting',
  },
  {
    q: 'When are election results announced?',
    a: 'Results timing varies. Some countries announce preliminary results on election night, while official certified results can take days or weeks depending on mail-in ballot counting rules.',
    category: 'results',
  },
];

export const quizQuestions = [
  {
    q: 'What is the minimum voting age in most democratic countries?',
    options: ['16', '18', '21', '25'],
    answer: 1,
  },
  {
    q: 'What does EVM stand for?',
    options: [
      'Electronic Voting Machine',
      'Electoral Vote Monitor',
      'Election Validation Mechanism',
      'Early Voting Method',
    ],
    answer: 0,
  },
  {
    q: 'Which of these is NOT a typical valid Voter ID?',
    options: ['Passport', "Driver's License", 'Library Card', 'National ID Card'],
    answer: 2,
  },
  {
    q: "What is a 'mail-in' ballot?",
    options: [
      'Voting via email',
      'A ballot sent and returned via postal service',
      'Voting at a post office',
      'A receipt for voting',
    ],
    answer: 1,
  },
  {
    q: 'In the US, Election Day is typically held on which day of the week?',
    options: ['Monday', 'Tuesday', 'Saturday', 'Sunday'],
    answer: 1,
  },
];

export const pollingBooths = [
  { id: 1, name: "St. Mary's High School", distance: '0.8 km', waitTime: 15, crowdLevel: 'low' },
  { id: 2, name: 'Community Hall, Sector 4', distance: '1.2 km', waitTime: 45, crowdLevel: 'high' },
  { id: 3, name: 'Public Library', distance: '2.5 km', waitTime: 25, crowdLevel: 'medium' },
  { id: 4, name: 'Town Hall Center', distance: '3.0 km', waitTime: 10, crowdLevel: 'low' },
  { id: 5, name: 'City College Auditorium', distance: '4.1 km', waitTime: 60, crowdLevel: 'high' },
];

export const museumExhibits = [
  {
    id: 1,
    title: 'The First Vote',
    year: '1951',
    desc: "India's first general election was a massive undertaking, taking 4 months to complete.",
    icon: 'landmark',
  },
  {
    id: 2,
    title: 'Evolution of the EVM',
    year: '1982',
    desc: 'Electronic Voting Machines were first used in the Parur Assembly constituency in Kerala.',
    icon: 'printer',
  },
  {
    id: 3,
    title: 'Women in Democracy',
    year: '1921',
    desc: 'Madras was the first legislature in India to grant women the right to vote.',
    icon: 'scale',
  },
  {
    id: 4,
    title: 'The Indelible Ink',
    year: '1962',
    desc: 'First introduced to prevent multiple voting, the ink is manufactured exclusively by Mysore Paints.',
    icon: 'pen-tool',
  },
  {
    id: 5,
    title: 'NOTA Introduced',
    year: '2013',
    desc: "The Supreme Court directed the Election Commission to provide a 'None of the Above' option.",
    icon: 'x-circle',
  },
];

export const liveEvents = [
  {
    id: 1,
    title: 'Democracy Concert: Youth for Change',
    time: '10:00 AM - Live',
    location: 'Central Park Plaza',
    type: 'cultural',
    icon: 'music',
  },
  {
    id: 2,
    title: 'Panel Discussion: Future of Electoral Tech',
    time: '2:00 PM - Upcoming',
    location: 'Virtual / Metaverse',
    type: 'educational',
    icon: 'monitor',
  },
  {
    id: 3,
    title: 'Street Play: Your Vote, Your Voice',
    time: '4:30 PM - Upcoming',
    location: 'City Square Mall',
    type: 'cultural',
    icon: 'venetian-mask',
  },
  {
    id: 4,
    title: 'Keynote Address: Chief Election Commissioner',
    time: '6:00 PM - Upcoming',
    location: 'Town Hall',
    type: 'speech',
    icon: 'mic',
  },
];

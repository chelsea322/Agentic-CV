// Content for the classic CV view. Every detail here comes from the same
// facts as data/cv-context.ts; do not add claims that are not in the CV.

export type CvEntry = {
  id: string
  title: string
  organization?: string
  period?: string
  summary: string
  details?: string[]
  ask?: string
}

export const EXPERIENCE: CvEntry[] = [
  {
    id: 'goto',
    title: 'Senior Product Designer',
    organization: 'GoTo (Miradore acquisition)',
    period: '2023 — Present',
    summary:
      'Designing new features from first concept to shipped. Leading native MDM enrollment flows, a large cross-product initiative, while integrating AI and expanding the design system.',
    details: [
      'Lead design of new native MDM enrollment flows across products.',
      'Work on integrating AI into the product and expanding the design system.',
      'Run dual-track discovery and design.',
      'Remote from Tampere, with travel to Budapest.',
    ],
    ask: 'What are you working on at GoTo right now?',
  },
  {
    id: 'miradore',
    title: 'Lead UX Designer',
    organization: 'Miradore',
    period: '2021 — 2022',
    summary:
      'First designer in the company. Built UX practices, research frameworks, and design processes from the ground up, and optimized onboarding for product-led growth.',
    details: [
      'First designer in a company that had been in business for 15 years.',
      'Introduced human-centered practices, Figma and customer insight sharing.',
      'Worked directly with the CPO and continued to lead UI modernization.',
    ],
    ask: 'How did you transform UX culture at Miradore?',
  },
  {
    id: 'consultant',
    title: 'UX / Service Design Consultant',
    organization: 'Headsted, Konvos & others',
    period: '2017 — 2021',
    summary: 'User testing and concept validation for early-stage wellness and behavior-change products.',
  },
  {
    id: 'researcher',
    title: 'UX Researcher',
    organization: 'Tampere University',
    period: '2016 — 2019',
    summary: 'Published research on UX and storytelling in immersive VR.',
    details: ['Applied rapid iterative methods and UX frameworks in an academic setting.'],
  },
]

export const WORK: CvEntry[] = [
  {
    id: 'google',
    title: 'Google Workspace integration',
    period: 'Design lead · 2024',
    summary:
      'Let admins import users from Google, unblocking subscription renewals for top customers. 90% first-try success rate.',
    details: [
      'Learned how the integration worked technically and benchmarked competitors first.',
      'Delivered a fully functional prototype for testing and ran three rounds of iteration.',
      'Handed off full UI specs and new components, then audited the implemented feature before release.',
      'Worked within a restrictive third-party iframe; one filtering flow served power users and novices.',
    ],
    ask: 'Tell me about the Google Workspace integration.',
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    summary:
      'Raised activation to 31% (industry average 15%) and lifted top-item clicks 60% in a welcome-page A/B test.',
    details: [
      'Defined and validated two user segments through three cross-team workshops with Sales, Marketing and Customer Success.',
      'Trimmed a Pendo tour after only 13% of users completed step 2.',
      'Redesigned Windows device enrollment (4.2 / 5 user preference).',
    ],
    ask: 'How did you improve onboarding and activation?',
  },
  {
    id: 'showroom',
    title: 'Live Showroom sandbox',
    summary: 'Led service design of a product demo environment now used by Marketing and Sales.',
  },
]

export type Expertise = { id: string; label: string; note: string; ask: string }

export const EXPERTISE: Expertise[] = [
  {
    id: 'systems',
    label: 'Design Systems',
    note: 'Extended the design system with new components along the way, and now feed it into Figma Make for faster ideation and handoff.',
    ask: 'How do you work with design systems?',
  },
  {
    id: 'research',
    label: 'User Research',
    note: 'A psychology background, research frameworks built from scratch at Miradore, and published UX research at Tampere University.',
    ask: 'What is your background in research?',
  },
  {
    id: 'plg',
    label: 'Onboarding & PLG',
    note: 'Pendo-driven activation work, A/B tested welcome pages, and a Product-Led Growth certificate from ProductLed (2023).',
    ask: 'How do you approach product-led growth?',
  },
  {
    id: 'ai',
    label: 'AI-Assisted Prototyping',
    note: 'LLMs taught to act like customers for testing ideas, AI prototypes (including Lovable) shared early with developers and PMs.',
    ask: 'What is your AI prototyping workflow?',
  },
  {
    id: 'service',
    label: 'Service Design',
    note: 'Service design of the Live Showroom sandbox, and concept validation for wellness and behavior-change products.',
    ask: 'What does service design mean in your work?',
  },
]

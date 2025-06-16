// src/data/mockDeliverables.ts

const mockDeliverables = [
  {
    id: '1',
    title: 'Content Strategy Development',
    description: 'Create comprehensive content calendar and distribution plan with focus on seasonal campaigns and evergreen content',
    problem: 'Current content lacks strategic direction and fails to engage target audience effectively, resulting in low conversion rates',
    kpis: [
      'Increase organic traffic by 25%',
      'Improve content engagement rate by 40%',
      'Generate 15+ qualified leads per month',
      'Achieve 4.5+ content quality score'
    ],
    status: 'recommended',
    estimatedHours: 8,
    actualHours: 0,
    timeEntries: [],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Technical SEO Audit',
    description: 'Complete site crawl and performance optimization recommendations including Core Web Vitals improvements',
    problem: 'Website has poor search visibility due to technical issues affecting crawlability and user experience metrics',
    kpis: [
      'Improve Core Web Vitals scores by 30%',
      'Fix 95% of critical SEO issues',
      'Increase search visibility by 20%',
      'Reduce page load time to under 3 seconds'
    ],
    status: 'recommended',
    estimatedHours: 8,
    actualHours: 0,
    timeEntries: [],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Social Media Campaign Setup',
    description: 'Design and schedule Q3 social media content across platforms with automated posting and engagement tracking',
    problem: 'Social media presence is inconsistent and lacks brand cohesion, missing opportunities for audience engagement',
    kpis: [
      'Increase follower growth by 50%',
      'Achieve 8% average engagement rate',
      'Generate 100+ social media leads',
      'Maintain 95% posting consistency'
    ],
    status: 'recommended',
    estimatedHours: 8,
    actualHours: 0,
    timeEntries: [],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Analytics Dashboard Creation',
    description: 'Build custom Google Analytics 4 dashboard with key metrics, automated reporting, and conversion tracking',
    problem: 'Current analytics setup provides limited insights and lacks proper conversion tracking for business decisions',
    kpis: [
      'Implement 100% conversion tracking',
      'Create 5+ automated reports',
      'Reduce data analysis time by 60%',
      'Achieve 99% data accuracy'
    ],
    status: 'recommended',
    estimatedHours: 8,
    actualHours: 0,
    timeEntries: [],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Email Marketing Automation',
    description: 'Set up triggered email sequences and A/B testing framework with personalization and segmentation',
    problem: 'Email marketing efforts are manual and lack personalization, resulting in low open rates and conversions',
    kpis: [
      'Increase email open rate to 25%',
      'Achieve 5% click-through rate',
      'Generate $10K+ in email revenue',
      'Reduce email bounce rate to under 2%'
    ],
    status: 'recommended',
    estimatedHours: 8,
    actualHours: 0,
    timeEntries: [],
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
  }
];

export { mockDeliverables };
export default mockDeliverables;
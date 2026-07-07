export interface TemplateQuestion {
  type: string
  title: string
  required: boolean
  options?: string[]
}

export interface SurveyTemplate {
  id: string
  title: string
  description: string
  touchpoint: string
  category: 'Survey' | 'Invitation' | 'Registration'
  gradient: string // Cover design gradient
  questions: TemplateQuestion[]
}

export const FEATURED_TEMPLATES: SurveyTemplate[] = [
  // ─── SURVEYS (INSURANCE RELATED) ──────────────────────────────────────────
  {
    id: 'employee-satisfaction',
    title: 'Claims Team Satisfaction Survey',
    description: 'Measure work environment, leadership support, and claims adjusting tools within the Claims Department.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#0B4A8B] to-[#052E58]', // Primary Navy Corporate
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our Insurance Claims department as a great team to work in?', required: true },
      { type: 'multiple_choice', title: 'How would you rate the efficiency of our claims adjudication software?', required: true, options: ['Highly Efficient', 'Somewhat Efficient', 'Neutral', 'Slow / Needs Improvement', 'Outdated / Frequent Crashes'] },
      { type: 'multiple_choice', title: 'Do you feel you have adequate authority levels to settle standard motor and medical claims without excessive approvals?', required: true, options: ['Yes, fully adequate', 'Mostly adequate', 'Need higher limits', 'Too restricted'] },
      { type: 'multiple_choice', title: 'How satisfied are you with the support provided by the underwriting team during disputed claims?', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
      { type: 'long_answer', title: 'What is the single biggest bottleneck preventing your team from processing claims faster?', required: false }
    ]
  },
  {
    id: 'course-evaluation',
    title: 'Takaful Compliance Course Review',
    description: 'Gather feedback on internal training sessions covering Takaful guidelines and Sharia insurance compliance.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#17A673] to-[#0E6C4C]', // Brand Emerald/Green
    questions: [
      { type: 'nps', title: 'How likely are you to recommend this Takaful compliance course to other insurance professionals?', required: true },
      { type: 'multiple_choice', title: 'The course effectively explained the difference between commercial insurance and cooperative Takaful models.', required: true, options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { type: 'multiple_choice', title: 'How would you rate the clarity of the Sharia board policy examples provided?', required: true, options: ['Excellent', 'Good', 'Average', 'Poor'] },
      { type: 'long_answer', title: 'Which underwriting compliance topic did you find most challenging during the course?', required: false }
    ]
  },
  {
    id: 'post-event-feedback',
    title: 'Broker Seminar Feedback Survey',
    description: 'Assess satisfaction with the annual seminar organized for licensed insurance brokers and agents.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#0D9488] to-[#115E59]', // Brand Teal/Cyan
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our broker seminars to other insurance intermediaries?', required: true },
      { type: 'multiple_choice', title: 'How informative was the presentation on our new online Broker E-Portal?', required: true, options: ['Extremely Informative', 'Very Informative', 'Moderately Informative', 'Not Informative'] },
      { type: 'multiple_choice', title: 'Did the commission structures and product update briefings meet your expectations?', required: true, options: ['Exceeded Expectations', 'Met Expectations', 'Below Expectations'] },
      { type: 'long_answer', title: 'What new insurance products or digital features would you like to see introduced in the next broker seminar?', required: false }
    ]
  },
  {
    id: 'customer-satisfaction',
    title: 'Claims Settlement Satisfaction Survey',
    description: 'Collect client feedback on motor, medical, or property insurance claims settlement experiences.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#0284C7] to-[#0369A1]', // Soft Ocean Blue
    questions: [
      { type: 'nps', title: 'Based on your recent claims experience, how likely are you to recommend our insurance plans to friends?', required: true },
      { type: 'multiple_choice', title: 'How satisfied were you with the speed of processing your claim payment?', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
      { type: 'multiple_choice', title: 'Was your vehicle repaired to your satisfaction at our approved workshop?', required: true, options: ['Yes, completely', 'Partially satisfied', 'Not satisfied', 'Not applicable (non-motor claim)'] },
      { type: 'long_answer', title: 'Please provide details on any issues encountered with our claims surveyor or customer service agent.', required: false }
    ]
  },
  {
    id: 'competitive-analysis',
    title: 'Insurance Policy Competitive Analysis',
    description: 'Analyze how policyholders view our coverage limits and premium rates compared to other UAE insurers.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#475569] to-[#1E293B]', // Corporate Slate/Steel
    questions: [
      { type: 'nps', title: 'How likely are you to renew your policy with us instead of switching to a competitor?', required: true },
      { type: 'multiple_choice', title: 'Which local insurance provider do you consider our primary competitor for motor/medical lines?', required: true, options: ['Sukoon / Oman Insurance', 'ADNIC', 'AXA / GIG', 'Orient Insurance', 'Other / None'] },
      { type: 'multiple_choice', title: 'What was the primary reason you selected our policy over competitors?', required: true, options: ['Lowest Premium Price', 'Broader Coverage / Lower Deductible', 'Brand Reputation & Sharia Compliance', 'Recommended by Broker', 'Fast Digital Onboarding'] },
      { type: 'long_answer', title: 'What is one product benefit or coverage extension that a competitor offers which we do not?', required: false }
    ]
  },
  {
    id: 'vacation-sick-leave',
    title: 'Agent Coverage Planning Survey',
    description: 'Gather feedback from insurance agents on leave coverage planning to ensure uninterrupted policy issuance.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#0B4A8B] to-[#1E3A8A]', // Corporate Blue
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our sales support structures for handling leave handovers?', required: true },
      { type: 'multiple_choice', title: 'During your recent absence, did the designated backup agent handle your client renewals effectively?', required: true, options: ['Always', 'Mostly', 'Sometimes', 'Rarely', 'Never'] },
      { type: 'multiple_choice', title: 'How clear are the departmental guidelines for setting up policy approval delegations during leave?', required: true, options: ['Very Clear', 'Reasonably Clear', 'Confusing', 'Very Unclear'] },
      { type: 'long_answer', title: 'What changes would make handing over high-value corporate accounts prior to leave more efficient?', required: false }
    ]
  },
  {
    id: 'customer-expectations',
    title: 'Policy Onboarding Feedback',
    description: 'Survey new policyholders about their onboarding, documentation delivery, and portal activation.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#0D9488] to-[#115E59]', // Brand Teal
    questions: [
      { type: 'nps', title: 'Based on your purchase experience, how likely are you to recommend our digital portal to buy insurance?', required: true },
      { type: 'multiple_choice', title: 'How long did it take to receive your electronic policy document (e-Policy) after payment?', required: true, options: ['Instantly online', 'Within 2 hours', 'Same business day', 'Next day or later'] },
      { type: 'multiple_choice', title: 'How clear was the explanation of policy exclusions and deductibles during purchase?', required: true, options: ['Very Clear', 'Somewhat Clear', 'Not Clear'] },
      { type: 'long_answer', title: 'What was the most difficult step in uploading your vehicle inspection or medical records?', required: false }
    ]
  },
  {
    id: 'product-pricing',
    title: 'Takaful Premium Pricing Feedback',
    description: 'Assess premium price sensitivity and willingness to pay for optional add-on coverages.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#D97706] to-[#78350F]', // Corporate Gold Accent
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our policy add-ons (e.g. road assistance, car hire) at their current prices?', required: true },
      { type: 'multiple_choice', title: 'What is the maximum yearly premium you would pay for comprehensive motor coverage (AED)?', required: true, options: ['AED 1,000 - 1,500', 'AED 1,501 - 2,000', 'AED 2,001 - 3,000', 'AED 3,000+'] },
      { type: 'multiple_choice', title: 'How would you rate the value of our optional home insurance add-on for AED 150/year?', required: true, options: ['Excellent Value', 'Reasonable Value', 'Overpriced', 'No Interest / Unnecessary'] },
      { type: 'long_answer', title: 'Which additional coverage benefit would justify paying a higher policy premium for you?', required: false }
    ]
  },
  {
    id: 'new-product-survey',
    title: 'Cyber Takaful Product Feedback',
    description: 'Gather feedback on a new commercial cyber risk insurance concept from corporate clients.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#0F172A] to-[#1E293B]', // Dark Tech Carbon
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our upcoming Cyber Takaful solution to corporate peers?', required: true },
      { type: 'multiple_choice', title: 'Which cyber risk exposure is your organization most concerned about insuring?', required: true, options: ['Ransomware & Business Interruption', 'Data Breaches & PII Leaks', 'Social Engineering & Phishing Fraud', 'System Restoration Costs'] },
      { type: 'multiple_choice', title: 'What limit of liability would your firm require for cyber insurance coverage?', required: true, options: ['AED 500,000', 'AED 1,000,000', 'AED 5,000,000', 'AED 10,000,000+'] },
      { type: 'long_answer', title: 'What security certifications (e.g. ISO 27001) does your company have to reduce cyber underwriting premiums?', required: false }
    ]
  },
  {
    id: 'market-research',
    title: 'Home Takaful Awareness Study',
    description: 'Assess consumer brand recognition and interest in home protection plans in the UAE.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#0284C7] to-[#0B4A8B]', // Ocean to Navy
    questions: [
      { type: 'nps', title: 'How likely are you to recommend Abu Dhabi National Takaful to other homeowners?', required: true },
      { type: 'multiple_choice', title: 'Were you aware that home contents insurance covers tenant liability in the UAE?', required: true, options: ['Yes, fully aware', 'Had heard about it', 'No, completely unaware'] },
      { type: 'multiple_choice', title: 'What is the primary factor that would trigger you to purchase home insurance?', required: true, options: ['Fearing fire or water damage', 'Landlord mandate in tenancy contract', 'Affordable premium cost', 'Recommendation by bank/mortgage provider'] },
      { type: 'long_answer', title: 'What misconceptions or questions do you have regarding Takaful home protection policies?', required: false }
    ]
  },
  {
    id: 'manager-feedback',
    title: 'Underwriting Team Leadership Survey',
    description: 'Evaluate communication, risk guidelines, and support structures within the Underwriting Department.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    gradient: 'from-[#0B4A8B] to-[#172554]', // Deep Royal Navy
    questions: [
      { type: 'nps', title: 'How likely are you to recommend your current underwriting manager to colleagues?', required: true },
      { type: 'multiple_choice', title: 'My manager provides clear risk underwriting guidelines and updates.', required: true, options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { type: 'multiple_choice', title: 'My manager supports risk escalation and helps resolve disputed corporate policies efficiently.', required: true, options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { type: 'long_answer', title: 'What training or resources does your underwriting manager need to support your daily policy reviews?', required: false }
    ]
  },

  // ─── INVITATIONS (INSURANCE RELATED) ───────────────────────────────────────
  {
    id: 'vip-event-invitation',
    title: 'Takaful Excellence Awards Gala',
    description: 'Corporate invitation for top-performing insurance brokers, partners, and brokers.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    gradient: 'from-[#D97706] to-[#78350F]', // Banquet Gold
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the Annual Takaful Excellence Awards Gala?', required: true, options: ['Yes, I will attend in-person', 'No, unable to attend', 'Sending a corporate proxy'] },
      { type: 'multiple_choice', title: 'Are you bringing a corporate guest?', required: true, options: ['Yes, bringing a guest (Broker Exec)', 'No, attending solo'] },
      { type: 'multiple_choice', title: 'Select your dinner menu preference:', required: true, options: ['Standard / Meat', 'Vegetarian / Vegan', 'Halal / Dietary Restricted'] },
      { type: 'multiple_choice', title: 'What is your broker company category?', required: true, options: ['International Brokerage Firm', 'Local UAE Brokerage', 'Corporate Direct Client', 'Takaful Employee / Stakeholder'] },
      { type: 'long_answer', title: 'Any special dietary restrictions or accommodation requests for the event?', required: false }
    ]
  },
  {
    id: 'product-launch-invite',
    title: 'Fleet Motor Takaful Launch Invite',
    description: 'Invite corporate clients and brokers to the launch of our digital fleet motor insurance platform.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    gradient: 'from-[#0B4A8B] to-[#0D9488]', // Brand Navy to Teal
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the digital Fleet Takaful launch event?', required: true, options: ['Yes, in-person attendance', 'Yes, online live-stream', 'No, unable to attend'] },
      { type: 'multiple_choice', title: 'Which launch workshop slot matches your schedule?', required: true, options: ['Morning Track (API Integration & Fleet Portals)', 'Afternoon Track (Underwriting Limits & Claims Rules)', 'Networking Dinner only'] },
      { type: 'multiple_choice', title: 'How many vehicles does your corporate fleet currently manage?', required: true, options: ['1 - 10 vehicles', '11 - 50 vehicles', '51 - 200 vehicles', '200+ vehicles'] },
      { type: 'long_answer', title: 'What feature are you most interested in seeing demonstrated during the launch event?', required: false }
    ]
  },
  {
    id: 'annual-general-meeting',
    title: 'Annual Shareholder Meeting (AGM)',
    description: 'Formal shareholder invitation including proxy delegation and Sharia compliance questions.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    gradient: 'from-[#0F172A] to-[#1E293B]', // Dark Slate Corporate
    questions: [
      { type: 'multiple_choice', title: 'Confirm your attendance to the Annual General Shareholder Meeting:', required: true, options: ['Attending in person', 'Appointing a proxy voter', 'Electronic voting only, not attending'] },
      { type: 'multiple_choice', title: 'What is your shareholding category?', required: true, options: ['Individual Shareholder', 'Institutional Shareholder Representative', 'Broker Partnership Stakeholder', 'Auditor / Board Advisor'] },
      { type: 'multiple_choice', title: 'Do you authorize the board of directors to vote on corporate resolutions on your behalf?', required: true, options: ['Yes, fully authorize', 'No, assigning proxy vote to another representative'] },
      { type: 'long_answer', title: 'Submit any policy or corporate governance question for the Sharia Board to answer during the AGM:', required: false }
    ]
  },
  {
    id: 'corporate-seminar-invite',
    title: 'Actuarial & Risk Seminar Invite',
    description: 'Invite risk officers and underwriters to the annual risk assessment and compliance seminar.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    gradient: 'from-[#0B4A8B] to-[#172554]', // Deep Royal Navy
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the Actuarial and Risk Management Seminar?', required: true, options: ['Yes, registered', 'No, nominating another Underwriter', 'Declined'] },
      { type: 'multiple_choice', title: 'Select your breakout seminar theme preference:', required: true, options: ['Underwriting Risks in Volatile Climates', 'Automating Claims Fraud Detection via AI', 'Sharia Audits & Takaful Solvency Rules', 'Re-Takaful & Risk Pool Diversification'] },
      { type: 'multiple_choice', title: 'Do you require a Continuous Professional Development (CPD) certificate?', required: true, options: ['Yes, digital PDF certificate', 'No certificate needed'] },
      { type: 'long_answer', title: 'What specific actuarial or underwriting topic do you want the panel to address?', required: false }
    ]
  },
  {
    id: 'team-retreat-invite',
    title: 'Broker Appreciation Retreat Invite',
    description: 'RSVP invitation for high-performing brokers and agents to the annual retreat.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    gradient: 'from-[#0D9488] to-[#17A673]', // Teal to Emerald
    questions: [
      { type: 'multiple_choice', title: 'Confirm your attendance to the Broker Appreciation Retreat weekend:', required: true, options: ['Yes, attending', 'No, cannot make it', 'Undecided'] },
      { type: 'multiple_choice', title: 'Which team bonding activity would you prefer to join?', required: true, options: ['Desert Safari & Dune Buggies', 'Golf Tournament & Clinic', 'Spa & Wellness Sessions', 'Takaful Networking Workshop'] },
      { type: 'multiple_choice', title: 'Do you require a seat on the corporate shuttle bus from Abu Dhabi?', required: true, options: ['Yes, round-trip', 'No, driving personal vehicle'] },
      { type: 'long_answer', title: 'Specify any accommodation preferences or dietary requirements for the resort stay.', required: false }
    ]
  },

  // ─── REGISTRATIONS (INSURANCE RELATED) ─────────────────────────────────────
  {
    id: 'webinar-registration',
    title: 'Claims Portal Training Webinar',
    description: 'Webinar signup for corporate clients to learn digital claim submission and tracking.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    gradient: 'from-[#0284C7] to-[#0B4A8B]', // Ocean to Navy
    questions: [
      { type: 'multiple_choice', title: 'What is your primary job role?', required: true, options: ['HR Manager (Handles Medical Insurance)', 'Fleet Manager (Handles Motor Policies)', 'Finance Director (Handles Corporate Accounts)', 'Insurance Broker / Agent', 'Individual Customer'] },
      { type: 'multiple_choice', title: 'Which webinar training slot fits your schedule?', required: true, options: ['Morning Session (10:00 AM GST)', 'Afternoon Session (3:00 PM GST)', 'Access On-Demand Recording only'] },
      { type: 'multiple_choice', title: 'What type of insurance policy does your company currently hold with us?', required: true, options: ['Group Medical Insurance', 'Corporate Motor Fleet Takaful', 'Property & Business Interruption', 'Marine / Cargo Takaful', 'None / Prospective Client'] },
      { type: 'long_answer', title: 'What is the primary question or feature you want our training team to cover regarding the claims portal?', required: false }
    ]
  },
  {
    id: 'conference-registration',
    title: 'Middle East Takaful Forum Registration',
    description: 'Register for the regional summit on Islamic insurance, selecting passes and details.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    gradient: 'from-[#0B4A8B] to-[#172554]', // Deep Royal Navy
    questions: [
      { type: 'multiple_choice', title: 'Select your conference registration pass type:', required: true, options: ['Delegate Pass (Keynotes & Exhibition access)', 'All-Access Pass (Keynotes, Workshops & Networking Gala)', 'Student / Academic Pass', 'Press / Media Pass'] },
      { type: 'multiple_choice', title: 'What is the primary line of insurance business of your firm?', required: true, options: ['Takaful / Islamic Insurance', 'Conventional Insurance / Reinsurance', 'InsurTech / Software Provider', 'Brokerage / Agency', 'Regulatory / Legal / Sharia Advisory'] },
      { type: 'multiple_choice', title: 'Select your unisex T-shirt size for the event registration pack:', required: true, options: ['S', 'M', 'L', 'XL', 'XXL', 'Decline Swag Pack'] },
      { type: 'long_answer', title: 'Note any dietary restrictions or corporate accessibility requests for the forum.', required: false }
    ]
  },
  {
    id: 'workshop-registration',
    title: 'Risk Modeling & Underwriting Workshop',
    description: 'Register for hands-on workshops covering risk assessment modeling and calculations.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    gradient: 'from-[#17A673] to-[#115E59]', // Emerald to Teal
    questions: [
      { type: 'multiple_choice', title: 'Rate your experience with actuarial risk modeling software:', required: true, options: ['Beginner (No experience)', 'Intermediate (Can modify models)', 'Advanced (Build custom actuarial projections)', 'Executive (Only evaluate risk reports)'] },
      { type: 'multiple_choice', title: 'Which workshop session format matches your learning style best?', required: true, options: ['Hands-on computer lab (Excel / R)', 'Case studies & underwriting audits', 'Theoretical risk models & formulas'] },
      { type: 'long_answer', title: 'What specific risk profile or line of business (e.g. liability, marine) are you most eager to model?', required: true }
    ]
  },
  {
    id: 'hackathon-registration',
    title: 'InsurTech Innovation Hackathon',
    description: 'Signup for the hackathon targeting automated claims, calculations, and chatbots.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    gradient: 'from-[#0B4A8B] to-[#0D9488]', // Brand Navy to Teal
    questions: [
      { type: 'multiple_choice', title: 'What is your primary technical role for the hackathon?', required: true, options: ['Full-Stack Developer (Next.js / Node.js)', 'Data Scientist / AI Engineer (Claims Auto-Detection)', 'Actuary / Insurance Product Expert', 'UI/UX Designer (Portal Design)', 'Business Analyst / Pitch Lead'] },
      { type: 'multiple_choice', title: 'What is your team formation status?', required: true, options: ['Team already registered', 'Individual looking for an InsurTech team', 'Competing solo'] },
      { type: 'long_answer', title: 'Link to your GitHub, LinkedIn, or portfolio site (Helps in matching teams):', required: false }
    ]
  },
  {
    id: 'executive-summit-registration',
    title: 'Takaful Board Summit Registration',
    description: 'Roundtable registration for insurance executives and Sharia board directors.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    gradient: 'from-[#0F172A] to-[#1E293B]', // Dark Slate Corporate
    questions: [
      { type: 'multiple_choice', title: 'Please select your professional executive title:', required: true, options: ['Board Member / Sharia Scholar', 'C-Level Officer (CEO, CTO, CFO, CIO)', 'Head of Legal & Compliance', 'General Manager / Regional Executive'] },
      { type: 'multiple_choice', title: 'Which regulatory discussion topic is your highest priority?', required: true, options: ['Solvency II Alignment in Cooperative Takaful', 'Surplus Distribution Policies to Policyholders', 'Sharia Board Auditing & Disclosure Rules', 'ESG & Sustainable Investments for Takaful Reserves'] },
      { type: 'multiple_choice', title: 'Confirm compliance with the Chatham House Rule of executive discussions:', required: true, options: ['Agree completely', 'Request compliance brief', 'Declined'] },
      { type: 'long_answer', title: 'Detail any specific regulatory or risk reserves issue you would like to introduce to the roundtable.', required: false }
    ]
  }
]

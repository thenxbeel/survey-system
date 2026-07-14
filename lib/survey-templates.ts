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
  department?: string
  gradient: string // Cover design gradient
  questions: TemplateQuestion[]
}

export const FEATURED_TEMPLATES: SurveyTemplate[] = [
  // ─── INFORMATION TECHNOLOGY (IT) ───
  {
    id: 'it-helpdesk-survey',
    title: 'IT Helpdesk Satisfaction',
    description: 'Survey employees on IT support speed and resolution quality.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Information Technology (IT)',
    gradient: 'from-[#0F172A] to-[#334155]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend the IT support desk?', required: true },
      { type: 'multiple_choice', title: 'How would you rate the response time of the IT support team?', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { type: 'multiple_choice', title: 'Was the IT issue resolved fully on the first attempt?', required: true, options: ['Yes, completely', 'Partially', 'No'] },
      { type: 'long_answer', title: 'Please share any additional feedback to improve IT helpdesk support.', required: false }
    ]
  },
  {
    id: 'it-software-usability',
    title: 'Software Tool Usability Survey',
    description: 'Assess the usability and efficiency of internal software tools.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Information Technology (IT)',
    gradient: 'from-[#1E293B] to-[#475569]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend this software to colleagues?', required: true },
      { type: 'multiple_choice', title: 'How intuitive is the user interface of our main software applications?', required: true, options: ['Very intuitive', 'Somewhat intuitive', 'Not intuitive'] },
      { type: 'multiple_choice', title: 'How often do you experience crashes or performance lags?', required: true, options: ['Never', 'Rarely', 'Sometimes', 'Frequently'] },
      { type: 'long_answer', title: 'What is the most frustrating feature of our current software stack?', required: false }
    ]
  },
  {
    id: 'it-cybersecurity-awareness',
    title: 'Cybersecurity Training Review',
    description: 'Evaluate the effectiveness of annual cybersecurity awareness training.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Information Technology (IT)',
    gradient: 'from-[#0F172A] to-[#0284C7]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend this training to a team member?', required: true },
      { type: 'multiple_choice', title: 'Do you feel confident identifying phishing emails after this training?', required: true, options: ['Highly Confident', 'Somewhat Confident', 'Not Confident'] },
      { type: 'multiple_choice', title: 'How would you rate the clarity of the password policy explained?', required: true, options: ['Very Clear', 'Clear', 'Confusing'] },
      { type: 'long_answer', title: 'Which security topic requires more depth in future sessions?', required: false }
    ]
  },
  {
    id: 'it-hardware-survey',
    title: 'Workplace Hardware Assessment',
    description: 'Gather feedback on laptops, monitors, and accessories provided.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Information Technology (IT)',
    gradient: 'from-[#334155] to-[#64748B]',
    questions: [
      { type: 'nps', title: 'How satisfied are you with the IT equipment issued to you?', required: true },
      { type: 'multiple_choice', title: 'How would you rate the processing speed of your primary work laptop?', required: true, options: ['Excellent', 'Sufficient', 'Too Slow'] },
      { type: 'multiple_choice', title: 'Do you have all necessary accessories (mouse, keyboard, monitors)?', required: true, options: ['Yes, fully equipped', 'Need a few replacements', 'Missing critical gear'] },
      { type: 'long_answer', title: 'Describe any hardware issues that are impacting your productivity.', required: false }
    ]
  },
  {
    id: 'it-tech-orientation-invite',
    title: 'New Tech Stack Orientation',
    description: 'Invitation to the hands-on session introducing new cloud-native tools.',
    touchpoint: 'Internal',
    category: 'Invitation',
    department: 'Information Technology (IT)',
    gradient: 'from-[#0284C7] to-[#0F172A]',
    questions: [
      { type: 'multiple_choice', title: 'Which orientation slot works best for you?', required: true, options: ['Morning Session (9:00 AM)', 'Afternoon Session (2:00 PM)', 'Access Recording Only'] },
      { type: 'multiple_choice', title: 'What is your current familiarity with cloud-native workflows?', required: true, options: ['Expert', 'Intermediate', 'Beginner', 'None'] },
      { type: 'multiple_choice', title: 'Do you require a sandbox account prior to the workshop?', required: true, options: ['Yes, please provision', 'No, already configured'] },
      { type: 'long_answer', title: 'Any specific technical topics you would like our architects to address?', required: false }
    ]
  },
  {
    id: 'it-hackathon-registration',
    title: 'InsurTech Innovation Hackathon',
    description: 'Signup for the hackathon targeting automated claims, calculations, and chatbots.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    department: 'Information Technology (IT)',
    gradient: 'from-[#0B4A8B] to-[#0D9488]', // Brand Navy to Teal
    questions: [
      { type: 'multiple_choice', title: 'What is your primary technical role for the hackathon?', required: true, options: ['Full-Stack Developer (Next.js / Node.js)', 'Data Scientist / AI Engineer (Claims Auto-Detection)', 'Actuary / Insurance Product Expert', 'UI/UX Designer (Portal Design)', 'Business Analyst / Pitch Lead'] },
      { type: 'multiple_choice', title: 'What is your team formation status?', required: true, options: ['Team already registered', 'Individual looking for an InsurTech team', 'Competing solo'] },
      { type: 'multiple_choice', title: 'Will you require hardware/hosting resources during the event?', required: true, options: ['Yes, cloud credits', 'Yes, physical workspace', 'No, self-sufficient'] },
      { type: 'long_answer', title: 'Link to your GitHub, LinkedIn, or portfolio site (Helps in matching teams):', required: false }
    ]
  },

  // ─── CLAIMS ───
  {
    id: 'employee-satisfaction',
    title: 'Claims Team Satisfaction Survey',
    description: 'Measure work environment, leadership support, and claims adjusting tools within the Claims Department.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Claims',
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
    id: 'customer-satisfaction',
    title: 'Claims Settlement Satisfaction Survey',
    description: 'Collect client feedback on motor, medical, or property insurance claims settlement experiences.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Claims',
    gradient: 'from-[#0284C7] to-[#0369A1]', // Soft Ocean Blue
    questions: [
      { type: 'nps', title: 'Based on your recent claims experience, how likely are you to recommend our insurance plans to friends?', required: true },
      { type: 'multiple_choice', title: 'How satisfied were you with the speed of processing your claim payment?', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
      { type: 'multiple_choice', title: 'Was your vehicle repaired to your satisfaction at our approved workshop?', required: true, options: ['Yes, completely', 'Partially satisfied', 'Not satisfied', 'Not applicable (non-motor claim)'] },
      { type: 'long_answer', title: 'Please provide details on any issues encountered with our claims surveyor or customer service agent.', required: false }
    ]
  },
  {
    id: 'claims-processing-feedback',
    title: 'Claims Processing Efficiency',
    description: 'Gather feedback from adjusters on processing times and bottlenecks.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Claims',
    gradient: 'from-[#0B4A8B] to-[#1E3A8A]',
    questions: [
      { type: 'multiple_choice', title: 'Are claims processed within SLA?', required: true, options: ['Always', 'Mostly', 'Rarely'] },
      { type: 'multiple_choice', title: 'How long does the average document verification step take?', required: true, options: ['Less than 1 hour', '1-4 hours', '1-2 days', 'More than 2 days'] },
      { type: 'multiple_choice', title: 'Do you receive clear guidelines for claiming fraud escalations?', required: true, options: ['Extremely Clear', 'Somewhat Clear', 'Not Clear'] },
      { type: 'long_answer', title: 'Describe any common reasons for verification delays.', required: false }
    ]
  },
  {
    id: 'claims-loss-adjuster-eval',
    title: 'Loss Adjuster Evaluation',
    description: 'Evaluate performance and accuracy of third-party loss adjusters.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Claims',
    gradient: 'from-[#1E3A8A] to-[#0F172A]',
    questions: [
      { type: 'nps', title: 'How likely are you to use this adjuster for high-value claims again?', required: true },
      { type: 'multiple_choice', title: 'Rate the thoroughness of the site inspection reports:', required: true, options: ['Excellent', 'Good', 'Adequate', 'Incomplete'] },
      { type: 'multiple_choice', title: 'Did the adjuster negotiate fair salvage values?', required: true, options: ['Yes, optimal', 'Average negotiation', 'No, values were too low'] },
      { type: 'long_answer', title: 'Specify any concerns regarding adjuster turnaround time or communication.', required: false }
    ]
  },
  {
    id: 'claims-workshop-invite',
    title: 'Claims Management Workshop Invite',
    description: 'RSVP invitation for the claims team to align on new Sharia claims guidelines.',
    touchpoint: 'Internal',
    category: 'Invitation',
    department: 'Claims',
    gradient: 'from-[#0B4A8B] to-[#17A673]',
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the workshop sessions?', required: true, options: ['Yes, attending in person', 'Yes, attending virtually', 'No, unable to attend'] },
      { type: 'multiple_choice', title: 'Do you require a copy of the updated guidelines beforehand?', required: true, options: ['Yes, digital PDF', 'No, will review during session'] },
      { type: 'multiple_choice', title: 'Which case study topic are you most interested in?', required: true, options: ['Motor Salvage Rules', 'Medical Policy Limits', 'Corporate Property Claims'] },
      { type: 'long_answer', title: 'State any specific questions you have for the compliance panel.', required: false }
    ]
  },
  {
    id: 'claims-webinar-registration',
    title: 'Claims Portal Training Registration',
    description: 'Register for the interactive walkthrough of our newly updated electronic claims portal.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    department: 'Claims',
    gradient: 'from-[#0284C7] to-[#0B4A8B]',
    questions: [
      { type: 'multiple_choice', title: 'Select your preferred training session date:', required: true, options: ['Monday, July 20th at 10 AM', 'Wednesday, July 22nd at 3 PM', 'Access On-Demand Recording'] },
      { type: 'multiple_choice', title: 'What is your primary category of claim processing?', required: true, options: ['Motor', 'Medical', 'Home', 'Marine', 'Corporate Property'] },
      { type: 'multiple_choice', title: 'Do you have login credentials for the portal active?', required: true, options: ['Yes, working fine', 'No, need setup assistance'] },
      { type: 'long_answer', title: 'What features would you like to see covered in the live demo?', required: false }
    ]
  },

  // ─── CUSTOMER SERVICE ───
  {
    id: 'customer-expectations',
    title: 'Policy Onboarding Feedback',
    description: 'Survey new policyholders about their onboarding, documentation delivery, and portal activation.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Customer Service',
    gradient: 'from-[#0D9488] to-[#115E59]', // Brand Teal
    questions: [
      { type: 'nps', title: 'Based on your purchase experience, how likely are you to recommend our digital portal to buy insurance?', required: true },
      { type: 'multiple_choice', title: 'How long did it take to receive your electronic policy document (e-Policy) after payment?', required: true, options: ['Instantly online', 'Within 2 hours', 'Same business day', 'Next day or later'] },
      { type: 'multiple_choice', title: 'How clear was the explanation of policy exclusions and deductibles during purchase?', required: true, options: ['Very Clear', 'Somewhat Clear', 'Not Clear'] },
      { type: 'long_answer', title: 'What was the most difficult step in uploading your vehicle inspection or medical records?', required: false }
    ]
  },
  {
    id: 'customer-agent-feedback',
    title: 'Customer Support Agent Evaluation',
    description: 'Feedback on interaction with our customer service team.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Customer Service',
    gradient: 'from-[#0284C7] to-[#0EA5E9]',
    questions: [
      { type: 'nps', title: 'How satisfied were you with the support provided by our representative?', required: true },
      { type: 'multiple_choice', title: 'Was the representative polite and helpful?', required: true, options: ['Extremely helpful', 'Polite but unhelpful', 'Unhelpful and impolite'] },
      { type: 'multiple_choice', title: 'Did the representative resolve your query?', required: true, options: ['Yes, completely', 'Partially', 'No, escalated further'] },
      { type: 'long_answer', title: 'Describe any notable positive or negative actions by the agent.', required: false }
    ]
  },
  {
    id: 'customer-chatbot-usability',
    title: 'AI Chatbot Usability Survey',
    description: 'Feedback on resolving tickets using our AI chatbot assistant.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Customer Service',
    gradient: 'from-[#0EA5E9] to-[#0369A1]',
    questions: [
      { type: 'nps', title: 'How likely are you to use our chatbot again for query resolution?', required: true },
      { type: 'multiple_choice', title: 'Did the chatbot understand your queries effectively?', required: true, options: ['Always', 'Mostly', 'Rarely', 'Never'] },
      { type: 'multiple_choice', title: 'How easy was the handoff to a live agent when required?', required: true, options: ['Seamless', 'Somewhat difficult', 'Very frustrating', 'Did not require handoff'] },
      { type: 'long_answer', title: 'What queries did the chatbot fail to answer or understand?', required: false }
    ]
  },
  {
    id: 'customer-resolution-survey',
    title: 'First Contact Resolution (FCR) Study',
    description: 'Measure the rate and efficiency of resolving tickets on first contact.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Customer Service',
    gradient: 'from-[#0D9488] to-[#0F766E]',
    questions: [
      { type: 'nps', title: 'How satisfied are you with the overall speed of ticket resolution?', required: true },
      { type: 'multiple_choice', title: 'How many times did you contact us to get this issue resolved?', required: true, options: ['Just once (FCR)', '2 times', '3 times', '4 or more times'] },
      { type: 'multiple_choice', title: 'Which support channel did you use for the first attempt?', required: true, options: ['Phone Call', 'Email', 'Web Chat', 'WhatsApp Support'] },
      { type: 'long_answer', title: 'What caused the delay if multiple contacts were necessary?', required: false }
    ]
  },
  {
    id: 'customer-service-gala-invite',
    title: 'Customer Service Excellence Gala',
    description: 'Invitation to our annual customer service appreciation and awards dinner.',
    touchpoint: 'Internal',
    category: 'Invitation',
    department: 'Customer Service',
    gradient: 'from-[#0EA5E9] to-[#9333EA]',
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the Excellence Gala?', required: true, options: ['Yes, attending', 'No, cannot attend'] },
      { type: 'multiple_choice', title: 'Would you like to nominate a colleague for the MVP award?', required: true, options: ['Yes (specify in comments)', 'No nomination'] },
      { type: 'multiple_choice', title: 'Select your culinary preference:', required: true, options: ['Halal', 'Vegetarian', 'Vegan', 'Gluten-Free'] },
      { type: 'long_answer', title: 'Please provide the name of the nominee and why they deserve the Customer Service MVP award.', required: false }
    ]
  },
  {
    id: 'customer-webinar-registration',
    title: 'Customer Portal Training Registration',
    description: 'Register for our customer portal navigation and digital options tutorial.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    department: 'Customer Service',
    gradient: 'from-[#0D9488] to-[#0EA5E9]',
    questions: [
      { type: 'multiple_choice', title: 'Choose your session timezone:', required: true, options: ['Morning Track (10:00 AM GST)', 'Afternoon Track (4:00 PM GST)'] },
      { type: 'multiple_choice', title: 'Which portal feature do you use most frequently?', required: true, options: ['View Policies', 'Submit Claims', 'Renew Documents', 'Contact Support'] },
      { type: 'multiple_choice', title: 'Do you require a copy of the Quick Start PDF Guide?', required: true, options: ['Yes', 'No'] },
      { type: 'long_answer', title: 'Specify any issues you faced logging in or navigating the portal recently.', required: false }
    ]
  },

  // ─── OPERATIONS ───
  {
    id: 'operations-workflow-audit',
    title: 'Operations Workflow Assessment',
    description: 'Evaluate internal operational bottlenecks and task flow efficiency.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Operations',
    gradient: 'from-[#D97706] to-[#B45309]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our current workflow process to another team?', required: true },
      { type: 'multiple_choice', title: 'Which step in our daily operations takes the longest time?', required: true, options: ['Document collection', 'Data entry & validation', 'Manager signoff', 'System syncing'] },
      { type: 'multiple_choice', title: 'How often do you have to redo tasks due to data entry errors?', required: true, options: ['Never', 'Rarely', 'Daily', 'Multiple times a day'] },
      { type: 'long_answer', title: 'What is the biggest operational bottleneck we should automate immediately?', required: true }
    ]
  },
  {
    id: 'operations-sla-review',
    title: 'Service Delivery SLA Review',
    description: 'Monitor compliance and barriers to reaching SLA targets.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Operations',
    gradient: 'from-[#B45309] to-[#78350F]',
    questions: [
      { type: 'nps', title: 'How likely are you to rate our SLA targets as realistic and achievable?', required: true },
      { type: 'multiple_choice', title: 'What percentage of tickets do you resolve within SLA targets?', required: true, options: ['90% - 100%', '75% - 89%', '50% - 74%', 'Less than 50%'] },
      { type: 'multiple_choice', title: 'What is the main reason for missing SLA targets?', required: true, options: ['High volume of incoming tickets', 'Unclear instructions', 'System outages', 'Waiting on third parties'] },
      { type: 'long_answer', title: 'How can management help your team maintain a high SLA rate?', required: false }
    ]
  },
  {
    id: 'operations-process-optimization',
    title: 'Business Process Optimization Survey',
    description: 'Gather feedback on proposed changes to standard operating procedures (SOPs).',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Operations',
    gradient: 'from-[#D97706] to-[#F59E0B]',
    questions: [
      { type: 'nps', title: 'How likely are you to support transitioning to our new SOP structure?', required: true },
      { type: 'multiple_choice', title: 'Does the new workflow documentation clear up previous ambiguities?', required: true, options: ['Yes, fully', 'Somewhat', 'No, it is more confusing'] },
      { type: 'multiple_choice', title: 'Do you feel you have received sufficient training on the new tools?', required: true, options: ['Yes, fully', 'Need more training', 'No training received'] },
      { type: 'long_answer', title: 'List any gaps in the new SOP that need to be addressed before launch.', required: false }
    ]
  },
  {
    id: 'manager-feedback',
    title: 'Underwriting Team Leadership Survey',
    description: 'Evaluate communication, risk guidelines, and support structures within the Underwriting Department.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Operations',
    gradient: 'from-[#0B4A8B] to-[#172554]', // Deep Royal Navy
    questions: [
      { type: 'nps', title: 'How likely are you to recommend your current underwriting manager to colleagues?', required: true },
      { type: 'multiple_choice', title: 'My manager provides clear risk underwriting guidelines and updates.', required: true, options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { type: 'multiple_choice', title: 'My manager supports risk escalation and helps resolve disputed corporate policies efficiently.', required: true, options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { type: 'long_answer', title: 'What training or resources does your underwriting manager need to support your daily policy reviews?', required: false }
    ]
  },
  {
    id: 'operations-strategy-invite',
    title: 'Operations Strategy Roundtable',
    description: 'Invite to the leadership strategy session on operations efficiency and cloud automation.',
    touchpoint: 'Internal',
    category: 'Invitation',
    department: 'Operations',
    gradient: 'from-[#78350F] to-[#0F172A]',
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the strategy roundtable?', required: true, options: ['Yes, in-person', 'Yes, online link', 'No, sending a delegate'] },
      { type: 'multiple_choice', title: 'Which strategic initiative is your department prioritizing?', required: true, options: ['RPA / Process Automation', 'Staff Upskilling', 'Legacy System Migration', 'Customer Portal Revamp'] },
      { type: 'multiple_choice', title: 'Do you have slides or data to present at the event?', required: true, options: ['Yes, need 10 mins', 'Yes, need 5 mins', 'No, listening only'] },
      { type: 'long_answer', title: 'State any key agenda items you would like to introduce.', required: false }
    ]
  },
  {
    id: 'operations-lean-registration',
    title: 'Lean Operations Certification Program',
    description: 'Sign up for the upcoming Lean Six Sigma certification and training course.',
    touchpoint: 'Internal',
    category: 'Registration',
    department: 'Operations',
    gradient: 'from-[#D97706] to-[#16A34A]',
    questions: [
      { type: 'multiple_choice', title: 'Which level of certification are you registering for?', required: true, options: ['Yellow Belt (Foundational)', 'Green Belt (Intermediate)', 'Black Belt (Advanced)', 'Sponsor / Champion'] },
      { type: 'multiple_choice', title: 'Select your training cohort preference:', required: true, options: ['Cohort A (Tuesday & Thursday PM)', 'Cohort B (Saturdays Full Day)', 'Self-Paced Digital Only'] },
      { type: 'multiple_choice', title: 'Have you completed the prerequisite foundational module?', required: true, options: ['Yes, completed', 'No, need waiver', 'Not applicable'] },
      { type: 'long_answer', title: 'What operational problem are you hoping to solve using Lean methodologies?', required: false }
    ]
  },

  // ─── FINANCE & ACCOUNTING ───
  {
    id: 'finance-budgeting-feedback',
    title: 'Annual Budgeting Process Survey',
    description: 'Gather feedback on departmental budgeting cycle and forecasting tools.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Finance & Accounting',
    gradient: 'from-[#16A34A] to-[#15803D]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our budgeting process to other departments?', required: true },
      { type: 'multiple_choice', title: 'Was the guidelines documentation clear for compiling your budget?', required: true, options: ['Very Clear', 'Somewhat Clear', 'Not Clear'] },
      { type: 'multiple_choice', title: 'How easy was it to input data into the Finance Portal spreadsheet system?', required: true, options: ['Very Easy', 'Neutral', 'Difficult / Slow', 'Crash Prone'] },
      { type: 'long_answer', title: 'What adjustments should we make to the budget planning calendar next year?', required: false }
    ]
  },
  {
    id: 'finance-reimbursement-survey',
    title: 'Expense Reimbursement Feedback',
    description: 'Assess employee satisfaction with expense claims processing times.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Finance & Accounting',
    gradient: 'from-[#15803D] to-[#166534]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our expense filing tool?', required: true },
      { type: 'multiple_choice', title: 'What is the average time to get your travel/out-of-pocket expenses reimbursed?', required: true, options: ['Within 3 days', '4-7 days', '8-14 days', 'More than 2 weeks'] },
      { type: 'multiple_choice', title: 'Did you experience any errors with currency conversions or receipts uploads?', required: true, options: ['None at all', 'Frequent receipt upload failures', 'Incorrect conversion rates'] },
      { type: 'long_answer', title: 'Suggest changes to make reimbursement filing easier for frequent travelers.', required: false }
    ]
  },
  {
    id: 'product-pricing',
    title: 'Takaful Premium Pricing Feedback',
    description: 'Assess premium price sensitivity and willingness to pay for optional add-on coverages.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Finance & Accounting',
    gradient: 'from-[#D97706] to-[#78350F]', // Corporate Gold Accent
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our policy add-ons (e.g. road assistance, car hire) at their current prices?', required: true },
      { type: 'multiple_choice', title: 'What is the maximum yearly premium you would pay for comprehensive motor coverage (AED)?', required: true, options: ['AED 1,000 - 1,500', 'AED 1,501 - 2,000', 'AED 2,001 - 3,000', 'AED 3,000+'] },
      { type: 'multiple_choice', title: 'How would you rate the value of our optional home insurance add-on for AED 150/year?', required: true, options: ['Excellent Value', 'Reasonable Value', 'Overpriced', 'No Interest / Unnecessary'] },
      { type: 'long_answer', title: 'Which additional coverage benefit would justify paying a higher policy premium for you?', required: false }
    ]
  },
  {
    id: 'finance-billing-review',
    title: 'Billing & Invoice Management Review',
    description: 'Gather feedback from B2B clients on billing cycle clarity and digital invoices.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Finance & Accounting',
    gradient: 'from-[#16A34A] to-[#0EA5E9]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our client billing portal?', required: true },
      { type: 'multiple_choice', title: 'Are invoices received with correct premium breakdowns and values?', required: true, options: ['Always correct', 'Occasional errors', 'Frequent errors'] },
      { type: 'multiple_choice', title: 'Which payment option do you prefer using for policy premium settling?', required: true, options: ['Corporate Credit Card', 'Bank Transfer', 'Direct Debit', 'Cheque Payment'] },
      { type: 'long_answer', title: 'What changes can we introduce to make account reconciliation easier?', required: false }
    ]
  },
  {
    id: 'finance-review-invite',
    title: 'Quarterly Financial Review Invite',
    description: 'Invitation for executive leadership to review quarterly performance and audits.',
    touchpoint: 'Internal',
    category: 'Invitation',
    department: 'Finance & Accounting',
    gradient: 'from-[#15803D] to-[#0F172A]',
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the financial review session?', required: true, options: ['Yes, attending', 'No, represented by deputy'] },
      { type: 'multiple_choice', title: 'Which financial metric would you like to deep-dive into?', required: true, options: ['Loss Ratio & Underwriting Profit', 'Investments Returns', 'Operational Expenses', 'Surplus Pool Balances'] },
      { type: 'multiple_choice', title: 'Do you require printouts of the financial statements folder?', required: true, options: ['Yes, print set', 'No, view digitally only'] },
      { type: 'long_answer', title: 'What concerns or questions do you have regarding the recent external audit results?', required: false }
    ]
  },
  {
    id: 'finance-tax-registration',
    title: 'Tax Compliance & VAT Workshop',
    description: 'Register for the training workshop on new VAT and corporate tax regulations.',
    touchpoint: 'Internal',
    category: 'Registration',
    department: 'Finance & Accounting',
    gradient: 'from-[#16A34A] to-[#D97706]',
    questions: [
      { type: 'multiple_choice', title: 'Select your department for training allocation:', required: true, options: ['Finance & Accounting', 'Legal', 'Sales & Invoicing', 'Operations'] },
      { type: 'multiple_choice', title: 'Rate your existing familiarity with corporate tax rules:', required: true, options: ['Expert', 'Intermediate', 'Beginner', 'No background'] },
      { type: 'multiple_choice', title: 'Do you require a training certificate for professional development credit?', required: true, options: ['Yes', 'No'] },
      { type: 'long_answer', title: 'Detail any specific VAT / Corporate Tax scenario you would like the instructor to review.', required: false }
    ]
  },

  // ─── LEGAL & COMPLIANCE ───
  {
    id: 'course-evaluation',
    title: 'Takaful Compliance Course Review',
    description: 'Gather feedback on internal training sessions covering Takaful guidelines and Sharia insurance compliance.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Legal & Compliance',
    gradient: 'from-[#17A673] to-[#0E6C4C]', // Brand Emerald/Green
    questions: [
      { type: 'nps', title: 'How likely are you to recommend this Takaful compliance course to other insurance professionals?', required: true },
      { type: 'multiple_choice', title: 'The course effectively explained the difference between commercial insurance and cooperative Takaful models.', required: true, options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
      { type: 'multiple_choice', title: 'How would you rate the clarity of the Sharia board policy examples provided?', required: true, options: ['Excellent', 'Good', 'Average', 'Poor'] },
      { type: 'long_answer', title: 'Which underwriting compliance topic did you find most challenging during the course?', required: false }
    ]
  },
  {
    id: 'compliance-code-conduct',
    title: 'Code of Conduct Compliance Survey',
    description: 'Ensure employee awareness and understanding of the company code of conduct.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Legal & Compliance',
    gradient: 'from-[#475569] to-[#64748B]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our compliance department as supportive?', required: true },
      { type: 'multiple_choice', title: 'Have you read and understood the updated Code of Conduct this year?', required: true, options: ['Yes, fully', 'Partially', 'No'] },
      { type: 'multiple_choice', title: 'Do you know how to report a potential compliance violation?', required: true, options: ['Yes, fully aware', 'Know the basics', 'No, need info'] },
      { type: 'long_answer', title: 'What areas of the Code of Conduct require further clarification or guidelines?', required: false }
    ]
  },
  {
    id: 'compliance-contract-feedback',
    title: 'Contract Lifecycle Process Survey',
    description: 'Survey employees on contract drafting, approval speeds, and legal support.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Legal & Compliance',
    gradient: 'from-[#334155] to-[#475569]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend the contract review workflow to other teams?', required: true },
      { type: 'multiple_choice', title: 'What is the average turnaround time for standard contract drafts?', required: true, options: ['1-2 days', '3-5 days', '1-2 weeks', 'More than 2 weeks'] },
      { type: 'multiple_choice', title: 'How clear is the division of responsibility between legal and business teams?', required: true, options: ['Very Clear', 'Somewhat Clear', 'Confusing'] },
      { type: 'long_answer', title: 'Identify any templates or standard clauses that we should create to speed up drafting.', required: false }
    ]
  },
  {
    id: 'compliance-whistleblower-awareness',
    title: 'Whistleblower Program Evaluation',
    description: 'Assess awareness, safety, and confidence in whistleblower reporting lines.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Legal & Compliance',
    gradient: 'from-[#475569] to-[#0F172A]',
    questions: [
      { type: 'nps', title: 'How confident are you that whistleblower reports remain strictly confidential?', required: true },
      { type: 'multiple_choice', title: 'Are you aware of the whistleblower hotline numbers and intake portal?', required: true, options: ['Yes', 'No'] },
      { type: 'multiple_choice', title: 'Would you feel safe from retaliation if you had to report a violation?', required: true, options: ['Yes, completely safe', 'Somewhat safe', 'Unsafe'] },
      { type: 'long_answer', title: 'What can legal do to build more trust in the whistleblower program?', required: false }
    ]
  },
  {
    id: 'annual-general-meeting',
    title: 'Annual Shareholder Meeting (AGM)',
    description: 'Formal shareholder invitation including proxy delegation and Sharia compliance questions.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    department: 'Legal & Compliance',
    gradient: 'from-[#0F172A] to-[#1E293B]', // Dark Slate Corporate
    questions: [
      { type: 'multiple_choice', title: 'Confirm your attendance to the Annual General Shareholder Meeting:', required: true, options: ['Attending in person', 'Appointing a proxy voter', 'Electronic voting only, not attending'] },
      { type: 'multiple_choice', title: 'What is your shareholding category?', required: true, options: ['Individual Shareholder', 'Institutional Shareholder Representative', 'Broker Partnership Stakeholder', 'Auditor / Board Advisor'] },
      { type: 'multiple_choice', title: 'Do you authorize the board of directors to vote on corporate resolutions on your behalf?', required: true, options: ['Yes, fully authorize', 'No, assigning proxy vote to another representative'] },
      { type: 'long_answer', title: 'Submit any policy or corporate governance question for the Sharia Board to answer during the AGM:', required: false }
    ]
  },
  {
    id: 'executive-summit-registration',
    title: 'Takaful Board Summit Registration',
    description: 'Roundtable registration for insurance executives and Sharia board directors.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    department: 'Legal & Compliance',
    gradient: 'from-[#0F172A] to-[#1E293B]', // Dark Slate Corporate
    questions: [
      { type: 'multiple_choice', title: 'Please select your professional executive title:', required: true, options: ['Board Member / Sharia Scholar', 'C-Level Officer (CEO, CTO, CFO, CIO)', 'Head of Legal & Compliance', 'General Manager / Regional Executive'] },
      { type: 'multiple_choice', title: 'Which regulatory discussion topic is your highest priority?', required: true, options: ['Solvency II Alignment in Cooperative Takaful', 'Surplus Distribution Policies to Policyholders', 'Sharia Board Auditing & Disclosure Rules', 'ESG & Sustainable Investments for Takaful Reserves'] },
      { type: 'multiple_choice', title: 'Confirm compliance with the Chatham House Rule of executive discussions:', required: true, options: ['Agree completely', 'Request compliance brief', 'Declined'] },
      { type: 'long_answer', title: 'Detail any specific regulatory or risk reserves issue you would like to introduce to the roundtable.', required: false }
    ]
  },

  // ─── RISK MANAGEMENT ───
  {
    id: 'risk-enterprise-survey',
    title: 'Enterprise Risk Management Survey',
    description: 'Survey managers to evaluate risk profiles and controls across business units.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Risk Management',
    gradient: 'from-[#DC2626] to-[#991B1B]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our current Risk Management framework?', required: true },
      { type: 'multiple_choice', title: 'How frequently does your department update its operational risk register?', required: true, options: ['Monthly', 'Quarterly', 'Annually', 'Only when requested'] },
      { type: 'multiple_choice', title: 'Do you feel you have the resources to mitigate risks within your unit?', required: true, options: ['Fully sufficient', 'Partially sufficient', 'Under-resourced'] },
      { type: 'long_answer', title: 'Detail the largest unmitigated operational risk in your department.', required: true }
    ]
  },
  {
    id: 'risk-bcp-readiness',
    title: 'Business Continuity Plan Readiness',
    description: 'Assess staff preparedness for disaster recovery, system failures, and offline workflows.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Risk Management',
    gradient: 'from-[#991B1B] to-[#7F1D1D]',
    questions: [
      { type: 'nps', title: 'How confident are you that your team can run operations during a critical outage?', required: true },
      { type: 'multiple_choice', title: 'Have you participated in a mock disaster recovery run in the past 12 months?', required: true, options: ['Yes, fully participated', 'Only observed', 'No'] },
      { type: 'multiple_choice', title: 'Are you familiar with the backup power and cloud offline access protocols?', required: true, options: ['Yes', 'No'] },
      { type: 'long_answer', title: 'List any systems or procedures that have outdated backup protocols.', required: false }
    ]
  },
  {
    id: 'risk-fraud-detection',
    title: 'Fraud Detection Tool Usability',
    description: 'Review claims and policy fraud detection systems from analyst perspective.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Risk Management',
    gradient: 'from-[#DC2626] to-[#0F172A]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our fraud scanning software?', required: true },
      { type: 'multiple_choice', title: 'How would you rate the false positive rate of the transaction monitoring tool?', required: true, options: ['Very high (many false flags)', 'Moderate', 'Low (accurate alerts)'] },
      { type: 'multiple_choice', title: 'Does the system flag suspicious claims fast enough to prevent payout?', required: true, options: ['Yes, instantly', 'Usually, but tight', 'No, often flagged after payment'] },
      { type: 'long_answer', title: 'What indicators or rules should be added to the fraud detection algorithm?', required: false }
    ]
  },
  {
    id: 'risk-operational-assessment',
    title: 'Operational Risk Evaluation',
    description: 'Gather feedback on new digital threat controls and endpoint security.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Risk Management',
    gradient: 'from-[#EF4444] to-[#B91C1C]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our endpoint threat response tool?', required: true },
      { type: 'multiple_choice', title: 'Do cybersecurity threat controls interfere with daily operations?', required: true, options: ['Never', 'Rarely', 'Sometimes', 'Frequently'] },
      { type: 'multiple_choice', title: 'How safe do you feel saving customer PII data in the current cloud sandbox?', required: true, options: ['Very safe', 'Somewhat safe', 'Unsafe'] },
      { type: 'long_answer', title: 'Provide suggestions to make security policies more employee-friendly.', required: false }
    ]
  },
  {
    id: 'corporate-seminar-invite',
    title: 'Actuarial & Risk Seminar Invite',
    description: 'Invite risk officers and underwriters to the annual risk assessment and compliance seminar.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    department: 'Risk Management',
    gradient: 'from-[#0B4A8B] to-[#172554]', // Deep Royal Navy
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the Actuarial and Risk Management Seminar?', required: true, options: ['Yes, registered', 'No, nominating another Underwriter', 'Declined'] },
      { type: 'multiple_choice', title: 'Select your breakout seminar theme preference:', required: true, options: ['Underwriting Risks in Volatile Climates', 'Automating Claims Fraud Detection via AI', 'Sharia Audits & Takaful Solvency Rules', 'Re-Takaful & Risk Pool Diversification'] },
      { type: 'multiple_choice', title: 'Do you require a Continuous Professional Development (CPD) certificate?', required: true, options: ['Yes, digital PDF certificate', 'No certificate needed'] },
      { type: 'long_answer', title: 'What specific actuarial or underwriting topic do you want the panel to address?', required: false }
    ]
  },
  {
    id: 'workshop-registration',
    title: 'Risk Modeling & Underwriting Workshop',
    description: 'Register for hands-on workshops covering risk assessment modeling and calculations.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    department: 'Risk Management',
    gradient: 'from-[#17A673] to-[#115E59]', // Emerald to Teal
    questions: [
      { type: 'multiple_choice', title: 'Rate your experience with actuarial risk modeling software:', required: true, options: ['Beginner (No experience)', 'Intermediate (Can modify models)', 'Advanced (Build custom actuarial projections)', 'Executive (Only evaluate risk reports)'] },
      { type: 'multiple_choice', title: 'Which workshop session format matches your learning style best?', required: true, options: ['Hands-on computer lab (Excel / R)', 'Case studies & underwriting audits', 'Theoretical risk models & formulas'] },
      { type: 'multiple_choice', title: 'Do you need instructions on configuring risk data feeds?', required: true, options: ['Yes, essential', 'No, already done'] },
      { type: 'long_answer', title: 'What specific risk profile or line of business (e.g. liability, marine) are you most eager to model?', required: true }
    ]
  },

  // ─── HUMAN RESOURCES (HR) ───
  {
    id: 'hr-onboarding-experience',
    title: 'HR Onboarding Experience',
    description: 'Gather feedback from new hires on their onboarding, training, and department setup.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Human Resources (HR)',
    gradient: 'from-[#9333EA] to-[#7E22CE]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our company onboarding process to new hires?', required: true },
      { type: 'multiple_choice', title: 'Was your workstation and equipment ready on your first day?', required: true, options: ['Yes, fully set up', 'Partially ready', 'Not ready, waited days'] },
      { type: 'multiple_choice', title: 'How clear was the explanation of your health insurance and company benefits?', required: true, options: ['Very Clear', 'Somewhat Clear', 'Not Clear'] },
      { type: 'long_answer', title: 'What is one thing we could improve to make the onboarding process smoother?', required: false }
    ]
  },
  {
    id: 'hr-employee-engagement',
    title: 'Annual Engagement Survey',
    description: 'Evaluate corporate culture, manager support, and employee sentiment.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Human Resources (HR)',
    gradient: 'from-[#7E22CE] to-[#6B21A8]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend working at this company to friends?', required: true },
      { type: 'multiple_choice', title: 'Do you feel your daily contributions align with the company goals?', required: true, options: ['Strongly Agree', 'Agree', 'Disagree', 'Strongly Disagree'] },
      { type: 'multiple_choice', title: 'How would you rate the work-life balance in your team?', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { type: 'long_answer', title: 'What changes in corporate policies would improve your day-to-day engagement?', required: false }
    ]
  },
  {
    id: 'hr-performance-appraisal',
    title: 'Performance Review Process Evaluation',
    description: 'Collect feedback on the fairness, ease, and depth of the appraisal cycle.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Human Resources (HR)',
    gradient: 'from-[#9333EA] to-[#4F46E5]',
    questions: [
      { type: 'nps', title: 'How likely are you to rate our appraisal tool as easy to use?', required: true },
      { type: 'multiple_choice', title: 'Do you feel the performance review criteria are transparent and fair?', required: true, options: ['Very Fair', 'Somewhat Fair', 'Unfair'] },
      { type: 'multiple_choice', title: 'Did your manager provide clear goals for your career development?', required: true, options: ['Yes, actionable goals', 'Vague suggestions', 'No goals set'] },
      { type: 'long_answer', title: 'Suggest changes to make performance reviews more meaningful.', required: false }
    ]
  },
  {
    id: 'hr-wellness-programs',
    title: 'Benefits & Wellness Survey',
    description: 'Gather feedback on health insurance plans, gym memberships, and mental health programs.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Human Resources (HR)',
    gradient: 'from-[#6B21A8] to-[#581C87]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our corporate wellness programs?', required: true },
      { type: 'multiple_choice', title: 'Which health benefit is most important to you?', required: true, options: ['Medical Coverage Limits', 'Dental Care Add-on', 'Mental Health Counseling', 'Wellness Reimbursements'] },
      { type: 'multiple_choice', title: 'How satisfied are you with the claims process of our medical provider?', required: true, options: ['Very Satisfied', 'Satisfied', 'Dissatisfied'] },
      { type: 'long_answer', title: 'What additional wellness benefits or events would you like us to introduce?', required: false }
    ]
  },
  {
    id: 'hr-retreat-invite',
    title: 'HR Leadership Retreat Invite',
    description: 'Invitation to the HR department team-building weekend and strategy session.',
    touchpoint: 'Internal',
    category: 'Invitation',
    department: 'Human Resources (HR)',
    gradient: 'from-[#9333EA] to-[#EC4899]',
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the HR Leadership Retreat?', required: true, options: ['Yes, attending', 'No, cannot attend'] },
      { type: 'multiple_choice', title: 'Which team bonding activity is your preference?', required: true, options: ['Outdoor cooking class', 'Escape room challenge', 'High-ropes course', 'Scenic hike'] },
      { type: 'multiple_choice', title: 'Do you require shuttle transportation to the resort?', required: true, options: ['Yes, please', 'No, driving myself'] },
      { type: 'long_answer', title: 'Specify any food allergies or physical accommodation requirements.', required: false }
    ]
  },
  {
    id: 'hr-townhall-registration',
    title: 'Company Town Hall Registration',
    description: 'Register and submit anonymous questions for the upcoming quarterly town hall.',
    touchpoint: 'Internal',
    category: 'Registration',
    department: 'Human Resources (HR)',
    gradient: 'from-[#9333EA] to-[#EC4899]',
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the town hall live or watch recording?', required: true, options: ['Attend live in main hall', 'Attend live via webinar link', 'Watch recording later'] },
      { type: 'multiple_choice', title: 'Which executive department updates are you most interested in?', required: true, options: ['Sales & Revenue', 'Operations & New Portal', 'HR & Benefits', 'Compliance & Regulations'] },
      { type: 'multiple_choice', title: 'Do you authorize submitting your comments to the Q&A slides?', required: true, options: ['Yes, show with name', 'Yes, anonymously', 'Do not display'] },
      { type: 'long_answer', title: 'Type your question for the C-level executives to address during the Q&A session.', required: false }
    ]
  },

  // ─── SALES ───
  {
    id: 'sales-commission-feedback',
    title: 'Commission Structures Evaluation',
    description: 'Gather feedback on sales incentive models and commission payment speed.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Sales',
    gradient: 'from-[#EA580C] to-[#C2410C]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our current commission plan to fellow sales professionals?', required: true },
      { type: 'multiple_choice', title: 'Do you find the commission targets realistic and motivating?', required: true, options: ['Highly Motivating', 'Achievable but tight', 'Unrealistic'] },
      { type: 'multiple_choice', title: 'Are commission payouts processed accurately and on time?', required: true, options: ['Always', 'Usually', 'Frequently delayed'] },
      { type: 'long_answer', title: 'What changes should we introduce to incentives for corporate account conversions?', required: false }
    ]
  },
  {
    id: 'sales-enablement-tools',
    title: 'Sales Tools & CRM Usability',
    description: 'Assess the efficiency of CRM software, quoting calculators, and pipeline tools.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Sales',
    gradient: 'from-[#C2410C] to-[#9A3412]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our CRM platform?', required: true },
      { type: 'multiple_choice', title: 'How much time do you spend on manual data entry versus active selling?', required: true, options: ['More selling', 'Balanced', 'Too much manual entry'] },
      { type: 'multiple_choice', title: 'Is the auto-quotation tool accurate for commercial fleets?', required: true, options: ['Highly accurate', 'Needs manual override', 'Incorrect results'] },
      { type: 'long_answer', title: 'List the features or tools missing from your current sales kit.', required: false }
    ]
  },
  {
    id: 'sales-account-management',
    title: 'Client Relationship Health Check',
    description: 'Survey account managers on relationship gaps and customer retention risk.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Sales',
    gradient: 'from-[#EA580C] to-[#4F46E5]',
    questions: [
      { type: 'nps', title: 'How likely are you to renew your major assigned accounts this quarter?', required: true },
      { type: 'multiple_choice', title: 'What is the primary risk factor for key accounts changing providers?', required: true, options: ['Cheaper premium competitor', 'Slower claims turnaround', 'Underwriting exclusions', 'Poor direct communication'] },
      { type: 'multiple_choice', title: 'Do you have enough support from underwriting to negotiate rate match approvals?', required: true, options: ['Yes', 'Only for select accounts', 'No, too restrictive'] },
      { type: 'long_answer', title: 'Describe any strategic key account that needs immediate executive intervention to retain.', required: false }
    ]
  },
  {
    id: 'sales-lead-quality',
    title: 'Lead Generation Quality Review',
    description: 'Evaluate leads received from digital campaigns and external brokers.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Sales',
    gradient: 'from-[#EA580C] to-[#D97706]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend the marketing team lead source?', required: true },
      { type: 'multiple_choice', title: 'What percentage of marketing leads convert to active quotes?', required: true, options: ['Over 30%', '10% - 29%', 'Less than 10%', 'None'] },
      { type: 'multiple_choice', title: 'Are the contact details provided in the lead captures accurate?', required: true, options: ['Always accurate', 'Contains dead lines', 'Mostly invalid data'] },
      { type: 'long_answer', title: 'What criteria should we add to lead forms to improve qualification?', required: false }
    ]
  },
  {
    id: 'sales-product-launch-invite',
    title: 'Sales Product Launch Invitation',
    description: 'Invite corporate clients and brokers to the launch of our digital fleet motor insurance platform.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    department: 'Sales',
    gradient: 'from-[#0B4A8B] to-[#0D9488]', // Brand Navy to Teal
    questions: [
      { type: 'multiple_choice', title: 'Will you attend the digital Fleet Takaful launch event?', required: true, options: ['Yes, in-person', 'Yes, online stream', 'No, unable'] },
      { type: 'multiple_choice', title: 'Which launch workshop slot matches your schedule?', required: true, options: ['Morning (API Integration)', 'Afternoon (Underwriting Guidelines)', 'Dinner Network'] },
      { type: 'multiple_choice', title: 'How many vehicles does your corporate fleet manage?', required: true, options: ['1 - 10', '11 - 50', '51 - 200', '200+'] },
      { type: 'long_answer', title: 'What feature are you most interested in seeing demonstrated during the launch event?', required: false }
    ]
  },
  {
    id: 'sales-training-registration',
    title: 'Sales Negotiation Masterclass',
    description: 'Register for advanced sales closing and commercial negotiation courses.',
    touchpoint: 'Internal',
    category: 'Registration',
    department: 'Sales',
    gradient: 'from-[#EA580C] to-[#EA580C]',
    questions: [
      { type: 'multiple_choice', title: 'Select your sales experience level:', required: true, options: ['Associate / Agent', 'Senior Account Manager', 'Head of Sales / Director'] },
      { type: 'multiple_choice', title: 'Which training module matches your learning goals?', required: true, options: ['Objection Handling in Takaful', 'Broker Partnership Structuring', 'Competitive Pricing Negotiation'] },
      { type: 'multiple_choice', title: 'Do you require a training binder printed?', required: true, options: ['Yes', 'No, digital only'] },
      { type: 'long_answer', title: 'Specify any specific negotiation roadblock you face when closing corporate accounts.', required: false }
    ]
  },

  // ─── MARKETING ───
  {
    id: 'market-research',
    title: 'Home Takaful Awareness Study',
    description: 'Assess consumer brand recognition and interest in home protection plans in the UAE.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Marketing',
    gradient: 'from-[#0284C7] to-[#0B4A8B]', // Ocean to Navy
    questions: [
      { type: 'nps', title: 'How likely are you to recommend Abu Dhabi National Takaful to other homeowners?', required: true },
      { type: 'multiple_choice', title: 'Were you aware that home contents insurance covers tenant liability in the UAE?', required: true, options: ['Yes, fully aware', 'Had heard about it', 'No, completely unaware'] },
      { type: 'multiple_choice', title: 'What is the primary factor that would trigger you to purchase home insurance?', required: true, options: ['Fearing fire or water damage', 'Landlord mandate in tenancy contract', 'Affordable premium cost', 'Recommendation by bank/mortgage provider'] },
      { type: 'long_answer', title: 'What misconceptions or questions do you have regarding Takaful home protection policies?', required: false }
    ]
  },
  {
    id: 'post-event-feedback',
    title: 'Broker Seminar Feedback Survey',
    description: 'Assess satisfaction with the annual seminar organized for licensed insurance brokers and agents.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Marketing',
    gradient: 'from-[#0D9488] to-[#115E59]', // Brand Teal/Cyan
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our broker seminars to other insurance intermediaries?', required: true },
      { type: 'multiple_choice', title: 'How informative was the presentation on our new online Broker E-Portal?', required: true, options: ['Extremely Informative', 'Very Informative', 'Moderately Informative', 'Not Informative'] },
      { type: 'multiple_choice', title: 'Did the commission structures and product update briefings meet your expectations?', required: true, options: ['Exceeded Expectations', 'Met Expectations', 'Below Expectations'] },
      { type: 'long_answer', title: 'What new insurance products or digital features would you like to see introduced in the next broker seminar?', required: false }
    ]
  },
  {
    id: 'competitive-analysis',
    title: 'Insurance Policy Competitive Analysis',
    description: 'Analyze how policyholders view our coverage limits and premium rates compared to other UAE insurers.',
    touchpoint: 'Customer Support',
    category: 'Survey',
    department: 'Marketing',
    gradient: 'from-[#475569] to-[#1E293B]', // Corporate Slate/Steel
    questions: [
      { type: 'nps', title: 'How likely are you to renew your policy with us instead of switching to a competitor?', required: true },
      { type: 'multiple_choice', title: 'Which local insurance provider do you consider our primary competitor for motor/medical lines?', required: true, options: ['Sukoon / Oman Insurance', 'ADNIC', 'AXA / GIG', 'Orient Insurance', 'Other / None'] },
      { type: 'multiple_choice', title: 'What was the primary reason you selected our policy over competitors?', required: true, options: ['Lowest Premium Price', 'Broader Coverage / Lower Deductible', 'Brand Reputation & Sharia Compliance', 'Recommended by Broker', 'Fast Digital Onboarding'] },
      { type: 'long_answer', title: 'What is one product benefit or coverage extension that a competitor offers which we do not?', required: false }
    ]
  },
  {
    id: 'marketing-campaign-review',
    title: 'Marketing Campaign Performance',
    description: 'Review effectiveness and ROI of the brand campaign from stakeholder perspective.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Marketing',
    gradient: 'from-[#E11D48] to-[#9F1239]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our current campaign assets for sales support?', required: true },
      { type: 'multiple_choice', title: 'Which advertising channel had the best visual impact in your region?', required: true, options: ['Outdoor Billboards', 'Social Media Ads', 'Radio Jingles', 'Search Engine Sponsorships'] },
      { type: 'multiple_choice', title: 'Did the campaign generate quality inbound customer inquiries?', required: true, options: ['High volume and quality', 'High volume but low quality', 'No notable impact'] },
      { type: 'long_answer', title: 'What messaging adjustments should we make for the next product launch?', required: false }
    ]
  },
  {
    id: 'vip-event-invitation',
    title: 'Takaful Excellence Awards Gala',
    description: 'Corporate invitation for top-performing insurance brokers, partners, and brokers.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    department: 'Marketing',
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
    id: 'conference-registration',
    title: 'Middle East Takaful Forum Registration',
    description: 'Register for the regional summit on Islamic insurance, selecting passes and details.',
    touchpoint: 'Customer Support',
    category: 'Registration',
    department: 'Marketing',
    gradient: 'from-[#0B4A8B] to-[#172554]', // Deep Royal Navy
    questions: [
      { type: 'multiple_choice', title: 'Select your conference registration pass type:', required: true, options: ['Delegate Pass (Keynotes & Exhibition access)', 'All-Access Pass (Keynotes, Workshops & Networking Gala)', 'Student / Academic Pass', 'Press / Media Pass'] },
      { type: 'multiple_choice', title: 'What is the primary line of insurance business of your firm?', required: true, options: ['Takaful / Islamic Insurance', 'Conventional Insurance / Reinsurance', 'InsurTech / Software Provider', 'Brokerage / Agency', 'Regulatory / Legal / Sharia Advisory'] },
      { type: 'multiple_choice', title: 'Select your unisex T-shirt size for the event registration pack:', required: true, options: ['S', 'M', 'L', 'XL', 'XXL', 'Decline Swag Pack'] },
      { type: 'long_answer', title: 'Note any dietary restrictions or corporate accessibility requests for the forum.', required: false }
    ]
  },

  // ─── PROCUREMENT ───
  {
    id: 'procurement-vendor-eval',
    title: 'Vendor Performance Survey',
    description: 'Assess vendor delivery times, quality compliance, and billing accuracy.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Procurement',
    gradient: 'from-[#059669] to-[#047857]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend this supplier to other business units?', required: true },
      { type: 'multiple_choice', title: 'Are orders delivered within the specified turnaround SLAs?', required: true, options: ['Always on time', 'Minor delays', 'Consistently late'] },
      { type: 'multiple_choice', title: 'How would you rate the quality of materials/services provided?', required: true, options: ['Excellent', 'Acceptable', 'Poor / Defective'] },
      { type: 'long_answer', title: 'Describe any billing discrepancies or compliance issues faced with the vendor.', required: false }
    ]
  },
  {
    id: 'procurement-portal-usability',
    title: 'Procurement Portal Usability',
    description: 'Collect feedback on internal software for logging supply requests and approvals.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Procurement',
    gradient: 'from-[#047857] to-[#065F46]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend our procurement system?', required: true },
      { type: 'multiple_choice', title: 'How easy is it to upload vendor quotes and catalogs?', required: true, options: ['Very Easy', 'Fair', 'Difficult'] },
      { type: 'multiple_choice', title: 'Do you receive notifications when a request is approved or rejected?', required: true, options: ['Yes, immediately', 'Sometimes delayed', 'No notifications'] },
      { type: 'long_answer', title: 'What software features would make your supply ordering process faster?', required: false }
    ]
  },
  {
    id: 'procurement-internal-ordering',
    title: 'Internal Supply Ordering Review',
    description: 'Review departmental office supply allocations and courier logistics feedback.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Procurement',
    gradient: 'from-[#059669] to-[#1E293B]',
    questions: [
      { type: 'nps', title: 'How likely are you to recommend the internal courier dispatch desk?', required: true },
      { type: 'multiple_choice', title: 'Are standard hardware and stationery supplies kept fully in stock?', required: true, options: ['Always available', 'Frequently backordered', 'Rarely in stock'] },
      { type: 'multiple_choice', title: 'How would you rate the responsiveness of the supply distribution desk?', required: true, options: ['Fast & helpful', 'Takes several days', 'Requires escalation'] },
      { type: 'long_answer', title: 'List the supplies that are most frequently out of stock.', required: false }
    ]
  },
  {
    id: 'procurement-sourcing-sustainability',
    title: 'Sourcing Sustainability Review',
    description: 'Ensure vendors align with carbon reduction and ethical compliance standards.',
    touchpoint: 'Internal',
    category: 'Survey',
    department: 'Procurement',
    gradient: 'from-[#047857] to-[#15803D]',
    questions: [
      { type: 'nps', title: 'How important is a vendor\'s ESG rating when selecting procurement partners?', required: true },
      { type: 'multiple_choice', title: 'What percentage of our active suppliers possess verified green certificates?', required: true, options: ['More than 50%', '25% - 49%', 'Less than 25%', 'None / Don\'t know'] },
      { type: 'multiple_choice', title: 'Do we apply adequate penalties for vendors breaching labor codes?', required: true, options: ['Yes, fully', 'Partial enforcement', 'No, policies are weak'] },
      { type: 'long_answer', title: 'What green procurement targets should we introduce in the upcoming fiscal year?', required: false }
    ]
  },
  {
    id: 'procurement-vendor-summit',
    title: 'Vendor Partnership Summit Invite',
    description: 'RSVP invitation for primary contractors and IT hardware suppliers to our annual roundtable.',
    touchpoint: 'Customer Support',
    category: 'Invitation',
    department: 'Procurement',
    gradient: 'from-[#059669] to-[#0B4A8B]',
    questions: [
      { type: 'multiple_choice', title: 'Will your firm be sending representatives to the summit?', required: true, options: ['Yes, 2 reps', 'Yes, 1 rep', 'No, unable'] },
      { type: 'multiple_choice', title: 'Which roundtable theme aligns with your business focus?', required: true, options: ['Green Supply Chain', 'e-Procurement Portal Syncing', 'SLA Adjustments'] },
      { type: 'multiple_choice', title: 'Will you participate in the networking cocktail hour?', required: true, options: ['Yes', 'No'] },
      { type: 'long_answer', title: 'Mention any topic your account manager wants to raise with our executive panel.', required: false }
    ]
  },
  {
    id: 'procurement-compliance-workshop',
    title: 'Supply Chain Compliance Registration',
    description: 'Register for compliance and bribery prevention workshops for procurement personnel.',
    touchpoint: 'Internal',
    category: 'Registration',
    department: 'Procurement',
    gradient: 'from-[#059669] to-[#334155]',
    questions: [
      { type: 'multiple_choice', title: 'Select your preferred workshop session cohort:', required: true, options: ['Morning Track', 'Afternoon Track'] },
      { type: 'multiple_choice', title: 'Do you require anti-bribery training material printed?', required: true, options: ['Yes, printed', 'No, digital slides'] },
      { type: 'multiple_choice', title: 'Have you completed the compliance module last year?', required: true, options: ['Yes', 'No'] },
      { type: 'long_answer', title: 'Any specific procurement compliance cases you want analyzed by the legal instructor?', required: false }
    ]
  }
]

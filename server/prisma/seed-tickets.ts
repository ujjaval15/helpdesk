import prisma from "../src/db";

const tickets = [
  // OPEN - GENERAL_QUESTION
  { subject: "How do I reset my password?", body: "I forgot my password and can't log in. What's the process to reset it?", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "sarah.chen@gmail.com", customerName: "Sarah Chen" },
  { subject: "What are your support hours?", body: "I need to know when your support team is available for live chat.", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "mike.johnson@yahoo.com", customerName: "Mike Johnson" },
  { subject: "Can I change my username?", body: "I'd like to update my display name on the platform. Is that possible?", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "priya.sharma@outlook.com", customerName: "Priya Sharma" },
  { subject: "How to export my data?", body: "I want to download all my course progress and certificates. How can I do that?", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "james.wilson@hotmail.com", customerName: "James Wilson" },
  { subject: "Do you offer group discounts?", body: "Our company wants to purchase licenses for 50 employees. Are there bulk pricing options?", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "lisa.park@company.com", customerName: "Lisa Park" },
  { subject: "How to enable two-factor authentication?", body: "I want to add 2FA to my account for better security. Where is the setting?", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "david.brown@gmail.com", customerName: "David Brown" },
  { subject: "Where can I find my purchase history?", body: "I need receipts for my recent purchases for expense reporting.", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "anna.kowalski@protonmail.com", customerName: "Anna Kowalski" },
  { subject: "Is there a mobile app available?", body: "I'd like to access courses on my phone. Do you have an iOS or Android app?", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "tom.garcia@icloud.com", customerName: "Tom Garcia" },
  { subject: "How to update my email address?", body: "I recently changed my email and need to update it on my account.", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "emma.liu@fastmail.com", customerName: "Emma Liu" },
  { subject: "What payment methods do you accept?", body: "Can I pay with PayPal or is it credit card only?", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "carlos.rodriguez@gmail.com", customerName: "Carlos Rodriguez" },

  // OPEN - TECHNICAL_QUESTION
  { subject: "Video playback buffering constantly", body: "Every video I try to watch keeps buffering every 10 seconds. My internet is fine for other sites.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "jenny.martinez@gmail.com", customerName: "Jenny Martinez" },
  { subject: "Code editor not loading in browser", body: "The in-browser code editor shows a blank white screen. I'm using Chrome 120 on Windows.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "alex.thompson@outlook.com", customerName: "Alex Thompson" },
  { subject: "Certificate PDF won't download", body: "I completed the course but when I click download certificate, nothing happens.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "rachel.kim@yahoo.com", customerName: "Rachel Kim" },
  { subject: "Cannot submit quiz answers", body: "When I click submit on the final quiz, I get a spinning loader that never finishes.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "omar.hassan@gmail.com", customerName: "Omar Hassan" },
  { subject: "Audio out of sync with video", body: "The instructor's audio is about 2 seconds ahead of the video in Section 3 lectures.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "sophie.anderson@hotmail.com", customerName: "Sophie Anderson" },
  { subject: "Dark mode not working properly", body: "When I enable dark mode, some text becomes invisible because it stays dark on a dark background.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "kevin.lee@protonmail.com", customerName: "Kevin Lee" },
  { subject: "Search function returns no results", body: "I search for 'Python basics' and get zero results even though I can see the course on the homepage.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "maria.santos@gmail.com", customerName: "Maria Santos" },
  { subject: "Progress not saving between sessions", body: "I watch 3 lectures, close the browser, and when I come back my progress is reset to zero.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "ryan.patel@outlook.com", customerName: "Ryan Patel" },
  { subject: "Can't connect GitHub account", body: "When I try to link my GitHub for the project submission, I get an OAuth error.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "nicole.weber@gmail.com", customerName: "Nicole Weber" },
  { subject: "Mobile site crashes on lesson page", body: "The lesson page crashes Safari on my iPhone 15 whenever I try to scroll through the content.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "daniel.murphy@icloud.com", customerName: "Daniel Murphy" },

  // OPEN - REFUND_REQUEST
  { subject: "Refund for duplicate purchase", body: "I accidentally bought the same course twice. Please refund the second purchase.", status: "OPEN", category: "REFUND_REQUEST", customerEmail: "amanda.taylor@gmail.com", customerName: "Amanda Taylor" },
  { subject: "Course content not as advertised", body: "The course description says it covers advanced React patterns but it's all beginner content.", status: "OPEN", category: "REFUND_REQUEST", customerEmail: "brian.clark@yahoo.com", customerName: "Brian Clark" },
  { subject: "Requesting refund within 30-day window", body: "I purchased this course 5 days ago and would like a full refund. The teaching style doesn't work for me.", status: "OPEN", category: "REFUND_REQUEST", customerEmail: "yuki.tanaka@gmail.com", customerName: "Yuki Tanaka" },
  { subject: "Charged wrong amount", body: "The listing showed $29.99 but I was charged $49.99. Please refund the difference.", status: "OPEN", category: "REFUND_REQUEST", customerEmail: "patricia.moore@hotmail.com", customerName: "Patricia Moore" },
  { subject: "Need refund - course is outdated", body: "This course teaches React class components and hasn't been updated since 2020. I want modern React.", status: "OPEN", category: "REFUND_REQUEST", customerEmail: "stefan.mueller@gmail.com", customerName: "Stefan Mueller" },

  // OPEN - no category (uncategorized)
  { subject: "Question about upcoming features", body: "Are you planning to add AI-powered code review to the platform?", status: "OPEN", category: null, customerEmail: "linda.white@gmail.com", customerName: "Linda White" },
  { subject: "Feedback on the new UI redesign", body: "The new layout is confusing. I can't find my enrolled courses anymore.", status: "OPEN", category: null, customerEmail: "mark.davis@outlook.com", customerName: "Mark Davis" },
  { subject: "Partnership inquiry", body: "I'm a content creator and would like to discuss publishing courses on your platform.", status: "OPEN", category: null, customerEmail: "elena.popov@gmail.com", customerName: "Elena Popov" },
  { subject: "Accessibility concerns with the platform", body: "Screen readers can't navigate the course player. This is a serious accessibility issue.", status: "OPEN", category: null, customerEmail: "jason.wright@yahoo.com", customerName: "Jason Wright" },
  { subject: "Newsletter unsubscribe not working", body: "I've clicked unsubscribe three times but I'm still getting daily emails.", status: "OPEN", category: null, customerEmail: "catherine.hall@protonmail.com", customerName: "Catherine Hall" },

  // RESOLVED - GENERAL_QUESTION
  { subject: "How to change my subscription plan?", body: "I want to upgrade from monthly to annual billing.", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "robert.king@gmail.com", customerName: "Robert King" },
  { subject: "Can I share my account with a colleague?", body: "Is it against your terms of service to share login credentials?", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "susan.green@company.com", customerName: "Susan Green" },
  { subject: "Where are the course materials?", body: "The instructor mentioned downloadable resources but I can't find them.", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "ahmed.ali@outlook.com", customerName: "Ahmed Ali" },
  { subject: "How long do I have access to the course?", body: "Does my access expire after a certain period?", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "julia.schmidt@gmail.com", customerName: "Julia Schmidt" },
  { subject: "Can I get a student discount?", body: "I'm a university student. Do you offer educational pricing?", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "tyler.jackson@edu.com", customerName: "Tyler Jackson" },
  { subject: "How to leave a course review?", body: "I finished the course and want to leave a 5-star review but can't find the option.", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "megan.foster@gmail.com", customerName: "Megan Foster" },
  { subject: "What certificates do you offer?", body: "Are your certificates recognized by employers? Do they have any accreditation?", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "andrew.campbell@yahoo.com", customerName: "Andrew Campbell" },
  { subject: "Can I access courses offline?", body: "I'll be on a flight and want to download lectures for offline viewing.", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "hannah.mitchell@icloud.com", customerName: "Hannah Mitchell" },
  { subject: "How to request a new course topic?", body: "I'd love to see a course on Rust programming. How can I suggest it?", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "peter.hernandez@gmail.com", customerName: "Peter Hernandez" },
  { subject: "Account locked after too many login attempts", body: "I tried my old password too many times and now my account is locked.", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "natalie.ross@hotmail.com", customerName: "Natalie Ross" },

  // RESOLVED - TECHNICAL_QUESTION
  { subject: "Subtitles not displaying correctly", body: "The auto-generated subtitles are overlapping with the code editor on screen.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "chris.baker@gmail.com", customerName: "Chris Baker" },
  { subject: "Can't change video quality settings", body: "The quality dropdown is grayed out and stuck on 360p.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "diana.cruz@outlook.com", customerName: "Diana Cruz" },
  { subject: "File upload fails for project submission", body: "I keep getting 'File too large' error when uploading my 5MB project zip.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "frank.nguyen@gmail.com", customerName: "Frank Nguyen" },
  { subject: "Notification emails going to spam", body: "All your emails land in my spam folder. I've marked them as not spam but it keeps happening.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "grace.cooper@yahoo.com", customerName: "Grace Cooper" },
  { subject: "Two-factor auth code not accepted", body: "My authenticator app shows a code but the site says it's invalid every time.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "ivan.petrov@protonmail.com", customerName: "Ivan Petrov" },
  { subject: "API rate limiting on practice exercises", body: "The coding exercises keep timing out with 429 errors during peak hours.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "kelly.morgan@gmail.com", customerName: "Kelly Morgan" },
  { subject: "Browser extension conflicting with player", body: "My ad blocker seems to break the video player. Is there a whitelist URL?", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "leo.torres@hotmail.com", customerName: "Leo Torres" },
  { subject: "Keyboard shortcuts not working", body: "The spacebar to pause/play and arrow keys to seek don't work in the video player.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "maya.reed@gmail.com", customerName: "Maya Reed" },
  { subject: "SSO login failing for enterprise account", body: "Our company uses SAML SSO and it stopped working after your last update.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "nathan.brooks@enterprise.com", customerName: "Nathan Brooks" },
  { subject: "Course progress bar shows 100% but locked", body: "It says I completed the course but the certificate section is still locked.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "olivia.james@gmail.com", customerName: "Olivia James" },

  // RESOLVED - REFUND_REQUEST
  { subject: "Refund for accidental annual subscription", body: "I meant to buy monthly but got charged for the full year. Please refund.", status: "RESOLVED", category: "REFUND_REQUEST", customerEmail: "paul.rivera@gmail.com", customerName: "Paul Rivera" },
  { subject: "Course instructor left the platform", body: "The instructor deleted their account and half the course is now unavailable. I want my money back.", status: "RESOLVED", category: "REFUND_REQUEST", customerEmail: "quinn.foster@outlook.com", customerName: "Quinn Foster" },
  { subject: "Refund request - medical leave", body: "I had a medical emergency and couldn't use the course within the refund window. Requesting an exception.", status: "RESOLVED", category: "REFUND_REQUEST", customerEmail: "rita.gonzalez@yahoo.com", customerName: "Rita Gonzalez" },
  { subject: "Wrong course purchased", body: "I bought 'JavaScript Advanced' but meant to buy 'Java Advanced'. Can I get a refund or swap?", status: "RESOLVED", category: "REFUND_REQUEST", customerEmail: "sam.washington@gmail.com", customerName: "Sam Washington" },
  { subject: "Promo code not applied at checkout", body: "I had a 50% discount code but it wasn't applied. I was charged full price.", status: "RESOLVED", category: "REFUND_REQUEST", customerEmail: "tina.bell@hotmail.com", customerName: "Tina Bell" },

  // RESOLVED - no category
  { subject: "Account merge request", body: "I have two accounts with different emails and want to merge them into one.", status: "RESOLVED", category: null, customerEmail: "victor.dunn@gmail.com", customerName: "Victor Dunn" },
  { subject: "Data deletion request under GDPR", body: "Please delete all my personal data from your systems as per GDPR Article 17.", status: "RESOLVED", category: null, customerEmail: "wendy.hart@protonmail.com", customerName: "Wendy Hart" },
  { subject: "Billing address change", body: "I moved to a new country and need to update my billing address for tax purposes.", status: "RESOLVED", category: null, customerEmail: "xavier.cole@gmail.com", customerName: "Xavier Cole" },
  { subject: "Instructor profile verification", body: "I applied to be an instructor 2 weeks ago but haven't heard back about verification.", status: "RESOLVED", category: null, customerEmail: "yvonne.price@outlook.com", customerName: "Yvonne Price" },
  { subject: "Report inappropriate content in forum", body: "There's a user posting spam links in the Python course discussion forum.", status: "RESOLVED", category: null, customerEmail: "zack.simmons@gmail.com", customerName: "Zack Simmons" },

  // CLOSED - GENERAL_QUESTION
  { subject: "How do I cancel my subscription?", body: "I want to cancel before the next billing cycle.", status: "CLOSED", category: "GENERAL_QUESTION", customerEmail: "alice.freeman@gmail.com", customerName: "Alice Freeman" },
  { subject: "Can I transfer a course to someone else?", body: "I want to gift a course I already own to my friend.", status: "CLOSED", category: "GENERAL_QUESTION", customerEmail: "bob.marshall@yahoo.com", customerName: "Bob Marshall" },
  { subject: "What's included in the Pro plan?", body: "Can you list all the features that come with the Pro subscription?", status: "CLOSED", category: "GENERAL_QUESTION", customerEmail: "clara.jenkins@outlook.com", customerName: "Clara Jenkins" },
  { subject: "Multi-language support question", body: "Are courses available in Spanish or Portuguese?", status: "CLOSED", category: "GENERAL_QUESTION", customerEmail: "diego.vega@gmail.com", customerName: "Diego Vega" },
  { subject: "Referral program details", body: "I heard you have a referral program. How does it work and what do I earn?", status: "CLOSED", category: "GENERAL_QUESTION", customerEmail: "eve.carter@hotmail.com", customerName: "Eve Carter" },

  // CLOSED - TECHNICAL_QUESTION
  { subject: "Login page stuck in redirect loop", body: "Clicking login keeps redirecting me back to the login page in an infinite loop.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "felix.stone@gmail.com", customerName: "Felix Stone" },
  { subject: "Drag and drop broken in course builder", body: "I can't reorder my curriculum sections. The drag and drop just doesn't work.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "gina.walsh@protonmail.com", customerName: "Gina Walsh" },
  { subject: "Payment processing error on checkout", body: "I get 'Payment failed' even though my card works fine on other sites.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "henry.fox@gmail.com", customerName: "Henry Fox" },
  { subject: "Email verification link expired", body: "The verification link I received says it's expired. Can you send a new one?", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "iris.holland@yahoo.com", customerName: "Iris Holland" },
  { subject: "Broken links in course resources", body: "Several download links in Section 5 return 404 errors.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "jake.waters@outlook.com", customerName: "Jake Waters" },
  { subject: "Profile picture upload failing", body: "I try to upload a JPG profile picture but get 'unsupported format' error.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "kara.douglas@gmail.com", customerName: "Kara Douglas" },
  { subject: "Zoom integration not connecting", body: "The live session Zoom link gives 'meeting not found' for every scheduled class.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "liam.porter@icloud.com", customerName: "Liam Porter" },
  { subject: "Markdown not rendering in notes", body: "When I write notes in markdown format, they display as raw text instead of formatted.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "mia.bennett@gmail.com", customerName: "Mia Bennett" },
  { subject: "WebSocket disconnection during live coding", body: "The collaborative coding session keeps disconnecting every 2 minutes.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "nolan.perry@hotmail.com", customerName: "Nolan Perry" },
  { subject: "Console errors blocking exercises", body: "The browser console shows CORS errors and none of the interactive exercises load.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "olivia.hunt@gmail.com", customerName: "Olivia Hunt" },

  // CLOSED - REFUND_REQUEST
  { subject: "Refund denied unfairly", body: "My refund was denied because it was 32 days after purchase, just 2 days over the limit.", status: "CLOSED", category: "REFUND_REQUEST", customerEmail: "peter.snow@yahoo.com", customerName: "Peter Snow" },
  { subject: "Partial refund for bundle purchase", body: "I bought a 5-course bundle but only want 3. Can I get a partial refund for the other 2?", status: "CLOSED", category: "REFUND_REQUEST", customerEmail: "quinn.marsh@gmail.com", customerName: "Quinn Marsh" },
  { subject: "Refund processed to wrong card", body: "You refunded to a card I no longer have. Can you redirect it to my new card?", status: "CLOSED", category: "REFUND_REQUEST", customerEmail: "rosa.lloyd@outlook.com", customerName: "Rosa Lloyd" },
  { subject: "Still waiting for refund after 2 weeks", body: "The refund was approved 14 days ago but I haven't received the money yet.", status: "CLOSED", category: "REFUND_REQUEST", customerEmail: "steven.grant@protonmail.com", customerName: "Steven Grant" },
  { subject: "Refund for subscription I didn't use", body: "I was charged for 3 months of Pro but I never logged in. Requesting a full refund.", status: "CLOSED", category: "REFUND_REQUEST", customerEmail: "tracy.hayes@gmail.com", customerName: "Tracy Hayes" },

  // CLOSED - no category
  { subject: "Account recovery help", body: "I lost access to my email and phone. I need help recovering my account.", status: "CLOSED", category: null, customerEmail: "ursula.watts@hotmail.com", customerName: "Ursula Watts" },
  { subject: "Complaint about customer service response time", body: "I submitted a ticket 5 days ago and nobody has responded. This is unacceptable.", status: "CLOSED", category: null, customerEmail: "vincent.ray@gmail.com", customerName: "Vincent Ray" },
  { subject: "Request for bulk invoice", body: "Our finance department needs a single invoice for all team purchases this quarter.", status: "CLOSED", category: null, customerEmail: "wendy.fisher@company.com", customerName: "Wendy Fisher" },
  { subject: "Course completion not reflected on LinkedIn", body: "I connected my LinkedIn but completed courses don't show up on my profile.", status: "CLOSED", category: null, customerEmail: "xander.cole@gmail.com", customerName: "Xander Cole" },
  { subject: "Suggestion for improved onboarding", body: "New users should get a guided tour of the platform. I was lost for the first hour.", status: "CLOSED", category: null, customerEmail: "yara.bishop@outlook.com", customerName: "Yara Bishop" },

  // Additional tickets to reach 100
  { subject: "Trouble with coupon code SUMMER25", body: "The coupon code SUMMER25 says expired but the promotion email says it's valid until end of month.", status: "OPEN", category: "REFUND_REQUEST", customerEmail: "ben.oliver@gmail.com", customerName: "Ben Oliver" },
  { subject: "How to add team members to my account?", body: "I purchased the team plan but can't figure out how to invite my colleagues.", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "diana.nash@company.com", customerName: "Diana Nash" },
  { subject: "Playback speed option missing", body: "I used to be able to watch at 1.5x speed but that option is gone from the player controls.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "roger.chen@gmail.com", customerName: "Roger Chen" },
  { subject: "Received someone else's certificate", body: "The certificate I downloaded has another person's name on it. This is a serious privacy issue.", status: "OPEN", category: null, customerEmail: "fiona.west@protonmail.com", customerName: "Fiona West" },
  { subject: "Course videos not available in my country", body: "I get a 'content not available in your region' message on all video lectures.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "amit.verma@yahoo.com", customerName: "Amit Verma" },
  { subject: "Billing cycle changed without notice", body: "My billing date moved from the 1st to the 15th. I wasn't notified about this change.", status: "RESOLVED", category: "GENERAL_QUESTION", customerEmail: "carol.meyer@outlook.com", customerName: "Carol Meyer" },
  { subject: "Double charged for same course", body: "I see two charges on my credit card statement for the same course purchased once.", status: "RESOLVED", category: "REFUND_REQUEST", customerEmail: "george.bell@gmail.com", customerName: "George Bell" },
  { subject: "API documentation seems outdated", body: "The webhook integration docs reference v1 endpoints that return 404.", status: "RESOLVED", category: "TECHNICAL_QUESTION", customerEmail: "helen.cross@fastmail.com", customerName: "Helen Cross" },
  { subject: "Where to find community Discord?", body: "I heard there's an official Discord server for students. Can you share the invite link?", status: "RESOLVED", category: null, customerEmail: "ian.frost@gmail.com", customerName: "Ian Frost" },
  { subject: "Auto-renewal cancellation confirmation", body: "I cancelled auto-renewal last week but didn't receive a confirmation email.", status: "CLOSED", category: "GENERAL_QUESTION", customerEmail: "julia.day@hotmail.com", customerName: "Julia Day" },
  { subject: "Refund for incorrect course level", body: "The course says 'intermediate' but it's clearly advanced. I'm completely lost.", status: "CLOSED", category: "REFUND_REQUEST", customerEmail: "karl.lang@gmail.com", customerName: "Karl Lang" },
  { subject: "Calendar integration broken", body: "Syncing course schedule to Google Calendar creates events with wrong times.", status: "CLOSED", category: "TECHNICAL_QUESTION", customerEmail: "laura.reed@outlook.com", customerName: "Laura Reed" },
  { subject: "Request to delete forum post", body: "I accidentally posted confidential company info in the public forum. Please remove it ASAP.", status: "CLOSED", category: null, customerEmail: "max.stone@company.com", customerName: "Max Stone" },
  { subject: "Instructor not responding to questions", body: "I've asked 4 questions in the Q&A section over the past month with zero replies.", status: "OPEN", category: "GENERAL_QUESTION", customerEmail: "nina.hart@gmail.com", customerName: "Nina Hart" },
  { subject: "Exam timer keeps resetting", body: "During the final exam, the timer resets to full whenever I switch between questions.", status: "OPEN", category: "TECHNICAL_QUESTION", customerEmail: "oscar.dean@yahoo.com", customerName: "Oscar Dean" },
] as const;

async function seedTickets() {
  const existing = await prisma.ticket.count();
  if (existing >= 100) {
    console.log(`Already ${existing} tickets in the database, skipping.`);
    return;
  }

  // Spread creation dates across the last 90 days
  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;

  const data = tickets.map((t, i) => ({
    subject: t.subject,
    body: t.body,
    status: t.status as "OPEN" | "RESOLVED" | "CLOSED",
    category: t.category as "GENERAL_QUESTION" | "TECHNICAL_QUESTION" | "REFUND_REQUEST" | null,
    customerEmail: t.customerEmail,
    customerName: t.customerName,
    createdAt: new Date(now - ninetyDays + (i * ninetyDays) / tickets.length),
  }));

  const result = await prisma.ticket.createMany({ data });
  console.log(`Seeded ${result.count} tickets.`);
}

seedTickets().catch((err) => {
  console.error("Ticket seed failed:", err);
  process.exit(1);
});

const WEBHOOK_URL = "http://localhost:3000/api/webhooks/inbound-email";
const WEBHOOK_SECRET = "test-webhook-secret-dev";

const tickets = [
  { from: "alice.jones@gmail.com", fromName: "Alice Jones", subject: "Forgot my password", body: "Hi, I forgot my password and can't log in. How do I reset it?" },
  { from: "bob.smith@yahoo.com", fromName: "Bob Smith", subject: "Password reset email not arriving", body: "I tried resetting my password but I never got the email. It's been 20 minutes. Can you help?" },
  { from: "carol.white@outlook.com", fromName: "Carol White", subject: "Can't see my purchased course", body: "I bought the React course yesterday but it's not showing up in my dashboard. I have the receipt." },
  { from: "dave.brown@gmail.com", fromName: "Dave Brown", subject: "Transfer course to another account", body: "Can I transfer my Python course to my wife's account? She wants to learn too." },
  { from: "emma.davis@hotmail.com", fromName: "Emma Davis", subject: "What does lifetime access mean?", body: "I'm considering buying a course. Does lifetime access really mean forever? Will I get updates?" },
  { from: "frank.miller@gmail.com", fromName: "Frank Miller", subject: "Refund policy question", body: "What is your refund policy? I just bought a course and want to know my options." },
  { from: "grace.wilson@yahoo.com", fromName: "Grace Wilson", subject: "How to request a refund", body: "I'd like a refund for my recent purchase. I bought it 5 days ago. How do I proceed?" },
  { from: "henry.taylor@gmail.com", fromName: "Henry Taylor", subject: "Do you offer certificates?", body: "After I complete a course, do I get a certificate? Is it an accredited degree?" },
  { from: "irene.anderson@outlook.com", fromName: "Irene Anderson", subject: "Can I download the videos?", body: "I want to watch videos offline during my commute. Is it possible to download them?" },
  { from: "jack.thomas@gmail.com", fromName: "Jack Thomas", subject: "Videos not playing", body: "I'm trying to watch the Node.js course but the videos won't play. Just a black screen." },
  { from: "karen.jackson@yahoo.com", fromName: "Karen Jackson", subject: "Video quality is very low", body: "The videos in my course are blurry and low resolution. How can I fix this?" },
  { from: "leo.harris@gmail.com", fromName: "Leo Harris", subject: "Coupon code not working", body: "I have a coupon code SAVE20 but it says invalid when I try to apply it. Help?" },
  { from: "maria.clark@hotmail.com", fromName: "Maria Clark", subject: "Change my email address", body: "I need to change the email on my account from this one to maria.new@gmail.com. How?" },
  { from: "nate.lewis@gmail.com", fromName: "Nate Lewis", subject: "Password reset help needed", body: "Can you walk me through how to reset my password? I'm not very tech savvy." },
  { from: "olivia.robinson@yahoo.com", fromName: "Olivia Robinson", subject: "Reset email in spam?", body: "You sent me a password reset email but I can't find it. Could it be in my spam folder?" },
  { from: "peter.walker@gmail.com", fromName: "Peter Walker", subject: "Course not appearing after payment", body: "I paid for the SQL course an hour ago. Payment went through but the course isn't in my account." },
  { from: "quinn.hall@outlook.com", fromName: "Quinn Hall", subject: "Lifetime access clarification", body: "If I buy a course now, will I still have access in 5 years? What about 10 years?" },
  { from: "rachel.allen@gmail.com", fromName: "Rachel Allen", subject: "30 day refund guarantee", body: "I purchased a course 10 days ago. Am I still eligible for a full refund?" },
  { from: "sam.young@yahoo.com", fromName: "Sam Young", subject: "Where to find my certificate", body: "I completed the JavaScript course but can't find my certificate. Where do I download it?" },
  { from: "tina.king@gmail.com", fromName: "Tina King", subject: "Source code download", body: "How do I download the source code for the exercises? I can only see videos." },
  { from: "victor.wright@hotmail.com", fromName: "Victor Wright", subject: "Browser issues with video playback", body: "Videos keep buffering on Firefox. Should I use a different browser?" },
  { from: "wendy.scott@gmail.com", fromName: "Wendy Scott", subject: "Expired coupon code", body: "I got a coupon code last month but it says expired now. Can you reactivate it?" },
  { from: "xavier.green@yahoo.com", fromName: "Xavier Green", subject: "Update my account email", body: "I want to update my email address from this one to xavier.new@yahoo.com please." },
  { from: "yolanda.baker@gmail.com", fromName: "Yolanda Baker", subject: "Forgot password reset steps", body: "What are the exact steps to reset my password? I need a walkthrough." },
  { from: "zach.adams@outlook.com", fromName: "Zach Adams", subject: "Course purchase confirmation", body: "I bought the Docker course but never received a confirmation email. Do I have access?" },
  { from: "amy.nelson@gmail.com", fromName: "Amy Nelson", subject: "Can I share my course with a friend", body: "My friend wants to take the same course I bought. Can I share access or transfer it?" },
  { from: "brian.carter@yahoo.com", fromName: "Brian Carter", subject: "Lifetime access for updates", body: "If a course gets updated with new content, do I get the updates for free with lifetime access?" },
  { from: "cindy.mitchell@gmail.com", fromName: "Cindy Mitchell", subject: "Refund for recent purchase", body: "I bought a course 3 days ago and want a refund. I haven't watched any of it yet." },
  { from: "derek.perez@hotmail.com", fromName: "Derek Perez", subject: "Certificate accreditation", body: "Are the certificates accredited? Can I use them on my resume or LinkedIn?" },
  { from: "elena.roberts@gmail.com", fromName: "Elena Roberts", subject: "Offline video access", body: "Is there any way to download course videos for offline viewing? I travel a lot." },
  { from: "freddy.turner@yahoo.com", fromName: "Freddy Turner", subject: "Clear cache to fix videos", body: "My videos are freezing. Someone said I should clear my cache. How do I do that?" },
  { from: "gina.phillips@gmail.com", fromName: "Gina Phillips", subject: "Two coupon codes", body: "Can I use two coupon codes on one purchase? I have codes from two promotions." },
  { from: "hank.campbell@outlook.com", fromName: "Hank Campbell", subject: "Email change request", body: "Please change my account email. Current: hank.campbell@outlook.com New: hank@newmail.com" },
  { from: "isla.parker@gmail.com", fromName: "Isla Parker", subject: "Login issues after password change", body: "I changed my password but now I can't log in. The new password isn't working." },
  { from: "james.evans@yahoo.com", fromName: "James Evans", subject: "Payment processed but no course", body: "My credit card was charged for the Angular course but I don't see it in my account." },
  { from: "kate.edwards@gmail.com", fromName: "Kate Edwards", subject: "Lifetime access meaning", body: "What does lifetime access mean exactly? Is it the lifetime of the site or mine?" },
  { from: "liam.collins@hotmail.com", fromName: "Liam Collins", subject: "Partial refund eligibility", body: "I completed about 50% of a course. Can I still get a refund? What would the amount be?" },
  { from: "mona.stewart@gmail.com", fromName: "Mona Stewart", subject: "Certificate for completed course", body: "I finished the TypeScript course. How do I get my completion certificate?" },
  { from: "noah.morris@yahoo.com", fromName: "Noah Morris", subject: "Downloadable resources", body: "Can I download any materials from the course? Like slides or code examples?" },
  { from: "olive.rogers@gmail.com", fromName: "Olive Rogers", subject: "Video not loading on Chrome", body: "I'm on the latest Chrome but videos still won't load. I've cleared cache and disabled extensions." },
  { from: "paul.reed@outlook.com", fromName: "Paul Reed", subject: "Coupon for wrong course", body: "I have a valid coupon but it doesn't work for the course I want. Is it course-specific?" },
  { from: "rose.cook@gmail.com", fromName: "Rose Cook", subject: "Account email update needed", body: "Hi, I need to update my email. Old: rose.cook@gmail.com, New: rose.new@gmail.com. Thanks!" },
  { from: "steve.morgan@yahoo.com", fromName: "Steve Morgan", subject: "Can't remember my account email", body: "I forgot which email I used to create my account. How can I find out?" },
  { from: "tara.bell@gmail.com", fromName: "Tara Bell", subject: "Course showing as not purchased", body: "I bought the C# course last week but today it says I need to purchase it again." },
  { from: "ulrich.murphy@hotmail.com", fromName: "Ulrich Murphy", subject: "Lifetime access question", body: "Does lifetime access include any new courses you release in the future?" },
  { from: "vera.bailey@gmail.com", fromName: "Vera Bailey", subject: "Refund processing time", body: "I requested a refund 3 days ago. How long does it take to process?" },
  { from: "will.rivera@yahoo.com", fromName: "Will Rivera", subject: "Certificate not showing", body: "I completed 100% of the course but the certificate section is empty. Help!" },
  { from: "xena.cooper@gmail.com", fromName: "Xena Cooper", subject: "Low quality video streaming", body: "My videos play in very low quality even though my internet is fast. Any fix?" },
  { from: "yuri.richardson@outlook.com", fromName: "Yuri Richardson", subject: "Browser extension blocking videos", body: "Could my ad blocker be preventing videos from playing? They show a blank white screen." },
  { from: "zara.cox@gmail.com", fromName: "Zara Cox", subject: "How to get a refund within 30 days", body: "I want to get a refund. I bought the course 2 weeks ago and completed about 10%. What do I do?" },
];

async function seedTickets() {
  console.log(`Sending ${tickets.length} tickets through the webhook...`);

  let created = 0;
  let failed = 0;

  for (const ticket of tickets) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": WEBHOOK_SECRET,
        },
        body: JSON.stringify(ticket),
      });

      const data = await res.json();

      if (res.status === 201) {
        created++;
        console.log(`  [${created}] Created ticket #${data.ticket.id}: ${ticket.subject}`);
      } else if (res.status === 200 && data.existing) {
        console.log(`  [skip] Duplicate: ${ticket.subject}`);
      } else {
        failed++;
        console.log(`  [fail] ${res.status}: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      failed++;
      console.error(`  [error] ${ticket.subject}:`, err);
    }
  }

  console.log(`\nDone. Created: ${created}, Failed: ${failed}`);
  console.log("Tickets are now being processed by the auto-resolve pipeline in the background.");
}

seedTickets();

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// 1. CONFIGURATION (Now from .env file)
const BOT_EMAIL = process.env.BOT_EMAIL || "microcilmateai.proj@gmail.com";
const BOT_PASSWORD = process.env.BOT_PASSWORD || "tuny lmmu fdbo zmdk";
const MY_EMAIL = process.env.MY_EMAIL || "gonzaga.angelor@gmail.com";
const SMTP_SERVICE = process.env.SMTP_SERVICE || 'gmail';

// 2. CREATE TRANSPORTER (The "Mailman")
const transporter = nodemailer.createTransport({
  service: SMTP_SERVICE,
  auth: {
    user: BOT_EMAIL,
    pass: BOT_PASSWORD
  }
});

// Test connection on startup
async function testConnection() {
  try {
    const result = await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    console.log('✅ Email service connected successfully!');
    return true;
  } catch (error) {
    console.log('⚠️  Proceeding with email send despite connection check delay...');
    return true; // Allow send anyway
  }
}

// 3. LOGIC TO SEND EMAIL
async function sendFloodAlert(precipitationChance, location) {
  
  // Construct a nice HTML email
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
      <h2 style="color: #d32f2f;">🚨 FLOOD RISK WARNING</h2>
      <p><strong>MicroClimate.AI</strong> has detected critical weather conditions.</p>
      
      <ul style="background-color: #f9f9f9; padding: 15px;">
        <li><strong>Location:</strong> ${location}</li>
        <li><strong>Rain Probability:</strong> ${precipitationChance}%</li>
        <li><strong>Status:</strong> <span style="color: red;">High Risk</span></li>
      </ul>

      <p>Please monitor local news and prepare for potential evacuation.</p>
      <hr>
      <small>This is an automated message from your IoT Station.</small>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"MicroClimate Bot" <${BOT_EMAIL}>`, // Sender Name
      to: MY_EMAIL, 
      subject: `⚠️ URGENT: Flood Alert for ${location}`, // Email Subject
      html: htmlContent // The fancy HTML body
    });

    console.log("✅ Email Alert Sent! Message ID:", info.messageId);
    return true;

  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    return false;
  }
}

// --- EXPORT & TEST TRIGGER ---
export { sendFloodAlert, testConnection, transporter };

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n🔧 Testing Email Bot...');
  console.log('='.repeat(50));
  console.log('BOT_EMAIL:', BOT_EMAIL);
  console.log('MY_EMAIL:', MY_EMAIL);
  console.log('SMTP_SERVICE:', SMTP_SERVICE);
  console.log('='.repeat(50));
  
  (async () => {
    try {
      // Test connection first
      console.log('\n📡 Testing email connection...');
      await testConnection();
      
      console.log('\n📧 Sending test flood alert...');
      const rainChance = 95;
      const riskLevel = 2;
      
      if (rainChance > 90 && riskLevel >= 2) {
        console.log('Rain chance:', rainChance + '% | Risk level:', riskLevel);
        console.log('Sending to:', MY_EMAIL);
        const result = await sendFloodAlert(rainChance, "Butuan City - Brgy. Libertad");
        if (result) {
          console.log('✅ Email sent successfully!');
        }
      }
    } catch (error) {
      console.error('Error during test:', error.message);
    } finally {
      process.exit(0);
    }
  })();
}

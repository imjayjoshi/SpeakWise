require('dotenv').config();
const emailService = require('../utils/emailService');

console.log('='.repeat(60));
console.log('📧 EMAIL SERVICE TEST SCRIPT');
console.log('='.repeat(60));
console.log('');

// Check environment variables
console.log('1️⃣  Checking Environment Variables...');
console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'NOT SET (will default to gmail)');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (length: ' + process.env.EMAIL_PASSWORD.length + ' chars)' : '❌ NOT SET');
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NOT SET');
console.log('');

// Validate configuration
let hasErrors = false;

if (!process.env.EMAIL_USER) {
  console.log('❌ ERROR: EMAIL_USER is not set in .env file');
  hasErrors = true;
}

if (!process.env.EMAIL_PASSWORD) {
  console.log('❌ ERROR: EMAIL_PASSWORD is not set in .env file');
  hasErrors = true;
} else if (process.env.EMAIL_PASSWORD.length !== 16) {
  console.log('⚠️  WARNING: Gmail app password should be 16 characters');
  console.log('   Current length:', process.env.EMAIL_PASSWORD.length);
  console.log('   Make sure you removed all spaces from the app password');
}

if (!process.env.FRONTEND_URL) {
  console.log('⚠️  WARNING: FRONTEND_URL is not set (will affect reset links)');
}

if (hasErrors) {
  console.log('');
  console.log('❌ Configuration errors found. Please fix them in backend/.env file');
  console.log('');
  console.log('Example .env configuration:');
  console.log('EMAIL_SERVICE=gmail');
  console.log('EMAIL_USER=your-email@gmail.com');
  console.log('EMAIL_PASSWORD=abcdefghijklmnop  ← 16 chars, no spaces!');
  console.log('FRONTEND_URL=http://localhost:5173');
  console.log('');
  process.exit(1);
}

console.log('✅ Environment variables look good!');
console.log('');

// Test email sending
async function testEmailService() {
  try {
    console.log('2️⃣  Testing Email Service Connection...');
    
    // Verify connection
    const isConnected = await emailService.verifyConnection();
    
    if (!isConnected) {
      console.log('❌ Failed to connect to email service');
      console.log('');
      console.log('Common issues:');
      console.log('1. Wrong email or password');
      console.log('2. 2-Factor Authentication not enabled on Gmail');
      console.log('3. Using regular password instead of app password');
      console.log('4. Firewall blocking SMTP connection');
      console.log('');
      process.exit(1);
    }
    
    console.log('✅ Email service connection successful!');
    console.log('');
    
    // Ask for test email address
    console.log('3️⃣  Sending Test Email...');
    console.log('   From:', process.env.EMAIL_USER);
    console.log('   To:', process.env.EMAIL_USER, '(sending to yourself)');
    console.log('');
    
    // Send test email
    const result = await emailService.sendPasswordResetEmail(
      process.env.EMAIL_USER,
      'test-token-' + Date.now(),
      'Test User'
    );
    
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
    console.log('   Message ID:', result.messageId);
    console.log('');
    console.log('📬 Check your email inbox (and spam folder)');
    console.log('   Email should arrive within 1-2 minutes');
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Your email service is working correctly! 🎉');
    console.log('You can now use the forgot password feature in your app.');
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('❌ EMAIL TEST FAILED');
    console.log('='.repeat(60));
    console.log('Error:', error.message);
    console.log('');
    
    if (error.message.includes('Invalid login')) {
      console.log('🔍 This error means:');
      console.log('   - You are using the wrong email or password');
      console.log('   - OR you are using your regular Gmail password instead of app password');
      console.log('');
      console.log('✅ Solution:');
      console.log('   1. Go to: https://myaccount.google.com/apppasswords');
      console.log('   2. Generate a new app password');
      console.log('   3. Copy the 16-character password (remove spaces)');
      console.log('   4. Update EMAIL_PASSWORD in backend/.env');
      console.log('   5. Restart this test');
    } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout')) {
      console.log('🔍 This error means:');
      console.log('   - Firewall is blocking the connection');
      console.log('   - OR internet connection issue');
      console.log('');
      console.log('✅ Solution:');
      console.log('   1. Check your internet connection');
      console.log('   2. Disable firewall temporarily');
      console.log('   3. Try again');
    } else {
      console.log('🔍 Unexpected error occurred');
      console.log('');
      console.log('Full error details:');
      console.log(error);
    }
    
    console.log('');
    process.exit(1);
  }
}

// Run the test
testEmailService();

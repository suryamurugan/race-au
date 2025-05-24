import 'dotenv/config';
import { readFileSync } from 'fs';
import nodemailer from 'nodemailer';

interface UserData {
    email: string;
    name: string;
    password: string;
    challenge_id: string;
    team_name: string;
}

function parsePasswordCSV(csvContent: string): UserData[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');

    const users: UserData[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const user: any = {};

        headers.forEach((header, index) => {
            user[header.trim()] = values[index]?.trim() || '';
        });

        users.push(user as UserData);
    }

    return users;
}

function createEmailTemplate(user: UserData): {
    subject: string;
    html: string;
    text: string;
} {
    const subject = `🏁 SQL Race Login Credentials - ${user.challenge_id}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .credentials { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
        .powered-by { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🏁 Welcome to SQL Race!</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
        </div>
        
        <p>You have been registered for the <strong>${user.challenge_id}</strong> challenge as part of team <strong>${user.team_name}</strong>.</p>
        
        <div class="credentials">
            <h3>📧 Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Password:</strong> <span class="highlight">${user.password}</span></p>
        </div>
        
        <p>Please use these credentials to log into the SQL Race platform and participate in your challenge.</p>
        
        <p><strong>Important:</strong></p>
        <ul>
            <li>Keep your password secure and don't share it with others</li>
            <li>You can change your password after logging in</li>
            <li>Contact support if you have any issues accessing your account</li>
        </ul>
        
        <div class="footer">
            <p>Good luck with your challenge! 🚀</p>
            <p><em>This is an automated email from the SQL Race platform.</em></p>
            <div class="powered-by">
                <p>Powered by <strong>CIALabs</strong></p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const text = `
🏁 SQL Race Login Credentials

Hello ${user.name},

You have been registered for the ${user.challenge_id} challenge as part of team ${user.team_name}.

Your Login Credentials:
Email: ${user.email}
Password: ${user.password}

Please use these credentials to log into the SQL Race platform and participate in your challenge.

Important:
- Keep your password secure and don't share it with others
- You can change your password after logging in
- Contact support if you have any issues accessing your account

Good luck with your challenge! 🚀

This is an automated email from the SQL Race platform.

Powered by CIALabs
`;

    return { subject, html, text };
}

async function sendEmail(
    transporter: nodemailer.Transporter,
    user: UserData,
): Promise<boolean> {
    try {
        const { subject, html, text } = createEmailTemplate(user);

        const info = await transporter.sendMail({
            from: `"RACE Challenge" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject,
            text,
            html,
        });

        console.log(
            `✅ Email sent to ${user.email} (${user.name}) - Message ID: ${info.messageId}`,
        );
        return true;
    } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error);
        return false;
    }
}

async function main() {
    const csvFilePath = process.argv[2];

    if (!csvFilePath) {
        console.error('Usage: pnpm run send:passwords <csv-file-path>');
        console.error('Example: pnpm run send:passwords ./teams_passwords.csv');
        process.exit(1);
    }

    // Check required environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('❌ Missing required environment variables:');
        console.error('   GMAIL_USER - Your Gmail address');
        console.error('   GMAIL_APP_PASSWORD - Your Gmail app password');
        console.error('');
        console.error('Please set these in your .env file:');
        console.error('GMAIL_USER=your-email@gmail.com');
        console.error('GMAIL_APP_PASSWORD=your-app-password');
        process.exit(1);
    }

    try {
        console.log('📧 Starting password email distribution...');
        console.log(`📄 Reading CSV file: ${csvFilePath}`);

        const csvContent = readFileSync(csvFilePath, 'utf-8');
        const users = parsePasswordCSV(csvContent);

        console.log(`👥 Found ${users.length} users to email`);

        // Create Gmail transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // Verify connection
        console.log('🔗 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified');

        let successCount = 0;
        let failureCount = 0;

        // Send emails with delay to avoid rate limiting
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            console.log(
                `\n📤 Sending email ${i + 1}/${users.length} to ${user.email}...`,
            );

            const success = await sendEmail(transporter, user);
            if (success) {
                successCount++;
            } else {
                failureCount++;
            }

            // Add delay between emails to avoid rate limiting (2 seconds)
            if (i < users.length - 1) {
                console.log('⏳ Waiting 2 seconds before next email...');
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        console.log('\n📊 Email Distribution Summary:');
        console.log(`✅ Successfully sent: ${successCount}`);
        console.log(`❌ Failed to send: ${failureCount}`);
        console.log(`📧 Total emails: ${users.length}`);

        if (failureCount === 0) {
            console.log('\n🎉 All passwords sent successfully!');
        } else {
            console.log(
                '\n⚠️  Some emails failed to send. Please check the errors above.',
            );
        }
    } catch (error) {
        console.error('❌ Error during email distribution:', error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

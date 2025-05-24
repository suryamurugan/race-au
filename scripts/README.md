# RACE Challenge Scripts

This directory contains scripts for managing challenge participants and sending credentials.

## Scripts

### 1. `seed-challenge.ts` - Create Users and Teams

Seeds the database with users and teams from a CSV file.

**Usage:**

```bash
pnpm run seed:challenge teams.csv
```

**CSV Format:**

```csv
challenge_id,team_name,email1,email2,name1,name2
CHALLENGE001,Team Alpha,john@example.com,jane@example.com,John Doe,Jane Smith
```

**Output:**

- Creates users and teams in the database
- Generates `teams_passwords.csv` with all user credentials

### 2. `send-passwords.ts` - Email Credentials to Users

Sends login credentials to users via email using Gmail SMTP.

**Usage:**

```bash
pnpm run send:passwords teams_passwords.csv
```

## Setup Instructions

### Prerequisites

1. **Install dependencies:**
    ```bash
    pnpm install
    ```

### Gmail SMTP Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
    - Go to your Google Account settings
    - Security → 2-Step Verification → App passwords
    - Generate a new app password for "Mail"
3. **Add environment variables** to your `.env` file:
    ```env
    GMAIL_USER=your-email@gmail.com
    GMAIL_APP_PASSWORD=your-16-character-app-password
    ```

### Environment Variables Required

```env
# Database (already configured)
DATABASE_URL=your-database-url

# Gmail SMTP (for password emails)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## Complete Workflow

1. **Prepare your CSV file** with team data:

    ```csv
    challenge_id,team_name,email1,email2,name1,name2
    HACK2024,Team Alpha,alice@example.com,bob@example.com,Alice Johnson,Bob Wilson
    HACK2024,Team Beta,carol@example.com,dave@example.com,Carol Smith,Dave Brown
    ```

2. **Seed the database:**

    ```bash
    pnpm run seed:challenge teams.csv
    ```

    This creates:

    - Users in the database
    - Teams with members
    - `teams_passwords.csv` file

3. **Send passwords via email:**
    ```bash
    pnpm run send:passwords teams_passwords.csv
    ```

## Password Generation Logic

Passwords are generated using this formula:

```
password = "at" + base64(email_username) + "ria"
```

For example:

- Email: `john.doe@example.com`
- Username: `john.doe`
- Base64: `am9obi5kb2U=`
- Password: `atam9obi5kb2U=ria`

## Email Template

The email includes:

- Welcome message with challenge and team information
- Login credentials (email and password)
- Instructions and security reminders
- Responsive HTML design

## Rate Limiting

The email script includes:

- 2-second delay between emails to avoid Gmail rate limits
- Connection verification before sending
- Error handling and retry logic
- Detailed progress reporting

## Troubleshooting

### Common Issues

1. **"Cannot find module 'nodemailer'"**

    ```bash
    pnpm install nodemailer @types/nodemailer
    ```

2. **Gmail authentication errors**

    - Ensure 2FA is enabled
    - Use app password, not regular password
    - Check GMAIL_USER and GMAIL_APP_PASSWORD in .env

3. **Rate limiting errors**

    - The script includes delays, but you can increase them if needed
    - Gmail allows ~100 emails per day for free accounts

4. **CSV parsing errors**
    - Ensure no extra commas in data fields
    - Check file encoding (should be UTF-8)
    - Verify CSV headers match expected format

### Support

For issues with the scripts, check:

1. Console output for specific error messages
2. Gmail security settings
3. Database connection
4. File permissions and paths

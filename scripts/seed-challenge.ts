import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { db, pool } from '@/server/db';
import { users, accounts } from '@/server/db/auth-schema';
import { teams, teamMembers } from '@/server/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

interface CSVRow {
    challenge_id: string;
    team_name: string;
    email1: string;
    email2: string;
    name1: string;
    name2: string;
}

interface UserWithPassword {
    email: string;
    name: string;
    password: string;
    challenge_id: string;
    team_name: string;
}

// Array to store user data for CSV export
const usersWithPasswords: UserWithPassword[] = [];

function parseCSV(csvContent: string): CSVRow[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');

    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row: any = {};

        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
        });

        rows.push(row as CSVRow);
    }

    return rows;
}

async function hashPassword(email: string): Promise<string> {
    // Get the first part of email (before @)
    const emailFirstPart = email.split('@')[0];

    // Base64 encode the first part
    const base64Encoded = Buffer.from(emailFirstPart, 'utf8').toString(
        'base64',
    );

    // Prepend 'at' and append 'ria'
    const passwordString = `at${base64Encoded}ria`;

    // Add the secret as a pepper to the password
    const secret = 'race-cialabs-atria';
    const passwordWithSecret = `${passwordString}${secret}`;

    // Use the same scrypt hashing as Better Auth configuration
    const salt = randomBytes(32);
    const derivedKey = (await scryptAsync(
        passwordWithSecret,
        salt,
        64,
    )) as Buffer;
    return salt.toString('hex') + ':' + derivedKey.toString('hex');
}

async function createUserIfNotExists(
    email: string,
    name: string,
    challengeId: string,
    teamName: string,
): Promise<{ userId: string; password: string }> {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
    });

    // Generate the plain text password to display
    const emailFirstPart = email.split('@')[0];
    const base64Encoded = Buffer.from(emailFirstPart, 'utf8').toString(
        'base64',
    );
    const plainPassword = `at${base64Encoded}ria`;

    if (existingUser) {
        console.log(`User ${email} already exists, using existing user`);
        // Add to CSV data even for existing users
        usersWithPasswords.push({
            email,
            name,
            password: plainPassword,
            challenge_id: challengeId,
            team_name: teamName,
        });
        return { userId: existingUser.id, password: plainPassword };
    }

    const userId = uuidv4();
    const hashedPassword = await hashPassword(email); // Pass email to generate password

    // Create user
    await db.insert(users).values({
        id: userId,
        name: name,
        email: email,
        emailVerified: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Create account with password
    await db.insert(accounts).values({
        id: uuidv4(),
        userId: userId,
        accountId: userId,
        providerId: 'credential',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Add to CSV data
    usersWithPasswords.push({
        email,
        name,
        password: plainPassword,
        challenge_id: challengeId,
        team_name: teamName,
    });

    console.log(
        `Created user: ${email} (${name}) - Password: ${plainPassword}`,
    );
    return { userId, password: plainPassword };
}

async function createTeam(
    challengeId: string,
    teamName: string,
    userIds: string[],
): Promise<string> {
    const teamId = uuidv4();

    // Create team
    await db.insert(teams).values({
        id: teamId,
        challengeId: challengeId,
        name: teamName,
        description: `Team ${teamName} for challenge ${challengeId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // Add team members
    for (const userId of userIds) {
        await db.insert(teamMembers).values({
            id: uuidv4(),
            teamId: teamId,
            userId: userId,
            role: 'member',
            joinedAt: new Date(),
        });
    }

    console.log(`Created team: ${teamName} with ${userIds.length} members`);
    return teamId;
}

function writePasswordsCSV(filename: string) {
    const headers = ['email', 'name', 'password', 'challenge_id', 'team_name'];
    const csvContent = [
        headers.join(','),
        ...usersWithPasswords.map((user) =>
            [
                user.email,
                user.name,
                user.password,
                user.challenge_id,
                user.team_name,
            ].join(','),
        ),
    ].join('\n');

    writeFileSync(filename, csvContent, 'utf-8');
    console.log(`💾 Passwords saved to: ${filename}`);
}

async function main() {
    const csvFilePath = process.argv[2];

    if (!csvFilePath) {
        console.error('Usage: pnpm run seed:challenge <csv-file-path>');
        console.error(
            'CSV format: challenge_id,team_name,email1,email2,name1,name2',
        );
        process.exit(1);
    }

    try {
        console.log('🌱 Starting challenge seeding...');
        console.log(`📄 Reading CSV file: ${csvFilePath}`);

        const csvContent = readFileSync(csvFilePath, 'utf-8');
        const rows = parseCSV(csvContent);

        console.log(`📊 Found ${rows.length} rows to process`);

        for (const row of rows) {
            console.log(
                `\n🏆 Processing challenge: ${row.challenge_id}, team: ${row.team_name}`,
            );

            // Create users
            console.log('👤 Creating/checking users:');
            const user1Data = await createUserIfNotExists(
                row.email1,
                row.name1,
                row.challenge_id,
                row.team_name,
            );
            const user2Data = await createUserIfNotExists(
                row.email2,
                row.name2,
                row.challenge_id,
                row.team_name,
            );

            console.log(`   User 1: ${user1Data.password}`);
            console.log(`   User 2: ${user2Data.password}`);

            // Create team with both users
            await createTeam(row.challenge_id, row.team_name, [
                user1Data.userId,
                user2Data.userId,
            ]);
        }

        // Generate output filename based on input filename
        const outputFilename = csvFilePath.replace(/\.csv$/, '_passwords.csv');
        writePasswordsCSV(outputFilename);

        console.log('\n📋 Password Summary:');
        usersWithPasswords.forEach((user, index) => {
            console.log(
                `${index + 1}. ${user.email} - ${user.password} (${user.team_name})`,
            );
        });

        console.log('\n✅ Challenge seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

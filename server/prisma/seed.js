// server/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // --- Clean up existing data (CORRECTED ORDER) ---
    // 1. Delete all "child" metric records first.
    await prisma.keystrokeMetrics.deleteMany();
    await prisma.idleMetrics.deleteMany();
    await prisma.focusMetrics.deleteMany();
    await prisma.errorMetrics.deleteMany();
    await prisma.taskMetrics.deleteMany();
    await prisma.pasteEvent.deleteMany();

    // 2. Now it's safe to delete the "parent" CodingSession records.
    await prisma.codingSession.deleteMany();

    // 3. Finally, delete the top-level User and Challenge records.
    await prisma.challenge.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('Cleaned up existing data.');


    // --- Create a sample challenge ---
    // ... (the rest of your file remains exactly the same) ...
    const challenge1 = await prisma.challenge.create({
        data: {
            id: 1,
            title: 'Hello World Function',
            description: 'Select a language and write a function that prints "Hello World" to the console.',
            difficulty: 'Easy',
            expectedCompletionTime: 60,
            optimalKeywords: '["function", "return", "console.log", "print"]',
            language: 'javascript'
        },
    });
    console.log(`Created challenge with id: ${challenge1.id}`);


    // --- Create a regular user ---
    const regularUserPassword = await bcrypt.hash('password123', 10);
    const regularUser = await prisma.user.create({
        data: {
            username: 'testuser',
            email: 'user@example.com',
            passwordHash: regularUserPassword,
            role: 'user',
        },
    });
    console.log(`Created regular user: ${regularUser.email}`);


    // --- Create an admin user ---
    const adminPassword = await bcrypt.hash('adminpassword', 10);
    const adminUser = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: adminPassword,
            role: 'admin',
        },
    });
    console.log(`Created admin user: ${adminUser.email}`);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
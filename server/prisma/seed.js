// server/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Create a sample challenge
    const challenge1 = await prisma.challenge.create({
        data: {
            id: 1, // We explicitly set the ID to 1
            title: 'Hello World Function',
            description: 'Write a function that returns the string "Hello, World!".',
            difficulty: 'Easy',
            expectedCompletionTime: 60, // 60 seconds
            optimalKeywords: '["function", "return"]', // Stored as a JSON string
            language: 'javascript'
        },
    });

    console.log(`Created challenge with id: ${challenge1.id}`);
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
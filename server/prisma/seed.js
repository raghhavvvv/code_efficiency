// server/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Clean up existing challenges to avoid conflicts on re-seeding
    await prisma.challenge.deleteMany({});
    console.log('Deleted old challenges.');

    const challenges = [
        {
            id: 1,
            title: 'Hello World',
            description: 'Write a function that returns the string "Hello, World!".',
            difficulty: 'Easy',
            expectedCompletionTime: 60,
            optimalKeywords: '["function", "return"]',
            language: 'javascript'
        },
        {
            id: 2,
            title: 'Sum of Two Numbers',
            description: 'Create a function that takes two numbers as arguments and returns their sum.',
            difficulty: 'Easy',
            expectedCompletionTime: 120,
            optimalKeywords: '["function", "return", "+"]',
            language: 'python'
        },
        {
            id: 3,
            title: 'Reverse a String',
            description: 'Write a function that takes a string and returns it in reverse order.',
            difficulty: 'Medium',
            expectedCompletionTime: 300,
            optimalKeywords: '["split", "reverse", "join", "loop"]',
            language: 'javascript'
        },
        {
            id: 4,
            title: 'Check for Palindrome',
            description: 'Create a function that checks if a given string is a palindrome (reads the same forwards and backwards). Ignore case and non-alphanumeric characters.',
            difficulty: 'Medium',
            expectedCompletionTime: 480,
            optimalKeywords: '["regex", "replace", "toLowerCase", "reverse"]',
            language: 'python'
        },
        {
            id: 5,
            title: 'FizzBuzz',
            description: 'Write a program that prints the numbers from 1 to 100. For multiples of three print “Fizz” instead of the number and for the multiples of five print “Buzz”. For numbers which are multiples of both three and five print “FizzBuzz”.',
            difficulty: 'Easy',
            expectedCompletionTime: 360,
            optimalKeywords: '["for", "if", "%", "console.log"]',
            language: 'javascript'
        }
    ];

    for (const challenge of challenges) {
        await prisma.challenge.create({
            data: challenge,
        });
    }

    console.log(`Seeded ${challenges.length} challenges.`);
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
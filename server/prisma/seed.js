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

    // --- Create sample challenges ---
    const challenge1 = await prisma.challenge.create({
        data: {
            title: 'Hello World Function',
            description: 'Select a language and write a function that prints "Hello World" to the console.',
            difficulty: 'Easy',
            expectedCompletionTime: 60,
            optimalKeywords: '["function", "return", "console.log", "print"]',
            language: 'javascript'
        },
    });

    const challenge2 = await prisma.challenge.create({
        data: {
            title: 'Array Sum Calculator',
            description: 'Write a function that takes an array of numbers and returns their sum.',
            difficulty: 'Easy',
            expectedCompletionTime: 120,
            optimalKeywords: '["function", "array", "sum", "reduce", "for", "loop"]',
            language: 'javascript'
        },
    });

    const challenge3 = await prisma.challenge.create({
        data: {
            title: 'Fibonacci Sequence',
            description: 'Implement a function that generates the first n numbers of the Fibonacci sequence.',
            difficulty: 'Medium',
            expectedCompletionTime: 300,
            optimalKeywords: '["function", "fibonacci", "recursion", "loop", "array"]',
            language: 'javascript'
        },
    });

    const challenge4 = await prisma.challenge.create({
        data: {
            title: 'Palindrome Checker',
            description: 'Write a function that checks if a given string is a palindrome (reads the same forwards and backwards).',
            difficulty: 'Easy',
            expectedCompletionTime: 180,
            optimalKeywords: '["function", "string", "reverse", "toLowerCase", "replace"]',
            language: 'javascript'
        },
    });

    const challenge5 = await prisma.challenge.create({
        data: {
            title: 'Two Sum Problem',
            description: 'Given an array of integers and a target sum, return indices of two numbers that add up to the target.',
            difficulty: 'Medium',
            expectedCompletionTime: 360,
            optimalKeywords: '["function", "array", "map", "indexOf", "for", "target"]',
            language: 'javascript'
        },
    });

    const challenge6 = await prisma.challenge.create({
        data: {
            title: 'Binary Search',
            description: 'Implement binary search algorithm to find a target value in a sorted array.',
            difficulty: 'Medium',
            expectedCompletionTime: 420,
            optimalKeywords: '["function", "array", "while", "mid", "left", "right"]',
            language: 'javascript'
        },
    });

    const challenge7 = await prisma.challenge.create({
        data: {
            title: 'Prime Number Checker',
            description: 'Write a function that determines if a given number is prime.',
            difficulty: 'Easy',
            expectedCompletionTime: 240,
            optimalKeywords: '["function", "for", "sqrt", "modulo", "return"]',
            language: 'python'
        },
    });

    const challenge8 = await prisma.challenge.create({
        data: {
            title: 'Merge Sort Algorithm',
            description: 'Implement the merge sort algorithm to sort an array of integers.',
            difficulty: 'Hard',
            expectedCompletionTime: 600,
            optimalKeywords: '["function", "array", "merge", "divide", "conquer", "recursion"]',
            language: 'python'
        },
    });

    const challenge9 = await prisma.challenge.create({
        data: {
            title: 'Reverse Linked List',
            description: 'Given the head of a singly linked list, reverse the list and return the new head.',
            difficulty: 'Medium',
            expectedCompletionTime: 480,
            optimalKeywords: '["class", "ListNode", "prev", "current", "next", "while"]',
            language: 'java'
        },
    });

    const challenge10 = await prisma.challenge.create({
        data: {
            title: 'Valid Parentheses',
            description: 'Given a string containing just characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
            difficulty: 'Easy',
            expectedCompletionTime: 300,
            optimalKeywords: '["stack", "push", "pop", "map", "for", "return"]',
            language: 'cpp'
        },
    });

    const challenge11 = await prisma.challenge.create({
        data: {
            title: 'Longest Common Subsequence',
            description: 'Find the length of the longest common subsequence between two strings using dynamic programming.',
            difficulty: 'Hard',
            expectedCompletionTime: 720,
            optimalKeywords: '["dp", "matrix", "for", "if", "max", "return"]',
            language: 'cpp'
        },
    });

    const challenge12 = await prisma.challenge.create({
        data: {
            title: 'Word Count',
            description: 'Write a program that counts the frequency of each word in a given text.',
            difficulty: 'Easy',
            expectedCompletionTime: 200,
            optimalKeywords: '["map", "strings", "Split", "for", "range"]',
            language: 'go'
        },
    });

    console.log(`Created ${12} challenges`);

    // --- Create an admin user ---
    const adminPassword = await bcrypt.hash('adminpassword', 10);
    const adminUser = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: adminPassword,
            role: 'admin',
            netScore: 95.5
        },
    });
    console.log(`Created admin user: ${adminUser.email}`);

    // --- Create 3 regular users ---
    const user1Password = await bcrypt.hash('password123', 10);
    const user1 = await prisma.user.create({
        data: {
            username: 'john_doe',
            email: 'john@example.com',
            passwordHash: user1Password,
            role: 'user',
            netScore: 87.3
        },
    });

    const user2Password = await bcrypt.hash('password123', 10);
    const user2 = await prisma.user.create({
        data: {
            username: 'jane_smith',
            email: 'jane@example.com',
            passwordHash: user2Password,
            role: 'user',
            netScore: 92.1
        },
    });

    const user3Password = await bcrypt.hash('password123', 10);
    const user3 = await prisma.user.create({
        data: {
            username: 'bob_wilson',
            email: 'bob@example.com',
            passwordHash: user3Password,
            role: 'user',
            netScore: 78.9
        },
    });

    console.log(`Created 3 regular users: ${user1.email}, ${user2.email}, ${user3.email}`);

    // --- Create sample coding sessions with metrics ---
    
    // Session 1 - John's Hello World attempt
    const session1 = await prisma.codingSession.create({
        data: {
            userId: user1.id,
            challengeId: challenge1.id,
            codeSubmitted: 'function helloWorld() {\n  console.log("Hello World");\n}',
            netScore: 85.0,
            endTime: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        }
    });

    await prisma.keystrokeMetrics.create({
        data: {
            sessionId: session1.id,
            keystrokeCount: 45,
            backspaceCount: 3,
            typingSpeed: 65.5,
            keystrokeLog: JSON.stringify([{timestamp: Date.now(), key: 'f'}, {timestamp: Date.now() + 100, key: 'u'}]),
            efficiencyScore: 88.2
        }
    });

    await prisma.errorMetrics.create({
        data: {
            sessionId: session1.id,
            errorFrequency: 2,
            repeatedErrors: 0,
            avgTimeToFix: 15.5,
            errorLog: JSON.stringify([{type: 'syntax', line: 2, fixed: true}]),
            efficiencyScore: 92.0
        }
    });

    await prisma.focusMetrics.create({
        data: {
            sessionId: session1.id,
            totalFocusTime: 55,
            contextSwitches: 2,
            efficiencyScore: 89.5
        }
    });

    // Session 2 - Jane's Array Sum attempt
    const session2 = await prisma.codingSession.create({
        data: {
            userId: user2.id,
            challengeId: challenge2.id,
            codeSubmitted: 'function arraySum(arr) {\n  return arr.reduce((sum, num) => sum + num, 0);\n}',
            netScore: 94.5,
            endTime: new Date(Date.now() - 1000 * 60 * 60 * 1) // 1 hour ago
        }
    });

    await prisma.keystrokeMetrics.create({
        data: {
            sessionId: session2.id,
            keystrokeCount: 68,
            backspaceCount: 1,
            typingSpeed: 78.3,
            keystrokeLog: JSON.stringify([{timestamp: Date.now(), key: 'f'}, {timestamp: Date.now() + 80, key: 'u'}]),
            efficiencyScore: 95.1
        }
    });

    await prisma.errorMetrics.create({
        data: {
            sessionId: session2.id,
            errorFrequency: 1,
            repeatedErrors: 0,
            avgTimeToFix: 8.2,
            errorLog: JSON.stringify([{type: 'typo', line: 2, fixed: true}]),
            efficiencyScore: 96.8
        }
    });

    await prisma.idleMetrics.create({
        data: {
            sessionId: session2.id,
            totalIdleTime: 12,
            idlePeriods: JSON.stringify([{start: Date.now(), duration: 12000}]),
            efficiencyScore: 91.3
        }
    });

    // Session 3 - Bob's Fibonacci attempt (incomplete)
    const session3 = await prisma.codingSession.create({
        data: {
            userId: user3.id,
            challengeId: challenge3.id,
            codeSubmitted: 'function fibonacci(n) {\n  // TODO: implement\n}',
            netScore: 45.2,
            endTime: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        }
    });

    await prisma.keystrokeMetrics.create({
        data: {
            sessionId: session3.id,
            keystrokeCount: 32,
            backspaceCount: 8,
            typingSpeed: 42.1,
            keystrokeLog: JSON.stringify([{timestamp: Date.now(), key: 'f'}, {timestamp: Date.now() + 150, key: 'u'}]),
            efficiencyScore: 65.4
        }
    });

    await prisma.taskMetrics.create({
        data: {
            sessionId: session3.id,
            completionTime: 180,
            timeRatio: 0.6,
            keywordMatching: 0.2,
            efficiencyScore: 48.7
        }
    });

    console.log('Created sample coding sessions with metrics');

    console.log('Seeding finished.');
    console.log('\n=== CREATED USERS ===');
    console.log('Admin: admin@example.com / adminpassword');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');
    console.log('User 3: bob@example.com / password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
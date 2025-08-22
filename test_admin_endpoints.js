// test_admin_endpoints.js
// Simple test script to verify admin endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// You'll need to replace this with a valid admin JWT token
const ADMIN_TOKEN = 'your_admin_jwt_token_here';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function testEndpoints() {
    console.log('🧪 Testing Admin Reporting Endpoints...\n');

    try {
        // Test 1: Metrics Summary
        console.log('1️⃣ Testing /admin/metrics/summary');
        const summaryResponse = await api.get('/admin/metrics/summary');
        console.log('✅ Metrics Summary:', {
            totalStudents: summaryResponse.data.totalStudents,
            totalSessions: summaryResponse.data.totalSessions,
            avgTypingSpeed: summaryResponse.data.metrics.typingSpeed.avg
        });

        // Test 2: Student Filtering - Top typing speed performers
        console.log('\n2️⃣ Testing /admin/students/filter - Top Typing Speed');
        const typingSpeedResponse = await api.get('/admin/students/filter', {
            params: {
                metric: 'typingSpeed',
                order: 'desc',
                limit: 5,
                minSessions: 1
            }
        });
        console.log('✅ Top 5 Typing Speed Performers:');
        typingSpeedResponse.data.results.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.username}: ${student.metricValue} WPM`);
        });

        // Test 3: Student Filtering - Lowest error rate
        console.log('\n3️⃣ Testing /admin/students/filter - Lowest Error Rate');
        const errorRateResponse = await api.get('/admin/students/filter', {
            params: {
                metric: 'errorRate',
                order: 'asc',
                limit: 5,
                minSessions: 1
            }
        });
        console.log('✅ Top 5 Students with Lowest Error Rate:');
        errorRateResponse.data.results.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.username}: ${student.metricValue} errors`);
        });

        // Test 4: Export functionality (JSON)
        console.log('\n4️⃣ Testing /admin/students/export - JSON format');
        const exportResponse = await api.get('/admin/students/export', {
            params: { format: 'json' }
        });
        console.log(`✅ Export successful: ${exportResponse.data.length} students exported`);
        
        // Show sample of first student data
        if (exportResponse.data.length > 0) {
            const sampleStudent = exportResponse.data[0];
            console.log('   Sample student data:', {
                username: sampleStudent.username,
                avgTypingSpeed: sampleStudent.avgTypingSpeed,
                avgErrorRate: sampleStudent.avgErrorRate,
                sessionCount: sampleStudent.sessionCount
            });
        }

        console.log('\n🎉 All tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n💡 Tip: Make sure to replace ADMIN_TOKEN with a valid admin JWT token');
        }
    }
}

// Example usage scenarios
function printUsageExamples() {
    console.log('\n📋 Usage Examples:');
    console.log('');
    console.log('1. Find top 10 fastest typists:');
    console.log('   GET /admin/students/filter?metric=typingSpeed&order=desc&limit=10');
    console.log('');
    console.log('2. Find students with least errors:');
    console.log('   GET /admin/students/filter?metric=errorRate&order=asc&limit=10');
    console.log('');
    console.log('3. Export all student data as CSV:');
    console.log('   GET /admin/students/export?format=csv');
    console.log('');
    console.log('4. Get performance summary:');
    console.log('   GET /admin/metrics/summary');
    console.log('');
}

if (require.main === module) {
    if (ADMIN_TOKEN === 'your_admin_jwt_token_here') {
        console.log('⚠️  Please update ADMIN_TOKEN with a valid admin JWT token before running tests');
        printUsageExamples();
    } else {
        testEndpoints();
    }
}

module.exports = { testEndpoints, printUsageExamples };

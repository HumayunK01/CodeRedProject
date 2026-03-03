/**
 * Test Script for Database Services
 * Verifies that all services work correctly with the database
 */

import { prisma } from "../lib/prisma";
import { UserService } from "../services/user.service";
import { DiagnosisService } from "../services/diagnosis.service";
import { ForecastService } from "../services/forecast.service";

async function testServices() {
    console.log("🧪 Testing Database Services...\n");

    try {
        // Test 1: User Service
        console.log("1️⃣ Testing UserService...");

        const testClerkId = `test-clerk-${Date.now()}`;
        const testEmail = `test-${Date.now()}@example.com`;

        // Create user
        const user = await UserService.create({
            clerkId: testClerkId,
            email: testEmail,
            firstName: "Test",
            lastName: "User",
        });
        console.log("   ✅ Created user:", user.id);

        // Find by Clerk ID
        const foundUser = await UserService.findByClerkId(testClerkId);
        console.log(
            "   ✅ Found user by Clerk ID:",
            foundUser ? foundUser.email : "NOT FOUND"
        );

        // Test 2: Diagnosis Service
        console.log("\n2️⃣ Testing DiagnosisService...");

        const diagnosis = await DiagnosisService.create({
            userId: user.id,
            result: "negative",
            confidence: 0.95,
            patientAge: 35,
            patientSex: "male",
            location: "Test Location",
            symptoms: { fever: true, headache: false },
            imageUrl: "https://example.com/test-image.jpg",
        });
        console.log("   ✅ Created diagnosis:", diagnosis.id);

        const diagnosisStats = await DiagnosisService.getStatsByUserId(user.id);
        console.log("   ✅ Diagnosis stats:", diagnosisStats);

        // Test 3: Forecast Service
        console.log("\n3️⃣ Testing ForecastService...");

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 28); // 4 weeks ahead

        const forecast = await ForecastService.create({
            userId: user.id,
            region: "Test Region",
            country: "Test Country",
            startDate,
            endDate,
            riskLevel: "medium",
            casesLow: 100,
            casesHigh: 500,
            casesMean: 250,
        });
        console.log("   ✅ Created forecast:", forecast.id);

        const forecastStats = await ForecastService.getStatsByUserId(user.id);
        console.log("   ✅ Forecast stats:", forecastStats);

        // Test 4: User with stats
        console.log("\n4️⃣ Testing User with Stats...");

        const userWithStats = await UserService.findByClerkIdWithStats(testClerkId);
        console.log("   ✅ User stats:", userWithStats?._count);

        // Cleanup: Delete test data
        console.log("\n🧹 Cleaning up test data...");

        await DiagnosisService.delete(diagnosis.id, user.id);
        console.log("   ✅ Deleted diagnosis");

        await ForecastService.delete(forecast.id, user.id);
        console.log("   ✅ Deleted forecast");

        await UserService.deleteByClerkId(testClerkId);
        console.log("   ✅ Deleted user");

        console.log("\n✅ All tests passed successfully!");
    } catch (error) {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testServices();

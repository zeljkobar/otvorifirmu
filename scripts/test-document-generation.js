/**
 * Test skripta za generisanje dokumenata
 * 
 * Kako koristiti:
 * 1. Kreiraj test company request sa: npm run create-test-company
 * 2. Pokreni: node scripts/test-document-generation.js <requestId>
 */

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function testDocumentGeneration(requestId) {
  console.log(`\n🔍 Testing document generation for request ${requestId}...\n`);

  try {
    const response = await fetch(
      `${baseUrl}/api/company-request/${requestId}/generate-documents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Document generation successful!");
      console.log("\nGenerated document:");
      console.log(`  - File: ${data.document.fileName}`);
      console.log(`  - Size: ${(data.document.fileSize / 1024).toFixed(2)} KB`);
      console.log(`  - Download URL: ${data.document.fileUrl}`);
      console.log(`\n📥 Download at: ${baseUrl}${data.document.fileUrl}`);
    } else {
      console.error("❌ Error:", data.error);
      if (data.details) {
        console.error("   Details:", data.details);
      }
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

const requestId = process.argv[2];

if (!requestId) {
  console.error("Usage: node scripts/test-document-generation.js <requestId>");
  process.exit(1);
}

testDocumentGeneration(requestId);

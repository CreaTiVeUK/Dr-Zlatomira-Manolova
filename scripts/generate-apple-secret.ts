import { SignJWT } from "jose";
import fs from "fs";
import path from "path";

/**
 * Usage: 
 * 1. Place your .p8 file in the project root or provide absolute path.
 * 2. Run: npx tsx scripts/generate-apple-secret.ts <team_id> <key_id> <client_id> <path_to_p8_file>
 * 
 * Arguments:
 * - team_id: Your 10-character Team ID (from Apple Developer Account membership details).
 * - key_id: The 10-character Key ID of the .p8 key.
 * - client_id: The "Service ID" (bundle identifier) you created for the app (e.g., com.example.app.service).
 * - path_to_p8_file: Path to the downloaded AuthKey_XXXXXXXXXX.p8 file.
 */

const args = process.argv.slice(2);

if (args.length !== 4) {
    console.error("Usage: npx tsx scripts/generate-apple-secret.ts <team_id> <key_id> <client_id> <path_to_p8_file>");
    process.exit(1);
}

const [team_id, key_id, client_id, p8_path] = args;

async function generateSecret() {
    try {
        const privateKey = fs.readFileSync(path.resolve(p8_path), "utf8");

        const secret = await new SignJWT({})
            .setProtectedHeader({ alg: "ES256", kid: key_id })
            .setIssuer(team_id)
            .setIssuedAt()
            .setExpirationTime("6mo") // Valid for 6 months (max allowed by Apple)
            .setAudience("https://appleid.apple.com")
            .setSubject(client_id)
            .sign(await importPKCS8(privateKey, "ES256"));

        console.log("\n✅ Generated Apple Client Secret (Valid for 6 months):");
        console.log("---------------------------------------------------");
        console.log(secret);
        console.log("---------------------------------------------------");
        console.log("\nPaste this into your .env file as AUTH_APPLE_SECRET");

    } catch (error) {
        console.error("Error generating secret:", error);
    }
}

// Helper to import key using jose (built-in node imports can vary by version)
import { importPKCS8 } from "jose";

generateSecret();

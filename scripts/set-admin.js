const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load service account key from the root directory
const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("\x1b[31mError: serviceAccountKey.json not found at the project root!\x1b[0m");
  console.log("\nPlease download your Firebase Admin service account key:");
  console.log("1. Go to Firebase Console > Project Settings > Service Accounts.");
  console.log("2. Click 'Generate New Private Key' and download the JSON file.");
  console.log("3. Save it as 'serviceAccountKey.json' in the root directory of this project.");
  console.log("4. Then run: node scripts/set-admin.js <user-email>\n");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];

if (!email) {
  console.error("\x1b[31mError: Please provide a target user email address!\x1b[0m");
  console.log("\nUsage: node scripts/set-admin.js <user-email>");
  console.log("Example: node scripts/set-admin.js admin@example.com\n");
  process.exit(1);
}

async function setAdminRole() {
  try {
    console.log(`\nSearching for user with email: ${email}...`);
    const user = await admin.auth().getUserByEmail(email);
    
    console.log(`User found! UID: \x1b[36m${user.uid}\x1b[0m`);
    console.log("Setting Custom Claims: \x1b[33m{ role: 'admin' }\x1b[0m...");
    
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    
    console.log("\x1b[32mCustom claims updated successfully!\x1b[0m");
    
    // Verify the claims were applied
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log("Verified claims in Firebase Auth:", updatedUser.customClaims);
    console.log(`\n\x1b[32m✔ Success! ${email} has been promoted to Admin in Firebase Auth.\x1b[0m`);
    console.log("Ask the user to log out and log back in (or force-refresh their authentication token) for the role to apply.\n");
    process.exit(0);
  } catch (error) {
    console.error("\n\x1b[31mFailed to promote user to Admin:\x1b[0m", error.message);
    console.log("Make sure this user is already registered in your Firebase Authentication database first!\n");
    process.exit(1);
  }
}

setAdminRole();

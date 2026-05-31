const { GoogleAuth } = require("google-auth-library");
const path = require("path");
const fs = require("fs");
const https = require("https");

const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: serviceAccountKey.json not found at the project root!");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
const projectId = serviceAccount.project_id;
const androidPackageName = "com.nutriai.app";

const sha1Fingerprint = "92:85:EA:BA:D6:25:6C:79:FD:A8:C0:D1:93:6E:2D:E8:75:38:F3:17";
const sha256Fingerprint = "1E:0E:1E:C7:78:04:A4:8F:7B:06:A8:BA:24:E3:FE:F9:BD:39:43:C4:22:C3:12:E0:90:EB:27:DD:6B:DF:07:BE";

async function run() {
  try {
    console.log("Authenticating service account...");
    const auth = new GoogleAuth({
      keyFilename: serviceAccountPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    
    const client = await auth.getClient();
    const headers = await client.getRequestHeaders();
    const token = headers.Authorization;

    console.log(`\nConnecting to Firebase Management API for project: \x1b[36m${projectId}\x1b[0m...\n`);

    // 1. Fetch Android Apps
    console.log("Fetching registered Android Apps...");
    const androidAppsRes = await makeRequest(
      `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps`,
      "GET",
      token
    );
    
    let androidApp = null;
    if (androidAppsRes.apps && androidAppsRes.apps.length > 0) {
      androidApp = androidAppsRes.apps.find(app => app.packageName === androidPackageName);
    }
    
    if (!androidApp) {
      console.error(`\x1b[31mError: Android App with package '${androidPackageName}' is not registered!\x1b[0m`);
      console.log("Please run setup-firebase-apps.js first to register the app.");
      process.exit(1);
    }
    
    const appId = androidApp.appId;
    console.log(`Found Android App: \x1b[33m${androidPackageName}\x1b[0m (App ID: ${appId})`);

    // 2. Fetch existing SHA fingerprints
    console.log("\nChecking existing SHA certificates registered on Firebase...");
    const existingShaRes = await makeRequest(
      `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps/${appId}/sha`,
      "GET",
      token
    );
    
    const existingShaHashes = (existingShaRes.certificates || []).map(cert => cert.shaHash.toUpperCase());
    console.log("Registered certificates:", existingShaHashes);

    // 3. Upload SHA-1 if not exists
    if (existingShaHashes.includes(sha1Fingerprint.toUpperCase())) {
      console.log(`\x1b[32m✔ SHA-1 fingerprint is already registered in Firebase.\x1b[0m`);
    } else {
      console.log(`Uploading SHA-1 fingerprint: ${sha1Fingerprint}...`);
      try {
        await makeRequest(
          `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps/${appId}/sha`,
          "POST",
          token,
          {
            shaHash: sha1Fingerprint,
            certType: "SHA_1"
          }
        );
        console.log(`\x1b[32m✔ SHA-1 fingerprint registered successfully!\x1b[0m`);
      } catch (e) {
        console.error(`\x1b[31mFailed to upload SHA-1 fingerprint:\x1b[0m`, e.message);
      }
    }

    // 4. Upload SHA-256 if not exists
    if (existingShaHashes.includes(sha256Fingerprint.toUpperCase())) {
      console.log(`\x1b[32m✔ SHA-256 fingerprint is already registered in Firebase.\x1b[0m`);
    } else {
      console.log(`Uploading SHA-256 fingerprint: ${sha256Fingerprint}...`);
      try {
        await makeRequest(
          `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps/${appId}/sha`,
          "POST",
          token,
          {
            shaHash: sha256Fingerprint,
            certType: "SHA_256"
          }
        );
        console.log(`\x1b[32m✔ SHA-256 fingerprint registered successfully!\x1b[0m`);
      } catch (e) {
        console.error(`\x1b[31mFailed to upload SHA-256 fingerprint:\x1b[0m`, e.message);
      }
    }

    // 5. Re-download google-services.json with new keys
    console.log(`\nRe-downloading the updated google-services.json...`);
    const configRes = await makeRequest(
      `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps/${appId}/config`,
      "GET",
      token
    );
    
    if (configRes.configFileContents) {
      const buffer = Buffer.from(configRes.configFileContents, 'base64');
      const decoded = buffer.toString('utf-8');
      const googleServicesJson = JSON.parse(decoded);
      console.log("\x1b[32m✔ Successfully retrieved updated google-services.json!\x1b[0m");
      
      const androidAppDir = path.join(__dirname, "../android/app");
      if (fs.existsSync(androidAppDir)) {
        const androidAppPath = path.join(androidAppDir, "google-services.json");
        fs.writeFileSync(androidAppPath, JSON.stringify(googleServicesJson, null, 2));
        console.log(`\x1b[32m✔ Updated and saved google-services.json to android/app/google-services.json!\x1b[0m`);
      }
      
      // Parse Client IDs to ensure it got generated
      console.log("\n==========================================================================");
      console.log("             NEWLY GENERATED AND REGISTERED CLIENT OAUTH CLIENT IDS");
      console.log("==========================================================================");
      const clients = googleServicesJson.client || [];
      clients.forEach(c => {
        const clientInfo = c.client_info || {};
        const oauthClients = c.oauth_client || [];
        console.log(`\nClient Package: \x1b[35m${clientInfo.android_client_info?.package_name || 'unknown'}\x1b[0m`);
        
        oauthClients.forEach(oc => {
          let typeStr = "Unknown";
          if (oc.client_type === 1) typeStr = "Android App Client ID (1) -- [GENERATED FOR THIS DEVICE]";
          if (oc.client_type === 3) typeStr = "Web OAuth Client ID (3) -- [REQUIRED FOR WEB FALLBACK]";
          console.log(`  - \x1b[1mType\x1b[0m: ${typeStr}`);
          console.log(`    \x1b[32mClient ID\x1b[0m: \x1b[36m${oc.client_id}\x1b[0m`);
        });
      });
      console.log("==========================================================================\n");
    }

  } catch (error) {
    console.error("\x1b[31mAn error occurred during execution:\x1b[0m", error);
  }
}

function makeRequest(url, method, authorizationHeader, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Authorization': authorizationHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error (${res.statusCode}): ${parsed.error?.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

run();

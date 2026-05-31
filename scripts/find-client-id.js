const { GoogleAuth } = require("google-auth-library");
const path = require("path");
const fs = require("fs");
const https = require("https");

const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: serviceAccountKey.json not found at the project root!");
  console.log("Please make sure you have serviceAccountKey.json in the project root.");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
const projectId = serviceAccount.project_id;

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
    let androidApps;
    try {
      androidApps = await makeRequest(
        `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps`,
        token
      );
      console.log("Raw Android Apps API Response:", JSON.stringify(androidApps, null, 2));
    } catch (e) {
      console.error("\x1b[31mError fetching Android Apps from Firebase:\x1b[0m", e.message);
      console.log("Please ensure the Firebase Management API is enabled in your Google Cloud Console for project: " + projectId);
      process.exit(1);
    }
    
    let googleServicesJson = null;
    
    if (androidApps.apps && androidApps.apps.length > 0) {
      const firstAndroidApp = androidApps.apps[0];
      const appId = firstAndroidApp.appId;
      console.log(`Found Android App: \x1b[33m${firstAndroidApp.packageName}\x1b[0m (App ID: ${appId})`);
      console.log(`Fetching google-services.json configuration...`);
      
      const configRes = await makeRequest(
        `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps/${appId}/config`,
        token
      );
      
      if (configRes.configFileContents) {
        const buffer = Buffer.from(configRes.configFileContents, 'base64');
        const decoded = buffer.toString('utf-8');
        googleServicesJson = JSON.parse(decoded);
        console.log("\x1b[32m✔ Successfully retrieved google-services.json content!\x1b[0m");
        
        // Ensure android/app directory exists
        const androidAppDir = path.join(__dirname, "../android/app");
        if (fs.existsSync(androidAppDir)) {
          const androidAppPath = path.join(androidAppDir, "google-services.json");
          fs.writeFileSync(androidAppPath, JSON.stringify(googleServicesJson, null, 2));
          console.log(`\x1b[32m✔ Saved google-services.json to android/app/google-services.json!\x1b[0m`);
        } else {
          console.log("\x1b[33mWarning: android/app directory not found. Skipping saving google-services.json file.\x1b[0m");
        }
      }
    } else {
      console.log("\x1b[33mNo Android Apps found in this Firebase project.\x1b[0m");
    }
    
    // 2. Fetch Web Apps
    let webApps;
    try {
      webApps = await makeRequest(
        `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
        token
      );
      console.log("Raw Web Apps API Response:", JSON.stringify(webApps, null, 2));
    } catch (e) {
      console.log("\x1b[33mWarning: Could not fetch Web Apps details:\x1b[0m", e.message);
    }
    
    let firebaseWebConfig = null;
    if (webApps && webApps.apps && webApps.apps.length > 0) {
      const firstWebApp = webApps.apps[0];
      const appId = firstWebApp.appId;
      console.log(`\nFound Web App: \x1b[33m${firstWebApp.displayName || 'Unnamed'}\x1b[0m (App ID: ${appId})`);
      console.log(`Fetching Web app configuration parameters...`);
      
      try {
        const configRes = await makeRequest(
          `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${appId}/config`,
          token
        );
        firebaseWebConfig = configRes;
        console.log("\x1b[32m✔ Successfully retrieved Web App config!\x1b[0m");
      } catch (e) {
        console.log("\x1b[33mWarning: Could not retrieve Web App configuration details:\x1b[0m", e.message);
      }
    }
    
    // Parse and present findings
    let foundWebClientId = null;
    
    if (googleServicesJson) {
      console.log("\n==========================================================================");
      console.log("                    EXTRACTED CLIENT OAUTH CLIENT IDS");
      console.log("==========================================================================");
      
      const clients = googleServicesJson.client || [];
      clients.forEach(c => {
        const clientInfo = c.client_info || {};
        const oauthClients = c.oauth_client || [];
        console.log(`\nClient Package: \x1b[35m${clientInfo.android_client_info?.package_name || 'unknown'}\x1b[0m`);
        
        oauthClients.forEach(oc => {
          let typeStr = "Unknown";
          if (oc.client_type === 1) typeStr = "Android App Client ID (1)";
          if (oc.client_type === 3) {
            typeStr = "Web OAuth Client ID (3) -- [REQUIRED FOR AUTH CONFIG]";
            foundWebClientId = oc.client_id;
          }
          console.log(`  - \x1b[1mType\x1b[0m: ${typeStr}`);
          console.log(`    \x1b[32mClient ID\x1b[0m: \x1b[36m${oc.client_id}\x1b[0m`);
        });
      });
      console.log("==========================================================================\n");
    }
    
    if (foundWebClientId) {
      console.log(`\x1b[32;1mFOUND YOUR WEB CLIENT ID:\x1b[0m`);
      console.log(`\x1b[36;1m${foundWebClientId}\x1b[0m\n`);
      
      // Let's create or update the .env file!
      const envPath = path.join(__dirname, "../.env");
      const envLocalPath = path.join(__dirname, "../.env.local");
      
      // We will prepare the .env content
      let apiConfig = firebaseWebConfig || {};
      
      const newEnvContent = `# Firebase Credentials (retrieved via service account)
NEXT_PUBLIC_FIREBASE_API_KEY=${apiConfig.apiKey || 'your_firebase_api_key'}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${apiConfig.authDomain || projectId + '.firebaseapp.com'}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${apiConfig.storageBucket || projectId + '.appspot.com'}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${apiConfig.messagingSenderId || 'your_messaging_sender_id'}
NEXT_PUBLIC_FIREBASE_APP_ID=${apiConfig.appId || 'your_firebase_app_id'}
NEXT_PUBLIC_FIREBASE_WEB_CLIENT_ID=${foundWebClientId}

# AI Engine Credentials
GEMINI_API_KEY=
OPENAI_API_KEY=

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;
      
      fs.writeFileSync(envLocalPath, newEnvContent);
      console.log(`\x1b[32m✔ Created/Updated .env.local with live retrieved credentials!\x1b[0m`);
      
      // Also write to .env if not exists
      if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, newEnvContent);
        console.log(`\x1b[32m✔ Created .env file with live retrieved credentials!\x1b[0m`);
      }
    } else {
      console.log("\x1b[31;1mCould not locate Web OAuth Client ID (type 3) in the Firebase config.\x1b[0m");
      console.log("Please ensure you have configured a Web OAuth Client ID in your Google Cloud / Firebase console credentials.");
    }
    
  } catch (error) {
    console.error("\x1b[31mAn error occurred during execution:\x1b[0m", error);
  }
}

function makeRequest(url, authorizationHeader) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': authorizationHeader,
        'Accept': 'application/json'
      }
    };
    
    https.get(url, options, (res) => {
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
    }).on('error', (err) => {
      reject(err);
    });
  });
}

run();

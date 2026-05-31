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
const webAppDisplayName = "ZenLog Web App";

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

    // 1. Check if Android App exists
    console.log("Checking registered Android Apps...");
    let androidAppsRes = await makeRequest(
      `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps`,
      "GET",
      token
    );
    
    let androidApp = null;
    if (androidAppsRes.apps && androidAppsRes.apps.length > 0) {
      androidApp = androidAppsRes.apps.find(app => app.packageName === androidPackageName);
    }
    
    if (androidApp) {
      console.log(`\x1b[32m✔ Android App with package '${androidPackageName}' is already registered.\x1b[0m`);
    } else {
      console.log(`Android App with package '${androidPackageName}' not found. Registering it now...`);
      const createAppOp = await makeRequest(
        `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps`,
        "POST",
        token,
        {
          packageName: androidPackageName,
          displayName: "ZenLog Android App"
        }
      );
      
      console.log(`Provisioning app (Operation: ${createAppOp.name}). Waiting...`);
      await waitForOperation(createAppOp.name, token);
      console.log(`\x1b[32m✔ Android App registered successfully!\x1b[0m`);
      
      // Refresh apps list
      androidAppsRes = await makeRequest(
        `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps`,
        "GET",
        token
      );
      androidApp = androidAppsRes.apps.find(app => app.packageName === androidPackageName);
    }

    // 2. Check if Web App exists
    console.log("\nChecking registered Web Apps...");
    let webAppsRes = await makeRequest(
      `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
      "GET",
      token
    );
    
    let webApp = null;
    if (webAppsRes.apps && webAppsRes.apps.length > 0) {
      webApp = webAppsRes.apps.find(app => app.displayName === webAppDisplayName);
      // If not matching by name, just take the first web app if any exists
      if (!webApp) {
        webApp = webAppsRes.apps[0];
      }
    }
    
    if (webApp) {
      console.log(`\x1b[32m✔ Web App '${webApp.displayName}' is already registered.\x1b[0m`);
    } else {
      console.log(`Web App '${webAppDisplayName}' not found. Registering it now...`);
      const createAppOp = await makeRequest(
        `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
        "POST",
        token,
        {
          displayName: webAppDisplayName
        }
      );
      
      console.log(`Provisioning web app (Operation: ${createAppOp.name}). Waiting...`);
      await waitForOperation(createAppOp.name, token);
      console.log(`\x1b[32m✔ Web App registered successfully!\x1b[0m`);
      
      // Refresh web apps list
      webAppsRes = await makeRequest(
        `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
        "GET",
        token
      );
      webApp = webAppsRes.apps.find(app => app.displayName === webAppDisplayName) || webAppsRes.apps[0];
    }

    // 3. Fetch google-services.json for Android
    let googleServicesJson = null;
    if (androidApp) {
      console.log(`\nFetching google-services.json for Android App ID: ${androidApp.appId}...`);
      const configRes = await makeRequest(
        `https://firebase.googleapis.com/v1beta1/projects/${projectId}/androidApps/${androidApp.appId}/config`,
        "GET",
        token
      );
      
      if (configRes.configFileContents) {
        const buffer = Buffer.from(configRes.configFileContents, 'base64');
        const decoded = buffer.toString('utf-8');
        googleServicesJson = JSON.parse(decoded);
        console.log("\x1b[32m✔ Successfully retrieved google-services.json contents!\x1b[0m");
        
        const androidAppDir = path.join(__dirname, "../android/app");
        if (fs.existsSync(androidAppDir)) {
          const androidAppPath = path.join(androidAppDir, "google-services.json");
          fs.writeFileSync(androidAppPath, JSON.stringify(googleServicesJson, null, 2));
          console.log(`\x1b[32m✔ Saved google-services.json to android/app/google-services.json!\x1b[0m`);
        }
      }
    }

    // 4. Fetch Web App Config Parameters
    let firebaseWebConfig = null;
    if (webApp) {
      console.log(`\nFetching web app config parameters for Web App ID: ${webApp.appId}...`);
      try {
        firebaseWebConfig = await makeRequest(
          `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${webApp.appId}/config`,
          "GET",
          token
        );
        console.log("\x1b[32m✔ Successfully retrieved Web App config parameters!\x1b[0m");
      } catch (e) {
        console.log("\x1b[33mWarning: Could not fetch Web App configuration parameters:\x1b[0m", e.message);
      }
    }

    // 5. Extract Web Client ID (type 3)
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
      const envLocalPath = path.join(__dirname, "../.env.local");
      const envPath = path.join(__dirname, "../.env");
      
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
      
      fs.writeFileSync(envPath, newEnvContent);
      console.log(`\x1b[32m✔ Created/Updated .env with live retrieved credentials!\x1b[0m`);
      
      console.log("\n\x1b[32;1m🎉 Firebase Project Provisioning & Configuration Complete!\x1b[0m");
      console.log("All environment variables have been set, and google-services.json has been written.");
    } else {
      console.log("\x1b[31;1mCould not locate Web OAuth Client ID (type 3) in the Firebase config.\x1b[0m");
      console.log("Please check if your Firebase Project has Google Sign-In enabled in Authentication.");
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

function waitForOperation(operationName, authorizationHeader) {
  return new Promise((resolve, reject) => {
    const url = `https://firebase.googleapis.com/v1beta1/${operationName}`;
    const check = async () => {
      try {
        const res = await makeRequest(url, "GET", authorizationHeader);
        if (res.done) {
          if (res.error) {
            reject(new Error(`Operation failed: ${res.error.message}`));
          } else {
            resolve(res.response);
          }
        } else {
          setTimeout(check, 2000);
        }
      } catch (e) {
        reject(e);
      }
    };
    setTimeout(check, 2000);
  });
}

run();

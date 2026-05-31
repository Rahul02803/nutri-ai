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

const domainsToWhitelist = [
  "localhost",
  "127.0.0.1",
  "zenlog-11984.firebaseapp.com",
  "zenlog-11984.web.app",
  "nutri-ai.vercel.app",
  "nutri-ai-three.vercel.app"
];

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

    console.log(`\nConnecting to Identity Toolkit Admin API for project: \x1b[36m${projectId}\x1b[0m...\n`);

    // 1. Get current config
    console.log("Fetching current Firebase project configuration...");
    const config = await makeRequest(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`,
      "GET",
      token
    );
    
    const currentDomains = config.authorizedDomains || [];
    console.log("Currently whitelisted domains:", currentDomains);

    // 2. Merge domains
    const mergedDomains = Array.from(new Set([...currentDomains, ...domainsToWhitelist]));
    console.log("\nTarget whitelisted domains list:", mergedDomains);

    // 3. Update configuration
    console.log("\nUpdating Firebase project authorized domains...");
    const updateRes = await makeRequest(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`,
      "PATCH",
      token,
      {
        authorizedDomains: mergedDomains
      }
    );
    
    console.log("\x1b[32m✔ Successfully updated authorized domains in Firebase Console!\x1b[0m");
    console.log("Verified whitelisted domains:", updateRes.authorizedDomains);
    console.log("\n🎉 Domain Whitelisting Complete! Google Sign-in will now work seamlessly on Vercel production hosting!");

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

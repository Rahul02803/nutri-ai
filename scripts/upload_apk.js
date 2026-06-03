const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Helper to make HTTPS requests using native Node.js
function apiRequest(options, requestBody = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (requestBody) {
      req.write(typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody));
    }
    req.end();
  });
}

// Upload file helper
function uploadAsset(uploadUrl, filePath, token) {
  return new Promise((resolve, reject) => {
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);
    
    // Clean up upload URL template (remove bracketed query parameters if any)
    const cleanUrl = uploadUrl.split('{')[0] + '?name=ZenLog.apk';
    const parsedUrl = new URL(cleanUrl);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node-APK-Uploader',
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': fileStats.size
      }
    };

    console.log(`Uploading ${filePath} (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB) to GitHub...`);
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Upload failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    fileStream.pipe(req);
  });
}

async function main() {
  try {
    console.log("Resolving authentication from Git Credential Store...");
    const credOutput = execSync("powershell -Command \"@('protocol=https', 'host=github.com') | git credential fill\"", { encoding: 'utf8' });
    const tokenMatch = credOutput.match(/password=(.*)/);
    if (!tokenMatch) {
      throw new Error("Could not find GitHub token in Git Credential Store. Please make sure you are logged in.");
    }
    const token = tokenMatch[1].trim();

    console.log("Determining repository information...");
    const remoteUrl = execSync("git config --get remote.origin.url", { encoding: 'utf8' }).trim();
    // Parse owner and repo name (works for HTTPS and SSH formats)
    const repoMatch = remoteUrl.match(/github\.com[/:]([^/]+)\/([^.]+)/);
    if (!repoMatch) {
      throw new Error(`Could not parse owner/repo from remote URL: ${remoteUrl}`);
    }
    const owner = repoMatch[1];
    const repo = repoMatch[2];
    console.log(`Repository: ${owner}/${repo}`);

    console.log("Reading app version from app.json...");
    const appJsonPath = path.join(__dirname, '..', 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const version = appJson.expo.version || "1.0.0";
    const tagName = `v${version}`;
    console.log(`Version Tag: ${tagName}`);

    const baseHeaders = {
      'Authorization': `token ${token}`,
      'User-Agent': 'Node-APK-Uploader',
      'Accept': 'application/vnd.github.v3+json'
    };

    console.log(`Checking if release for tag '${tagName}' exists...`);
    let release = null;
    try {
      release = await apiRequest({
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/releases/tags/${tagName}`,
        method: 'GET',
        headers: baseHeaders
      });
      console.log(`Found existing release: ${release.name} (ID: ${release.id})`);
    } catch (e) {
      console.log(`No existing release found for tag '${tagName}'. Creating new release...`);
      release = await apiRequest({
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/releases`,
        method: 'POST',
        headers: baseHeaders
      }, {
        tag_name: tagName,
        name: `ZenLog Release ${tagName}`,
        body: `Automated build release for version ${version}`,
        draft: false,
        prerelease: false
      });
      console.log(`Created release successfully (ID: ${release.id})`);
    }

    // Check if there is an existing ZenLog.apk asset and delete it
    if (release.assets && release.assets.length > 0) {
      const existingAsset = release.assets.find(a => a.name === 'ZenLog.apk');
      if (existingAsset) {
        console.log(`Deleting old asset ZenLog.apk (ID: ${existingAsset.id})...`);
        await apiRequest({
          hostname: 'api.github.com',
          path: `/repos/${owner}/${repo}/releases/assets/${existingAsset.id}`,
          method: 'DELETE',
          headers: baseHeaders
        });
        console.log("Old asset deleted successfully.");
      }
    }

    const apkPath = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    if (!fs.existsSync(apkPath)) {
      throw new Error(`Compiled APK not found at: ${apkPath}`);
    }

    console.log("Uploading newly compiled APK...");
    const uploadedAsset = await uploadAsset(release.upload_url, apkPath, token);
    console.log("=================================================");
    console.log(`[SUCCESS] ZenLog.apk uploaded successfully!`);
    console.log(`Asset Download URL: ${uploadedAsset.browser_download_url}`);
    console.log("=================================================");
  } catch (error) {
    console.error("\n[ERROR] Upload script failed:", error.message);
    process.exit(1);
  }
}

main();

"use client";

import { useEffect, useState } from "react";

export default function AuthRedirect() {
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    // Extract access_token from hash parameters
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // strip the leading '#'
      const accessToken = params.get("access_token");
      
      if (accessToken) {
        setStatus("Redirecting you back to Cal AI...");
        // Redirect back to the Expo app using its custom scheme with the access token
        const redirectUrl = `calaipremium://#access_token=${accessToken}`;
        window.location.href = redirectUrl;
        return;
      }
    }
    
    // Fallback if no hash is present (e.g. direct access)
    setStatus("No authentication parameters found. Redirecting to login...");
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "24px", color: "#111", fontWeight: "600", marginBottom: "8px" }}>{status}</h2>
        <p style={{ color: "#666", fontSize: "14px" }}>Please wait while we secure your connection.</p>
      </div>
    </div>
  );
}

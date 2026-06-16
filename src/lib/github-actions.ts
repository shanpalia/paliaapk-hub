'use server';

/**
 * @fileOverview GitHub API actions for automated APK and Icon distribution.
 * Includes tactical diagnostics for debugging authentication protocols.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

interface GithubUploadResult {
  assetUrl: string;
  name: string;
}

export async function uploadToGithubRelease(
  version: string,
  files: { name: string; type: string; base64: string }[]
): Promise<GithubUploadResult[]> {
  // Infrastructure Diagnostics
  console.log("--- HUB INFRASTRUCTURE SCAN ---");
  console.log("GITHUB_OWNER:", GITHUB_OWNER || "MISSING");
  console.log("GITHUB_REPO:", GITHUB_REPO || "MISSING");
  console.log("TOKEN EXISTS:", !!GITHUB_TOKEN);
  console.log("-------------------------------");

  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not loaded from environment. Check your .env configuration.');
  }

  if (!GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub repository identifiers (OWNER/REPO) are missing from infrastructure variables.');
  }

  // Verify Token Clearance via GitHub Identity Handshake
  console.log("Auth Protocol: Verifying GitHub Token Clearance...");
  const verifyResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store'
  });

  if (verifyResponse.status === 401) {
    console.error("Auth Protocol: HANDSHAKE FAILED - Bad credentials");
    throw new Error('GitHub token invalid: The provided GITHUB_TOKEN has been rejected by GitHub (Bad credentials).');
  }

  if (!verifyResponse.ok) {
    const errorData = await verifyResponse.json().catch(() => ({ message: verifyResponse.statusText }));
    console.error("Auth Protocol: IDENTITY FAULT -", errorData.message);
    throw new Error(`GitHub Authentication Protocol Fault: ${errorData.message || 'Verification service unreachable.'}`);
  }

  console.log("Auth Protocol: IDENTITY VERIFIED. Proceeding with distribution...");

  const tagName = `v${version}-${Date.now()}`;
  
  // 1. Create Release
  console.log(`Publishing Protocol: Creating Release ${tagName}...`);
  const releaseResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        tag_name: tagName,
        name: `Hub Release ${version}`,
        body: `Automated binary distribution for version ${version}`,
        draft: false,
        prerelease: false,
      }),
    }
  );

  if (!releaseResponse.ok) {
    const errorData = await releaseResponse.json().catch(() => ({ message: releaseResponse.statusText }));
    console.error("Publishing Protocol: RELEASE FAULT -", errorData.message);
    throw new Error(`GitHub Release Error: ${errorData.message || releaseResponse.statusText}`);
  }

  const releaseData = await releaseResponse.json();
  const uploadUrlBase = releaseData.upload_url.split('{')[0];
  const results: GithubUploadResult[] = [];

  // 2. Upload Assets
  for (const file of files) {
    console.log(`Publishing Protocol: Uploading binary asset [${file.name}]...`);
    const buffer = Buffer.from(file.base64, 'base64');
    const uploadResponse = await fetch(
      `${uploadUrlBase}?name=${encodeURIComponent(file.name)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': file.type,
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({ message: uploadResponse.statusText }));
      console.error(`Publishing Protocol: ASSET FAULT [${file.name}] -`, errorData.message);
      throw new Error(`GitHub Asset Upload Error (${file.name}): ${errorData.message || uploadResponse.statusText}`);
    }

    const assetData = await uploadResponse.json();
    results.push({
      name: file.name,
      assetUrl: assetData.browser_download_url,
    });
  }

  console.log("Publishing Protocol: ASSET DISTRIBUTION SUCCESSFUL.");
  return results;
}

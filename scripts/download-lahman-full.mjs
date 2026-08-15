import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const downloadDir = path.join(root, "data/raw/lahman/full");
const archivePath = path.join(downloadDir, "lahman-csv.7z");
const extractDir = path.join(downloadDir, "extract");
const teamsOutputPath = path.join(downloadDir, "Teams.csv");

const url =
  process.env.LAHMAN_CSV_URL ||
  "https://www.dropbox.com/scl/fi/hy0sxw6gaai7ghemrshi8/lahman_1871-2023_csv.7z?rlkey=edw1u63zzxg48gvpcmr3qpnhz&dl=1";

function fail(message) {
  console.error("FAIL: " + message);
  process.exit(1);
}

function download(sourceUrl, targetPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(targetPath);

    https
      .get(sourceUrl, (response) => {
        if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
          file.close();
          fs.rmSync(targetPath, { force: true });
          download(response.headers.location, targetPath).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.rmSync(targetPath, { force: true });
          reject(new Error("Download failed with status " + response.statusCode));
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (error) => {
        file.close();
        fs.rmSync(targetPath, { force: true });
        reject(error);
      });
  });
}

function findTeamsCsv(targetDir) {
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      const found = findTeamsCsv(entryPath);
      if (found) return found;
    }

    if (entry.isFile() && entry.name === "Teams.csv") {
      return entryPath;
    }
  }

  return null;
}

fs.mkdirSync(downloadDir, { recursive: true });
fs.rmSync(extractDir, { recursive: true, force: true });
fs.mkdirSync(extractDir, { recursive: true });

console.log("Downloading Lahman archive...");
await download(url, archivePath);

console.log("Extracting Lahman archive...");

try {
  execFileSync("7z", ["x", archivePath, "-o" + extractDir, "-y"], { stdio: "inherit" });
} catch {
  fail("Could not extract .7z archive. Install 7zip/p7zip or set LAHMAN_CSV_URL to a directly extractable source.");
}

const teamsPath = findTeamsCsv(extractDir);

if (!teamsPath) {
  fail("Could not find Teams.csv in extracted Lahman archive.");
}

fs.copyFileSync(teamsPath, teamsOutputPath);
console.log("Wrote " + path.relative(root, teamsOutputPath));

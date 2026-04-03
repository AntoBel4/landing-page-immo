#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="${ROOT_DIR}/.tools/browser-env"
PLAYWRIGHT_DIR="${ROOT_DIR}/.tools/playwright-runtime"
SYSROOT_DIR="${TOOLS_DIR}/sysroot"
PKG_DIR="${TOOLS_DIR}/packages"
AMD64_INDEX="${TOOLS_DIR}/Packages-amd64.txt"
ALL_INDEX="${TOOLS_DIR}/Packages-all.txt"

mkdir -p "${TOOLS_DIR}" "${PKG_DIR}" "${SYSROOT_DIR}" "${PLAYWRIGHT_DIR}"

fetch_index() {
  local url="$1"
  local output="$2"

  if [ ! -f "${output}" ]; then
    curl -fsSL "${url}" | gzip -dc > "${output}"
  fi
}

fetch_index "https://deb.debian.org/debian/dists/trixie/main/binary-amd64/Packages.gz" "${AMD64_INDEX}"
fetch_index "https://deb.debian.org/debian/dists/trixie/main/binary-all/Packages.gz" "${ALL_INDEX}"

if [ ! -f "${PLAYWRIGHT_DIR}/node_modules/playwright/package.json" ]; then
  (
    cd "${PLAYWRIGHT_DIR}"
    npm init -y >/dev/null 2>&1
    npm install playwright@1.59.1 --no-save >/dev/null
  )
fi

(
  cd "${PLAYWRIGHT_DIR}"
  npx playwright install chromium >/dev/null
)

AMD64_PACKAGES=(
  libglib2.0-0t64
  libnss3
  libnspr4
  libatk1.0-0t64
  libatk-bridge2.0-0t64
  libdbus-1-3
  libcups2t64
  libxcb1
  libxkbcommon0
  libasound2t64
  libgbm1
  libx11-6
  libxext6
  libcairo2
  libpango-1.0-0
  libxcomposite1
  libxdamage1
  libxfixes3
  libxrandr2
  libatspi2.0-0t64
  libatomic1
  libxrender1
  libdrm2
  libxau6
  libxdmcp6
  libxi6
  libfontconfig1
  fontconfig-config
)

ALL_PACKAGES=(
  fonts-dejavu-core
  fonts-dejavu-mono
)

extract_packages() {
  local index_file="$1"
  shift

  node - "${index_file}" "${PKG_DIR}" "${SYSROOT_DIR}" "$@" <<'JS'
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const [, , indexFile, pkgDir, sysrootDir, ...packages] = process.argv;
const text = fs.readFileSync(indexFile, 'utf8');
const stanzas = text.split('\n\n');
const filenameByPackage = new Map();

for (const stanza of stanzas) {
  const lines = stanza.split('\n');
  if (!lines[0] || !lines[0].startsWith('Package: ')) continue;
  const pkg = lines[0].slice(9);
  if (!packages.includes(pkg)) continue;
  for (const line of lines) {
    if (line.startsWith('Filename: ')) {
      filenameByPackage.set(pkg, line.slice(10));
      break;
    }
  }
}

for (const pkg of packages) {
  const filename = filenameByPackage.get(pkg);
  if (!filename) {
    throw new Error(`Package not found in ${indexFile}: ${pkg}`);
  }

  const debPath = path.join(pkgDir, `${pkg}.deb`);
  if (!fs.existsSync(debPath)) {
    cp.execFileSync('curl', ['-fsSL', `https://deb.debian.org/debian/${filename}`, '-o', debPath], {
      stdio: 'inherit'
    });
  }

  cp.execFileSync('dpkg-deb', ['-x', debPath, sysrootDir], { stdio: 'inherit' });
  console.log(`extracted ${pkg}`);
}
JS
}

extract_packages "${AMD64_INDEX}" "${AMD64_PACKAGES[@]}"
extract_packages "${ALL_INDEX}" "${ALL_PACKAGES[@]}"

cat > "${TOOLS_DIR}/env.sh" <<EOF
export LD_LIBRARY_PATH="${SYSROOT_DIR}/usr/lib/x86_64-linux-gnu"
export FONTCONFIG_PATH="${SYSROOT_DIR}/etc/fonts"
export FONTCONFIG_FILE="fonts.conf"
export FONTCONFIG_SYSROOT="${SYSROOT_DIR}"
export PLAYWRIGHT_RUNTIME_DIR="${PLAYWRIGHT_DIR}"
EOF

cat <<EOF
Browser environment prepared.

Source this before running Playwright:
  source "${TOOLS_DIR}/env.sh"

Playwright runtime:
  ${PLAYWRIGHT_DIR}
EOF

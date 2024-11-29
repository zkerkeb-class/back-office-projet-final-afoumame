/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const huskyDir = path.join(__dirname, '..', '.husky');
const preCommitFile = path.join(huskyDir, 'pre-commit');

// Create .husky directory if it doesn't exist
if (!fs.existsSync(huskyDir)) {
  fs.mkdirSync(huskyDir, { recursive: true });
}

// Create pre-commit hook with correct line endings for the platform
const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;

// Write the file with platform-specific line endings
fs.writeFileSync(preCommitFile, preCommitContent.replace(/\n/g, require('os').EOL));

// Make the pre-commit hook executable (Unix only)
if (process.platform !== 'win32') {
  fs.chmodSync(preCommitFile, '755');
}
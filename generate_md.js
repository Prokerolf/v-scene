import fs from 'fs';
const accounts = JSON.parse(fs.readFileSync('src/data/accounts.json', 'utf8'));

let md = '# V-SCENE User Accounts\n\n';
md += '## Admin Account\n';
md += '- **Username:** `admin`\n';
md += '- **Password:** `password123`\n\n';
md += '## Student Accounts (VS001 - VS100)\n';
md += '| No. | Username | Password |\n';
md += '|---|---|---|\n';

accounts.filter(a => a.role === 'student').forEach((a, idx) => {
  md += `| ${idx + 1} | ${a.username} | ${a.password} |\n`;
});

fs.writeFileSync('accounts_list.md', md);

import fs from 'fs';
const accounts = JSON.parse(fs.readFileSync('src/data/accounts.json', 'utf8'));

let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>V-SCENE User Accounts</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; }
    h1 { color: #2563eb; }
    h2 { color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
    th { background-color: #f1f5f9; color: #334155; font-weight: bold; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .admin-card { background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
  </style>
</head>
<body>
  <h1>V-SCENE User Accounts</h1>
  
  <div class="admin-card">
    <h2>👨‍🏫 Admin Account</h2>
    <p><strong>Username:</strong> admin</p>
    <p><strong>Password:</strong> password123</p>
  </div>

  <h2>👨‍⚕️ Student Accounts (VS001 - VS100)</h2>
  <table>
    <thead>
      <tr>
        <th>No.</th>
        <th>Username</th>
        <th>Password</th>
      </tr>
    </thead>
    <tbody>
`;

accounts.filter(a => a.role === 'student').forEach((a, idx) => {
  html += `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${a.username}</strong></td>
        <td>${a.password}</td>
      </tr>
  `;
});

html += `
    </tbody>
  </table>
</body>
</html>
`;

fs.writeFileSync('accounts_list.html', html);

const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('/Users/phakansitketwiset/.gemini/antigravity/brain/04775cac-96ed-45da-a662-c7850d1a0ca8/vscene_accounts.pdf'));

const accounts = JSON.parse(fs.readFileSync('src/data/accounts.json', 'utf8'));

doc.fontSize(20).text('V-SCENE User Accounts', { align: 'center' });
doc.moveDown();

doc.fontSize(16).text('Admin Account');
doc.fontSize(12).text('Username: admin');
doc.fontSize(12).text('Password: password123');
doc.moveDown(2);

doc.fontSize(16).text('Student Accounts (VS001 - VS100)');
doc.moveDown();

doc.fontSize(12);
const startX = 50;
let y = doc.y;

doc.text('No.', startX, y);
doc.text('Username', startX + 50, y);
doc.text('Password', startX + 200, y);
y += 20;
doc.moveTo(startX, y - 5).lineTo(startX + 300, y - 5).stroke();

const students = accounts.filter(a => a.role === 'student');

students.forEach((a, idx) => {
    if (y > 700) {
        doc.addPage();
        y = 50;
        doc.text('No.', startX, y);
        doc.text('Username', startX + 50, y);
        doc.text('Password', startX + 200, y);
        y += 20;
        doc.moveTo(startX, y - 5).lineTo(startX + 300, y - 5).stroke();
    }
    doc.text((idx + 1).toString(), startX, y);
    doc.text(a.username, startX + 50, y);
    doc.text(a.password, startX + 200, y);
    y += 15;
});

doc.end();

const fs = require('fs');

let casesTs = fs.readFileSync('src/data/cases.ts', 'utf8');

// The 6 appended cases have string keys like "id": "gen_1709426400000_mid"
// We can parse just the appended part, or carefully regex.

// Let's just regex based on the ID since they are unique.

const updates = [
  {
    id: 'gen_1709426400000_mid', // Paragonimiasis Mid
    name: 'คุณครู สมหมาย',
    gender: 'Male',
    voice: 'young_male'
  },
  {
    id: 'gen_1709426400001_high', // Paragonimiasis High
    name: 'คุณครู สมหมาย',
    gender: 'Male',
    voice: 'young_male'
  },
  {
    id: 'gen_covid_low_1', // COVID Low
    name: 'คุณสมศรี รักสะอาด',
    gender: 'Female',
    voice: 'old_female'
  },
  {
    id: 'gen_covid_high_1', // COVID High
    name: 'คุณสมศรี รักสะอาด',
    gender: 'Female',
    voice: 'old_female'
  },
  {
    id: 'gen_low_bdp_001', // BDP Low
    name: 'คุณทรงพล คนสู้ชีวิต',
    gender: 'Male',
    voice: 'old_male'
  },
  {
    id: 'gen_mid_bdp_001', // BDP Mid
    name: 'คุณทรงพล คนสู้ชีวิต',
    gender: 'Male',
    voice: 'old_male'
  }
];

for (const u of updates) {
  // Find the block for this ID
  const idRegex = new RegExp(`"id":\\s*"${u.id}"[\\s\\S]*?(?=\\}|,"id")`, 'g');
  
  casesTs = casesTs.replace(idRegex, (match) => {
    let replaced = match;
    replaced = replaced.replace(/"patientName":\s*"[^"]+"/, `"patientName": "${u.name}"`);
    replaced = replaced.replace(/"gender":\s*"[^"]+"/, `"gender": "${u.gender}"`);
    replaced = replaced.replace(/"voiceProfile":\s*"[^"]+"/, `"voiceProfile": "${u.voice}"`);
    return replaced;
  });
}

fs.writeFileSync('src/data/cases.ts', casesTs);
console.log('Fixed names successfully!');

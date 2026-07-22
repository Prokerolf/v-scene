const fs = require('fs');

const generatedText = fs.readFileSync('generated_cases.json', 'utf8');
const generatedCases = JSON.parse(generatedText);

// Pre-test questions for each disease
const preTests = {
  'Pulmonary Paragonimiasis': [
    {
      id: 1,
      question: 'ข้อใดคือพยาธิสภาพหลัก (Pathogenesis) ของการติดเชื้อพยาธิใบไม้ในปอด (Pulmonary Paragonimiasis)?',
      options: ['พยาธิตัวเต็มวัยอาศัยอยู่ในถุงลม (Alveoli)', 'พยาธิตัวอ่อนไชทะลุกระบังลมเข้าไปสร้างซีสต์ (Cyst) ในเนื้อปอด', 'การเกิดปฏิกิริยาแพ้รุนแรง (Anaphylaxis) ต่อไข่พยาธิในหลอดลม', 'เชื้อแบคทีเรียแทรกซ้อนบริเวณที่พยาธิเกาะ'],
      correctAnswerIndex: 1,
      category: 'Pathophysiology'
    },
    {
      id: 2,
      question: 'สิ่งส่งตรวจใดที่ถือเป็น Gold Standard ในการวินิจฉัยโรค Pulmonary Paragonimiasis?',
      options: ['Sputum for AFB', 'Sputum for Ova & Parasite', 'Bronchoalveolar lavage (BAL) fluid culture', 'Blood culture'],
      correctAnswerIndex: 1,
      category: 'Diagnosis'
    },
    {
      id: 3,
      question: 'ผู้ป่วยโรคนี้มักมีประวัติความเสี่ยงที่สำคัญคืออะไร?',
      options: ['สูบบุหรี่จัด', 'ทำงานในเหมืองแร่', 'รับประทานปูน้ำจืดดิบหรือกึ่งสุกกึ่งดิบ', 'เลี้ยงนกพิราบ'],
      correctAnswerIndex: 2,
      category: 'Epidemiology'
    }
  ],
  'COVID-19 Pneumonia with Acute Hypoxemic Respiratory Failure': [
    {
      id: 4,
      question: 'ลักษณะภาพถ่ายรังสีทรวงอก (CXR) ที่พบได้บ่อยที่สุดในผู้ป่วย COVID-19 Pneumonia คือข้อใด?',
      options: ['Lobar consolidation', 'Pleural effusion', 'Bilateral peripheral ground-glass opacities', 'Cavitary lesions'],
      correctAnswerIndex: 2,
      category: 'Imaging'
    },
    {
      id: 5,
      question: 'เกณฑ์ที่สำคัญที่สุดในการพิจารณาว่าผู้ป่วยเข้าสู่ภาวะ Acute Hypoxemic Respiratory Failure คืออะไร?',
      options: ['PaCO2 > 50 mmHg', 'PaO2 < 60 mmHg (บน Room Air)', 'pH < 7.35', 'Respiratory rate > 20 ครั้ง/นาที'],
      correctAnswerIndex: 1,
      category: 'Diagnosis'
    },
    {
      id: 6,
      question: 'การรักษาหลักสำหรับผู้ป่วย COVID-19 Pneumonia ที่มีภาวะ Hypoxemia (SpO2 < 94%) คืออะไร?',
      options: ['Oseltamivir และ Azithromycin', 'Corticosteroids (เช่น Dexamethasone) และ Oxygen therapy', 'Inhaled bronchodilators', 'High-dose Vitamin C'],
      correctAnswerIndex: 1,
      category: 'Treatment'
    }
  ],
  'Bilateral Diaphragmatic Paralysis': [
    {
      id: 7,
      question: 'อาการแสดงที่จำเพาะเจาะจง (Pathognomonic sign) ของภาวะ Bilateral Diaphragmatic Paralysis คือข้อใด?',
      options: ['Orthopnea รุนแรง และ Paradoxical inward abdominal motion ขณะหายใจเข้า', 'ไอมีเสมหะสีเขียวจำนวนมาก', 'Wheezing ทั้งสองข้างของปอด', 'Clubbing fingers'],
      correctAnswerIndex: 0,
      category: 'Clinical Presentation'
    },
    {
      id: 8,
      question: 'ผล Arterial Blood Gas (ABG) ของผู้ป่วยที่มีภาวะ Hypoventilation เรื้อรัง (Chronic Hypoventilation) มักพบภาวะใด?',
      options: ['Metabolic Alkalosis', 'Uncompensated Respiratory Acidosis', 'Compensated Respiratory Acidosis (pCO2 สูง, HCO3- สูง)', 'Respiratory Alkalosis'],
      correctAnswerIndex: 2,
      category: 'Acid-Base Balance'
    },
    {
      id: 9,
      question: 'อุปกรณ์ใดเหมาะสมที่สุดในการช่วยสนับสนุนการหายใจสำหรับผู้ป่วย Bilateral Diaphragmatic Paralysis ที่ยังไม่ใส่ท่อช่วยหายใจ?',
      options: ['Nasal cannula 3 LPM', 'Simple face mask 5 LPM', 'Non-invasive Positive Pressure Ventilation (NPPV / BiPAP)', 'High-Flow Nasal Cannula (HFNC)'],
      correctAnswerIndex: 2,
      category: 'Respiratory Support'
    }
  ]
};

// Add preTestQuestions to each generated case
generatedCases.forEach(c => {
  c.preTestQuestions = preTests[c.diseaseName];
});

// Format to JS object string
let casesString = JSON.stringify(generatedCases, null, 2);
// Remove outer brackets
casesString = casesString.substring(1, casesString.length - 1);
// Append to cases.ts
let casesTs = fs.readFileSync('src/data/cases.ts', 'utf8');

// The file ends with:
//   }
// ];
// We will replace "];" with ",\n" + casesString + "\n];"

casesTs = casesTs.replace(/\n\];[\s]*$/, ',\n' + casesString + '\n];\n');
fs.writeFileSync('src/data/cases.ts', casesTs);
console.log('Appended to cases.ts successfully!');

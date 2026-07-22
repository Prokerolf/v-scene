const fs = require('fs');
const file = 'src/data/cases.ts';
let content = fs.readFileSync(file, 'utf8');

const lowCase = `  {
    id: 'gen_covid_low_1',
    tier: 'Low',
    diseaseName: 'COVID-19 Pneumonia with Acute Hypoxemic Respiratory Failure',
    patientName: 'Mrs. Sarah Connor',
    age: 35,
    gender: 'Female',
    chiefComplaint: 'Fever, cough, and feeling very short of breath.',
    caseConstraints: [
      'Started 3 days ago: sudden onset of high fever and dry cough.',
      '1 day ago: felt breathless even at rest.',
      'Close contact with COVID-19 positive husband.',
      'No past medical history. Healthy adult.'
    ],
    localization: 'Lungs (Bilateral diffuse alveolar infiltrates)',
    etiology: 'SARS-CoV-2 (Severe acute respiratory syndrome coronavirus 2)',
    goldStandardLabs: ['12', '7', '13', '14', '3'], 
    goldStandardDrugs: ['15', '16', '17', '18'], 
    contraindicatedDrugs: [], 
    personaDetails: 'A 35-year-old Caucasian female. She is generally healthy. Presents with classic COVID symptoms: fever, dry cough, and shortness of breath. She is very worried. **CRITICAL INSTRUCTION FOR AI: You MUST act as this foreign patient. You MUST ONLY speak and reply in ENGLISH regardless of the language the doctor uses.**',
    voiceProfile: 'adult_female',
    ddxKeywords: ['covid', 'covid-19', 'covid 19', 'community acquired pneumonia', 'heart failure', 'pulmonary embolism', 'sars-cov-2'],
    finalDiagnosisKeywords: ['covid-19 pneumonia', 'covid pneumonia', 'acute hypoxemic respiratory failure'],
    vitals: {
      bp: '120/75',
      hr: 98,
      rr: 28,
      temp: 39.5,
      spo2: 90,
      weight: 65,
      height: 165
    },
    ddxGroup: 'กลุ่มโรคติดเชื้อไวรัสทางเดินหายใจรุนแรง (Severe Viral Respiratory Infection)',
    ddxExplanation: 'อาการชัดเจนตรงไปตรงมาสำหรับ COVID-19 (ไข้ ไอ หอบ ประวัติสัมผัสชัดเจน)',
    diagnosisExplanation: 'ผล RT-PCR บวก, CXR เข้าได้ ยืนยันการวินิจฉัย COVID-19 Pneumonia ง่ายและตรงไปตรงมา',
    treatmentExplanation: 'Standard COVID treatment with oxygen support.',
    specificLabResults: {
      '12': { text: '**SARS-CoV-2 RT-PCR:**\\n- **Positive (Detected)**' },
      '7': { text: '**Chest X-ray (PA upright):**\\n- **Bilateral diffuse alveolar infiltrates**.' },
      '13': { text: '**Arterial Blood Gas (Room Air):**\\n- pH: 7.42, PaCO2: 30, PaO2: 60, HCO3-: 22\\n- *Impression: Hypoxemia.*' },
      '14': { text: '**C-reactive protein (CRP):**\\n- 80 mg/L (Normal <1 mg/L)' },
      '3': { text: '**Complete Blood Count (CBC):**\\n- WBC: 5,000 /uL, Lymphocytes 25%' }
    },
    preTestQuestions: []
  }`;

const highCase = `  {
    id: 'gen_covid_high_1',
    tier: 'High',
    diseaseName: 'COVID-19 Pneumonia with Acute Hypoxemic Respiratory Failure',
    patientName: 'Mrs. Sarah Connor',
    age: 78,
    gender: 'Female',
    chiefComplaint: 'I just feel extremely tired, weak, and a bit confused. My chest feels heavy.',
    caseConstraints: [
      'No fever. Mild cough only.',
      'Progressive fatigue, weakness, and altered mental status for 4 days.',
      'No known sick contacts, but lives in a nursing home.',
      'Past Medical History: CHF, COPD, Chronic Kidney Disease (stage 3).'
    ],
    localization: 'Lungs (Bilateral diffuse alveolar infiltrates)',
    etiology: 'SARS-CoV-2 (Severe acute respiratory syndrome coronavirus 2)',
    goldStandardLabs: ['12', '7', '13', '14', '3'], 
    goldStandardDrugs: ['15', '16', '17', '18'], 
    contraindicatedDrugs: [], 
    personaDetails: 'A 78-year-old Caucasian female from a nursing home. Presents with atypical symptoms: fatigue, confusion, no fever, mild cough. She has multiple comorbidities (CHF, COPD, CKD) which make the diagnosis tricky. She speaks slowly and is slightly confused. **CRITICAL INSTRUCTION FOR AI: You MUST act as this foreign patient. You MUST ONLY speak and reply in ENGLISH regardless of the language the doctor uses.**',
    voiceProfile: 'elderly_female',
    ddxKeywords: ['covid', 'covid-19', 'covid 19', 'community acquired pneumonia', 'heart failure', 'pulmonary embolism', 'sars-cov-2'],
    finalDiagnosisKeywords: ['covid-19 pneumonia', 'covid pneumonia', 'acute hypoxemic respiratory failure'],
    vitals: {
      bp: '140/90',
      hr: 110,
      rr: 26,
      temp: 37.2,
      spo2: 86,
      weight: 70,
      height: 155
    },
    ddxGroup: 'กลุ่มโรคติดเชื้อไวรัสทางเดินหายใจรุนแรง (Severe Viral Respiratory Infection)',
    ddxExplanation: 'ผู้ป่วยสูงอายุอาจไม่มีไข้ อาการไม่ชัดเจน ต้องแยกโรคจาก CHF exacerbation และ COPD exacerbation',
    diagnosisExplanation: 'แม้จะไม่มีไข้ แต่ hypoxia และ infiltrates ใน CXR ร่วมกับผล PCR ยืนยัน COVID-19',
    treatmentExplanation: 'Careful management due to multiple comorbidities.',
    specificLabResults: {
      '12': { text: '**SARS-CoV-2 RT-PCR:**\\n- **Positive (Detected)**' },
      '7': { text: '**Chest X-ray (PA upright):**\\n- Bilateral infiltrates, also cardiomegaly and mild fluid overload.' },
      '13': { text: '**Arterial Blood Gas (Room Air):**\\n- pH: 7.35, PaCO2: 45, PaO2: 50, HCO3-: 24\\n- *Impression: Severe hypoxemia.*' },
      '14': { text: '**C-reactive protein (CRP):**\\n- 120 mg/L (Normal <1 mg/L)' },
      '3': { text: '**Complete Blood Count (CBC):**\\n- WBC: 9,000 /uL, Lymphocytes 15%' }
    },
    preTestQuestions: []
  }`;

content = content.replace('  ];', ',\n' + lowCase + ',\n' + highCase + '\n  ];');
fs.writeFileSync(file, content);
console.log('Cases added');

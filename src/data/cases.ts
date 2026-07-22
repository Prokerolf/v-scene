export interface PreTestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  category?: string;
  difficulty?: string;
}

export interface ClinicalCase {
  id: string;
  tier: 'Low' | 'Mid' | 'High';
  diseaseName: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  caseConstraints: string[];
  localization: string;
  etiology: string;
  goldStandardLabs: string[];
  goldStandardDrugs: string[];
  contraindicatedDrugs: string[];
  personaDetails: string;
  voiceProfile: string;
  ddxKeywords: string[];
  finalDiagnosisKeywords: string[];
  vitals?: {
    bp: string;
    hr: number;
    rr: number;
    temp: number;
    spo2: number;
    weight: number;
    height: number;
  };
  ddxGroup: string;
  ddxExplanation: string;
  diagnosisExplanation: string;
  treatmentExplanation?: string;
  specificLabResults?: {
    [labId: string]: {
      text?: string;
      imageUrl?: string;
    };
  };
  preTestQuestions: PreTestQuestion[];
}

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case_paragonimus',
    tier: 'Low',
    diseaseName: 'Pulmonary Paragonimiasis',
    patientName: 'คุณครู สมหมาย',
    age: 32,
    gender: 'Male',
    chiefComplaint: 'ไอเรื้อรัง มีเสมหะปนเลือดเป็นๆ หายๆ มา 3 เดือน',
    caseConstraints: [
      '3 เดือนก่อนเริ่มไอแห้งๆ ต่อมามีเสมหะข้นขุ่น สีแดงเข้มคล้ายสนิมเหล็ก (Rusty brown sputum)',
      'เจ็บแน่นหน้าอกเวลาไอ, มีไข้ต่ำๆ, เพลีย, นอนไม่หลับเพราะไอตอนกลางคืน, น้ำหนักลด 3 kg ใน 2 เดือน',
      'ไม่สูบบุหรี่, ไม่มีประวัติสัมผัสวัณโรค',
      '5 เดือนก่อนไปเดินป่าภาคเหนือ กินปูน้ำตกดิบแช่น้ำปลา (Raw mountain crabs)',
      'กินยาปฏิชีวนะจากคลินิกหลายขนานแล้วไม่ดีขึ้น'
    ],
    localization: 'Lung parenchyma (Right lower lobe predominance)',
    etiology: 'Parasitic infection (Paragonimus species)',
    goldStandardLabs: ['3', '10', '7'],
    goldStandardDrugs: ['11'], 
    contraindicatedDrugs: ['9'], 
    personaDetails: 'ชายหนุ่มอายุ 32 ปี อาชีพคุณครู ชอบเดินทางท่องเที่ยวธรรมชาติและตั้งแคมป์ตามป่าเขา ตอนไปเที่ยวภาคเหนือเมื่อ 5 เดือนก่อนกินปูน้ำตกดิบกับเพื่อน ตอนนี้ไอหนักจนนอนไม่ได้ เสมหะออกมาเป็นสีสนิมเหล็ก กังวลว่าจะเป็นวัณโรคหรือโรคร้ายแรง',
    voiceProfile: 'young_male',
    ddxKeywords: ['paragonimiasis', 'paragonimus', 'lung fluke', 'ascariasis', 'strongyloidiasis', 'ancylostomiasis', 'necatoriasis', 'พยาธิใบไม้ปอด'],
    finalDiagnosisKeywords: ['pulmonary paragonimiasis', 'paragonimiasis'],
    vitals: {
      bp: '120/75',
      hr: 78,
      rr: 18,
      temp: 37.4, 
      spo2: 98,
      weight: 65,
      height: 170
    },
    ddxGroup: 'กลุ่มโรคติดเชื้อปรสิตในปอด (Pulmonary Parasitic Infection)',
    ddxExplanation: 'อาการไอเรื้อรัง เสมหะสีสนิมเหล็ก (Rusty sputum) ประวัติกินปูดิบดิบ ร่วมกับภาวะ Eosinophilia สูง บ่งชี้ไปที่การติดเชื้อพยาธิใบไม้ปอด (Lung fluke) มากกว่าแบคทีเรียหรือวัณโรค',
    diagnosisExplanation: 'ตรวจพบไข่พยาธิลักษณะผิวเรียบ สีน้ำตาลเหลือง มีฝาเปิดชัดเจน (Unembryonated egg with operculum) ในเสมหะ ยืนยันการวินิจฉัย Pulmonary Paragonimiasis ซี่งสอดคล้องกับภาพรังสีทรวงอกและการซักประวัติ',
    treatmentExplanation: 'Praziquantel เป็นยาต้านพยาธิที่เป็น Gold Standard สำหรับรักษาโรคพยาธิใบไม้ปอด ส่วนยาแก้ไอและยาขยายหลอดลมให้เพื่อบรรเทาอาการแทรกซ้อนเบื้องต้น',
    specificLabResults: {
      '3': {
        text: '**Complete Blood Count (CBC):**\n- Hb: 13.2 g/dL (Normal: 12.0-15.5 g/dL)\n- WBC: 11,500 /mcL (Normal: 4,500-11,000 /mcL)\n- Differential: **Eosinophils 18% (High, Normal: 1-4%)**, Neutrophils 50% (Normal: 40-60%), Lymphocytes 30% (Normal: 20-40%), Monocytes 2% (Normal: 2-8%)\n- *Impression: Marked Eosinophilia.*'
      },
      '10': {
        text: '**Sputum Examination:**\n- **AFB stain:** Negative x 3 days\n- **Direct smear:** Numerous Eosinophils seen. **Positive for unembryonated eggs with operculum (smooth thick shell, golden-brown color).**\n- *Impression: Paragonimus eggs identified.*'
      },
      '7': {
        text: '**Chest X-ray (PA upright):**\n- Pulmonary infiltrates at right lower lung zone.\n- Nodular cystic lesions (ring shadows) noted in the RLL.\n- Mild right pleural effusion.\n- No typical upper lobe cavitary lesions suggestive of TB.',
        imageUrl: '/labs/cxr_paragonimiasis.jpg'
      }
    },
    preTestQuestions: [
      {
        id: 1,
        question: 'สาเหตุที่พบบ่อยที่สุดของอาการไอเรื้อรัง (Chronic cough) ที่มีระยะเวลาเกิน 8 สัปดาห์ ในประเทศไทยคือข้อใด?',
        options: ['Asthma (โรคหืด)', 'Pulmonary Tuberculosis (วัณโรคปอด)', 'Lung Cancer (มะเร็งปอด)', 'Gastroesophageal Reflux Disease (GERD)'],
        correctAnswerIndex: 1,
        category: 'Differential Diagnosis'
      },
      {
        id: 2,
        question: 'ภาวะ Eosinophilia ในเลือด (Eosinophil สูง) มักมีความสัมพันธ์กับกลุ่มโรคในข้อใดมากที่สุด?',
        options: ['Bacterial infection', 'Viral infection', 'Parasitic infection and Allergy', 'Fungal infection'],
        correctAnswerIndex: 2,
        category: 'Laboratory Findings'
      },
      {
        id: 3,
        question: 'พยาธิชนิดใดในตัวเลือกนี้ ที่วงจรชีวิตส่วนหนึ่งต้องไชผ่านปอด (Lung migration) และทำให้เกิดอาการทางระบบหายใจได้?',
        options: ['Enterobius vermicularis (พยาธิเข็มหมุด)', 'Ascaris lumbricoides (พยาธิไส้เดือน)', 'Taenia saginata (พยาธิตืดวัว)', 'Trichuris trichiura (พยาธิแส้ม้า)'],
        correctAnswerIndex: 1,
        category: 'Parasitology'
      },
      {
        id: 4,
        question: 'เสมหะที่มีสีสนิมเหล็ก (Rusty sputum) มักบ่งชี้ถึงพยาธิสภาพแบบใดในระบบทางเดินหายใจ?',
        options: ['การแตกของเม็ดเลือดแดงเก่าในถุงลม', 'การติดเชื้อแบคทีเรียที่สร้างสีเขียว', 'การมีหนองปริมาณมาก (Purulent)', 'การหลั่งน้ำเมือกมากเกินไป'],
        correctAnswerIndex: 0,
        category: 'Clinical Presentation'
      },
      {
        id: 5,
        question: 'หากพบ Cavitary lesion หรือ Cystic lesion ในภาพรังสีทรวงอก (CXR) โรคใดที่ควรคำนึงถึงเป็นอันดับแรกๆ?',
        options: ['Mycoplasma pneumonia', 'Pulmonary Tuberculosis', 'Viral pneumonitis', 'Asthma exacerbation'],
        correctAnswerIndex: 1,
        category: 'Radiology'
      },
      {
        id: 6,
        question: 'การส่งสิ่งส่งตรวจใด ถือเป็นขั้นตอนมาตรฐานแรกสุด (First-line) ในการวินิจฉัยผู้ป่วยที่มาด้วยอาการสงสัยวัณโรคปอด?',
        options: ['Sputum for AFB stain', 'Blood culture', 'Bronchoscopy', 'Sputum for Ova and Parasite'],
        correctAnswerIndex: 0,
        category: 'Diagnosis'
      },
      {
        id: 7,
        question: 'ยา Praziquantel เป็นยาต้านพยาธิที่มีประสิทธิภาพสูงในการรักษาโรคติดเชื้อกลุ่มใด?',
        options: ['Nematodes (พยาธิตัวกลม)', 'Trematodes (พยาธิใบไม้) และ Cestodes (พยาธิตัวตืด)', 'Protozoa (โปรโตซัว)', 'Ectoparasites'],
        correctAnswerIndex: 1,
        category: 'Pharmacology'
      },
      {
        id: 8,
        question: 'พฤติกรรมการบริโภคอาหารประเภทใด ที่เป็นปัจจัยเสี่ยงหลักในการติดเชื้อพยาธิใบไม้ในประเทศไทย (เช่น พยาธิใบไม้ตับ พยาธิใบไม้ปอด)?',
        options: ['การกินเนื้อวัวดิบ', 'การกินหมูกระทะที่ไม่สุก', 'การกินสัตว์น้ำจืด (ปู กุ้ง ปลา) แบบสุกๆ ดิบๆ', 'การกินผักสดที่ล้างไม่สะอาด'],
        correctAnswerIndex: 2,
        category: 'Epidemiology'
      },
      {
        id: 9,
        question: 'ข้อใดคือลักษณะเด่นของไข่พยาธิใบไม้ (Trematode eggs) ที่ตรวจพบได้ด้วยกล้องจุลทรรศน์?',
        options: ['มีลักษณะกลมและมีเปลือกหนาขรุขระ', 'มีฝาเปิด (Operculum) อยู่ที่ปลายด้านหนึ่ง', 'มีรูปร่างคล้ายถังเบียร์ (Barrel-shaped)', 'มีตัวอ่อนขดอยู่ภายในเสมอ'],
        correctAnswerIndex: 1,
        category: 'Parasitology'
      }
    ]
  },
  {
    id: 'case_covid_pneumonia',
    tier: 'Mid',
    diseaseName: 'COVID-19 Pneumonia with Acute Hypoxemic Respiratory Failure',
    patientName: 'Mrs. Sarah Connor',
    age: 45,
    gender: 'Female',
    chiefComplaint: 'Fever, dry cough, and worsening shortness of breath for 5 days.',
    caseConstraints: [
      '5 days ago: high-grade fever, dry cough, generalized fatigue, poor appetite, loss of smell (anosmia).',
      '3 days ago: progressively worsening shortness of breath and rapid breathing.',
      'Close contact with a confirmed COVID-19 patient one week ago (shared meal without mask).',
      'Past Medical History: T2DM for 2 years (on Glipizide, Metformin), Obesity (BMI = 35 kg/m²).'
    ],
    localization: 'Lungs (Bilateral diffuse alveolar infiltrates)',
    etiology: 'SARS-CoV-2 (Severe acute respiratory syndrome coronavirus 2)',
    goldStandardLabs: ['12', '7', '13', '14', '3'], 
    goldStandardDrugs: ['15', '16', '17', '18'], 
    contraindicatedDrugs: [], 
    personaDetails: 'A 45-year-old Caucasian female housewife, obese with underlying type 2 diabetes. She presents with high fever, dry cough, generalized fatigue, poor appetite, and loss of smell for 5 days. She is now experiencing severe shortness of breath and had to come to the hospital. She is extremely anxious because she had a meal with a friend who tested positive for COVID-19 last week. **CRITICAL INSTRUCTION FOR AI: You MUST act as this foreign patient. You MUST ONLY speak and reply in ENGLISH regardless of the language the doctor uses.**',
    voiceProfile: 'old_female',
    ddxKeywords: ['covid', 'covid-19', 'covid 19', 'community acquired pneumonia', 'heart failure', 'pulmonary embolism', 'sars-cov-2'],
    finalDiagnosisKeywords: ['covid-19 pneumonia', 'covid pneumonia', 'acute hypoxemic respiratory failure'],
    vitals: {
      bp: '112/64',
      hr: 105,
      rr: 35,
      temp: 39.0,
      spo2: 88,
      weight: 90,
      height: 160
    },
    ddxGroup: 'กลุ่มโรคติดเชื้อไวรัสทางเดินหายใจรุนแรง (Severe Viral Respiratory Infection)',
    ddxExplanation: 'อาการไข้ ไอแห้ง หอบเหนื่อย หายใจเร็ว SpO2 ต่ำ ร่วมกับภาวะ Anosmia (สูญเสียการได้กลิ่น) และประวัติสัมผัสผู้ติดเชื้อ บ่งชี้ไปทางโรคในกลุ่มติดเชื้อไวรัสทางเดินหายใจรุนแรงอย่างชัดเจน',
    diagnosisExplanation: 'ผล RT-PCR สำหรับ SARS-CoV-2 เป็นบวก ภาพรังสีพบ Bilateral diffuse alveolar infiltrates และผล ABG เข้าได้กับ Acute Hypoxemic Respiratory Failure ยืนยันการวินิจฉัย COVID-19 Pneumonia',
    treatmentExplanation: 'Dexamethasone ช่วยลดการอักเสบรุนแรงที่ทำลายปอด, LMWH ป้องกันภาวะลิ่มเลือดอุดตันซึ่งพบบ่อยในโควิดรุนแรง และ HFNC ช่วยประคองการหายใจโดยให้ O2 ปริมาณสูงพร้อมลดแรงต้านการหายใจ',
    specificLabResults: {
      '12': {
        text: '**SARS-CoV-2 RT-PCR:**\n- **Positive (Detected)**'
      },
      '7': {
        text: '**Chest X-ray (PA upright):**\n- **Bilateral diffuse alveolar infiltrates** with peripheral and lower lung predominance.\n- No pleural effusion.\n- Normal cardiac size.'
      },
      '13': {
        text: '**Arterial Blood Gas (Room Air):**\n- pH: 7.48 (Normal: 7.35-7.45)\n- PaCO2: 25 mmHg (Normal: 35-45 mmHg)\n- PaO2: 55 mmHg (Normal: 80-100 mmHg)\n- HCO3-: 21 mEq/L (Normal: 22-26 mEq/L)\n- *Impression: Uncompensated respiratory alkalosis with severe hypoxemia (Type I Respiratory Failure).*'
      },
      '14': {
        text: '**C-reactive protein (CRP):**\n- 100 mg/L (Normal <1 mg/L)'
      },
      '3': {
        text: '**Complete Blood Count (CBC):**\n- WBC: 4,000 /uL (Normal: 4,500-11,000 /uL)\n  - Neutrophils 60% (Normal: 40-60%)\n  - Lymphocytes 30% (Normal: 20-40%)\n- Hb: 12 g/dL (Normal: 12.0-15.5 g/dL)\n- Plt: 250,000 /uL (Normal: 150,000-450,000 /uL)\n- *Impression: Normal WBC count with relative lymphopenia common in viral infection.*'
      }
    },
    preTestQuestions: [
      {
        id: 1,
        question: 'ลักษณะทางคลินิกใดที่มักช่วยแยกแยะระหว่าง Atypical/Viral Pneumonia กับ Typical Bacterial Pneumonia ในระยะเริ่มแรก?',
        options: ['ไข้สูงหนาวสั่นและไอมีเสมหะหนองสีเขียว', 'ไอแห้งๆ ปวดเมื่อยตามตัว และอาการมักค่อยเป็นค่อยไปหรือมีอาการหวัดนำมาก่อน', 'ไอเป็นเลือดสดปริมาณมาก', 'มีเสียง Wheezing ชัดเจนทั่วปอด'],
        correctAnswerIndex: 1,
        category: 'Clinical Presentation'
      },
      {
        id: 2,
        question: 'ภาวะ Type I Respiratory Failure (Hypoxemic respiratory failure) มักมีผล Arterial Blood Gas (ABG) ในลักษณะใด?',
        options: ['PaO2 ต่ำ และ PaCO2 สูง', 'PaO2 ต่ำ และ PaCO2 ปกติหรือต่ำ', 'PaO2 ปกติ และ PaCO2 สูง', 'pH สูง และ HCO3- สูง'],
        correctAnswerIndex: 1,
        category: 'Respiratory Physiology'
      },
      {
        id: 3,
        question: 'ภาพรังสีทรวงอก (CXR) ของผู้ป่วย Viral Pneumonitis รุนแรง มักแสดงลักษณะใด?',
        options: ['Lobar consolidation ที่ชัดเจนขอบเขตเดียว', 'Bilateral interstitial หรือ alveolar infiltrates', 'Large unilateral pleural effusion', 'Multiple cavitary lesions'],
        correctAnswerIndex: 1,
        category: 'Radiology'
      },
      {
        id: 4,
        question: 'กลไกหลักของภาวะ Acute Respiratory Distress Syndrome (ARDS) คืออะไร?',
        options: ['การหดเกร็งของหลอดลมอย่างรุนแรง (Bronchospasm)', 'การรั่วของน้ำและโปรตีนเข้าสู่ถุงลมจากการอักเสบของ Alveolar-capillary membrane', 'หัวใจล้มเหลวทำให้ความดันในหลอดเลือดปอดสูงขึ้น (Cardiogenic pulmonary edema)', 'การอุดตันของหลอดเลือดแดงปอด (Pulmonary Embolism)'],
        correctAnswerIndex: 1,
        category: 'Pathophysiology'
      },
      {
        id: 5,
        question: 'ยาต้านการอักเสบกลุ่ม Corticosteroids (เช่น Dexamethasone) มีบทบาทสำคัญในผู้ป่วยปอดอักเสบจากไวรัสที่มีอาการรุนแรง (Severe hyperinflammation) อย่างไร?',
        options: ['ช่วยทำลายเชื้อไวรัสโดยตรง', 'ลดปฏิกิริยาการอักเสบที่รุนแรงเกินไป (Hyperinflammatory response) ที่ทำลายเนื้อปอด', 'กระตุ้นการสร้างเม็ดเลือดขาวเพื่อสู้กับเชื้อ', 'ขยายหลอดลมเพื่อลดอาการไอ'],
        correctAnswerIndex: 1,
        category: 'Pharmacology'
      },
      {
        id: 6,
        question: 'ผู้ป่วยวิกฤตที่ติดเชื้อรุนแรงและต้องนอนโรงพยาบาลเป็นเวลานาน (Immobilization) มีความเสี่ยงสูงต่อภาวะใด และมักต้องให้ยาป้องกัน?',
        options: ['ภาวะน้ำตาลในเลือดต่ำ (Hypoglycemia)', 'ภาวะหลอดเลือดดำอุดตัน (Venous Thromboembolism: VTE)', 'ภาวะเลือดออกในกระเพาะอาหาร (GI Bleeding)', 'ภาวะหัวใจเต้นผิดจังหวะ (Arrhythmia)'],
        correctAnswerIndex: 1,
        category: 'Complication Management'
      },
      {
        id: 7,
        question: 'ข้อดีของ High-Flow Nasal Cannula (HFNC) ที่เหนือกว่า Nasal Cannula ธรรมดา คือข้อใด?',
        options: ['สามารถให้ FiO2 ได้สูงสุดเพียง 40%', 'สร้างแรงดันบวก (PEEP) อ่อนๆ และให้ความชื้นได้อย่างเหมาะสม', 'ไม่ต้องใช้ไฟฟ้าและออกซิเจนชนิดพิเศษในการทำงาน', 'สามารถพ่นยาขยายหลอดลมได้ดีกว่าชนิดอื่น'],
        correctAnswerIndex: 1,
        category: 'Respiratory Support'
      },
      {
        id: 8,
        question: 'การซักประวัติระบาดวิทยา (Epidemiology) ในผู้ป่วยที่มีอาการทางเดินหายใจเฉียบพลัน ข้อใดสำคัญที่สุดในการประเมินความเสี่ยงโรคติดเชื้ออุบัติใหม่?',
        options: ['ประวัติโรคภูมิแพ้ในครอบครัว', 'ประวัติการเดินทาง หรือสัมผัสใกล้ชิดผู้ป่วยที่มีอาการคล้ายกัน', 'ประวัติการสูบบุหรี่จัด', 'ประวัติการรับประทานอาหารดิบ'],
        correctAnswerIndex: 1,
        category: 'History Taking'
      },
      {
        id: 9,
        question: 'ผลตรวจเลือด (CBC) ในผู้ป่วยปอดอักเสบจากไวรัสหลายชนิด มักพบการเปลี่ยนแปลงของเม็ดเลือดขาวอย่างไร?',
        options: ['WBC สูงมาก ร่วมกับ Neutrophil เด่น', 'WBC ปกติหรือต่ำ ร่วมกับ Lymphopenia (Lymphocyte ต่ำ)', 'Eosinophil สูงมากกว่า 10%', 'Basophil สูง'],
        correctAnswerIndex: 1,
        category: 'Laboratory Findings'
      }
    ]
  },
  {
    id: 'case_diaphragmatic_paralysis',
    tier: 'High', 
    diseaseName: 'Bilateral Diaphragmatic Paralysis',
    patientName: 'คุณทรงพล คนสู้ชีวิต',
    age: 55,
    gender: 'Male',
    chiefComplaint: 'เหนื่อยหอบเวลานอนราบ (Orthopnea) เรื้อรัง และง่วงนอนมากในเวลากลางวัน',
    caseConstraints: [
      'เหนื่อยหอบเวลานอนราบ (Orthopnea) และมีอาการเหมือนจะขาดใจเวลานอนราบ',
      'มีอาการแน่นหน้าอกและหายใจไม่ออกเฉียบพลันในเวลากลางคืน (Acute nocturnal dyspnea) จนสะดุ้งตื่น',
      'ไป ER หลายครั้ง ได้ยาปฏิชีวนะ ยาขับปัสสาวะ และให้ออกซิเจนที่บ้าน แต่อาการไม่ดีขึ้น',
      'มีโรคประจำตัว: HTN, DLP, T2DM',
      'อดีตเคยตกจากต้นไม้และได้รับการวินิจฉัยว่ามีกระดูกสันหลังส่วนคอบาดเจ็บ (Previous C-spine injury)'
    ],
    localization: 'Diaphragm / Phrenic Nerve (C3, C4, C5)',
    etiology: 'Phrenic nerve injury secondary to previous cervical spine trauma, exacerbated by obesity.',
    goldStandardLabs: ['4', '13', '7'], 
    goldStandardDrugs: ['19', '20', '21'],
    contraindicatedDrugs: ['2', '9'], 
    personaDetails: 'ชายไทยวัย 55 ปี รูปร่างอ้วน อดีตคนงานก่อสร้างที่เคยตกต้นไม้จนเจ็บคอเรื้อรัง ตอนนี้บ่นเหนื่อยมากเวลานอนหงาย สะดุ้งตื่นมาหอบกลางดึกบ่อยๆ กลางวันก็ง่วงซึมตลอดเวลา ไปฉุกเฉินมาหลายรอบหมอให้ยาขับปัสสาวะกับยาฆ่าเชื้อก็ไม่หาย เหนื่อยล้าและท้อแท้มาก',
    voiceProfile: 'old_male',
    ddxKeywords: ['diaphragmatic paralysis', 'bilateral diaphragmatic paralysis', 'obesity hypoventilation syndrome', 'ohs', 'pulmonary edema', 'heart failure'],
    finalDiagnosisKeywords: ['bilateral diaphragmatic paralysis', 'diaphragmatic paralysis'],
    vitals: {
      bp: '130/80', 
      hr: 82, 
      rr: 20, 
      temp: 36.8,
      spo2: 88, 
      weight: 110,
      height: 170
    },
    ddxGroup: 'กลุ่มโรคกล้ามเนื้อหายใจอ่อนแรงและภาวะอ้วน (Respiratory Muscle Weakness & Obesity-related conditions)',
    ddxExplanation: 'อาการเหนื่อยหอบเวลานอนราบ (Orthopnea) ร่วมกับประวัติอุบัติเหตุที่กระดูกสันหลังส่วนคอ (C-spine injury) บ่งชี้ปัญหาที่เส้นประสาท Phrenic Nerve ที่เลี้ยงกะบังลม ทำให้กะบังลมทำงานไม่ได้',
    diagnosisExplanation: 'ผล Spirometry ในท่านอนราบพบค่า VC ลดลงถึง 20% ร่วมกับ ABG เป็น Chronic respiratory acidosis เข้าได้กับ Bilateral Diaphragmatic Paralysis ที่มีอาการแย่ลงจากภาวะอ้วน (Obesity)',
    treatmentExplanation: 'BiPAP (NIPPV) ช่วยถ่างขยายทางเดินหายใจและประคองการระบาย CO2 ในขณะที่กล้ามเนื้อกะบังลมทำงานไม่ได้ ร่วมกับการลดน้ำหนักเพื่อลดแรงกดทับที่หน้าอกและช่องท้อง',
    specificLabResults: {
      '4': {
        text: '**Pulmonary Function Test (PFT) & Spirometry (Upright):**\n- TLC: 44.2% predicted (Normal > 80%)\n- VC: 37.6% predicted (Normal > 80%)\n- RV: 127% predicted (Normal 80-120%)\n- FVC: 38.6% predicted (Normal > 80%)\n- FEV1: 39.3% predicted (Normal > 80%)\n- DLCO: 88%, DLCO/VA: 80% (Normal > 80%)\n- MIP: 36 cmH2O (Decreased, Normal > 80 cmH2O)\n- MEP: 70 cmH2O (Normal > 80 cmH2O)\n\n**Spirometry (Supine position):**\n- **VC decreased by 20%** compared to upright position (Normal decrease is < 10%).\n- *Impression: Severe restrictive lung defect with significant supine worsening, highly suggestive of diaphragmatic weakness/paralysis.*'
      },
      '13': {
        text: '**Arterial Blood Gas (Room air):**\n- pH: 7.42 (Normal: 7.35-7.45)\n- pCO2: 54 mmHg (Hypercapnia, Normal: 35-45 mmHg)\n- pO2: 63 mmHg (Hypoxemia, Normal: 80-100 mmHg)\n- HCO3-: 40.9 mEq/L (Metabolic compensation, Normal: 22-26 mEq/L)\n- SaO2: 88.2% (Normal > 95%)\n- *Impression: Fully compensated chronic respiratory acidosis.*'
      },
      '7': {
        text: '**Chest X-ray (PA upright):**\n- Elevated hemidiaphragms bilaterally.\n- Decreased lung volumes.\n- No evidence of pulmonary edema or acute infiltrates.'
      }
    },
    preTestQuestions: [
      {
        id: 1,
        question: 'กล้ามเนื้อใดทำหน้าที่เป็นกล้ามเนื้อหลัก (Primary muscle) ในการหายใจเข้า (Inspiration)?',
        options: ['Internal intercostal muscles', 'Diaphragm (กะบังลม)', 'Sternocleidomastoid', 'Rectus abdominis'],
        correctAnswerIndex: 1,
        category: 'Anatomy'
      },
      {
        id: 2,
        question: 'เส้นประสาทใดที่ทำหน้าที่ส่งสัญญาณไฟฟ้าไปควบคุมการหดตัวของกะบังลม (Diaphragm)?',
        options: ['Vagus nerve', 'Intercostal nerves', 'Phrenic nerve', 'Glossopharyngeal nerve'],
        correctAnswerIndex: 2,
        category: 'Neuroanatomy'
      },
      {
        id: 3,
        question: 'อาการหอบเหนื่อยที่เกิดขึ้นทันทีเมื่อผู้ป่วยล้มตัวลงนอนราบ (Orthopnea) มักพบได้บ่อยในภาวะใด?',
        options: ['Congestive Heart Failure และ Diaphragmatic weakness', 'Pulmonary Embolism', 'Acute Bronchitis', 'Pneumothorax'],
        correctAnswerIndex: 0,
        category: 'Clinical Symptoms'
      },
      {
        id: 4,
        question: 'ผลการตรวจ Pulmonary Function Test (PFT) ในผู้ป่วยที่มีภาวะกล้ามเนื้อหายใจอ่อนแรง (Respiratory muscle weakness) มักแสดงรูปแบบใด?',
        options: ['Obstructive defect (FEV1/FVC < 70%)', 'Restrictive defect (TLC ลดลง, FVC ลดลง)', 'Mixed defect', 'Normal spirometry'],
        correctAnswerIndex: 1,
        category: 'Diagnostic Testing'
      },
      {
        id: 5,
        question: 'ในคนปกติ เมื่อเปลี่ยนจากท่านั่งเป็นท่านอนราบ (Supine position) ค่า Vital Capacity (VC) จะลดลงไม่เกินร้อยละเท่าใด?',
        options: ['ไม่ลดลงเลย', 'ลดลงประมาณ 5-10%', 'ลดลงมากกว่า 20%', 'ลดลง 50%'],
        correctAnswerIndex: 1,
        category: 'Physiology'
      },
      {
        id: 6,
        question: 'ผล Arterial Blood Gas (ABG) ของผู้ป่วยที่มีภาวะ Hypoventilation เรื้อรัง (เช่น จากภาวะอ้วนมาก หรือกล้ามเนื้ออ่อนแรง) มักพบการเปลี่ยนแปลงใด?',
        options: ['Respiratory Alkalosis', 'Metabolic Acidosis', 'Compensated Respiratory Acidosis (High PaCO2, High HCO3-)', 'Uncompensated Metabolic Alkalosis'],
        correctAnswerIndex: 2,
        category: 'Acid-Base Balance'
      },
      {
        id: 7,
        question: 'รากประสาท (Nerve roots) ของเส้นประสาทที่ไปเลี้ยงกะบังลม ออกมาจากไขสันหลังระดับใด?',
        options: ['C1, C2', 'C3, C4, C5', 'T1-T12', 'L1-L5'],
        correctAnswerIndex: 1,
        category: 'Anatomy'
      },
      {
        id: 8,
        question: 'ผู้ป่วยที่มีปัญหาภาวะอ้วนรุนแรง (Severe obesity) มักมีกลไกใดที่ทำให้เกิดปัญหาการหายใจ (Obesity Hypoventilation Syndrome)?',
        options: ['การสร้างเสมหะในหลอดลมมากเกินไป', 'น้ำหนักที่กดทับผนังทรวงอกและช่องท้องทำให้ความต้านทานการขยายตัวของปอดเพิ่มขึ้น', 'เชื้อแบคทีเรียเจริญเติบโตในถุงลมได้ดีขึ้น', 'หลอดลมตีบเกร็งจากภูมิแพ้'],
        correctAnswerIndex: 1,
        category: 'Pathophysiology'
      },
      {
        id: 9,
        question: 'อุปกรณ์ใดเหมาะสมที่สุดในการช่วยสนับสนุนการหายใจขณะหลับ สำหรับผู้ป่วยที่มีภาวะ Chronic Hypoventilation โดยยังไม่จำเป็นต้องใส่ท่อช่วยหายใจ?',
        options: ['Nasal cannula 3 LPM', 'Simple face mask', 'Non-invasive Positive Pressure Ventilation (NIPPV / BiPAP)', 'High-Flow Nasal Cannula (HFNC)'],
        correctAnswerIndex: 2,
        category: 'Respiratory Support'
      }
    ]
  },

,
  {
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
      '12': { text: '**SARS-CoV-2 RT-PCR:**\n- **Positive (Detected)**' },
      '7': { text: '**Chest X-ray (PA upright):**\n- **Bilateral diffuse alveolar infiltrates**.' },
      '13': { text: '**Arterial Blood Gas (Room Air):**\n- pH: 7.42, PaCO2: 30, PaO2: 60, HCO3-: 22\n- *Impression: Hypoxemia.*' },
      '14': { text: '**C-reactive protein (CRP):**\n- 80 mg/L (Normal <1 mg/L)' },
      '3': { text: '**Complete Blood Count (CBC):**\n- WBC: 5,000 /uL, Lymphocytes 25%' }
    },
    preTestQuestions: []
  },
  {
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
      '12': { text: '**SARS-CoV-2 RT-PCR:**\n- **Positive (Detected)**' },
      '7': { text: '**Chest X-ray (PA upright):**\n- Bilateral infiltrates, also cardiomegaly and mild fluid overload.' },
      '13': { text: '**Arterial Blood Gas (Room Air):**\n- pH: 7.35, PaCO2: 45, PaO2: 50, HCO3-: 24\n- *Impression: Severe hypoxemia.*' },
      '14': { text: '**C-reactive protein (CRP):**\n- 120 mg/L (Normal <1 mg/L)' },
      '3': { text: '**Complete Blood Count (CBC):**\n- WBC: 9,000 /uL, Lymphocytes 15%' }
    },
    preTestQuestions: []
  }
  ];

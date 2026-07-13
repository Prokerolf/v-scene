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
    specificLabResults: {
      '3': {
        text: '**Complete Blood Count (CBC):**\n- Hb: 13.2 g/dL\n- WBC: 11,500 /mcL\n- Differential: **Eosinophils 18% (High)**, Neutrophils 50%, Lymphocytes 30%, Monocytes 2%\n- *Impression: Marked Eosinophilia.*'
      },
      '10': {
        text: '**Sputum Examination:**\n- **AFB stain:** Negative x 3 days\n- **Direct smear:** Numerous Eosinophils seen. **Positive for unembryonated eggs with operculum (smooth thick shell, golden-brown color).**\n- *Impression: Paragonimus eggs identified.*'
      },
      '7': {
        text: '**Chest X-ray (PA upright):**\n- Pulmonary infiltrates at right lower lung zone.\n- Nodular cystic lesions (ring shadows) noted in the RLL.\n- Mild right pleural effusion.\n- No typical upper lobe cavitary lesions suggestive of TB.'
      }
    },
    preTestQuestions: [
      {
        id: 1,
        question: 'การติดเชื้อพยาธิใบไม้ปอด (Paragonimiasis) มักเกิดจากพฤติกรรมความเสี่ยงใด?',
        options: ['กินเนื้อหมูดิบ', 'กินปูน้ำจืดหรือกุ้งน้ำจืดดิบ', 'เดินเท้าเปล่าบนดิน', 'ยุงกัด'],
        correctAnswerIndex: 1,
        category: 'Parasitic Infection'
      },
      {
        id: 2,
        question: 'อาการทางคลินิกที่พบบ่อยและเป็นเอกลักษณ์ของผู้ป่วย Pulmonary Paragonimiasis คือข้อใด?',
        options: ['ไอแห้งๆ ไม่มีเสมหะ', 'ไอเรื้อรัง เสมหะสีสนิมเหล็ก (Rusty sputum)', 'ไอเป็นเลือดสดปริมาณมาก', 'ไอเสียงก้อง (Barking cough)'],
        correctAnswerIndex: 1,
        category: 'Clinical Presentation'
      },
      {
        id: 3,
        question: 'ความผิดปกติใดในผลตรวจเลือด (CBC) ที่ช่วยชี้แนะถึงการติดเชื้อพยาธิใบไม้ปอด?',
        options: ['Neutrophilia', 'Lymphocytosis', 'Eosinophilia', 'Basophilia'],
        correctAnswerIndex: 2,
        category: 'Laboratory Findings'
      },
      {
        id: 4,
        question: 'การวินิจฉัยยืนยัน (Definitive diagnosis) ของโรคพยาธิใบไม้ปอด อาศัยการตรวจพบสิ่งใด?',
        options: ['Acid-Fast Bacilli ในเสมหะ', 'ไข่พยาธิลักษณะมีฝาเปิด (Operculum) ในเสมหะ', 'IgG antibody ต่อพยาธิใบไม้ตับ', 'Cysts ในภาพรังสีทรวงอก'],
        correctAnswerIndex: 1,
        category: 'Diagnosis'
      },
      {
        id: 5,
        question: 'ยาชนิดใดเป็นยาหลัก (Drug of choice) ในการรักษา Pulmonary Paragonimiasis?',
        options: ['Albendazole', 'Mebendazole', 'Praziquantel', 'Ivermectin'],
        correctAnswerIndex: 2,
        category: 'Pharmacology'
      },
      {
        id: 6,
        question: 'ภาพรังสีทรวงอก (CXR) ของผู้ป่วย Pulmonary Paragonimiasis อาจพบรอยโรคใดที่เด่นชัด?',
        options: ['Miliary nodules', 'Nodular cysts or ring shadows', 'Lobar consolidation', 'Tension pneumothorax'],
        correctAnswerIndex: 1,
        category: 'Radiology'
      },
      {
        id: 7,
        question: 'โรคติดเชื้อชนิดใดที่มักถูกวินิจฉัยผิด (Misdiagnosed) ว่าเป็น Paragonimiasis มากที่สุดในประเทศไทยเนื่องจากอาการคล้ายกัน?',
        options: ['Pulmonary Tuberculosis', 'Lung Cancer', 'Bacterial Pneumonia', 'Asthma'],
        correctAnswerIndex: 0,
        category: 'Differential Diagnosis'
      },
      {
        id: 8,
        question: 'ระยะใดของพยาธิ Paragonimus westermani ที่เป็นระยะติดต่อ (Infective stage) เข้าสู่ร่างกายมนุษย์?',
        options: ['Miracidium', 'Cercaria', 'Metacercaria', 'Adult worm'],
        correctAnswerIndex: 2,
        category: 'Parasite Life Cycle'
      },
      {
        id: 9,
        question: 'หลังจากที่พยาธิระยะ Metacercaria เข้าสู่ร่างกายมนุษย์ทางระบบทางเดินอาหาร มันจะไชทะลุอวัยวะใดเพื่อเดินทางไปที่ปอด?',
        options: ['กระเพาะอาหารและตับ', 'ลำไส้และกะบังลม (Diaphragm)', 'หลอดอาหาร', 'เส้นเลือดดำใหญ่ (Vena cava)'],
        correctAnswerIndex: 1,
        category: 'Pathogenesis'
      }
    ]
  },
  {
    id: 'case_covid_pneumonia',
    tier: 'Mid',
    diseaseName: 'COVID-19 Pneumonia with Acute Hypoxemic Respiratory Failure',
    patientName: 'คุณสมศรี รักสะอาด',
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
    personaDetails: 'หญิงไทยอายุ 45 ปี เป็นแม่บ้าน รูปร่างอ้วนและมีโรคประจำตัวเป็นเบาหวาน มีไข้สูง ไอแห้งๆ อ่อนเพลีย กินข้าวไม่ได้และจมูกไม่ได้กลิ่นมา 5 วัน หายใจหอบเหนื่อยมากจนต้องมา รพ. กังวลมากเพราะเพิ่งไปกินข้าวกับเพื่อนที่ติดโควิดมาสัปดาห์ก่อน',
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
    ddxExplanation: 'อาการไข้ ไอแห้ง หอบเหนื่อย หายใจเร็ว SpO2 ต่ำ ร่วมกับภาวะ Anosmia (สูญเสียการได้กลิ่น) และประวัติสัมผัสผู้ป่วยยืนยัน บ่งชี้ไปทางโรคติดเชื้อ COVID-19 อย่างชัดเจน',
    diagnosisExplanation: 'ผล RT-PCR สำหรับ SARS-CoV-2 เป็นบวก ภาพรังสีพบ Bilateral diffuse alveolar infiltrates และผล ABG เข้าได้กับ Acute Hypoxemic Respiratory Failure ยืนยันการวินิจฉัย COVID-19 Pneumonia',
    specificLabResults: {
      '12': {
        text: '**SARS-CoV-2 RT-PCR:**\n- **Positive (Detected)**'
      },
      '7': {
        text: '**Chest X-ray (PA upright):**\n- **Bilateral diffuse alveolar infiltrates** with peripheral and lower lung predominance.\n- No pleural effusion.\n- Normal cardiac size.'
      },
      '13': {
        text: '**Arterial Blood Gas (Room Air):**\n- pH: 7.48\n- PaCO2: 25 mmHg\n- PaO2: 55 mmHg\n- HCO3-: 21 mEq/L\n- *Impression: Uncompensated respiratory alkalosis with severe hypoxemia (Type I Respiratory Failure).*'
      },
      '14': {
        text: '**C-reactive protein (CRP):**\n- 100 mg/L (Normal <1 mg/L)'
      },
      '3': {
        text: '**Complete Blood Count (CBC):**\n- WBC: 4,000 /uL (Neutrophils 60%, Lymphocytes 30%)\n- Hb: 12 g/dL\n- Plt: 250,000 /uL\n- *Impression: Normal WBC count with relative lymphopenia common in viral infection.*'
      }
    },
    preTestQuestions: [
      {
        id: 1,
        question: 'อาการทางคลินิกใดที่พบได้บ่อยและค่อนข้างจำเพาะเจาะจงในผู้ป่วย COVID-19 ระยะแรก?',
        options: ['ไอมีเสมหะสีเขียว', 'สูญเสียการได้กลิ่น (Anosmia)', 'เจ็บหน้าอกแปลบๆ เวลาหายใจ', 'ไอเป็นเลือด'],
        correctAnswerIndex: 1,
        category: 'Clinical Presentation'
      },
      {
        id: 2,
        question: 'ภาวะ Acute Hypoxemic Respiratory Failure (Type I) มีลักษณะผล Arterial Blood Gas (ABG) อย่างไร?',
        options: ['PaO2 ต่ำ, PaCO2 สูง', 'PaO2 ต่ำ, PaCO2 ปกติหรือต่ำ', 'PaO2 ปกติ, PaCO2 สูง', 'PaO2 สูง, PaCO2 ปกติ'],
        correctAnswerIndex: 1,
        category: 'Respiratory Physiology'
      },
      {
        id: 3,
        question: 'ภาพรังสีทรวงอก (CXR) ในผู้ป่วยรุนแรงจาก COVID-19 Pneumonia มักมีลักษณะอย่างไร?',
        options: ['Bilateral peripheral alveolar infiltrates', 'Unilateral lobar consolidation', 'Large pleural effusion', 'Apical cavitary lesions'],
        correctAnswerIndex: 0,
        category: 'Radiology'
      },
      {
        id: 4,
        question: 'ยาต้านการอักเสบกลุ่มใดที่ได้รับการพิสูจน์แล้วว่าช่วยลดอัตราการเสียชีวิตในผู้ป่วย COVID-19 ที่ต้องการออกซิเจน?',
        options: ['NSAIDs (เช่น Ibuprofen)', 'Corticosteroids (เช่น Dexamethasone)', 'Antihistamines', 'Leukotriene receptor antagonists'],
        correctAnswerIndex: 1,
        category: 'Pharmacology'
      },
      {
        id: 5,
        question: 'การบำบัดด้วยออกซิเจนแบบ High-Flow Nasal Cannula (HFNC) มีกลไกหลักอย่างไรที่เหนือกว่า Nasal Cannula ธรรมดา?',
        options: ['ให้ยาขยายหลอดลมผสมไปกับออกซิเจนได้', 'ให้อัตราการไหลสูงและสร้างแรงดันบวก (PEEP) อ่อนๆ', 'ไม่ต้องใช้น้ำให้ความชื้น', 'ลดคาร์บอนไดออกไซด์ได้ดีกว่าเครื่องช่วยหายใจ'],
        correctAnswerIndex: 1,
        category: 'Respiratory Support'
      },
      {
        id: 6,
        question: 'ผู้ป่วย COVID-19 รุนแรงมักได้รับยา Low-molecular-weight heparin (LMWH) เพื่อจุดประสงค์ใด?',
        options: ['ลดการอักเสบในปอด', 'ป้องกันภาวะหลอดเลือดดำอุดตัน (VTE Prophylaxis)', 'ฆ่าเชื้อไวรัส', 'รักษาภาวะน้ำท่วมปอด'],
        correctAnswerIndex: 1,
        category: 'Complication Management'
      },
      {
        id: 7,
        question: 'การตรวจวินิจฉัยยืนยัน (Gold standard) การติดเชื้อ SARS-CoV-2 ในระยะเฉียบพลันคือวิธีใด?',
        options: ['Chest X-ray', 'RT-PCR จากสิ่งส่งตรวจทางเดินหายใจ', 'Rapid Antigen Test (ATK)', 'Serology (IgG/IgM)'],
        correctAnswerIndex: 1,
        category: 'Diagnosis'
      },
      {
        id: 8,
        question: 'ยาต้านไวรัสชนิดใดที่มักบริหารทางหลอดเลือดดำ (IV) สำหรับรักษาผู้ป่วย COVID-19 ปอดอักเสบ?',
        options: ['Oseltamivir', 'Acyclovir', 'Remdesivir', 'Favipiravir'],
        correctAnswerIndex: 2,
        category: 'Antiviral Therapy'
      },
      {
        id: 9,
        question: 'ปัจจัยเสี่ยง (Risk factors) ใดที่สัมพันธ์กับความรุนแรงของโรค COVID-19 มากที่สุด?',
        options: ['อายุ < 20 ปี', 'โรคหอบหืดที่ควบคุมได้', 'โรคเบาหวานและภาวะอ้วน (Obesity)', 'ประวัติการผ่าตัดไส้ติ่ง'],
        correctAnswerIndex: 2,
        category: 'Risk Factors'
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
    specificLabResults: {
      '4': {
        text: '**Pulmonary Function Test (PFT) & Spirometry (Upright):**\n- TLC: 44.2% predicted\n- VC: 37.6% predicted\n- RV: 127% predicted\n- FVC: 38.6% predicted\n- FEV1: 39.3% predicted\n- DLCO: 88%, DLCO/VA: 80%\n- MIP: 36 cmH2O (Decreased)\n- MEP: 70 cmH2O\n\n**Spirometry (Supine position):**\n- **VC decreased by 20%** compared to upright position.\n- *Impression: Severe restrictive lung defect with significant supine worsening, highly suggestive of diaphragmatic weakness/paralysis.*'
      },
      '13': {
        text: '**Arterial Blood Gas (Room air):**\n- pH: 7.42\n- pCO2: 54 mmHg (Hypercapnia)\n- pO2: 63 mmHg (Hypoxemia)\n- HCO3-: 40.9 mEq/L (Metabolic compensation)\n- SaO2: 88.2%\n- *Impression: Fully compensated chronic respiratory acidosis.*'
      },
      '7': {
        text: '**Chest X-ray (PA upright):**\n- Elevated hemidiaphragms bilaterally.\n- Decreased lung volumes.\n- No evidence of pulmonary edema or acute infiltrates.'
      }
    },
    preTestQuestions: [
      {
        id: 1,
        question: 'กล้ามเนื้อใดเป็นกล้ามเนื้อหลักที่ใช้ในการหายใจเข้า (Primary muscle of inspiration)?',
        options: ['Internal intercostals', 'Diaphragm (กะบังลม)', 'Sternocleidomastoid', 'Abdominal rectus'],
        correctAnswerIndex: 1,
        category: 'Respiratory Anatomy'
      },
      {
        id: 2,
        question: 'กะบังลม (Diaphragm) ได้รับการควบคุมและสั่งการจากเส้นประสาทใด?',
        options: ['Vagus nerve (CN X)', 'Phrenic nerve', 'Intercostal nerves', 'Hypoglossal nerve'],
        correctAnswerIndex: 1,
        category: 'Neuroanatomy'
      },
      {
        id: 3,
        question: 'เส้นประสาท Phrenic Nerve มีรากประสาท (Nerve roots) มาจากระดับใดของไขสันหลังส่วนคอ?',
        options: ['C1, C2, C3', 'C3, C4, C5', 'C5, C6, C7', 'C7, T1, T2'],
        correctAnswerIndex: 1,
        category: 'Spinal Cord Anatomy'
      },
      {
        id: 4,
        question: 'อาการหอบเหนื่อยที่รุนแรงขึ้นเวลานอนราบ เรียกว่าอะไร?',
        options: ['Platypnea', 'Trepopnea', 'Orthopnea', 'Paroxysmal nocturnal dyspnea'],
        correctAnswerIndex: 2,
        category: 'Clinical Symptoms'
      },
      {
        id: 5,
        question: 'เหตุใดผู้ป่วยที่มีภาวะ Diaphragmatic Paralysis ทั้งสองข้าง จึงมีอาการหอบเหนื่อยรุนแรงเวลานอนราบ (Supine)?',
        options: ['เลือดดำไหลกลับเข้าหัวใจมากเกินไปจนน้ำท่วมปอด', 'อวัยวะในช่องท้องดันกะบังลมที่อ่อนแรงขึ้นไปในช่องอก', 'ทางเดินหายใจส่วนบนยุบตัว', 'ปริมาณออกซิเจนในเลือดลดลงจากแรงโน้มถ่วง'],
        correctAnswerIndex: 1,
        category: 'Pathophysiology'
      },
      {
        id: 6,
        question: 'ผลการตรวจสมรรถภาพปอด (Spirometry) ของผู้ป่วย Diaphragmatic paralysis มักพบความผิดปกติแบบใด?',
        options: ['Obstructive defect', 'Restrictive defect', 'Mixed obstructive and restrictive defect', 'Normal lung function'],
        correctAnswerIndex: 1,
        category: 'Pulmonary Function Test'
      },
      {
        id: 7,
        question: 'การทำ Spirometry เปรียบเทียบระหว่างท่านั่ง (Upright) และท่านอนราบ (Supine) ในผู้ป่วยกะบังลมอัมพาต จะพบการเปลี่ยนแปลงใดที่เป็นเอกลักษณ์?',
        options: ['ค่า FEV1/FVC ratio ลดลงมากในท่านอน', 'ค่า Vital Capacity (VC) ลดลงมากกว่า 20% ในท่านอน', 'ค่า Total Lung Capacity เพิ่มขึ้นในท่านอน', 'ไม่พบการเปลี่ยนแปลงใดๆ'],
        correctAnswerIndex: 1,
        category: 'Diagnostic Testing'
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
  }
];

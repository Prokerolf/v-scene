export interface DiseaseItem {
  id: string;
  nameEn: string;
  nameTh: string;
  category?: string;
  abbreviation?: string;
  aliases?: string[];
}

export const COMPREHENSIVE_DISEASES: DiseaseItem[] = [
  // Respiratory
  { id: 'asthma', nameEn: 'Asthma', nameTh: 'โรคหอบหืด', category: 'Respiratory', abbreviation: 'BA', aliases: ['หอบหืด', 'หอบ', ' bronchial asthma'] },
  { id: 'copd', nameEn: 'Chronic Obstructive Pulmonary Disease', nameTh: 'โรคปอดอุดกั้นเรื้อรัง', category: 'Respiratory', abbreviation: 'COPD', aliases: ['ปอดอุดกั้น', 'ถุงลมโป่งพอง'] },
  { id: 'cap', nameEn: 'Community-Acquired Pneumonia', nameTh: 'ปอดอักเสบชุมชน / ปอดบวม', category: 'Respiratory', abbreviation: 'CAP', aliases: ['ปอดอักเสบ', 'ปอดบวม', 'pneumonia'] },
  { id: 'tb_pulmonary', nameEn: 'Pulmonary Tuberculosis', nameTh: 'วัณโรคปอด', category: 'Respiratory', abbreviation: 'TB', aliases: ['วัณโรค', 'ปอดติดเชื้อวัณโรค'] },
  { id: 'pleural_effusion', nameEn: 'Pleural Effusion', nameTh: 'น้ำในโพรงเยื่อหุ้มปอด', category: 'Respiratory', aliases: ['น้ำท่วมปอด', 'น้ำในปอด'] },
  { id: 'empyema', nameEn: 'Empyema Thoracis', nameTh: 'หนองในโพรงเยื่อหุ้มปอด', category: 'Respiratory', aliases: ['หนองในปอด'] },
  { id: 'pneumothorax', nameEn: 'Pneumothorax', nameTh: 'ลมในโพรงเยื่อหุ้มปอด', category: 'Respiratory', aliases: ['ลมรั่วในปอด', 'ปอดรั่ว'] },
  { id: 'lung_cancer', nameEn: 'Lung Cancer', nameTh: 'มะเร็งปอด', category: 'Respiratory', aliases: ['มะเร็ง'] },
  { id: 'pulmonary_embolism', nameEn: 'Pulmonary Embolism', nameTh: 'ลิ่มเลือดอุดตันในปอด', category: 'Respiratory', abbreviation: 'PE', aliases: ['ลิ่มเลือดปอด'] },
  { id: 'paragonimiasis', nameEn: 'Pulmonary Paragonimiasis', nameTh: 'โรคพยาธิใบไม้ปอด', category: 'Parasitic', aliases: ['พยาธิใบไม้ปอด', 'ปอดอักเสบจากพยาธิ'] },

  // Infectious & Tropical
  { id: 'dengue', nameEn: 'Dengue Hemorrhagic Fever', nameTh: 'ไข้เลือดออกเดงกี', category: 'Infectious', abbreviation: 'DHF', aliases: ['ไข้เลือดออก', 'เดงกี', 'dengue'] },
  { id: 'leptospirosis', nameEn: 'Leptospirosis', nameTh: 'โรคฉี่หนู / ไข้ฉี่หนู', category: 'Infectious', aliases: ['ฉี่หนู', 'ไข้ฉี่หนู', 'เลปโตสไปโรซิส'] },
  { id: 'melioidosis', nameEn: 'Melioidosis', nameTh: 'โรคเมลีออยโดสิส / ไข้ดิน', category: 'Infectious', aliases: ['เมลีออยด์', 'ไข้ดิน'] },
  { id: 'scrub_typhus', nameEn: 'Scrub Typhus', nameTh: 'โรคไข้รากสาดใหญ่ (ไรอ่อน)', category: 'Infectious', aliases: ['ไข้รากสาด', 'เอสชาร์', 'eschar'] },
  { id: 'malaria', nameEn: 'Malaria (Plasmodium falciparum / vivax)', nameTh: 'ไข้มาลาเรีย / ไข้ป่า', category: 'Infectious', aliases: ['มาลาเรีย', 'ไข้จับสั่น', 'ไข้ป่า'] },
  { id: 'sepsis', nameEn: 'Sepsis / Septic Shock', nameTh: 'ภาวะติดเชื้อในกระแสเลือด', category: 'Infectious', aliases: ['ติดเชื้อในกระแสเลือด', 'ช็อกจากการติดเชื้อ'] },
  { id: 'covid19', nameEn: 'COVID-19 Pneumonia', nameTh: 'โรคโควิด-19', category: 'Infectious', abbreviation: 'COVID', aliases: ['โควิด', 'โควิด19'] },
  { id: 'influenza', nameEn: 'Influenza', nameTh: 'ไข้หวัดใหญ่', category: 'Infectious', aliases: ['ไข้หวัดใหญ่', 'หวัดใหญ่'] },
  { id: 'rabies', nameEn: 'Rabies', nameTh: 'โรคพิษสุนัขบ้า', category: 'Infectious', aliases: ['พิษสุนัขบ้า', 'โรคกลัวน้ำ'] },

  // Parasitic & Neurology
  { id: 'ncc', nameEn: 'Neurocysticercosis', nameTh: 'โรคถุงพยาธิหมูในสมอง', category: 'Parasitic', abbreviation: 'NCC', aliases: ['พยาธิหมูขึ้นสมอง', 'ถุงพยาธิหมู', 'พยาธิตืดหมู'] },
  { id: 'czs', nameEn: 'Congenital Zika Syndrome', nameTh: 'กลุ่มอาการไวรัสซีกาแต่กำเนิด', category: 'Infectious', abbreviation: 'CZS', aliases: ['ซีกา', 'ศีรษะเล็กแต่กำเนิด'] },
  { id: 'strongyloidiasis', nameEn: 'Strongyloidiasis Hyperinfection', nameTh: 'โรคพยาธิสตรองจิรอยด์แพร่กระจาย', category: 'Parasitic', aliases: ['พยาธิเส้นด้าย', 'สตรองจิรอยด์'] },
  { id: 'gnathostomiasis', nameEn: 'Gnathostomiasis', nameTh: 'โรคพยาธิตัวจี๊ด', category: 'Parasitic', aliases: ['ตัวจี๊ด', 'พยาธิตัวจี๊ด'] },
  { id: 'angiostrongyliasis', nameEn: 'Eosinophilic Meningitis (Angiostrongyliasis)', nameTh: 'เยื่อหุ้มสมองอักเสบจากพยาธิปอดหนู', category: 'Parasitic', aliases: ['พยาธิปอดหนู', 'เยื่อหุ้มสมองอักเสบ'] },
  { id: 'toxoplasmosis', nameEn: 'Cerebral Toxoplasmosis', nameTh: 'ท็อกโซพลาสโมซิสในสมอง', category: 'Parasitic', aliases: ['ขี้แมวขึ้นสมอง', 'พยาธิขี้แมว'] },
  { id: 'amoebic_abscess', nameEn: 'Amoebic Liver Abscess', nameTh: 'ฝีในตับจากอะมีบา', category: 'Parasitic', aliases: ['ฝีตับ', 'อะมีบา'] },
  { id: 'opisthorchiasis', nameEn: 'Opisthorchiasis', nameTh: 'โรคพยาธิใบไม้ตับ', category: 'Parasitic', aliases: ['พยาธิใบไม้ตับ', 'มะเร็งท่อน้ำดี'] },
  { id: 'cholangiocarcinoma', nameEn: 'Cholangiocarcinoma', nameTh: 'มะเร็งท่อน้ำดี', category: 'Oncology', abbreviation: 'CCA', aliases: ['มะเร็งท่อน้ำดี', 'พยาธิใบไม้ตับ'] },

  // Neurology
  { id: 'stroke_ischemic', nameEn: 'Acute Ischemic Stroke', nameTh: 'โรคหลอดเลือดสมองตีบ/อุดตันฉับพลัน', category: 'Neurology', abbreviation: 'AIS', aliases: ['สโตรก', 'อัมพฤกษ์', 'อัมพาต', 'สมองขาดเลือด'] },
  { id: 'stroke_hemorrhagic', nameEn: 'Intracerebral Hemorrhage', nameTh: 'เลือดออกในเนื้อสมอง', category: 'Neurology', abbreviation: 'ICH', aliases: ['เส้นเลือดสมองแตก', 'เลือดออกในสมอง'] },
  { id: 'sah', nameEn: 'Subarachnoid Hemorrhage', nameTh: 'เลือดออกใต้ชั้นเยื่อหุ้มสมอง', category: 'Neurology', abbreviation: 'SAH', aliases: ['เลือดออกใต้เยื่อหุ้มสมอง', 'ปวดศีรษะรุนแรงเฉียบพลัน'] },
  { id: 'meningitis_bacterial', nameEn: 'Acute Bacterial Meningitis', nameTh: 'เยื่อหุ้มสมองอักเสบจากแบคทีเรีย', category: 'Neurology', aliases: ['เยื่อหุ้มสมองอักเสบ', 'ไข้คอแข็ง'] },
  { id: 'encephalitis_viral', nameEn: 'Viral Encephalitis', nameTh: 'สมองอักเสบจากไวรัส', category: 'Neurology', aliases: ['สมองอักเสบ', 'ไข้สมองอักเสบ'] },
  { id: 'epilepsy', nameEn: 'Epilepsy / Seizure Disorder', nameTh: 'โรคโรคลมชัก / อาการชัก', category: 'Neurology', aliases: ['ลมชัก', 'ชักกระตุก', 'ชักเกร็ง'] },

  // Cardiovascular
  { id: 'stemi', nameEn: 'ST-Elevation Myocardial Infarction', nameTh: 'กล้ามเนื้อหัวใจขาดเลือดฉับพลันชนิด ST ยก', category: 'Cardiology', abbreviation: 'STEMI', aliases: ['หัวใจวาย', 'กล้ามเนื้อหัวใจตาย', 'เจ็บหน้าอก'] },
  { id: 'nstemi', nameEn: 'Non-ST-Elevation Myocardial Infarction / Unstable Angina', nameTh: 'กล้ามเนื้อหัวใจขาดเลือดฉับพลันชนิด ST ไม่ยก', category: 'Cardiology', abbreviation: 'NSTEMI', aliases: ['เจ็บแน่นหน้าอก'] },
  { id: 'heart_failure', nameEn: 'Acute Decompensated Heart Failure', nameTh: 'ภาวะหัวใจล้มเหลวเฉียบพลัน', category: 'Cardiology', abbreviation: 'ADHF', aliases: ['หัวใจล้มเหลว', 'หัวใจโต', 'เหนื่อยหอบ'] },
  { id: 'infective_endocarditis', nameEn: 'Infective Endocarditis', nameTh: 'การติดเชื้อที่ลิ้นหัวใจ', category: 'Cardiology', abbreviation: 'IE', aliases: ['ลิ้นหัวใจติดเชื้อ'] },

  // GI & Abdomen
  { id: 'appendicitis', nameEn: 'Acute Appendicitis', nameTh: 'ไส้ติ่งอักเสบเฉียบพลัน', category: 'Gastroenterology', aliases: ['ไส้ติ่งอักเสบ', 'ปวดท้องขวาล่าง'] },
  { id: 'cholecystitis', nameEn: 'Acute Cholecystitis', nameTh: 'ถุงน้ำดีอักเสบเฉียบพลัน', category: 'Gastroenterology', aliases: ['ถุงน้ำดีอักเสบ', 'นิ่วในถุงน้ำดี'] },
  { id: 'pud', nameEn: 'Peptic Ulcer Disease', nameTh: 'โรคแผลในกระเพาะอาหาร/ลำไส้เล็ก', category: 'Gastroenterology', abbreviation: 'PUD', aliases: ['แผลกระเพาะอาหาร', 'โรคกระเพาะ', 'ปวดใต้ลิ้นปี่'] },
  { id: 'gastroenteritis', nameEn: 'Acute Gastroenteritis', nameTh: 'ลำไส้อักเสบเฉียบพลัน / ท้องเสีย', category: 'Gastroenterology', abbreviation: 'AGE', aliases: ['อุจจาระร่วง', 'ท้องเสีย', 'อาหารเป็นพิษ'] },
  { id: 'cirrhosis', nameEn: 'Liver Cirrhosis', nameTh: 'โรคตับแข็ง', category: 'Gastroenterology', aliases: ['ตับแข็ง', 'ท้องมาร', 'ตัวเหลืองตาเหลือง'] },

  // Renal & Endocrine
  { id: 'aki', nameEn: 'Acute Kidney Injury', nameTh: 'ภาวะไตวายเฉียบพลัน', category: 'Nephrology', abbreviation: 'AKI', aliases: ['ไตวาย', 'ไตเฉียบพลัน'] },
  { id: 'ckd', nameEn: 'Chronic Kidney Disease', nameTh: 'โรคไตเรื้อรัง', category: 'Nephrology', abbreviation: 'CKD', aliases: ['ไตเรื้อรัง', 'ไตเสื่อม'] },
  { id: 'uti', nameEn: 'Urinary Tract Infection / Pyelonephritis', nameTh: 'การติดเชื้อทางเดินปัสสาวะ / กรวยไตอักเสบ', category: 'Nephrology', abbreviation: 'UTI', aliases: ['ปัสสาวะแสบขัด', 'กรวยไตอักเสบ'] },
  { id: 'dka', nameEn: 'Diabetic Ketoacidosis', nameTh: 'ภาวะเลือดเป็นกรดจากเบาหวาน', category: 'Endocrinology', abbreviation: 'DKA', aliases: ['เบาหวานเป็นกรด', 'น้ำตาลสูง'] },
  { id: 'hyperthyroid', nameEn: 'Thyrotoxicosis / Graves Disease', nameTh: 'ภาวะต่อมไทรอยด์เป็นพิษ', category: 'Endocrinology', aliases: ['ไทรอยด์เป็นพิษ', 'ไทรอยด์โต', 'ใจสั่น'] },

  // Hematology & Rheumatology
  { id: 'ida', nameEn: 'Iron Deficiency Anemia', nameTh: 'โลหิตจางจากการขาดธาตุเหล็ก', category: 'Hematology', abbreviation: 'IDA', aliases: ['ซีด', 'ขาดธาตุเหล็ก'] },
  { id: 'thalassemia', nameEn: 'Thalassemia Syndrome', nameTh: 'โรคทาลาสซีเมีย', category: 'Hematology', aliases: ['ทาลาสซีเมีย', 'เลือดจางพันธุกรรม'] },
  { id: 'sle', nameEn: 'Systemic Lupus Erythematosus', nameTh: 'โรคพุ่มพวง / เอสแอลอี', category: 'Rheumatology', abbreviation: 'SLE', aliases: ['โรคพุ่มพวง', 'แพ้ภูมิตัวเอง'] },
];

/**
 * Filter diseases by matching query against English name, Thai name, abbreviation, and aliases
 */
export function searchDiseases(query: string, limit = 8): DiseaseItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return COMPREHENSIVE_DISEASES.filter(d => {
    const matchEn = d.nameEn.toLowerCase().includes(q);
    const matchTh = d.nameTh.toLowerCase().includes(q);
    const matchAbbr = d.abbreviation ? d.abbreviation.toLowerCase().includes(q) : false;
    const matchAlias = d.aliases ? d.aliases.some(a => a.toLowerCase().includes(q)) : false;

    return matchEn || matchTh || matchAbbr || matchAlias;
  }).slice(0, limit);
}

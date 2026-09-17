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
  phase: 1 | 2;
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
    "id": "ncc_low",
    "phase": 1,
    "tier": "Low",
    "diseaseName": "Neurocysticercosis (NCC)",
    "patientName": "สมศรี รักผักสด",
    "age": 35,
    "gender": "Female",
    "chiefComplaint": "มีอาการชักเกร็งกระตุกทั้งตัว 1 ครั้ง เป็นเวลาประมาณ 2 นาทีก่อนมาโรงพยาบาล",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Central Nervous System (Parietal lobe)",
    "etiology": "Taenia solium (Metacestode / Cysticercus cellulosae stage)",
    "goldStandardLabs": [
      "Stool Examination",
      "Non-contrast & Contrast-enhanced CT Brain",
      "Brain MRI",
      "Serum Antibody Detection (EITB)"
    ],
    "goldStandardDrugs": [
      "Oral Albendazole",
      "Oral Dexamethasone",
      "Levetiracetam"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "พนักงานออฟฟิศ ภูมิลำเนาเดิมจังหวัดแพร่ ชอบรับประทานผักสดและผลไม้ที่ซื้อจากตลาดสดเป็นประจำ ล้างน้ำแบบเร็วๆ คนในครอบครัวเคยถ่ายเป็นปล้องพยาธิแบนๆ",
    "voiceProfile": "adult_female",
    "ddxKeywords": [
      "Tuberculoma",
      "Pyogenic Brain Abscess",
      "Primary Brain Tumor",
      "Cerebral Toxoplasmosis"
    ],
    "finalDiagnosisKeywords": [
      "Neurocysticercosis",
      "NCC",
      "Taenia solium"
    ],
    "vitals": {
      "bp": "124/78",
      "hr": 82,
      "rr": 16,
      "temp": 36.8,
      "spo2": 99,
      "weight": 55,
      "height": 160
    },
    "ddxGroup": "New-onset seizure with Intracranial mass lesion",
    "ddxExplanation": "อาการชักและก้อนใต้ผิวหนังบ่งชี้ถึงการติดเชื้อพยาธิตืดหมู",
    "diagnosisExplanation": "พบ Subcutaneous nodule และ CT Brain พบ \"Hole-with-dot\" sign",
    "treatmentExplanation": "ต้องให้ยา Albendazole ร่วมกับ Corticosteroid เพื่อลดอาการสมองบวมจากการตายของพยาธิ",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 1,
        "question": "Mock Question 1 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      },
      {
        "id": 2,
        "question": "Mock Question 2 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      },
      {
        "id": 3,
        "question": "Mock Question 3 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      },
      {
        "id": 4,
        "question": "Mock Question 4 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      },
      {
        "id": 5,
        "question": "Mock Question 5 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      },
      {
        "id": 6,
        "question": "Mock Question 6 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      },
      {
        "id": 7,
        "question": "Mock Question 7 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      },
      {
        "id": 8,
        "question": "Mock Question 8 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      },
      {
        "id": 9,
        "question": "Mock Question 9 for ncc_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Low"
      }
    ]
  },
  {
    "id": "ncc_mid",
    "phase": 1,
    "tier": "Mid",
    "diseaseName": "Neurocysticercosis (NCC)",
    "patientName": "วิชัย ชัยชนะ",
    "age": 42,
    "gender": "Male",
    "chiefComplaint": "ปวดศีรษะเรื้อรัง เป็นๆ หายๆ มา 3 เดือน และมีอาการชาครึ่งซีก",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Central Nervous System",
    "etiology": "Taenia solium (Metacestode / Cysticercus cellulosae stage)",
    "goldStandardLabs": [
      "Stool Examination",
      "Non-contrast & Contrast-enhanced CT Brain",
      "Brain MRI",
      "Serum Antibody Detection (EITB)"
    ],
    "goldStandardDrugs": [
      "Oral Albendazole",
      "Oral Dexamethasone",
      "Levetiracetam"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "เกษตรกร มีประวัติปวดศีรษะตื้อๆ ทั่วศีรษะ อาการคล้ายเนื้องอกในสมอง หรือ Tuberculoma แต่ไม่มีไข้ หรือ B-symptoms",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Tuberculoma",
      "Pyogenic Brain Abscess",
      "Primary Brain Tumor",
      "Cerebral Toxoplasmosis"
    ],
    "finalDiagnosisKeywords": [
      "Neurocysticercosis",
      "NCC",
      "Taenia solium"
    ],
    "vitals": {
      "bp": "130/85",
      "hr": 78,
      "rr": 18,
      "temp": 37,
      "spo2": 98,
      "weight": 68,
      "height": 172
    },
    "ddxGroup": "Chronic headache with focal neurological deficit",
    "ddxExplanation": "อาการคล้าย Primary Brain Tumor หรือ Tuberculoma",
    "diagnosisExplanation": "CT Brain พบ Ring-enhancing lesion ต้องแยกโรคกับวัณโรคสมอง",
    "treatmentExplanation": "การให้ยาต้องเริ่มด้วย Corticosteroid ก่อนให้ยาฆ่าพยาธิ",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 10,
        "question": "Mock Question 1 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      },
      {
        "id": 11,
        "question": "Mock Question 2 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      },
      {
        "id": 12,
        "question": "Mock Question 3 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      },
      {
        "id": 13,
        "question": "Mock Question 4 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      },
      {
        "id": 14,
        "question": "Mock Question 5 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      },
      {
        "id": 15,
        "question": "Mock Question 6 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      },
      {
        "id": 16,
        "question": "Mock Question 7 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      },
      {
        "id": 17,
        "question": "Mock Question 8 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      },
      {
        "id": 18,
        "question": "Mock Question 9 for ncc_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_Mid"
      }
    ]
  },
  {
    "id": "ncc_high",
    "phase": 1,
    "tier": "High",
    "diseaseName": "Neurocysticercosis (NCC)",
    "patientName": "สุรศักดิ์ หนักแน่น",
    "age": 28,
    "gender": "Male",
    "chiefComplaint": "ชักเกร็งต่อเนื่อง (Status Epilepticus) และซึมลง",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Central Nervous System",
    "etiology": "Taenia solium (Metacestode / Cysticercus cellulosae stage)",
    "goldStandardLabs": [
      "Stool Examination",
      "Non-contrast & Contrast-enhanced CT Brain",
      "Brain MRI",
      "Serum Antibody Detection (EITB)"
    ],
    "goldStandardDrugs": [
      "Oral Albendazole",
      "Oral Dexamethasone",
      "Levetiracetam"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "ผู้ป่วยหมดสติ ญาตินำส่ง ประวัติเคยกินหมูดิบเมื่อหลายปีก่อน มีภาวะความดันในกะโหลกศีรษะสูง",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Tuberculoma",
      "Pyogenic Brain Abscess",
      "Primary Brain Tumor",
      "Cerebral Toxoplasmosis"
    ],
    "finalDiagnosisKeywords": [
      "Neurocysticercosis",
      "NCC",
      "Taenia solium"
    ],
    "vitals": {
      "bp": "160/90",
      "hr": 110,
      "rr": 24,
      "temp": 37.5,
      "spo2": 95,
      "weight": 70,
      "height": 175
    },
    "ddxGroup": "Status epilepticus with increased intracranial pressure",
    "ddxExplanation": "สาเหตุที่เป็นไปได้รวมถึง Severe NCC, Encephalitis, Severe head trauma",
    "diagnosisExplanation": "พบซีสต์จำนวนมากในสมอง (Massive infection) ทำให้เกิดภาวะฉุกเฉิน",
    "treatmentExplanation": "ต้องให้ยากันชักฉีดเข้าเส้นเลือด และจัดการภาวะความดันในสมองสูง ก่อนรักษาสาเหตุ",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 19,
        "question": "Mock Question 1 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      },
      {
        "id": 20,
        "question": "Mock Question 2 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      },
      {
        "id": 21,
        "question": "Mock Question 3 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      },
      {
        "id": 22,
        "question": "Mock Question 4 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      },
      {
        "id": 23,
        "question": "Mock Question 5 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      },
      {
        "id": 24,
        "question": "Mock Question 6 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      },
      {
        "id": 25,
        "question": "Mock Question 7 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      },
      {
        "id": 26,
        "question": "Mock Question 8 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      },
      {
        "id": 27,
        "question": "Mock Question 9 for ncc_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category ncc_High"
      }
    ]
  },
  {
    "id": "czs_low",
    "phase": 1,
    "tier": "Low",
    "diseaseName": "Congenital Zika Syndrome (CZS)",
    "patientName": "ด.ญ. น้ำใส",
    "age": 0,
    "gender": "Female",
    "chiefComplaint": "ทารกแรกเกิด ขนาดศีรษะเล็กผิดปกติและน้ำหนักแรกคลอดต่ำกว่าเกณฑ์",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Systemic / CNS",
    "etiology": "Zika virus",
    "goldStandardLabs": [
      "Viral urine or plasma RT-PCR",
      "Viral specific antibodies (anti-zika virus IgM)"
    ],
    "goldStandardDrugs": [
      "Supportive care",
      "Symptomatic treatment"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "มารดาอายุ 23 ปี ครรภ์แรก ไม่มีประวัติไข้หรือผื่นช่วงใกล้คลอด ผลเลือดฝากครรภ์ Anti-HIV/VDRL negative",
    "voiceProfile": "child_female",
    "ddxKeywords": [
      "Congenital Cytomegalovirus",
      "Congenital Toxoplasmosis",
      "Congenital Rubella Syndrome",
      "Chromosomal abnormalities"
    ],
    "finalDiagnosisKeywords": [
      "Congenital Zika Syndrome",
      "CZS",
      "Zika"
    ],
    "vitals": {
      "bp": "70/40",
      "hr": 140,
      "rr": 40,
      "temp": 36.8,
      "spo2": 98,
      "weight": 2.2,
      "height": 46
    },
    "ddxGroup": "TORCH infections and congenital microcephaly",
    "ddxExplanation": "ต้องวินิจฉัยแยกโรคกลุ่ม TORCH",
    "diagnosisExplanation": "พบ microcephaly และ RT-PCR positive สำหรับ Zika virus",
    "treatmentExplanation": "ไม่มีวัคซีนหรือยารักษาเฉพาะเจาะจง รักษาประคับประคอง",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 28,
        "question": "Mock Question 1 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      },
      {
        "id": 29,
        "question": "Mock Question 2 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      },
      {
        "id": 30,
        "question": "Mock Question 3 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      },
      {
        "id": 31,
        "question": "Mock Question 4 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      },
      {
        "id": 32,
        "question": "Mock Question 5 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      },
      {
        "id": 33,
        "question": "Mock Question 6 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      },
      {
        "id": 34,
        "question": "Mock Question 7 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      },
      {
        "id": 35,
        "question": "Mock Question 8 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      },
      {
        "id": 36,
        "question": "Mock Question 9 for czs_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Low"
      }
    ]
  },
  {
    "id": "czs_mid",
    "phase": 1,
    "tier": "Mid",
    "diseaseName": "Congenital Zika Syndrome (CZS)",
    "patientName": "ด.ช. ต้นกล้า",
    "age": 0.5,
    "gender": "Male",
    "chiefComplaint": "พัฒนาการช้า และเริ่มมีอาการชักเกร็งตอนอายุ 6 เดือน",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "CNS",
    "etiology": "Zika virus",
    "goldStandardLabs": [
      "Viral urine or plasma RT-PCR",
      "Viral specific antibodies (anti-zika virus IgM)"
    ],
    "goldStandardDrugs": [
      "Supportive care",
      "Symptomatic treatment"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "แรกเกิดดูปกติ แต่มารดามีประวัติไข้และผื่นแดงช่วงตั้งครรภ์ไตรมาสแรกในพื้นที่ที่มีการระบาดของยุงลาย",
    "voiceProfile": "child_male",
    "ddxKeywords": [
      "Congenital Cytomegalovirus",
      "Congenital Toxoplasmosis",
      "Congenital Rubella Syndrome",
      "Chromosomal abnormalities"
    ],
    "finalDiagnosisKeywords": [
      "Congenital Zika Syndrome",
      "CZS",
      "Zika"
    ],
    "vitals": {
      "bp": "80/50",
      "hr": 120,
      "rr": 30,
      "temp": 37,
      "spo2": 99,
      "weight": 6.5,
      "height": 65
    },
    "ddxGroup": "Developmental delay with late-onset seizures",
    "ddxExplanation": "อาการทางระบบประสาทที่แสดงออกช้า คล้ายกับ Congenital CMV",
    "diagnosisExplanation": "Neuroimaging พบ calcifications ในสมอง และประวัติมารดาสนับสนุน",
    "treatmentExplanation": "จัดการอาการชักและกระตุ้นพัฒนาการ",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 37,
        "question": "Mock Question 1 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      },
      {
        "id": 38,
        "question": "Mock Question 2 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      },
      {
        "id": 39,
        "question": "Mock Question 3 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      },
      {
        "id": 40,
        "question": "Mock Question 4 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      },
      {
        "id": 41,
        "question": "Mock Question 5 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      },
      {
        "id": 42,
        "question": "Mock Question 6 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      },
      {
        "id": 43,
        "question": "Mock Question 7 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      },
      {
        "id": 44,
        "question": "Mock Question 8 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      },
      {
        "id": 45,
        "question": "Mock Question 9 for czs_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_Mid"
      }
    ]
  },
  {
    "id": "czs_high",
    "phase": 1,
    "tier": "High",
    "diseaseName": "Congenital Zika Syndrome (CZS)",
    "patientName": "ด.ญ. พาขวัญ",
    "age": 0,
    "gender": "Female",
    "chiefComplaint": "คลอดออกมามีข้อติดแข็ง (Arthrogryposis) ศีรษะเล็กมาก และมีปัญหาการกลืน",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Systemic / Neuromuscular",
    "etiology": "Zika virus",
    "goldStandardLabs": [
      "Viral urine or plasma RT-PCR",
      "Viral specific antibodies (anti-zika virus IgM)"
    ],
    "goldStandardDrugs": [
      "Supportive care",
      "Symptomatic treatment"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "Severe manifestation ของ CZS",
    "voiceProfile": "child_female",
    "ddxKeywords": [
      "Congenital Cytomegalovirus",
      "Congenital Toxoplasmosis",
      "Congenital Rubella Syndrome",
      "Chromosomal abnormalities"
    ],
    "finalDiagnosisKeywords": [
      "Congenital Zika Syndrome",
      "CZS",
      "Zika"
    ],
    "vitals": {
      "bp": "65/35",
      "hr": 150,
      "rr": 45,
      "temp": 36.5,
      "spo2": 94,
      "weight": 1.8,
      "height": 42
    },
    "ddxGroup": "Severe congenital malformation syndrome",
    "ddxExplanation": "แยกโรคจาก Genetic syndromes และ severe TORCH",
    "diagnosisExplanation": "อาการรุนแรงครบชุดของ CZS: severe microcephaly, macular scarring, clubfoot, arthrogryposis",
    "treatmentExplanation": "Multidisciplinary care สหสาขาวิชาชีพเพื่อดูแลแบบประคับประคอง",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 46,
        "question": "Mock Question 1 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      },
      {
        "id": 47,
        "question": "Mock Question 2 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      },
      {
        "id": 48,
        "question": "Mock Question 3 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      },
      {
        "id": 49,
        "question": "Mock Question 4 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      },
      {
        "id": 50,
        "question": "Mock Question 5 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      },
      {
        "id": 51,
        "question": "Mock Question 6 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      },
      {
        "id": 52,
        "question": "Mock Question 7 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      },
      {
        "id": 53,
        "question": "Mock Question 8 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      },
      {
        "id": 54,
        "question": "Mock Question 9 for czs_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category czs_High"
      }
    ]
  },
  {
    "id": "strongy_low",
    "phase": 1,
    "tier": "Low",
    "diseaseName": "Strongyloidiasis",
    "patientName": "บุญมี ขยันทำ",
    "age": 62,
    "gender": "Male",
    "chiefComplaint": "ปวดท้อง ถ่ายเหลว และมีผื่นคันแดงนูนเป็นเส้นคดเคี้ยวบริเวณสะโพก ลุกลามเร็ว",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Gastrointestinal & Skin",
    "etiology": "Strongyloides stercoralis",
    "goldStandardLabs": [
      "Stool Examination",
      "Modified Agar Plate Culture",
      "Sputum Wet Mount"
    ],
    "goldStandardDrugs": [
      "Oral Ivermectin",
      "Oral Albendazole",
      "Ceftriaxone"
    ],
    "contraindicatedDrugs": [
      "High-dose Corticosteroids (if preventable)"
    ],
    "personaDetails": "ชาวนาภาคอีสาน เดินเท้าเปล่าทำงานในไร่เป็นประจำ ไม่มีโรคประจำตัวอื่น",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Severe Bacterial Sepsis",
      "Pneumocystis jirovecii Pneumonia",
      "Disseminated Tuberculosis"
    ],
    "finalDiagnosisKeywords": [
      "Strongyloidiasis",
      "Strongyloides",
      "Hyperinfection"
    ],
    "vitals": {
      "bp": "120/80",
      "hr": 80,
      "rr": 18,
      "temp": 37.2,
      "spo2": 98,
      "weight": 60,
      "height": 165
    },
    "ddxGroup": "Chronic diarrhea with creeping eruption (Larva currens)",
    "ddxExplanation": "ลักษณะผื่น Larva currens ชี้ชัดไปที่ Strongyloides",
    "diagnosisExplanation": "ตรวจอุจจาระพบ Rhabditiform larvae",
    "treatmentExplanation": "ให้ Ivermectin รักษาก่อนที่จะมีภาวะแทรกซ้อน",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 55,
        "question": "Mock Question 1 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      },
      {
        "id": 56,
        "question": "Mock Question 2 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      },
      {
        "id": 57,
        "question": "Mock Question 3 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      },
      {
        "id": 58,
        "question": "Mock Question 4 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      },
      {
        "id": 59,
        "question": "Mock Question 5 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      },
      {
        "id": 60,
        "question": "Mock Question 6 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      },
      {
        "id": 61,
        "question": "Mock Question 7 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      },
      {
        "id": 62,
        "question": "Mock Question 8 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      },
      {
        "id": 63,
        "question": "Mock Question 9 for strongy_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Low"
      }
    ]
  },
  {
    "id": "strongy_mid",
    "phase": 1,
    "tier": "Mid",
    "diseaseName": "Strongyloidiasis",
    "patientName": "สมปอง แสวงโชค",
    "age": 55,
    "gender": "Male",
    "chiefComplaint": "หอบเหนื่อย ไอมีเสมหะปนเลือดเล็กน้อย ปวดท้อง ถ่ายเหลว หลังกินยาสเตียรอยด์",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Respiratory & GI",
    "etiology": "Strongyloides stercoralis",
    "goldStandardLabs": [
      "Stool Examination",
      "Modified Agar Plate Culture",
      "Sputum Wet Mount"
    ],
    "goldStandardDrugs": [
      "Oral Ivermectin",
      "Oral Albendazole",
      "Ceftriaxone"
    ],
    "contraindicatedDrugs": [
      "High-dose Corticosteroids (if preventable)"
    ],
    "personaDetails": "ได้รับยา Prednisolone รักษารูมาตอยด์มา 3 สัปดาห์ เพิ่งเริ่มมีอาการหอบเหนื่อย ถ่ายเหลว",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Severe Bacterial Sepsis",
      "Pneumocystis jirovecii Pneumonia",
      "Disseminated Tuberculosis"
    ],
    "finalDiagnosisKeywords": [
      "Strongyloidiasis",
      "Strongyloides",
      "Hyperinfection"
    ],
    "vitals": {
      "bp": "110/70",
      "hr": 95,
      "rr": 24,
      "temp": 38,
      "spo2": 94,
      "weight": 65,
      "height": 168
    },
    "ddxGroup": "Hyperinfection syndrome mimicking PCP or TB",
    "ddxExplanation": "ผู้ป่วยที่ได้ยาสเตียรอยด์มีอาการปอดอักเสบและท้องเสีย ต้องระวัง Hyperinfection",
    "diagnosisExplanation": "ตรวจเสมหะและอุจจาระพบ Filariform larvae จำนวนมาก",
    "treatmentExplanation": "หยุด/ลดสเตียรอยด์ และให้ยา Ivermectin",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 64,
        "question": "Mock Question 1 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      },
      {
        "id": 65,
        "question": "Mock Question 2 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      },
      {
        "id": 66,
        "question": "Mock Question 3 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      },
      {
        "id": 67,
        "question": "Mock Question 4 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      },
      {
        "id": 68,
        "question": "Mock Question 5 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      },
      {
        "id": 69,
        "question": "Mock Question 6 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      },
      {
        "id": 70,
        "question": "Mock Question 7 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      },
      {
        "id": 71,
        "question": "Mock Question 8 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      },
      {
        "id": 72,
        "question": "Mock Question 9 for strongy_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_Mid"
      }
    ]
  },
  {
    "id": "strongy_high",
    "phase": 1,
    "tier": "High",
    "diseaseName": "Strongyloidiasis",
    "patientName": "ชัยชาญ ชาญชัย",
    "age": 62,
    "gender": "Male",
    "chiefComplaint": "ไข้สูง หอบเหนื่อย ปวดท้อง ถ่ายเหลว 3 วัน และช็อกความดันตก",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Systemic (Disseminated)",
    "etiology": "Strongyloides stercoralis",
    "goldStandardLabs": [
      "Stool Examination",
      "Modified Agar Plate Culture",
      "Sputum Wet Mount"
    ],
    "goldStandardDrugs": [
      "Oral Ivermectin",
      "Oral Albendazole",
      "Ceftriaxone"
    ],
    "contraindicatedDrugs": [
      "High-dose Corticosteroids (if preventable)"
    ],
    "personaDetails": "ได้ยา Prednisolone 60mg/day รักษา AIHA มา 3 สัปดาห์ Cushingoid appearance. มีผื่น Larva currens และ Gram-negative bacteremia",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Severe Bacterial Sepsis",
      "Pneumocystis jirovecii Pneumonia",
      "Disseminated Tuberculosis"
    ],
    "finalDiagnosisKeywords": [
      "Strongyloidiasis",
      "Strongyloides",
      "Hyperinfection"
    ],
    "vitals": {
      "bp": "85/55",
      "hr": 118,
      "rr": 26,
      "temp": 38.9,
      "spo2": 91,
      "weight": 75,
      "height": 170
    },
    "ddxGroup": "Septic shock in immunosuppressed host with parasitic hyperinfection",
    "ddxExplanation": "แบคทีเรียทะลุเข้ากระแสเลือด (Translocation) จากการไชของตัวอ่อนพยาธิในลำไส้",
    "diagnosisExplanation": "Hemoculture ขึ้น E. coli และพบพยาธิในเสมหะ/อุจจาระ",
    "treatmentExplanation": "ต้องให้ Broad-spectrum antibiotics ฉีดเข้าเส้นเลือดควบคู่กับยา Ivermectin และรับไว้ใน ICU",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 73,
        "question": "Mock Question 1 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      },
      {
        "id": 74,
        "question": "Mock Question 2 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      },
      {
        "id": 75,
        "question": "Mock Question 3 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      },
      {
        "id": 76,
        "question": "Mock Question 4 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      },
      {
        "id": 77,
        "question": "Mock Question 5 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      },
      {
        "id": 78,
        "question": "Mock Question 6 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      },
      {
        "id": 79,
        "question": "Mock Question 7 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      },
      {
        "id": 80,
        "question": "Mock Question 8 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      },
      {
        "id": 81,
        "question": "Mock Question 9 for strongy_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category strongy_High"
      }
    ]
  },
  {
    "id": "malaria_low",
    "phase": 2,
    "tier": "Low",
    "diseaseName": "Malaria",
    "patientName": "มานพ สมศักดิ์",
    "age": 27,
    "gender": "Male",
    "chiefComplaint": "ไข้สูง หนาวสั่น ปวดศีรษะ ปวดเมื่อยตามตัวมา 3 วัน",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Systemic / Hematologic",
    "etiology": "Plasmodium species (P. falciparum, P. vivax)",
    "goldStandardLabs": [
      "Thick and Thin Blood Smear for Malaria",
      "Malaria Rapid Diagnostic Test (RDT)"
    ],
    "goldStandardDrugs": [
      "Artemisinin-based Combination Therapy (ACT)",
      "Primaquine",
      "IV Artesunate"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "เจ้าหน้าที่ป่าไม้ ประวัติเข้าป่าชายแดนเมื่อ 2 สัปดาห์ก่อน ไข้ขึ้นๆ ลงๆ เป็นพักๆ (Paroxysm of fever)",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Dengue Fever",
      "Leptospirosis",
      "Scrub Typhus",
      "Enteric Fever"
    ],
    "finalDiagnosisKeywords": [
      "Malaria",
      "Plasmodium"
    ],
    "vitals": {
      "bp": "118/76",
      "hr": 104,
      "rr": 20,
      "temp": 39,
      "spo2": 98,
      "weight": 65,
      "height": 170
    },
    "ddxGroup": "Classic Uncomplicated Malaria",
    "ddxExplanation": "ประวัติเดินป่าตรงไปตรงมา มาด้วยไข้หนาวสั่น",
    "diagnosisExplanation": "Blood film พบ Ring-form trophozoite ของ Plasmodium ชัดเจน",
    "treatmentExplanation": "เริ่มยาต้านมาลาเรียกิน (ACT) และ Primaquine หากเป็น P. vivax",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 82,
        "question": "Mock Question 1 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      },
      {
        "id": 83,
        "question": "Mock Question 2 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      },
      {
        "id": 84,
        "question": "Mock Question 3 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      },
      {
        "id": 85,
        "question": "Mock Question 4 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      },
      {
        "id": 86,
        "question": "Mock Question 5 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      },
      {
        "id": 87,
        "question": "Mock Question 6 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      },
      {
        "id": 88,
        "question": "Mock Question 7 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      },
      {
        "id": 89,
        "question": "Mock Question 8 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      },
      {
        "id": 90,
        "question": "Mock Question 9 for malaria_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Low"
      }
    ]
  },
  {
    "id": "malaria_mid",
    "phase": 2,
    "tier": "Mid",
    "diseaseName": "Malaria",
    "patientName": "อารีย์ รักป่า",
    "age": 32,
    "gender": "Female",
    "chiefComplaint": "ไข้สูง เป็นๆ หายๆ นาน 1 สัปดาห์ อ่อนเพลีย เบื่ออาหาร",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Systemic",
    "etiology": "Plasmodium species (P. falciparum, P. vivax)",
    "goldStandardLabs": [
      "Thick and Thin Blood Smear for Malaria",
      "Malaria Rapid Diagnostic Test (RDT)"
    ],
    "goldStandardDrugs": [
      "Artemisinin-based Combination Therapy (ACT)",
      "Primaquine",
      "IV Artesunate"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "คิดว่าเป็นเพียงไข้หวัดใหญ่จึงกินยาเองแต่ไม่ดีขึ้น แพทย์ต้องเจาะลึกประวัติการท่องเที่ยวพบว่าค้างคืนในป่าเมื่อเดือนก่อน",
    "voiceProfile": "adult_female",
    "ddxKeywords": [
      "Dengue Fever",
      "Leptospirosis",
      "Scrub Typhus",
      "Enteric Fever"
    ],
    "finalDiagnosisKeywords": [
      "Malaria",
      "Plasmodium"
    ],
    "vitals": {
      "bp": "110/70",
      "hr": 98,
      "rr": 20,
      "temp": 38.5,
      "spo2": 98,
      "weight": 55,
      "height": 160
    },
    "ddxGroup": "Mimic Febrile Illness",
    "ddxExplanation": "อาการไข้ไม่ชัดเจน ผู้ป่วยคิดว่าเป็นไข้หวัด/ไข้เลือดออก ทำให้ประเมินประวัติเสี่ยงล่าช้า",
    "diagnosisExplanation": "ตรวจ Malaria RDT และ Blood smear พบ Plasmodium trophozoites หลังซักประวัติเพิ่มเติม",
    "treatmentExplanation": "ให้ยาต้านมาลาเรียและเฝ้าระวังภาวะแทรกซ้อนเนื่องจากมาพบแพทย์ช้า",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 91,
        "question": "Mock Question 1 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      },
      {
        "id": 92,
        "question": "Mock Question 2 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      },
      {
        "id": 93,
        "question": "Mock Question 3 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      },
      {
        "id": 94,
        "question": "Mock Question 4 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      },
      {
        "id": 95,
        "question": "Mock Question 5 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      },
      {
        "id": 96,
        "question": "Mock Question 6 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      },
      {
        "id": 97,
        "question": "Mock Question 7 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      },
      {
        "id": 98,
        "question": "Mock Question 8 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      },
      {
        "id": 99,
        "question": "Mock Question 9 for malaria_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_Mid"
      }
    ]
  },
  {
    "id": "malaria_high",
    "phase": 2,
    "tier": "High",
    "diseaseName": "Malaria",
    "patientName": "ทรงพล พลทหาร",
    "age": 45,
    "gender": "Male",
    "chiefComplaint": "ซึมลง สับสน หายใจหอบเหนื่อย ชักเกร็ง",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Systemic / CNS",
    "etiology": "Plasmodium species (P. falciparum, P. vivax)",
    "goldStandardLabs": [
      "Thick and Thin Blood Smear for Malaria",
      "Malaria Rapid Diagnostic Test (RDT)"
    ],
    "goldStandardDrugs": [
      "Artemisinin-based Combination Therapy (ACT)",
      "Primaquine",
      "IV Artesunate"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "ผู้ป่วยไม่ได้รับการรักษามา 5 วัน อาการแย่ลงอย่างรวดเร็ว ถูกนำส่ง ER GCS ลดลง",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Dengue Fever",
      "Leptospirosis",
      "Scrub Typhus",
      "Enteric Fever"
    ],
    "finalDiagnosisKeywords": [
      "Malaria",
      "Plasmodium"
    ],
    "vitals": {
      "bp": "90/60",
      "hr": 120,
      "rr": 30,
      "temp": 40,
      "spo2": 90,
      "weight": 70,
      "height": 168
    },
    "ddxGroup": "Severe Malaria with Cerebral Involvement",
    "ddxExplanation": "ต้องแยกโรคจาก Acute Meningitis / Encephalitis, Sepsis with Septic Shock",
    "diagnosisExplanation": "พบ High Parasitemia (> 5%), Severe Anemia (Hb < 7), และระยะ Schizont ในเลือด",
    "treatmentExplanation": "Urgent ICU admission, ให้ IV Artesunate และจัดการภาวะแทรกซ้อน (Hypoglycemia, Seizure)",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 100,
        "question": "Mock Question 1 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      },
      {
        "id": 101,
        "question": "Mock Question 2 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      },
      {
        "id": 102,
        "question": "Mock Question 3 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      },
      {
        "id": 103,
        "question": "Mock Question 4 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      },
      {
        "id": 104,
        "question": "Mock Question 5 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      },
      {
        "id": 105,
        "question": "Mock Question 6 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      },
      {
        "id": 106,
        "question": "Mock Question 7 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      },
      {
        "id": 107,
        "question": "Mock Question 8 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      },
      {
        "id": 108,
        "question": "Mock Question 9 for malaria_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category malaria_High"
      }
    ]
  },
  {
    "id": "diphyllo_low",
    "phase": 2,
    "tier": "Low",
    "diseaseName": "Diphyllobothriasis",
    "patientName": "สุชาติ ปลาดิบ",
    "age": 40,
    "gender": "Male",
    "chiefComplaint": "ปวดท้อง น้ำหนักลด และถ่ายเหลวเป็น ๆ หาย ๆ นาน 2 เดือน",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Gastrointestinal",
    "etiology": "Diphyllobothrium latum",
    "goldStandardLabs": [
      "Stool examination",
      "CBC (for MCV)",
      "Vitamin B12 level"
    ],
    "goldStandardDrugs": [
      "Praziquantel",
      "Niclosamide",
      "Vitamin B12 supplementation"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "เดินทางท่องเที่ยวญี่ปุ่นหลายครั้ง ชอบรับประทานปลาน้ำจืดดิบเป็นประจำ",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Taenia species",
      "Spirometra mansoni",
      "Pernicious anemia",
      "Intestinal malignancy"
    ],
    "finalDiagnosisKeywords": [
      "Diphyllobothriasis",
      "Fish tapeworm",
      "Diphyllobothrium"
    ],
    "vitals": {
      "bp": "120/75",
      "hr": 82,
      "rr": 18,
      "temp": 37.2,
      "spo2": 99,
      "weight": 70,
      "height": 170
    },
    "ddxGroup": "Classic Diphyllobothriasis",
    "ddxExplanation": "ประวัติกินปลาดิบและอาการทางลำไส้ตรงไปตรงมา",
    "diagnosisExplanation": "Stool microscopy พบไข่รูป oval มี operculum และ small knob",
    "treatmentExplanation": "ให้ยา Praziquantel หรือ Niclosamide และให้คำแนะนำเรื่องอาหาร",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 109,
        "question": "Mock Question 1 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      },
      {
        "id": 110,
        "question": "Mock Question 2 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      },
      {
        "id": 111,
        "question": "Mock Question 3 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      },
      {
        "id": 112,
        "question": "Mock Question 4 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      },
      {
        "id": 113,
        "question": "Mock Question 5 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      },
      {
        "id": 114,
        "question": "Mock Question 6 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      },
      {
        "id": 115,
        "question": "Mock Question 7 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      },
      {
        "id": 116,
        "question": "Mock Question 8 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      },
      {
        "id": 117,
        "question": "Mock Question 9 for diphyllo_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Low"
      }
    ]
  },
  {
    "id": "diphyllo_mid",
    "phase": 2,
    "tier": "Mid",
    "diseaseName": "Diphyllobothriasis",
    "patientName": "สมหญิง รักสุขภาพ",
    "age": 55,
    "gender": "Female",
    "chiefComplaint": "เหนื่อยง่าย ใจสั่น ชาปลายมือปลายเท้า",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Hematologic / Neurologic",
    "etiology": "Diphyllobothrium latum",
    "goldStandardLabs": [
      "Stool examination",
      "CBC (for MCV)",
      "Vitamin B12 level"
    ],
    "goldStandardDrugs": [
      "Praziquantel",
      "Niclosamide",
      "Vitamin B12 supplementation"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "ไม่มีอาการทางลำไส้ชัดเจน แต่มีอาการซีดและชาปลายมือ รับประทานปลาน้ำจืดดิบมานาน 10 ปี",
    "voiceProfile": "adult_female",
    "ddxKeywords": [
      "Taenia species",
      "Spirometra mansoni",
      "Pernicious anemia",
      "Intestinal malignancy"
    ],
    "finalDiagnosisKeywords": [
      "Diphyllobothriasis",
      "Fish tapeworm",
      "Diphyllobothrium"
    ],
    "vitals": {
      "bp": "110/70",
      "hr": 96,
      "rr": 20,
      "temp": 37,
      "spo2": 98,
      "weight": 58,
      "height": 155
    },
    "ddxGroup": "Diagnostic Dilemma (Vitamin B12 Deficiency)",
    "ddxExplanation": "ผู้ป่วยมาด้วย complication จาก chronic infection คือ Megaloblastic anemia",
    "diagnosisExplanation": "พบ Macrocytic anemia (MCV สูง), Vitamin B12 ต่ำ, และไข่พยาธิในอุจจาระ",
    "treatmentExplanation": "ต้องให้ Vitamin B12 supplementation ร่วมกับยาฆ่าพยาธิ",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 118,
        "question": "Mock Question 1 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      },
      {
        "id": 119,
        "question": "Mock Question 2 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      },
      {
        "id": 120,
        "question": "Mock Question 3 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      },
      {
        "id": 121,
        "question": "Mock Question 4 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      },
      {
        "id": 122,
        "question": "Mock Question 5 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      },
      {
        "id": 123,
        "question": "Mock Question 6 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      },
      {
        "id": 124,
        "question": "Mock Question 7 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      },
      {
        "id": 125,
        "question": "Mock Question 8 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      },
      {
        "id": 126,
        "question": "Mock Question 9 for diphyllo_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_Mid"
      }
    ]
  },
  {
    "id": "diphyllo_high",
    "phase": 2,
    "tier": "High",
    "diseaseName": "Diphyllobothriasis",
    "patientName": "วิทวัส ทรมาน",
    "age": 65,
    "gender": "Male",
    "chiefComplaint": "Severe abdominal pain, อาเจียน และอ่อนเพลียมาก",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Gastrointestinal",
    "etiology": "Diphyllobothrium latum",
    "goldStandardLabs": [
      "Stool examination",
      "CBC (for MCV)",
      "Vitamin B12 level"
    ],
    "goldStandardDrugs": [
      "Praziquantel",
      "Niclosamide",
      "Vitamin B12 supplementation"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "รับประทานปลาน้ำจืดดิบมานานหลายสิบปี น้ำหนักลด 15 kg",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Taenia species",
      "Spirometra mansoni",
      "Pernicious anemia",
      "Intestinal malignancy"
    ],
    "finalDiagnosisKeywords": [
      "Diphyllobothriasis",
      "Fish tapeworm",
      "Diphyllobothrium"
    ],
    "vitals": {
      "bp": "95/60",
      "hr": 110,
      "rr": 24,
      "temp": 37.5,
      "spo2": 96,
      "weight": 50,
      "height": 165
    },
    "ddxGroup": "Severe Complicated Diphyllobothriasis",
    "ddxExplanation": "ผู้ป่วยติดเชื้อปริมาณมากจนเกิดลำไส้อุดตัน (Intestinal obstruction)",
    "diagnosisExplanation": "CT abdomen สงสัย intestinal obstruction และตรวจพบไข่พยาธิจำนวนมากในอุจจาระ",
    "treatmentExplanation": "Fluid resuscitation, แก้ไข electrolyte, รักษา obstruction ควบคู่กับการให้ยา",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 127,
        "question": "Mock Question 1 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      },
      {
        "id": 128,
        "question": "Mock Question 2 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      },
      {
        "id": 129,
        "question": "Mock Question 3 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      },
      {
        "id": 130,
        "question": "Mock Question 4 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      },
      {
        "id": 131,
        "question": "Mock Question 5 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      },
      {
        "id": 132,
        "question": "Mock Question 6 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      },
      {
        "id": 133,
        "question": "Mock Question 7 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      },
      {
        "id": 134,
        "question": "Mock Question 8 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      },
      {
        "id": 135,
        "question": "Mock Question 9 for diphyllo_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category diphyllo_High"
      }
    ]
  },
  {
    "id": "paragonimus_low",
    "phase": 2,
    "tier": "Low",
    "diseaseName": "Paragonimiasis",
    "patientName": "บุญถิ่น กินปู",
    "age": 38,
    "gender": "Male",
    "chiefComplaint": "ไอกระเส็นกระสาย มีเสมหะสีสนิมเหล็ก (Rusty sputum)",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Respiratory",
    "etiology": "Paragonimus species",
    "goldStandardLabs": [
      "Sputum examination for ova",
      "Stool examination for ova",
      "Chest X-ray"
    ],
    "goldStandardDrugs": [
      "Praziquantel"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "ชอบทานปูดิบ แหนมปู น้ำพริกปูนาดิบ ไม่มีไข้",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Tuberculosis",
      "Lung Cancer",
      "Pneumonia"
    ],
    "finalDiagnosisKeywords": [
      "Paragonimiasis",
      "Paragonimus"
    ],
    "vitals": {
      "bp": "120/80",
      "hr": 80,
      "rr": 18,
      "temp": 37,
      "spo2": 98,
      "weight": 65,
      "height": 165
    },
    "ddxGroup": "Chronic cough with rusty sputum",
    "ddxExplanation": "ประวัติการรับประทานปูดิบชัดเจน",
    "diagnosisExplanation": "ตรวจเสมหะพบไข่พยาธิ Paragonimus",
    "treatmentExplanation": "Praziquantel 25 mg/kg 3 ครั้งต่อวัน นาน 2-3 วัน",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 136,
        "question": "Mock Question 1 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      },
      {
        "id": 137,
        "question": "Mock Question 2 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      },
      {
        "id": 138,
        "question": "Mock Question 3 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      },
      {
        "id": 139,
        "question": "Mock Question 4 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      },
      {
        "id": 140,
        "question": "Mock Question 5 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      },
      {
        "id": 141,
        "question": "Mock Question 6 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      },
      {
        "id": 142,
        "question": "Mock Question 7 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      },
      {
        "id": 143,
        "question": "Mock Question 8 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      },
      {
        "id": 144,
        "question": "Mock Question 9 for paragonimus_Low?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Low"
      }
    ]
  },
  {
    "id": "paragonimus_mid",
    "phase": 2,
    "tier": "Mid",
    "diseaseName": "Paragonimiasis",
    "patientName": "จันทร์เพ็ญ ไอเรื้อรัง",
    "age": 45,
    "gender": "Female",
    "chiefComplaint": "ไอเรื้อรัง มีเลือดปน น้ำหนักลด",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "Respiratory",
    "etiology": "Paragonimus species",
    "goldStandardLabs": [
      "Sputum examination for ova",
      "Stool examination for ova",
      "Chest X-ray"
    ],
    "goldStandardDrugs": [
      "Praziquantel"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "มาด้วยอาการคล้ายวัณโรค (TB mimic) มี cavitation ในภาพเอกซเรย์ปอด",
    "voiceProfile": "adult_female",
    "ddxKeywords": [
      "Tuberculosis",
      "Lung Cancer",
      "Pneumonia"
    ],
    "finalDiagnosisKeywords": [
      "Paragonimiasis",
      "Paragonimus"
    ],
    "vitals": {
      "bp": "110/70",
      "hr": 85,
      "rr": 20,
      "temp": 37.8,
      "spo2": 97,
      "weight": 50,
      "height": 155
    },
    "ddxGroup": "TB Mimicker",
    "ddxExplanation": "ต้องแยกโรคจาก Pulmonary Tuberculosis",
    "diagnosisExplanation": "AFB smear negative แต่พบไข่พยาธิในเสมหะและอุจจาระ",
    "treatmentExplanation": "ให้ยาฆ่าพยาธิและติดตามรอยโรคในปอด",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 145,
        "question": "Mock Question 1 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      },
      {
        "id": 146,
        "question": "Mock Question 2 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      },
      {
        "id": 147,
        "question": "Mock Question 3 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      },
      {
        "id": 148,
        "question": "Mock Question 4 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      },
      {
        "id": 149,
        "question": "Mock Question 5 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      },
      {
        "id": 150,
        "question": "Mock Question 6 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      },
      {
        "id": 151,
        "question": "Mock Question 7 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      },
      {
        "id": 152,
        "question": "Mock Question 8 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      },
      {
        "id": 153,
        "question": "Mock Question 9 for paragonimus_Mid?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_Mid"
      }
    ]
  },
  {
    "id": "paragonimus_high",
    "phase": 2,
    "tier": "High",
    "diseaseName": "Paragonimiasis",
    "patientName": "คมสัน ปวดหัว",
    "age": 30,
    "gender": "Male",
    "chiefComplaint": "ชักเกร็ง ปวดศีรษะรุนแรง อ่อนแรงครึ่งซีก",
    "caseConstraints": [
      "No time constraints for virtual cases"
    ],
    "localization": "CNS",
    "etiology": "Paragonimus species",
    "goldStandardLabs": [
      "Sputum examination for ova",
      "Stool examination for ova",
      "Chest X-ray"
    ],
    "goldStandardDrugs": [
      "Praziquantel"
    ],
    "contraindicatedDrugs": [],
    "personaDetails": "Ectopic infection (Cerebral paragonimiasis) พยาธิไชขึ้นสมอง",
    "voiceProfile": "adult_male",
    "ddxKeywords": [
      "Tuberculosis",
      "Lung Cancer",
      "Pneumonia"
    ],
    "finalDiagnosisKeywords": [
      "Paragonimiasis",
      "Paragonimus"
    ],
    "vitals": {
      "bp": "140/90",
      "hr": 100,
      "rr": 22,
      "temp": 37.5,
      "spo2": 98,
      "weight": 70,
      "height": 175
    },
    "ddxGroup": "Intracranial space-occupying lesion with seizures",
    "ddxExplanation": "แยกโรคจาก Brain tumor, NCC, Toxoplasmosis",
    "diagnosisExplanation": "CT/MRI Brain พบ \"Soap bubble\" appearance และตรวจพบ Antibody ต่อ Paragonimus ในน้ำไขสันหลัง",
    "treatmentExplanation": "Praziquantel ร่วมกับ Corticosteroids ลดสมองบวม และยากันชัก",
    "specificLabResults": {},
    "preTestQuestions": [
      {
        "id": 154,
        "question": "Mock Question 1 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      },
      {
        "id": 155,
        "question": "Mock Question 2 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      },
      {
        "id": 156,
        "question": "Mock Question 3 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      },
      {
        "id": 157,
        "question": "Mock Question 4 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      },
      {
        "id": 158,
        "question": "Mock Question 5 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      },
      {
        "id": 159,
        "question": "Mock Question 6 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      },
      {
        "id": 160,
        "question": "Mock Question 7 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      },
      {
        "id": 161,
        "question": "Mock Question 8 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      },
      {
        "id": 162,
        "question": "Mock Question 9 for paragonimus_High?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswerIndex": 0,
        "category": "Category paragonimus_High"
      }
    ]
  }
];

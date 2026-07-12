export interface PreTestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  category?: string;
  difficulty?: string;
}

export const PRE_TEST_QUESTIONS: PreTestQuestion[] = [
  {
    id: 1,
    question: 'เซลล์ชนิดใดทำหน้าที่สร้าง Myelin sheath ในระบบประสาทส่วนกลาง (CNS)?',
    options: ['Schwann cell', 'Astrocyte', 'Oligodendrocyte', 'Microglia'],
    correctAnswerIndex: 2,
    explanation: 'Oligodendrocyte ทำหน้าที่สร้าง myelin sheath ให้กับ axon ในระบบประสาทส่วนกลาง (CNS) ในขณะที่ Schwann cell สร้าง myelin sheath ในระบบประสาทส่วนปลาย (PNS)',
    category: 'L2. NeuroAnatomy - Histology of Nervous Tissues_2026'
  },
  {
    id: 2,
    difficulty: 'Easy',
    question: 'บริเวณใดของสมองที่ทำหน้าที่เป็นศูนย์ควบคุมการทำงานของระบบประสาทอัตโนมัติ (ANS) ที่สำคัญที่สุด?',
    options: ['Thalamus', 'Hypothalamus', 'Medulla oblongata', 'Cerebellum'],
    correctAnswerIndex: 1,
    explanation: 'Hypothalamus เป็นศูนย์กลางหลักในการควบคุมระบบประสาทอัตโนมัติ (ANS) และระบบต่อมไร้ท่อ เพื่อรักษาสมดุลของร่างกาย (Homeostasis)',
    category: 'L14. Diencephalon_2024'
  },
  {
    id: 3,
    difficulty: 'Easy',
    question: 'Sensory decussation ของ Dorsal column-medial lemniscus pathway เกิดขึ้นที่ระดับใด?',
    options: ['Spinal cord', 'Lower Medulla', 'Midbrain', 'Thalamus'],
    correctAnswerIndex: 1,
    explanation: 'DCML pathway มีการไขว้สลับ (decussation) ของ second-order neuron ที่ lower medulla กลายเป็น medial lemniscus ก่อนจะวิ่งขึ้นไปยัง Thalamus',
    category: 'L11. Somatosensory system_2024'
  },
  {
    id: 4,
    question: 'ผู้ป่วยมีอาการสูญเสีย Pain and Temperature sensation ที่ซีกซ้ายของร่างกาย รอยโรค (Lesion) น่าจะอยู่ที่ใด?',
    options: ['Right Spinothalamic tract', 'Left Spinothalamic tract', 'Right Dorsal column', 'Left Dorsal column'],
    correctAnswerIndex: 0,
    explanation: 'Spinothalamic tract นำความรู้สึกเจ็บปวดและอุณหภูมิ โดยไขว้สลับที่ระดับไขสันหลัง ดังนั้นรอยโรคที่ Right Spinothalamic tract จะทำให้เสียความรู้สึกที่ซีกซ้ายของร่างกาย',
    category: 'L11. Somatosensory system_2024'
  },
  {
    id: 5,
    difficulty: 'Moderate',
    question: 'การบาดเจ็บที่ Corticospinal tract ที่ระดับ Internal capsule ซีกขวา จะส่งผลอย่างไร?',
    options: ['Ipsilateral flaccid paralysis', 'Contralateral spastic hemiparesis', 'Ipsilateral loss of proprioception', 'Contralateral loss of pain'],
    correctAnswerIndex: 1,
    explanation: 'Corticospinal tract ไขว้สลับที่ Medulla (Pyramidal decussation) รอยโรคที่ Internal capsule ซีกขวาซึ่งอยู่เหนือการไขว้สลับ จึงทำให้เกิดอัมพาตแบบเกร็งที่ซีกซ้าย (Contralateral spastic hemiparesis)',
    category: 'L17 Descending motor system'
  },
  {
    id: 6,
    difficulty: 'Moderate',
    question: 'ผู้ป่วยมีอาการสูญเสียการรับรู้ตำแหน่ง (Proprioception) และการสั่น (Vibration) ที่ขาทั้งสองข้าง รอยโรคอยู่ที่ใด?',
    options: ['Anterior spinothalamic tract', 'Lateral spinothalamic tract', 'Fasciculus cuneatus', 'Fasciculus gracilis'],
    correctAnswerIndex: 3,
    explanation: 'Fasciculus gracilis นำสัญญาณ Proprioception และ Vibration จากส่วนล่างของร่างกาย (ขาและลำตัวส่วนล่าง) ในขณะที่ Fasciculus cuneatus นำสัญญาณจากแขนและลำตัวส่วนบน',
    category: 'L11. Somatosensory system_2024'
  },
  {
    id: 7,
    difficulty: 'Hard',
    question: 'ผู้ป่วยถูกแทงที่สันหลังซีกขวา (Right hemisection) ระดับ T10 จะพบอาการใด?',
    options: ['Loss of pain on right leg, loss of proprioception on left leg', 'Loss of pain on left leg, loss of proprioception on right leg', 'Bilateral loss of pain and temperature', 'Bilateral flaccid paralysis of legs'],
    correctAnswerIndex: 1,
    explanation: 'Brown-Séquard syndrome ทำให้สูญเสีย Proprioception ในฝั่งเดียวกัน (Ipsilateral) และสูญเสีย Pain/Temp ในฝั่งตรงข้าม (Contralateral) ต่ำกว่าระดับรอยโรค',
    category: 'L31. Spine and Spinal Cord Disorders'
  },
  {
    id: 8,
    difficulty: 'Hard',
    question: 'ผู้ป่วยมีอาการกลืนลำบาก, เสียงแหบ, เดินเซ, และสูญเสีย Pain/Temp ที่หน้าซีกขวาและลำตัวซีกซ้าย (Wallenberg syndrome) รอยโรคอยู่ที่ใด?',
    options: ['Right Lateral Medulla', 'Left Lateral Medulla', 'Right Medial Medulla', 'Left Medial Pons'],
    correctAnswerIndex: 0,
    explanation: 'Wallenberg syndrome เกิดจากการอุดตันของหลอดเลือด PICA ที่ไปเลี้ยง Lateral Medulla ทำให้เสียการรับรู้ความเจ็บปวดและอุณหภูมิที่ใบหน้าฝั่งเดียวกัน แต่สูญเสียที่ลำตัวฝั่งตรงข้าม',
    category: 'L9. Brainstem_KG67'
  },
  {
    id: 9,
    question: 'ผู้ป่วยชายอายุ 60 ปี มาด้วยอาการอ่อนแรงครึ่งซีกขวาแบบเฉียบพลัน ร่วมกับมี Aphasia (พูดไม่รู้เรื่อง) รอยโรคน่าจะอยู่ที่หลอดเลือดเส้นใด?',
    options: ['Left Anterior Cerebral Artery (ACA)', 'Left Middle Cerebral Artery (MCA)', 'Right Middle Cerebral Artery (MCA)', 'Basilar Artery'],
    correctAnswerIndex: 1,
    explanation: 'Left MCA หล่อเลี้ยงสมองซีกซ้ายด้านข้าง ควบคุมการเคลื่อนไหวของหน้า/แขนขวา และเป็นตำแหน่งของศูนย์ควบคุมภาษา (Broca\'s / Wernicke\'s area)',
    category: 'L30. Cerebrovascular disease 200269'
  }
];

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
}

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case_mca_stroke',
    tier: 'Low', // Score 0-3
    diseaseName: 'Acute MCA Ischemic Stroke',
    patientName: 'คุณสมชาย ใจดี',
    age: 65,
    gender: 'Male',
    chiefComplaint: 'แขนขาซีกขวาอ่อนแรงกะทันหัน พูดไม่ชัด (Sudden right hemiparesis and dysarthria)',
    caseConstraints: [
      'Onset time: 2 ชั่วโมง (อยู่ในช่วง Golden Period)',
      'ไม่มีข้อห้ามในการให้ยาละลายลิ่มเลือด',
      'CT Brain: No hemorrhage'
    ],
    localization: 'Left Middle Cerebral Artery (MCA) Territory - Frontal and Parietal lobes',
    etiology: 'Thrombosis / Embolism (Ischemic)',
    goldStandardLabs: ['1'], // CT Brain (Only the absolute essential for acute stroke decision)
    goldStandardDrugs: ['5'], // rt-PA (because onset is 2 hours)
    contraindicatedDrugs: ['4', '6'], // Clopidogrel/Warfarin usually not immediate if giving rt-PA, but let's just mark rt-PA as the required gold standard.
    personaDetails: 'อาชีพขับแท็กซี่ จู่ๆ ก็อ่อนแรงซีกขวา แก้วน้ำหลุดมือ พูดอ้อแอ้ ฟังรู้เรื่องแต่พูดไม่ชัด ตกใจมาก รีบให้ลูกพาส่ง รพ. เป็นความดันแต่ไม่ค่อยกินยา',
    voiceProfile: 'old_male',
    ddxKeywords: ['stroke', 'ischemic stroke', 'mca', 'infarction', 'cva'],
    finalDiagnosisKeywords: ['acute ischemic stroke', 'left mca infarction', 'mca stroke'],
    vitals: {
      bp: '180/100',
      hr: 85,
      rr: 18,
      temp: 37.0,
      spo2: 98,
      weight: 75,
      height: 165
    },
    ddxGroup: 'กลุ่มโรคหลอดเลือดสมอง (Cerebrovascular Disease / Stroke)',
    ddxExplanation: 'อาการแขนขาอ่อนแรงซีกขวากะทันหันและพูดไม่ชัด บ่งชี้ถึงความผิดปกติของระบบประสาทส่วนกลางที่เกิดขึ้นเฉียบพลัน (Sudden onset) ซึ่งเข้าได้กับกลุ่มโรคหลอดเลือดสมองมากที่สุด',
    diagnosisExplanation: 'อาการอ่อนแรงซีกขวาและพูดไม่ชัด (Aphasia/Dysarthria) บ่งชี้ตำแหน่งรอยโรคที่สมองซีกซ้าย (Left MCA territory) และเนื่องจากเกิดขึ้นเฉียบพลันโดย CT ไม่พบเลือดออก จึงเข้าได้กับ Acute Ischemic Stroke',
    specificLabResults: {
      '1': {
        text: '**CT Brain non-contrast:**\n- No acute intracranial hemorrhage.\n- Subtle loss of insular ribbon on the left side.\n- Hyperdense MCA sign (left).',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Placeholder CT
      },
      '9': {
        text: '**EKG 12 leads:**\n- Normal sinus rhythm at 85 bpm.\n- No ST-T wave changes.\n- **No evidence of Atrial Fibrillation.**'
      }
    }
  },
  {
    id: 'case_brown_sequard',
    tier: 'Mid', // Score 4-6
    diseaseName: 'Brown-Séquard Syndrome',
    patientName: 'คุณวิชัย แสงทอง',
    age: 32,
    gender: 'Male',
    chiefComplaint: 'ถูกแทงที่หลังด้านขวา ขาขวาขยับไม่ได้ ขาซ้ายไม่รู้สึกเจ็บ (Stab wound, right leg paralysis, left leg loss of pain)',
    caseConstraints: [
      'Traumatic spinal cord injury',
      'Need urgent MRI Thoracic Spine',
      'Do not give Thrombolytics!'
    ],
    localization: 'Right Hemicord Lesion (Thoracic level)',
    etiology: 'Trauma (Penetrating injury)',
    goldStandardLabs: ['2'], // MRI Spine (mapped to ID 2 in specificLabResults)
    goldStandardDrugs: ['8'], // Dexamethasone/Steroids for spinal cord injury (debatable, but common in exams)
    contraindicatedDrugs: ['1', '4', '5', '6'], // No blood thinners for trauma!
    personaDetails: 'วัยรุ่นทำงานก่อสร้าง ทะเลาะวิวาทถูกแทงที่หลังด้านขวา รู้สึกเจ็บปวดแผลมาก ขาขวาขยับไม่ได้เลย ส่วนขาซ้ายขยับได้แต่ถ้าหยิกจะไม่เจ็บ',
    voiceProfile: 'young_male',
    ddxKeywords: ['brown sequard', 'brown-sequard', 'spinal cord injury', 'hemicord'],
    finalDiagnosisKeywords: ['brown-sequard syndrome', 'brown sequard'],
    vitals: {
      bp: '130/80',
      hr: 105,
      rr: 20,
      temp: 37.2,
      spo2: 99,
      weight: 65,
      height: 175
    },
    ddxGroup: 'กลุ่มโรคไขสันหลังบาดเจ็บ (Spinal Cord Injury / Myelopathy)',
    ddxExplanation: 'ประวัติถูกแทงที่หลังอย่างชัดเจนร่วมกับอาการอ่อนแรงและชาที่ขาสองข้างไม่เหมือนกัน เป็นกลุ่มอาการทางคลินิกที่บ่งชี้รอยโรคที่ระดับไขสันหลัง (Spinal cord)',
    diagnosisExplanation: 'การอ่อนแรงขาขวา (Ipsilateral motor loss) และเสียการรับความรู้สึกเจ็บปวดที่ขาซ้าย (Contralateral pain/temp loss) เป็นลักษณะเฉพาะของการบาดเจ็บที่ไขสันหลังซีกขวา (Brown-Séquard Syndrome)',
    specificLabResults: {
      '2': {
        text: '**MRI Spine (Thoracic):**\n- **Right-sided hemicord injury** at T10 level.\n- Localized edema and soft tissue defect correlating with stab wound tract.',
        imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Placeholder MRI
      }
    }
  },
  {
    id: 'case_wallenbergs',
    tier: 'High', // Score 7-9
    diseaseName: 'Lateral Medullary Syndrome (Wallenberg\'s)',
    patientName: 'คุณอนันต์ สุขสม',
    age: 58,
    gender: 'Male',
    chiefComplaint: 'เวียนศีรษะรุนแรง เดินเซ กลืนลำบาก เสียงแหบ ชาหน้าซีกซ้ายและลำตัวซีกขวา (Vertigo, dysphagia, crossed sensory loss)',
    caseConstraints: [
      'Onset time: 5 ชั่วโมง (เกิน Golden Period สำหรับ IV rt-PA)',
      'Atypical presentation requiring complex brainstem localization'
    ],
    localization: 'Left Lateral Medulla (PICA territory)',
    etiology: 'Infarction of Posterior Inferior Cerebellar Artery (PICA)',
    goldStandardLabs: ['2'], // MRI Brain (better for posterior fossa)
    goldStandardDrugs: ['1', '2'], // Aspirin, Atorvastatin (Secondary prevention, no rt-PA)
    contraindicatedDrugs: ['5'], // rt-PA contraindicated (Onset > 4.5 hrs)
    personaDetails: 'พ่อค้าขายข้าวมันไก่ ตื่นมา 5 ชั่วโมงก่อนแล้วบ้านหมุนรุนแรง อ้วกตลอด กลืนน้ำลายลำบาก เสียงแหบพร่า รู้สึกชาๆ ที่หน้าซีกซ้ายและลำตัวซีกขวา เดินเซเหมือนคนเมา',
    voiceProfile: 'old_male',
    ddxKeywords: ['wallenberg', 'lateral medullary', 'pica syndrome'],
    finalDiagnosisKeywords: ['wallenberg syndrome', 'lateral medullary syndrome'],
    vitals: {
      bp: '150/90',
      hr: 82,
      rr: 16,
      temp: 36.8,
      spo2: 97,
      weight: 70,
      height: 168
    },
    ddxGroup: 'กลุ่มโรคก้านสมอง (Brainstem Syndrome / Posterior Circulation Stroke)',
    ddxExplanation: 'อาการเวียนศีรษะ เดินเซ กลืนลำบาก และเสียงแหบ เป็นกลุ่มอาการที่บ่งชี้ถึงความผิดปกติของระบบประสาทในส่วนก้านสมองและสมองน้อย (Posterior fossa)',
    diagnosisExplanation: 'อาการชาหน้าซ้าย ชาตัวขวา (Crossed sensory loss) ร่วมกับเวียนศีรษะ กลืนลำบาก และเดินเซ บ่งชี้ตำแหน่งรอยโรคที่ก้านสมองส่วน Lateral Medulla ซีกซ้าย (Wallenberg Syndrome)',
    specificLabResults: {
      '2': {
        text: '**MRI Brain:**\n- **Acute restricted diffusion in the left lateral medulla.**\n- Preserved pons and midbrain.\n- Finding is consistent with acute infarction in the left PICA territory.',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Placeholder MRI
      }
    }
  }
];

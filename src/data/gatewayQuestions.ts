export interface GatewayQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  relatedSlide: string;
}

export const GATEWAY_QUESTIONS: GatewayQuestion[] = [
  {
    id: "g1",
    question: "Which structure prevents food from entering the trachea during swallowing?",
    options: ["Epiglottis", "Larynx", "Pharynx", "Uvula"],
    correctAnswerIndex: 0,
    relatedSlide: "Respiratory Anatomy: Upper Airway"
  },
  {
    id: "g2",
    question: "What is the primary site of gas exchange in the lungs?",
    options: ["Bronchioles", "Trachea", "Alveoli", "Bronchi"],
    correctAnswerIndex: 2,
    relatedSlide: "Respiratory Anatomy: Alveoli"
  },
  {
    id: "g3",
    question: "Which muscle is primarily responsible for resting inspiration?",
    options: ["Internal intercostals", "Diaphragm", "Abdominal muscles", "Sternocleidomastoid"],
    correctAnswerIndex: 1,
    relatedSlide: "Respiratory Physiology: Muscles of Respiration"
  },
  {
    id: "g4",
    question: "What is the normal resting tidal volume (VT) in an average adult?",
    options: ["150 mL", "500 mL", "1200 mL", "3000 mL"],
    correctAnswerIndex: 1,
    relatedSlide: "Lung Volumes and Capacities"
  },
  {
    id: "g5",
    question: "Which cell type in the alveoli produces surfactant?",
    options: ["Type I pneumocytes", "Type II pneumocytes", "Alveolar macrophages", "Goblet cells"],
    correctAnswerIndex: 1,
    relatedSlide: "Alveolar Histology"
  },
  {
    id: "g6",
    question: "What is the effect of surfactant on alveolar surface tension?",
    options: ["Increases surface tension", "Decreases surface tension", "Has no effect", "Increases fluid leakage"],
    correctAnswerIndex: 1,
    relatedSlide: "Respiratory Physiology: Surfactant"
  },
  {
    id: "g7",
    question: "In a normal healthy individual, the drive to breathe is primarily regulated by which central chemoreceptor stimulus?",
    options: ["Decreased PaO2", "Increased PaCO2", "Decreased pH in blood", "Increased HCO3-"],
    correctAnswerIndex: 1,
    relatedSlide: "Control of Breathing"
  },
  {
    id: "g8",
    question: "Which of the following describes the Bohr effect?",
    options: ["O2 binding increases CO2 affinity", "CO2 and H+ decrease hemoglobin's affinity for O2", "O2 binding decreases CO2 affinity", "CO2 binding increases O2 affinity"],
    correctAnswerIndex: 1,
    relatedSlide: "Gas Transport in Blood"
  },
  {
    id: "g9",
    question: "What is the anatomical dead space volume in a typical adult?",
    options: ["50 mL", "150 mL", "350 mL", "500 mL"],
    correctAnswerIndex: 1,
    relatedSlide: "Ventilation and Dead Space"
  },
  {
    id: "g10",
    question: "A rightward shift of the oxygen-hemoglobin dissociation curve is caused by:",
    options: ["Decreased temperature", "Decreased 2,3-BPG", "Decreased pH (acidosis)", "Decreased PCO2"],
    correctAnswerIndex: 2,
    relatedSlide: "Oxygen Dissociation Curve"
  },
  {
    id: "g11",
    question: "Which nerve innervates the diaphragm?",
    options: ["Vagus nerve", "Phrenic nerve", "Intercostal nerves", "Accessory nerve"],
    correctAnswerIndex: 1,
    relatedSlide: "Respiratory Anatomy: Innervation"
  },
  {
    id: "g12",
    question: "What is the normal ratio of FEV1 to FVC (FEV1/FVC) in a healthy adult?",
    options: ["< 50%", "~ 60%", "> 75-80%", "> 95%"],
    correctAnswerIndex: 2,
    relatedSlide: "Spirometry and Pulmonary Function Tests"
  },
  {
    id: "g13",
    question: "In obstructive lung diseases (e.g., Asthma, COPD), what typical change is seen in spirometry?",
    options: ["Increased FEV1/FVC ratio", "Decreased FEV1/FVC ratio (< 70%)", "Decreased Total Lung Capacity", "Normal FEV1"],
    correctAnswerIndex: 1,
    relatedSlide: "Pathophysiology: Obstructive Disease"
  },
  {
    id: "g14",
    question: "Which type of hypoxia is caused by a right-to-left cardiac shunt?",
    options: ["Hypoxic hypoxia", "Anemic hypoxia", "Circulatory hypoxia", "Histotoxic hypoxia"],
    correctAnswerIndex: 0,
    relatedSlide: "Causes of Hypoxemia"
  },
  {
    id: "g15",
    question: "What is the primary pathological mechanism in Asthma?",
    options: ["Alveolar destruction", "Reversible airway inflammation and bronchoconstriction", "Irreversible airway dilation", "Pulmonary fibrosis"],
    correctAnswerIndex: 1,
    relatedSlide: "Asthma Pathophysiology"
  },
  {
    id: "g16",
    question: "Which drug class is considered the first-line 'reliever' therapy for an acute asthma attack?",
    options: ["Inhaled Corticosteroids (ICS)", "Long-acting beta-agonists (LABA)", "Short-acting beta-agonists (SABA)", "Leukotriene receptor antagonists"],
    correctAnswerIndex: 2,
    relatedSlide: "Pharmacology: Asthma Management"
  },
  {
    id: "g17",
    question: "What is the most common bacterial pathogen causing Community-Acquired Pneumonia (CAP)?",
    options: ["Staphylococcus aureus", "Streptococcus pneumoniae", "Mycoplasma pneumoniae", "Pseudomonas aeruginosa"],
    correctAnswerIndex: 1,
    relatedSlide: "Infectious Disease: Pneumonia"
  },
  {
    id: "g18",
    question: "Which physical examination finding is classic for pleural effusion?",
    options: ["Hyperresonance on percussion", "Dullness on percussion", "Wheezing", "Increased tactile fremitus"],
    correctAnswerIndex: 1,
    relatedSlide: "Respiratory Physical Examination"
  },
  {
    id: "g19",
    question: "A patient presents with sudden severe chest pain, shortness of breath, absent breath sounds on the right, and tracheal deviation to the left. Diagnosis?",
    options: ["Asthma exacerbation", "Pneumonia", "Tension pneumothorax", "Pulmonary embolism"],
    correctAnswerIndex: 2,
    relatedSlide: "Respiratory Emergencies"
  },
  {
    id: "g20",
    question: "What is the immediate life-saving intervention for a tension pneumothorax?",
    options: ["Chest X-ray", "Needle thoracostomy (decompression)", "Intravenous antibiotics", "Inhaled bronchodilators"],
    correctAnswerIndex: 1,
    relatedSlide: "Management of Tension Pneumothorax"
  }
];

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
    question: "Which of the following describes the function of the Primary Motor Cortex?",
    options: ["Sensory processing", "Voluntary motor execution", "Visual processing", "Auditory reception"],
    correctAnswerIndex: 1,
    relatedSlide: "Slide 12: Motor Cortices"
  },
  {
    id: "g2",
    question: "Which artery supplies the medial surface of the frontal and parietal lobes?",
    options: ["Middle Cerebral Artery (MCA)", "Anterior Cerebral Artery (ACA)", "Posterior Cerebral Artery (PCA)", "Basilar Artery"],
    correctAnswerIndex: 1,
    relatedSlide: "Slide 15: Cerebral Blood Supply"
  },
  {
    id: "g3",
    question: "A lesion in Broca's area leads to which of the following?",
    options: ["Expressive aphasia", "Receptive aphasia", "Visual agnosia", "Ataxia"],
    correctAnswerIndex: 0,
    relatedSlide: "Slide 18: Cortical Areas & Aphasia"
  },
  {
    id: "g4",
    question: "Which spinal tract is primarily responsible for pain and temperature sensation?",
    options: ["Dorsal Column Medial Lemniscus", "Lateral Spinothalamic Tract", "Corticospinal Tract", "Spinocerebellar Tract"],
    correctAnswerIndex: 1,
    relatedSlide: "Slide 22: Spinal Cord Tracts"
  },
  {
    id: "g5",
    question: "Which cranial nerve is responsible for facial expression?",
    options: ["CN V", "CN VII", "CN IX", "CN X"],
    correctAnswerIndex: 1,
    relatedSlide: "Slide 30: Cranial Nerves"
  },
  {
    id: "g6",
    question: "The anterior choroidal artery (AChorA) supplies which of the following structures?",
    options: ["Medial aspect of frontal lobe", "Choroid plexus of the lateral ventricle", "Primary visual cortex", "Pons and medulla"],
    correctAnswerIndex: 1,
    relatedSlide: "Blood supply Slide 12: Anterior choroidal artery"
  },
  {
    id: "g7",
    question: "Which branch of the anterior cerebral artery (ACA) supplies the head of the caudate nucleus and anterior limb of the internal capsule?",
    options: ["Recurrent artery of Heubner", "Pericallosal artery", "Frontopolar artery", "Callosomarginal artery"],
    correctAnswerIndex: 0,
    relatedSlide: "Blood supply Slide 15: Central branches of ACA"
  },
  {
    id: "g8",
    question: "A patient presents with weakness and sensory loss in the contralateral leg more than the arm. Which artery is most likely occluded?",
    options: ["Middle cerebral artery (MCA)", "Anterior cerebral artery (ACA)", "Posterior cerebral artery (PCA)", "Anterior choroidal artery"],
    correctAnswerIndex: 1,
    relatedSlide: "Blood supply Slide 16: Cortical branches of ACA"
  },
  {
    id: "g9",
    question: "The primary motor and somatosensory cortices for the face and upper extremity are supplied by which artery?",
    options: ["Anterior cerebral artery", "Middle cerebral artery (M4 branch)", "Posterior cerebral artery", "Anterior choroidal artery"],
    correctAnswerIndex: 1,
    relatedSlide: "Blood supply Slide 18: Middle cerebral artery"
  },
  {
    id: "g10",
    question: "Which arteries supply the body of the caudate, globus pallidus, and putamen?",
    options: ["Thalamoperforating arteries", "Medial striate arteries", "Lenticulostriate arteries", "Pontine arteries"],
    correctAnswerIndex: 2,
    relatedSlide: "Blood supply Slide 19: Central branches of MCA"
  },
  {
    id: "g11",
    question: "The posterior inferior cerebellar artery (PICA) arises from which artery?",
    options: ["Basilar artery", "Internal carotid artery", "Vertebral artery", "Posterior cerebral artery"],
    correctAnswerIndex: 2,
    relatedSlide: "Blood supply Slide 24: PICA"
  },
  {
    id: "g12",
    question: "Which structure is formed at the base of the brain to join the carotid and vertebrobasilar systems?",
    options: ["Circle of Willis", "Cavernous sinus", "Great cerebral vein of Galen", "Straight sinus"],
    correctAnswerIndex: 0,
    relatedSlide: "Blood supply Slide 32: Circle of Willis"
  },
  {
    id: "g13",
    question: "Which dural venous sinus is formed by the union of the great cerebral vein and the inferior sagittal sinus?",
    options: ["Superior sagittal sinus", "Straight sinus", "Transverse sinus", "Sigmoid sinus"],
    correctAnswerIndex: 1,
    relatedSlide: "Blood supply Slide 35: Dural venous sinuses"
  },
  {
    id: "g14",
    question: "Which fissure separates the two cerebral hemispheres?",
    options: ["Sylvian fissure", "Central sulcus", "Longitudinal (interhemispheric) fissure", "Calcarine fissure"],
    correctAnswerIndex: 2,
    relatedSlide: "Cerebrum Slide 18: Longitudinal fissure"
  },
  {
    id: "g15",
    question: "The primary auditory cortex is located in which area?",
    options: ["Superior temporal gyrus (Heschl's gyrus)", "Precentral gyrus", "Postcentral gyrus", "Occipital lobe"],
    correctAnswerIndex: 0,
    relatedSlide: "Cerebrum Slide 41: Temporal lobe"
  },
  {
    id: "g16",
    question: "A patient with Wernicke's aphasia primarily exhibits which of the following?",
    options: ["Nonfluent speech with good comprehension", "Fluent speech with poor comprehension", "Inability to repeat words with intact comprehension", "Loss of all language capabilities"],
    correctAnswerIndex: 1,
    relatedSlide: "Cerebrum Slide 51: Aphasic syndromes"
  },
  {
    id: "g17",
    question: "Which area of the brain is known as the primary visual cortex (BA 17)?",
    options: ["Superior parietal lobule", "Calcarine cortex", "Angular gyrus", "Orbitofrontal cortex"],
    correctAnswerIndex: 1,
    relatedSlide: "Cerebrum Slide 43: Occipital lobe"
  },
  {
    id: "g18",
    question: "Gerstmann's syndrome (including agraphia and acalculia) is typically caused by a lesion in which area?",
    options: ["Medial frontal lobe", "Inferior parietal lobule (Left side)", "Right superior temporal gyrus", "Occipital pole"],
    correctAnswerIndex: 1,
    relatedSlide: "Cerebrum Slide 36: Parietal lobe"
  },
  {
    id: "g19",
    question: "The ascending reticular activating system (ARAS), responsible for the level of consciousness, is located in which structures?",
    options: ["Bilateral diencephalon, midbrain, and upper pons", "Cerebellum and medulla", "Occipital and parietal lobes", "Basal ganglia and amygdala"],
    correctAnswerIndex: 0,
    relatedSlide: "Cerebrum Slide 60: Anatomy of consciousness"
  },
  {
    id: "g20",
    question: "Which type of fibers connect the left and right cerebral hemispheres, such as the corpus callosum?",
    options: ["Association fibers", "Projection fibers", "Commissural fibers", "Corticospinal fibers"],
    correctAnswerIndex: 2,
    relatedSlide: "Cerebrum Slide 8: Connection fibers"
  }
];

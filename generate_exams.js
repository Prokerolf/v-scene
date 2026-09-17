const fs = require('fs');

const examsData = `import { GatewayQuestion } from './gatewayQuestions';

export const BATCH1_QUESTIONS: GatewayQuestion[] = [
  {
    id: "b1_1",
    caseKey: "case_a",
    question: "1. A 35-year-old female presents with new-onset generalized tonic-clonic seizures preceded by chronic dull headaches. Non-contrast brain CT reveals a cystic lesion with an eccentric hyperdense mural nodule representing an invaginated scolex (hole-with-dot sign). She denies eating raw pork but frequently eats unwashed raw vegetables. What was the infective stage and mode of infection that caused her central nervous system disease?",
    options: [
      "a. Ingestion of raw pork containing Cysticercus cellulosae",
      "b. Ingestion of food or water contaminated with T. solium embryonated eggs",
      "c. Ingestion of raw beef containing Cysticercus bovis embryonated eggs",
      "d. Skin penetration by hexacanth oncospheres from contaminated soil",
      "e. Ingestion of copepods infected with procercoid larvae"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_2",
    caseKey: "case_a",
    question: "2. In the biological life cycle of Taenia solium, humans can serve two distinct host roles depending on the acquired stage. Which of the following correctly pairs the human host status with the resulting clinical disease and route of exposure?",
    options: [
      "a. Definitive host: develops taeniasis after ingesting Cysticercus cellulosae in undercooked pork",
      "b. Intermediate host: develops taeniasis after ingesting embryonated eggs from feces",
      "c. Definitive host: develops neurocysticercosis after ingesting Cysticercus cellulosae",
      "d. Accidental intermediate host: develops cysticercosis after ingesting adult gravid proglottids",
      "e. Paratenic host: develops intestinal taeniasis after ingesting oncospheres in soil"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b1_3",
    caseKey: "case_a",
    question: "3. A patient passes ribbon-like white flat segments in his stool. Microscopic examination of a gravid proglottid injected with India ink confirms Taenia solium rather than Taenia saginata. Which morphological feature of the gravid proglottid is diagnostic for Taenia solium?",
    options: [
      "a. Absence of a genital pore along the lateral margin",
      "b. Presence of 7 to 13 main lateral uterine branches on each side",
      "c. Presence of 15 to 30 main lateral uterine branches on each side",
      "d. Presence of two prominent sucking grooves (bothria)",
      "e. Presence of 4 to 8 polar filaments surrounding the oncosphere"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_4",
    caseKey: "case_a",
    question: "4. A surgical excision of a subcutaneous nodule from the forearm of a patient suspected of having cysticercosis reveals a fluid-filled cystic bladder containing an invaginated scolex. Which structural characteristic distinguishes the scolex of Taenia solium from that of Taenia saginata?",
    options: [
      "a. An armed rostellum with a double crown of hooklets in addition to four suckers",
      "b. An unarmed scolex possessing only four hemispherical suckers without hooklets",
      "c. A pair of longitudinal slit-like sucking grooves without suckers or rostellum",
      "d. An apical cone with prominent lateral spines",
      "e. A rounded scolex surrounded by multiple branched tentacles"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b1_5",
    caseKey: "case_a",
    question: "5. A stool examination from an asymptomatic patient demonstrates round, brown-colored eggs measuring 35 µm with a thick shell exhibiting prominent radial striations and containing a hexacanth embryo (oncosphere). What is the appropriate laboratory reporting protocol and limitation for this microscopic finding?",
    options: [
      "a. Report as definitive Taenia solium egg because the shell morphology differentiates it from Taenia saginata",
      "b. Report as Taenia spp. egg because the eggs of both species are morphologically identical",
      "c. Report as Hymenolepis nana egg because both have thick radial striations",
      "d. Report as unembryonated cestode egg requiring water incubation before identification",
      "e. Report as Echinococcus granulosus egg because only human hydatid eggs appear in stool"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_6",
    caseKey: "case_a",
    question: "6. A 28-year-old male with confirmed intestinal taeniasis solium experiences severe reverse peristalsis and nausea. What major complication is he at risk of developing via internal autoinfection?",
    options: [
      "a. Intestinal perforation by migrating adult worms",
      "b. Biliary colic due to adult worm migration into the common bile duct",
      "c. Cysticercosis of the brain, eyes, and muscles from prematurely hatched oncospheres",
      "d. Severe megaloblastic anemia due to competitive uptake of cobalamin",
      "e. Massive eosinophilic pneumonia caused by pulmonary larval molting"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b1_7",
    caseKey: "case_a",
    question: "7. A 34-year-old woman is diagnosed with viable parenchymal neurocysticercosis with perilesional edema. Prior to initiating antiparasitic treatment with albendazole, which mandatory baseline screening examination must be conducted to avoid catastrophic local inflammation?",
    options: [
      "a. Routine fundoscopic eye examination to rule out intraocular cysticercosis",
      "b. Serum cobalamin measurement to exclude tapeworm-induced vitamin deficiency",
      "c. Contrast echocardiography to rule out cardiac echinococcal cysts",
      "d. Stool agar plate culture to assess the intensity of autoinfection",
      "e. Lumbar puncture to confirm the absence of Gram-negative bacterial translocation"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b1_8",
    caseKey: "case_a",
    question: "8. A patient with symptomatic parenchymal neurocysticercosis is prescribed to oral albendazole. According to Rational Drug Use principles, why must systemic corticosteroids (e.g., dexamethasone) be administered concurrently or shortly prior to the anthelmintic therapy?",
    options: [
      "a. To accelerate the passive renal clearance of albendazole sulfoxide metabolites",
      "b. To suppress severe intracranial host inflammatory reactions induced by dying cysticerci",
      "c. To promote the spontaneous hatching of oncospheres in the small intestine",
      "d. To inhibit gastric acid secretion and enhance the bioavailability of albendazole",
      "e. To prevent secondary Gram-negative enteric bacteremia"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_9",
    caseKey: "case_a",
    question: "9. A patient is confirmed to have adult intestinal Taeniasis. Which measure is most critical for primary prevention of cysticercosis in the household contacts?",
    options: [
      "a. Screening household contacts for taeniasis carriers and ensuring proper sanitary stool disposal",
      "b. Freezing all household beef below -10 degrees Celsius for 24 hours",
      "c. Administering prophylactic albendazole to all domestic cats and dogs",
      "d. Boiling all domestic drinking water for 15 minutes to kill plerocercoid larvae",
      "e. Avoiding the consumption of aquatic vegetables such as water chestnuts and water caltrops"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b1_10",
    caseKey: "case_a",
    question: "10. A 30-year-old man presents with a history of passing white, flat, ribbon-like segments in his stool for the past 2 months. He reports frequently eating undercooked pork. Stool examination reveals gravid proglottids, and he is diagnosed with intestinal taeniasis caused by Taenia solium. Which of the following correctly describes the infective stage and the natural intermediate host responsible for this infection?",
    options: [
      "a. Infective stage is the embryonated egg; the natural intermediate host is cattle",
      "b. Infective stage is Cysticercus cellulosae in pork; the natural intermediate host is the pig",
      "c. Infective stage is Cysticercus bovis in beef; the natural intermediate host is the pig",
      "d. Infective stage is the plerocercoid larva in freshwater fish; the natural intermediate host is the copepod",
      "e. Infective stage is the hexacanth oncosphere in soil; there is no intermediate host"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_11",
    caseKey: "case_b",
    question: "11. A full-term female newborn is delivered to a 23-year-old primigravida mother, presenting with severe symmetric microcephaly, low birth weight (2,200 g), jaundice, hepatosplenomegaly, and petechial rash. Which of the following is the primary vector responsible for transmitting the suspected causative pathogen to the mother?",
    options: [
      "a. Culex quinquefasciatus",
      "b. Aedes aegypti",
      "c. Anopheles dirus",
      "d. Mansonia uniformis",
      "e. Ixodes scapularis"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_12",
    caseKey: "case_b",
    question: "12. Non-contrast CT scan of the newborn's brain demonstrates subcortical calcifications and ventriculomegaly. Which of the following neuroimaging patterns best distinguishes Congenital Zika Virus infection from Congenital Cytomegalovirus infection?",
    options: [
      "a. Periventricular calcifications primarily around lateral ventricles",
      "b. Subcortical calcifications located predominantly at the gray-white matter junction with severe cortical thinning",
      "c. Diffuse intracranial calcifications scattered throughout the basal ganglia and thalamus",
      "d. Unilateral cerebellar hypoplasia without ventriculomegaly",
      "e. Extensive epidural hemorrhage with calvarial destruction"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_13",
    caseKey: "case_b",
    question: "13. What is the primary cellular mechanism explaining why Zika virus causes severe microcephaly and disrupted fetal brain development?",
    options: [
      "a. Direct destruction of myelin sheaths by cytotoxic T lymphocytes",
      "b. Selective viral tropism and infection of neural progenitor cells, leading to cell cycle arrest and apoptosis",
      "c. Autoantibody-mediated inhibition of synaptic vesicle neurotransmitter release",
      "d. Massive infiltration of neutrophils causing diffuse brain abscesses",
      "e. Blockade of the aqueduct of Sylvius by fungal pseudo-hyphae"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_14",
    caseKey: "case_b",
    question: "14. A newborn with suspected congenital infection has negative Zika IgM serology but positive Zika virus RT-PCR in both plasma and urine. Which of the following best explains this diagnostic outcome?",
    options: [
      "a. Serology is falsely negative due to complete viral clearance before delivery",
      "b. Immature fetal immune response can result in delayed or absent specific IgM production, making molecular detection essential for confirmation",
      "c. Positive RT-PCR in urine is a non-specific artifact caused by maternal cell contamination",
      "d. Serological testing for flaviviruses always carries 100% negative predictive value",
      "e. RT-PCR detects only inactivated non-pathogenic viral proteins"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_15",
    caseKey: "case_b",
    question: "15. Complete blood count of the neonate reveals a platelet count of 60,000 /mm³ and physical exam shows petechiae on the trunk and face. What is the true about primary pathophysiology behind thrombocytopenia in congenital viral infections?",
    options: [
      "a. Direct viral suppression of megakaryocytopoiesis in the bone marrow",
      "b. Severe nutritional vitamin K deficiency from maternal malabsorption",
      "c. Hereditary deficiency of von Willebrand factor that suppress platelets count",
      "d. Rapid enzymatic cleavage of platelets by viral neuraminidase",
      "e. Massive splenic sequestration without reticuloendothelial activation"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b1_16",
    caseKey: "case_b",
    question: "16. Which of the following structural and genomic characteristics is correct for the causative agent of Congenital Zika Syndrome?",
    options: [
      "a. Enveloped virus with positive-sense single-stranded RNA, belonging to the family Flaviviridae",
      "b. Non-enveloped virus with negative-sense single-stranded RNA, belonging to the family Paramyxoviridae",
      "c. Enveloped virus with double-stranded DNA, belonging to the family Herpesviridae",
      "d. Non-enveloped virus with positive-sense single-stranded RNA, belonging to the family Picornaviridae",
      "e. Enveloped virus with segmented negative-sense RNA, belonging to the family Orthomyxoviridae"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b1_17",
    caseKey: "case_b",
    question: "17. A 23-year-old mother living in an endemic area presents during the first trimester of pregnancy with low-grade fever, rash, and arthralgia. Which of the following is the most appropriate analgesic/antipyretic agent of choice?",
    options: [
      "a. Oral Ibuprofen 400 mg every 6 hours",
      "b. Oral Aspirin 325 mg every 4 hours",
      "c. Oral Paracetamol 500 mg every 4 to 6 hours",
      "d. Oral Indomethacin 25 mg twice daily",
      "e. Intramuscular Ketorolac 30 mg single dose"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b1_18",
    caseKey: "case_b",
    question: "18. A Neonate confirmed to have Congenital Zika Syndrome, which of the following reflects the principle of appropriate drug use?",
    options: [
      "a. Routine administration of high-dose intravenous Ganciclovir for 6 weeks",
      "b. Immediate initiation of empirical oral Oseltamivir to halt central nervous system injury",
      "c. Prophylactic broad-spectrum intravenous Ceftriaxone for 14 days to prevent superinfection",
      "d. Supportive and symptomatic care with no indication for specific antiviral drugs, as no approved antiviral therapy currently exists",
      "e. Long-term systemic corticosteroid therapy to reverse subcortical calcifications"
    ],
    correctAnswerIndex: 3,
    relatedSlide: ""
  },
  {
    id: "b1_19",
    caseKey: "case_b",
    question: "19. In addition to mosquito vector control, which of the following transmission routes is unique among arthropod-borne flaviviruses and requires specific counseling for pregnant women and their partners?",
    options: [
      "a. Ingestion of unpasteurized cow's milk",
      "b. Sexual transmission via semen and vaginal secretions",
      "c. Inhalation of fungal spores from contaminated soil",
      "d. Direct skin-to-skin contact with intact dry skin",
      "e. Aerosol droplet transmission during normal conversation"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_20",
    caseKey: "case_b",
    question: "20. The mother of this neonate reports no history of fever, rash, or arthralgia at any point during her pregnancy, and her antenatal Anti-HIV and VDRL results were both negative. The medical student on the team suggests that congenital Zika virus infection can therefore be excluded. Which of the following is the most appropriate response?",
    options: [
      "a. The student is correct, because congenital transmission occurs only when the mother develops a symptomatic viremic illness",
      "b. The student is incorrect, because the majority of Zika virus infections are asymptomatic or cause only mild self-limited symptoms lasting 2–7 days, so an absent maternal history does not exclude congenital infection",
      "c. The student is correct, because negative antenatal Anti-HIV and VDRL results also rule out all other TORCH pathogens",
      "d. The student is incorrect, because Zika virus is transmitted to the fetus only during labor and delivery, making the antenatal history irrelevant",
      "e. The student is correct, because maternal symptoms are required for the virus to cross the placental barrier"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_21",
    caseKey: "case_c",
    question: "21. A 62-year-old farmer with autoimmune hemolytic anemia on high-dose prednisolone presents with fever, hemoptysis, watery diarrhea, and shock. He has a history of walking barefoot in rural fields. Which of the following is the mode of infection and infective stage for acquiring this parasite from the soil?",
    options: [
      "a. Ingestion of embryonated eggs",
      "b. Skin penetration by filariform larvae",
      "c. Ingestion of encysted metacercariae",
      "d. Skin penetration by rhabditiform larvae",
      "e. Ingestion of raw freshwater fish containing third-stage larvae"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_22",
    caseKey: "case_c",
    question: "22. Physical examination of the patient reveals raised, erythematous, serpiginous linear tracks around the perianal area extending rapidly along the buttocks and trunk. Which mechanism directly accounts for this characteristic rash?",
    options: [
      "a. Migration of adult female worms in dermal capillaries",
      "b. Deposition of embryonated eggs along subcutaneous lymphatics",
      "c. Rapid subcutaneous migration of filariform larvae during autoinfection",
      "d. Type I hypersensitivity reaction to excreted rhabditiform larvae",
      "e. Direct tissue destruction by bacterial toxins on the larval sheath"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b1_23",
    caseKey: "case_c",
    question: "23. Complete blood count shows marked leukocytosis with absolute eosinopenia (0% eosinophils). Which of the following best explains this hematologic finding in this severe case?",
    options: [
      "a. Complete consumption of eosinophils within alveolar spaces",
      "b. Corticosteroid-induced eosinophil apoptosis combined with severe bacterial sepsis",
      "c. Direct suppression of bone marrow granulopoiesis by parasite proteases",
      "d. Differentiation shift of eosinophils into the neutrophil lineage",
      "e. Immune tolerance against somatic parasitic antigens"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_24",
    caseKey: "case_c",
    question: "24. In an immunocompromised host, Strongyloides stercoralis can cause fatal hyperinfection syndrome through internal autoinfection. Which of the following events triggers this internal cycle within the host?",
    options: [
      "a. Rhabditiform larvae transform into filariform larvae inside the bowel lumen and invade the intestinal wall",
      "b. Free-living adult male and female worms' mate in the peritoneal cavity",
      "c. Parthenogenetic adult females penetrate directly into the mesenteric lymphatics",
      "d. Embryonated eggs hatch directly in the pulmonary alveoli after hematogenous spread",
      "e. Filariform larvae migrate retrograde from the colon into the pancreatic duct"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b1_25",
    caseKey: "case_c",
    question: "25. Sputum wet mount demonstrates actively motile nematode larvae. Which of the following morphological characteristics is diagnostic for the stage found in the respiratory specimen?",
    options: [
      "a. Short buccal cavity and prominent genital primordium",
      "b. Long buccal cavity and pointed tail",
      "c. Esophagus length approximately half of body length with a notched tail",
      "d. Esophagus length approximately one-third of body length with a pointed tail",
      "e. Lateral alae and bulbous esophagus"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b1_26",
    caseKey: "case_c",
    question: "26. Which stool examination technique provides the highest sensitivity for detecting Strongyloides stercoralis larvae by demonstrating tracks of bacterial colonies following larval movement?",
    options: [
      "a. Simple direct wet smear",
      "b. Formalin-ether concentration technique",
      "c. Modified agar plate culture",
      "d. Kato-Katz thick smear",
      "e. Saturated salt flotation technique"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b1_27",
    caseKey: "case_c",
    question: "27. Blood cultures from the patient grow Escherichia coli. Which of the following explains the pathogenesis of this polymicrobial bacteremia?",
    options: [
      "a. Specimen contamination during venipuncture",
      "b. Bacterial translocation via mucosal micro-perforations caused by invading filariform larvae",
      "c. Ascending urinary tract infection caused by bacteria, secondary to bladder",
      "d. Obstruction of the ampulla of Vater by adult worms",
      "e. Breakdown of vascular endothelial tight junctions directly induced by corticosteroids"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b1_28",
    caseKey: "case_c",
    question: "28. What is the most appropriate targeted anthelmintic regimen for patients with hyperinfection syndrome?",
    options: [
      "a. Oral albendazole single dose until stool and sputum examinations are negative and stop the drug",
      "b. Oral mebendazole twice daily until stool and sputum examinations are negative for at least 3 days",
      "c. Oral ivermectin daily until stool and sputum examinations are negative for at least 2 weeks",
      "d. Oral praziquantel three times daily until stool and sputum examinations are negative for at least 2 days",
      "e. Oral diethylcarbamazine for 14 days until stool and sputum examinations are negative and stop the drug"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b1_29",
    caseKey: "case_c",
    question: "29. Considering the parasitic life cycle of Strongyloides stercoralis, which of the following biological classifications best describes the role of the human body?",
    options: [
      "a. Definitive host harboring the parasitic adult female in the small intestine",
      "b. Intermediate host supporting only asexual larval multiplication",
      "c. Accidental dead-end host terminating transmission to the environment",
      "d. Paratenic host that encapsulates dormant larvae without development",
      "e. Vector host mechanically transferring infective stages via secretions"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b1_30",
    caseKey: "case_c",
    question: "30. Before initiating high-dose corticosteroid therapy in the patient described, screening and pre-emptive treatment for Strongyloides stercoralis would have been indicated. Which of the following best explains why immunosuppression converts a chronic, often asymptomatic infection into fatal hyperinfection syndrome?",
    options: [
      "a. Corticosteroids directly stimulate the parasite to switch from the free-living cycle to the parasitic cycle in the external environment",
      "b. Impaired Th2 responses and reduced eosinophil-mediated killing permit uncontrolled amplification of the autoinfective cycle, markedly increasing larval burden",
      "c. Corticosteroids inhibit gastric acid secretion, allowing ingested filariform larvae to survive passage into the small intestine",
      "d. immunosuppression allows parthenogenetic females to be replaced by sexually reproducing adults within the intestinal wall",
      "e. Corticosteroids block hepatic metabolism of larval antigens, resulting in an isolated immune-complex vasculitis"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  }
];

export const BATCH2_QUESTIONS: GatewayQuestion[] = [
  {
    id: "b2_1",
    caseKey: "case_a",
    question: "1. A 34-year-old man with untreated HIV infection presents with headache, low-grade fever, and a generalized seizure. His CD4 count is 22 cells/µL. MRI shows multiple ring-enhancing lesions with surrounding edema, predominantly in the basal ganglia. Serum Toxoplasma gondii IgG is positive. What is the most likely diagnosis?",
    options: [
      "a. Primary CNS lymphoma",
      "b. Cerebral toxoplasmosis",
      "c. Cryptococcal meningitis",
      "d. CMV encephalitis",
      "e. Progressive multifocal leukoencephalopathy"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_2",
    caseKey: "case_a",
    question: "2. Which of the following findings in this patient is the strongest predisposing factor for cerebral toxoplasmosis?",
    options: [
      "a. CD4 count of 22 cells/µL",
      "b. Mild anemia",
      "c. Low-grade fever",
      "d. History of headache",
      "e. Positive HIV antibody alone"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b2_3",
    caseKey: "case_a",
    question: "3. A patient with AIDS has multiple intracranial lesions and a positive Toxoplasma gondii IgG test. What does the positive IgG result primarily indicate?",
    options: [
      "a. Acute infection acquired within the previous week",
      "b. Previous exposure to Toxoplasma gondii",
      "c. Definitive evidence of active cerebral infection",
      "d. Recent primary infection only",
      "e. Resistance to anti-toxoplasma drugs"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_4",
    caseKey: "case_a",
    question: "4. A patient with advanced HIV infection has multiple ring-enhancing lesions in the brain. Which condition is an important differential diagnosis because it may produce a similar radiological appearance?",
    options: [
      "a. Primary CNS lymphoma",
      "b. Guillain-Barré syndrome",
      "c. Myasthenia gravis",
      "d. Peripheral neuropathy",
      "e. Tetanus"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b2_5",
    caseKey: "case_a",
    question: "5. A patient with AIDS is suspected of having cerebral toxoplasmosis. Anti-toxoplasma therapy is initiated. After 2 weeks, his headache and neurological deficits improve, and the intracranial lesions decrease in size. Which interpretation is most appropriate?",
    options: [
      "a. The patient definitely has primary CNS lymphoma",
      "b. The response supports the diagnosis of cerebral toxoplasmosis",
      "c. Positive IgG is no longer clinically relevant",
      "d. The patient should immediately undergo brain biopsy",
      "e. The lesions are most likely caused by CMV"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_6",
    caseKey: "case_a",
    question: "6. A patient with suspected cerebral toxoplasmosis has no significant mass effect on brain imaging. Which investigation can provide microbiological evidence supporting the diagnosis?",
    options: [
      "a. CSF Toxoplasma gondii PCR",
      "b. Stool examination",
      "c. Peripheral blood smear",
      "d. Sputum Gram stain",
      "e. Urine culture"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b2_7",
    caseKey: "case_a",
    question: "7. A 39-year-old man with AIDS has multiple ring-enhancing brain lesions and positive Toxoplasma IgG. He receives appropriate anti-toxoplasma therapy. After 14 days, his neurological symptoms worsen and MRI shows no meaningful reduction in the lesions. What is the most appropriate next step?",
    options: [
      "a. Continue the same therapy indefinitely",
      "b. Perform brain biopsy",
      "c. Start corticosteroids alone",
      "d. Perform lumbar puncture despite marked mass effect",
      "e. Discontinue all treatment"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_8",
    caseKey: "case_a",
    question: "8. A patient with cerebral toxoplasmosis is treated with pyrimethamine and sulfadiazine. Another drug is added to reduce treatment-related hematologic toxicity. Which drug is being described?",
    options: [
      "a. Acyclovir",
      "b. Leucovorin",
      "c. Oseltamivir",
      "d. Rifampicin",
      "e. Amphotericin B"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_9",
    caseKey: "case_a",
    question: "9. A 35-year-old man with AIDS develops cerebral toxoplasmosis and has one generalized seizure. MRI demonstrates significant surrounding edema with mass effect. He is started on appropriate anti-toxoplasma therapy. Which combination represents the most appropriate management?",
    options: [
      "a. Antiviral therapy + routine long-term corticosteroids",
      "b. Anti-toxoplasma therapy + anticonvulsant, with corticosteroid considered for significant mass effect",
      "c. Antibiotic therapy alone + lumbar puncture",
      "d. Corticosteroid alone + immediate discontinuation of ART",
      "e. Antifungal therapy + anticoagulation"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_10",
    caseKey: "case_a",
    question: "10. A 34-year-old man with AIDS is diagnosed with cerebral toxoplasmosis. He asks how he could have acquired this infection. Which of the following is a recognized route of transmission for Toxoplasma gondii in humans?",
    options: [
      "a. Ingestion of undercooked meat containing tissue cysts, or food/water contaminated with oocysts from cat feces",
      "b. Inhalation of airborne spores from soil",
      "c. Bite of an infected Anopheles mosquito",
      "d. Direct person-to-person contact with skin lesions",
      "e. Sharing of contaminated drinking glasses"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b2_11",
    caseKey: "case_b",
    question: "11. A patient with suspected malaria undergoes microscopic examination of peripheral blood. Which specimen preparation is particularly useful for detecting a low level of parasitemia?",
    options: [
      "a. Thin blood film",
      "b. Thick blood film",
      "c. Gram stain",
      "d. Acid-fast stain",
      "e. Buffy coat smear"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_12",
    caseKey: "case_b",
    question: "12. A thin blood film from a febrile patient demonstrates delicate ring forms inside erythrocytes, with some infected red cells containing more than one ring form and occasional double chromatin dots. Which species is most strongly suggested?",
    options: [
      "a. Plasmodium malariae",
      "b. Plasmodium vivax",
      "c. Plasmodium falciparum",
      "d. Plasmodium ovale",
      "e. Plasmodium knowlesi"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b2_13",
    caseKey: "case_b",
    question: "13. A 28-year-old man presents with high fever, myalgia, headache, and thrombocytopenia after returning from a forested area. Dengue fever is initially suspected. However, he reports episodes of chills followed by profuse sweating, and a peripheral blood smear demonstrates intraerythrocytic parasites. Which diagnosis is most likely?",
    options: [
      "a. Dengue fever",
      "b. Malaria",
      "c. Leptospirosis",
      "d. Scrub typhus",
      "e. Typhoid fever"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_14",
    caseKey: "case_b",
    question: "14. A patient previously treated for malaria develops another episode of fever several months after the initial illness. The blood smear again demonstrates Plasmodium vivax. Which biological feature best explains this recurrence?",
    options: [
      "a. Persistent gametocytes in the intestine",
      "b. Dormant hypnozoites in hepatocytes",
      "c. Bacterial superinfection",
      "d. Reinfection by contaminated food",
      "e. Dormant merozoites in the spleen"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_15",
    caseKey: "case_b",
    question: "15. A patient presents with fever after returning from an endemic area. Initial malaria testing is negative, but clinical suspicion remains high. Which approach is most appropriate?",
    options: [
      "a. Exclude malaria permanently after one negative smear",
      "b. Repeat blood film examination",
      "c. Perform stool examination",
      "d. Perform urine culture",
      "e. Perform sputum acid-fast staining"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_16",
    caseKey: "case_b",
    question: "16. A 31-year-old man with confirmed P. falciparum infection develops confusion, generalized seizures, severe anemia, hypoglycemia, and metabolic acidosis. His parasitemia is markedly elevated. Which diagnosis best describes this condition?",
    options: [
      "a. Uncomplicated malaria",
      "b. Chronic malaria carrier state",
      "c. Severe malaria with cerebral involvement",
      "d. Relapsing P. vivax infection",
      "e. Asymptomatic parasitemia"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b2_17",
    caseKey: "case_b",
    question: "17. A patient with severe malaria is admitted with altered consciousness and repeated seizures. He cannot tolerate oral medication. Which antimalarial should be administered urgently?",
    options: [
      "a. Oral chloroquine",
      "b. Oral primaquine alone",
      "c. Intravenous artesunate",
      "d. Oral doxycycline alone",
      "e. Oral sulfadoxine-pyrimethamine alone"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b2_18",
    caseKey: "case_b",
    question: "18. A patient with cerebral malaria has a GCS of 8, recurrent seizures, Hb 6.2 g/dL, and blood glucose of 42 mg/dL. Which management combination is most appropriate?",
    options: [
      "a. Oral ACT only and discharge after fever resolves",
      "b. IV artesunate, correction of hypoglycemia, seizure control, and management of severe anemia",
      "c. Primaquine alone and fluid restriction",
      "d. Chloroquine with prophylactic anticonvulsants only",
      "e. Corticosteroid therapy as the primary treatment"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_19",
    caseKey: "case_b",
    question: "19. A 26-year-old man returns from a forested area near the Thai-Myanmar border and is diagnosed with malaria. He asks how he became infected. Which of the following describes the mode of transmission and the infective stage of Plasmodium species in humans?",
    options: [
      "a. Bite of an infected female Anopheles mosquito injecting sporozoites",
      "b. Bite of an infected female Aedes mosquito injecting merozoites",
      "c. Ingestion of food or water contaminated with oocysts",
      "d. Skin penetration by infective larvae in soil",
      "e. Bite of an infected Culex mosquito injecting gametocytes"
    ],
    correctAnswerIndex: 0,
    relatedSlide: ""
  },
  {
    id: "b2_20",
    caseKey: "case_b",
    question: "20. Which Plasmodium species is responsible for causing the highest mortality worldwide and is characterized by its ability to cause severe complications like cerebral malaria?",
    options: [
      "a. Plasmodium vivax",
      "b. Plasmodium ovale",
      "c. Plasmodium malariae",
      "d. Plasmodium falciparum",
      "e. Plasmodium knowlesi"
    ],
    correctAnswerIndex: 3,
    relatedSlide: ""
  },
  {
    id: "b2_21",
    caseKey: "case_c",
    question: "21. A 40-year-old man presents with abdominal discomfort, intermittent diarrhea, and weight loss. He frequently consumes raw freshwater fish. Stool examination reveals an oval, thin-shelled egg with an operculum and a small knob. Which parasite is the most likely causative organism?",
    options: [
      "a. Taenia solium",
      "b. Ascaris lumbricoides",
      "c. Diphyllobothrium latum (Dibothriocephalus latus)",
      "d. Enterobius vermicularis",
      "e. Fasciolopsis buski"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b2_22",
    caseKey: "case_c",
    question: "22. A patient acquires diphyllobothriasis after eating raw freshwater fish. Which developmental stage of the parasite is infective to humans?",
    options: [
      "a. Unembryonated egg",
      "b. Coracidium",
      "c. Procercoid larva",
      "d. Plerocercoid larva",
      "e. Rhabditiform larva"
    ],
    correctAnswerIndex: 3,
    relatedSlide: ""
  },
  {
    id: "b2_23",
    caseKey: "case_c",
    question: "23. Which finding is most characteristic of a Diphyllobothrium latum egg in stool?",
    options: [
      "a. Thick, mammillated shell with a fully developed embryo",
      "b. Oval, thin and smooth shell with an operculum and a small knob",
      "c. Barrel-shaped egg with bipolar plugs",
      "d. Round egg containing multiple hooklets",
      "e. Radially striated shell containing an oncosphere"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_24",
    caseKey: "case_c",
    question: "24. A stool specimen from a patient with suspected fish tapeworm infection contains eggs measuring approximately 58 to 76 by 40 to 51 µm. The eggs are oval, thin-shelled, operculated, and have a small knob at the opposite end. Which additional characteristic would be most consistent with these findings?",
    options: [
      "a. The eggs are fully embryonated when passed in stool",
      "b. The eggs are immediately infected by humans after defecation",
      "c. The eggs are unembryonated when passed in stool",
      "d. The eggs contain a six-hooked embryo when passed in stool",
      "e. The eggs hatch spontaneously within the large intestine"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b2_25",
    caseKey: "case_c",
    question: "25. Which statement about the life cycle of Diphyllobothrium latum is correct?",
    options: [
      "a. Cyclops is the definitive host, and freshwater fish is the first intermediate host",
      "b. Cyclops is the first intermediate host, and freshwater fish is the second intermediate host",
      "c. Humans are the first intermediate host, and freshwater fish is the definitive host",
      "d. Freshwater fish is the definitive host, and humans are the second intermediate host",
      "e. Freshwater snails are the first intermediate host, and freshwater crabs are the second intermediate host"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_26",
    caseKey: "case_c",
    question: "26. A 55-year-old patient with chronic Diphyllobothrium infection develops fatigue and pallor. Laboratory examination reveals megaloblastic anemia and decreased vitamin B12 levels. Which clinical manifestation is most directly associated with this infection?",
    options: [
      "a. Iron-deficiency anemia",
      "b. Hemolytic anemia",
      "c. Megaloblastic anemia due to vitamin B12 deficiency",
      "d. Aplastic anemia",
      "e. Sideroblastic anemia"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b2_27",
    caseKey: "case_c",
    question: "27. A 40-year-old man has been eating raw freshwater fish regularly. Two months later, stool examination reveals Diphyllobothrium eggs. Which explanation best connects his dietary history with acquisition of the infection?",
    options: [
      "a. He ingested unembryonated eggs directly from contaminated fish, which developed into adult worms in the intestine",
      "b. He ingested procercoid larvae from freshwater fish, which developed directly into adult worms",
      "c. He ingested freshwater fish containing plerocercoid larvae, which subsequently developed into adult worms in the small intestine",
      "d. He acquired the infection after ingestion of Cyclops containing adult worms",
      "e. He ingested encysted metacercariae attached to watercress"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b2_28",
    caseKey: "case_c",
    question: "28. A patient has chronic abdominal discomfort and diarrhea. Stool examination is performed to look for Diphyllobothrium infection. The first stool examination is negative, but clinical suspicion remains high because the patient has a history of consuming raw freshwater fish. Which approach is most appropriate based on diagnostic reasoning?",
    options: [
      "a. Perform blood culture because the parasite primarily infects the bloodstream",
      "b. Perform PCR only because microscopy cannot detect this parasite",
      "c. Use stool concentration techniques such as FECT or Kato-Katz to detect parasite eggs",
      "d. Perform liver biopsy because the adult worm primarily resides in the biliary system",
      "e. Perform bone marrow aspiration to identify larval forms"
    ],
    correctAnswerIndex: 2,
    relatedSlide: ""
  },
  {
    id: "b2_29",
    caseKey: "case_c",
    question: "29. A 65-year-old man has a heavy Diphyllobothrium infection. He develops severe abdominal symptoms and imaging suggests intestinal obstruction. He also has evidence of vitamin B12 deficiency. Which management plan is most appropriate?",
    options: [
      "a. Treat only the vitamin B12 deficiency because the intestinal symptoms are self-limiting",
      "b. Treat the infection with praziquantel or niclosamide, while managing the intestinal obstruction and correcting the nutritional complication",
      "c. Give antibiotics alone because intestinal obstruction is caused by bacterial infection",
      "d. No treatment is necessary because most Diphyllobothrium infections are asymptomatic",
      "e. Perform immediate radical bowel resection before initiating antiparasitic therapy"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  },
  {
    id: "b2_30",
    caseKey: "case_c",
    question: "30. A 40-year-old man is treated successfully for diphyllobothriasis. He asks how he can avoid becoming infected again, since raw freshwater fish is a regular part of his diet. Which advice is most appropriate for preventing reinfection?",
    options: [
      "a. Avoid drinking untreated water, since infection is acquired by swallowing eggs from contaminated water",
      "b. Thoroughly cook freshwater fish, or freeze it adequately before consumption, to kill the plerocercoid larvae",
      "c. Avoid contact with domestic cats and dogs, which serve as the main source of human infection",
      "d. Wash hands after using the toilet, since the infection spreads by the fecal-oral route from person to person",
      "e. Wear footwear when wading in lakes or streams, since larvae penetrates intact skin during freshwater exposure"
    ],
    correctAnswerIndex: 1,
    relatedSlide: ""
  }
];
\`;

fs.writeFileSync('src/data/exams.ts', examsData);
console.log('src/data/exams.ts generated successfully.');

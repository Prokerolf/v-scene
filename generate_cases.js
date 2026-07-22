import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const diseases = [
  { name: 'Pulmonary Paragonimiasis', missingTiers: ['Mid', 'High'] },
  { name: 'COVID-19 Pneumonia with Acute Hypoxemic Respiratory Failure', missingTiers: ['Low', 'High'] },
  { name: 'Bilateral Diaphragmatic Paralysis', missingTiers: ['Low', 'Mid'] }
];

async function generate() {
  let allResults = [];
  
  for (const d of diseases) {
    const prompt = `
คุณเป็นระบบสร้างเคสผู้ป่วยจำลอง (Patient Persona Generator) สำหรับให้นักศึกษาแพทย์ฝึกซักประวัติ
จงสร้างข้อมูลผู้ป่วยจากชื่อโรค: "${d.name}"

สำคัญมาก: คุณต้องสร้างเคสย่อย 2 เคส ที่มีระดับความยากคือ: ${d.missingTiers.join(' และ ')} สำหรับโรคนี้ โดยประยุกต์อาการและโรคแทรกซ้อนให้เหมาะสมกับแต่ละระดับความยาก
ให้ตอบกลับมาเป็น JSON Array ที่ประกอบด้วย 2 Object เท่านั้น โดยมีรูปแบบดังนี้:
[
  {
    "id": "gen_${Date.now()}_...",
    "tier": "ระดับความยาก (Low, Mid, หรือ High)",
    "tierExplanation": "อธิบายสั้นๆ ว่าทำไมเคสนี้ถึงมีความยากระดับนี้",
    "diseaseName": "${d.name}",
    "patientName": "ชื่อ นามสกุล (ภาษาไทย)",
    "age": ตัวเลขอายุ,
    "gender": "ชาย หรือ หญิง",
    "chiefComplaint": "อาการสำคัญที่เป็นภาษาชาวบ้าน ไม่ใช้ศัพท์แพทย์",
    "personaDetails": "ประวัติอย่างละเอียด อุปนิสัย ภาษาที่ใช้ ประวัติครอบครัว ประวัติส่วนตัว (เพื่อนำไปให้ AI สวมบทบาทต่อ)",
    "voiceProfile": "เลือกระหว่าง: old_male, male, old_female, female, child",
    "ddxGroup": "กลุ่มโรคที่เป็นไปได้ (ภาษาไทย)",
    "ddxExplanation": "คำอธิบายเหตุผลในการซักประวัติแยกโรค",
    "diagnosisExplanation": "คำอธิบายเหตุผลของการวินิจฉัยโรคนี้",
    "goldStandardLabs": ["1", "3"],
    "specificLabResults": {
      "1": { "text": "**CT Brain:** Normal findings." }
    }
  }
]

กติกาสำหรับผลแล็บ (specificLabResults): 
- ต้องใช้ ID จากรายการ Lab พื้นฐาน (เช่น 1=CBC, 3=BUN, 8=CXR)
- ต้องใส่ค่าอ้างอิงปกติ (Normal Range) ไว้ในวงเล็บต่อท้ายค่าผลแล็บที่เป็นตัวเลขเสมอ

ไม่ต้องมี markdown \`\`\`json ครอบ ให้ส่งเฉพาะ JSON Array ล้วนๆ
`;
    console.log("Generating for", d.name, "...");
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      allResults = allResults.concat(parsed);
    } catch (e) {
      console.error("Failed to parse JSON for", d.name);
      console.error(text);
    }
  }
  
  fs.writeFileSync('generated_cases.json', JSON.stringify(allResults, null, 2));
  console.log("Done! Written to generated_cases.json");
}

generate();

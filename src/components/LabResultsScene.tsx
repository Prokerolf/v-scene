import React, { useState, useEffect } from 'react';
import { FileText, Loader2, ArrowRight, Activity, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { labOptions } from './LabOrderScene';

interface LabResultsSceneProps {
  activeCase: any;
  selectedLabs: string[];
  onNext: () => void;
}

interface ProcessedLab {
  id: string;
  name: string;
  text: string;
  imageUrl?: string;
  isAiGenerated: boolean;
}

const LabResultsScene = ({ activeCase, selectedLabs, onNext }: LabResultsSceneProps) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [processedLabs, setProcessedLabs] = useState<ProcessedLab[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateLabResults();
  }, [activeCase, selectedLabs]);

  const generateLabResults = async () => {
    setIsGenerating(true);
    setError(null);

    if (!selectedLabs || selectedLabs.length === 0) {
      setProcessedLabs([]);
      setIsGenerating(false);
      return;
    }

    try {
      const finalLabs: ProcessedLab[] = [];
      const aiLabIdsToFetch: string[] = [];

      // 1. Separate hardcoded vs AI needed
      for (const labId of selectedLabs) {
        const labName = labOptions.find(l => l.id === labId)?.name || labId;
        const hardcodedResult = activeCase?.specificLabResults?.[labId];

        if (hardcodedResult) {
          finalLabs.push({
            id: labId,
            name: labName,
            text: hardcodedResult.text,
            imageUrl: hardcodedResult.imageUrl,
            isAiGenerated: false
          });
        } else {
          aiLabIdsToFetch.push(labId);
        }
      }

      // 2. Fetch AI for the remaining labs
      if (aiLabIdsToFetch.length > 0) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error('API Key is missing');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

        for (const labId of aiLabIdsToFetch) {
          const labName = labOptions.find(l => l.id === labId)?.name || labId;
          const prompt = `
            คุณเป็นนักเทคนิคการแพทย์ ที่ทำหน้าที่รายงานผลแล็บ
            ข้อมูลผู้ป่วย: ชื่อ ${activeCase?.patientName}, อายุ ${activeCase?.age}, เพศ ${activeCase?.gender}
            ประวัติ: ${activeCase?.chiefComplaint}
            
            แพทย์สั่งตรวจ: ${labName}
            
            ข้อกำหนดสำคัญ: 
            - แล็บนี้ "ไม่ได้เกี่ยวข้องโดยตรง" กับโรคที่เป็น (${activeCase?.diseaseName})
            - ดังนั้น คุณต้องสร้างผลแล็บที่ "อยู่ในเกณฑ์ปกติทั้งหมด (Within Normal Limits)" เท่านั้น
            - ไม่ต้องมีคำนำหน้า ไม่ต้องมีคำลงท้าย ให้บอกแค่ผลตรวจสั้นๆ เป็น bullet points
          `;
          
          try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            finalLabs.push({
              id: labId,
              name: labName,
              text: responseText,
              isAiGenerated: true
            });
          } catch (e) {
             finalLabs.push({
              id: labId,
              name: labName,
              text: "ผลตรวจอยู่ในเกณฑ์ปกติ (Normal Limits)",
              isAiGenerated: true
            });
          }
        }
      }

      // 3. Update State
      setProcessedLabs(finalLabs);

    } catch (err) {
      console.error('Failed to generate lab results:', err);
      setError('ไม่สามารถแสดงผลแล็บได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-variant text-on-surface-variant font-label-sm uppercase tracking-wider mb-4">
          <Activity className="w-4 h-4" />
          <span>Stage 3: Laboratory & Imaging Results</span>
        </div>
        <h2 className="font-headline-lg text-3xl sm:text-4xl text-on-surface mb-2">ผลการตรวจ (Lab Results)</h2>
        <p className="font-body-lg text-on-surface-variant">พิจารณาผลการตรวจที่คุณสั่ง เพื่อนำไปสู่การวินิจฉัย</p>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm relative min-h-[400px]">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm z-10 rounded-3xl">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="font-headline-md text-xl text-on-surface mb-2">ห้องปฏิบัติการกำลังดำเนินการ...</h3>
            <p className="font-body-md text-on-surface-variant text-center px-4">
              โปรดรอสักครู่ ระบบกำลังจัดเตรียมผลการตรวจของคุณ
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-12 h-12 text-error mb-4" />
            <h3 className="font-headline-md text-xl text-on-surface mb-2">เกิดข้อผิดพลาด</h3>
            <p className="font-body-md text-on-surface-variant mb-6">{error}</p>
            <button 
              onClick={generateLabResults}
              className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md font-bold hover:bg-primary/90 transition"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : processedLabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-on-surface-variant py-12">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-body-lg">ไม่มีการสั่งตรวจทางห้องปฏิบัติการ</p>
          </div>
        ) : (
          <div className="space-y-6">
            {processedLabs.map((lab) => (
              <div key={lab.id} className="border border-outline-variant rounded-2xl overflow-hidden bg-surface">
                <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex justify-between items-center">
                  <h4 className="font-label-md font-bold text-on-surface flex items-center gap-2">
                    {lab.imageUrl ? <ImageIcon className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-secondary" />}
                    {lab.name}
                  </h4>
                  {lab.isAiGenerated && (
                    <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">AI Generated</span>
                  )}
                </div>
                <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-6">
                  {lab.imageUrl && (
                    <div className="w-full md:w-1/3 shrink-0">
                      <img 
                        src={lab.imageUrl} 
                        alt={lab.name} 
                        className="w-full h-auto rounded-xl object-cover border border-outline-variant shadow-sm"
                      />
                    </div>
                  )}
                  <div className={`prose prose-slate max-w-none font-body-md text-on-surface ${lab.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                    {renderFormattedText(lab.text)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={isGenerating}
          className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 hover:gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          ไปที่หน้าวินิจฉัยโรค (Diagnosis) <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default LabResultsScene;

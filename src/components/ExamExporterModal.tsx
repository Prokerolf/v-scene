import React, { useState } from 'react';
import { Printer, FileText, CheckSquare, Download, X, Eye } from 'lucide-react';

interface ExamExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle?: string;
  questions?: any[];
}

export const ExamExporterModal: React.FC<ExamExporterModalProps> = ({
  isOpen,
  onClose,
  examTitle = 'V-SCENE Clinical Competency Examination',
  questions = []
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'omr'>('pdf');

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${examTitle} - Printable Paper Exam</title>
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; }
          .title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
          .subtitle { font-size: 13px; color: #475569; }
          .info-block { display: flex; justify-content: space-between; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 8px; margin-bottom: 30px; font-size: 13px; }
          .question-item { margin-bottom: 25px; page-break-inside: avoid; }
          .q-text { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
          .options { margin-left: 20px; font-size: 13px; }
          .option { margin-bottom: 6px; }
          .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">FACULTY OF MEDICINE - V-SCENE EXAM BOARD</div>
          <div class="subtitle">${examTitle}</div>
        </div>

        <div class="info-block">
          <div><strong>Student Name:</strong> ___________________________</div>
          <div><strong>Student ID:</strong> _______________</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString('th-TH')}</div>
        </div>

        ${questions.map((q, idx) => `
          <div class="question-item">
            <div class="q-text">${idx + 1}. ${q.question}</div>
            <div class="options">
              ${(q.options || ['Choice A', 'Choice B', 'Choice C', 'Choice D', 'Choice E']).map((opt: string, i: number) => `
                <div class="option">(${String.fromCharCode(65 + i)}) ${opt}</div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <div class="footer">
          V-SCENE Medical Education System • Confidential Examination Document
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintOMR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${examTitle} - OMR Answer Sheet</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #000; }
          .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: bold; }
          .omr-grid { display: grid; grid-template-cols: repeat(2, 1fr); gap: 20px; }
          .question-row { display: flex; items-center; gap: 10px; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
          .bubble { width: 18px; height: 18px; border: 1.5px solid #000; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
          .info-box { border: 2px solid #000; padding: 15px; margin-bottom: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">OPTICAL MARK RECOGNITION (OMR) ANSWER SHEET</div>
          <div>${examTitle}</div>
        </div>

        <div class="info-box">
          <strong>Instructions:</strong> Fill in circles completely using a 2B pencil. Do not make stray marks.
          <br/><br/>
          Student Name: ____________________________________ ID: [  ][  ][  ][  ][  ][  ]
        </div>

        <div class="omr-grid">
          <div>
            ${Array.from({ length: 25 }).map((_, i) => `
              <div class="question-row">
                <span style="width: 25px;">${i + 1}.</span>
                <span class="bubble">A</span>
                <span class="bubble">B</span>
                <span class="bubble">C</span>
                <span class="bubble">D</span>
                <span class="bubble">E</span>
              </div>
            `).join('')}
          </div>

          <div>
            ${Array.from({ length: 25 }).map((_, i) => `
              <div class="question-row">
                <span style="width: 25px;">${i + 26}.</span>
                <span class="bubble">A</span>
                <span class="bubble">B</span>
                <span class="bubble">C</span>
                <span class="bubble">D</span>
                <span class="bubble">E</span>
              </div>
            `).join('')}
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl">
              <Printer className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>Automated PDF & OMR Exporter</span>
                <span className="text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-2.5 py-0.5 rounded-full font-semibold">
                  System 6: PDF/OMR
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                ส่งออกไฟล์ข้อสอบ PDF และกระดาษคำตอบ OMR สำหรับจัดสอบออฟไลน์เมื่อเกิดเหตุฉุกเฉิน
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-100 border-b border-slate-200 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'pdf'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ส่งออกข้อสอบ PDF (Printable Exam PDF)</span>
          </button>

          <button
            onClick={() => setActiveTab('omr')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'omr'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>กระดาษคำตอบฝน OMR (OMR Sheet)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-slate-50/50">
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">พิมพ์เอกสารชุดข้อสอบ (Printable Paper Exam)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ระบบจะจัดรูปแบบเอกสารข้อสอบทางการแพทย์ พร้อมโลโก้คณะ ช่องระบุชื่อ-รหัสผู้สอบ และตัวเลือก A-E ที่สวยงามพร้อมสั่งพิมพ์หรือบันทึกเป็น PDF ได้ทันที
                </p>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                  <span>จำนวนข้อสอบที่จะส่งออก: <strong>{questions.length > 0 ? questions.length : 20} ข้อ</strong></span>
                  <span className="font-semibold text-indigo-700">พร้อมจัดรูปแบบ A4</span>
                </div>
              </div>

              <button
                onClick={handlePrintPDF}
                className="w-full py-3.5 bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-800 transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>เปิดหน้าต่างสั่งพิมพ์ / บันทึก PDF (Print Exam PDF)</span>
              </button>
            </div>
          )}

          {activeTab === 'omr' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">กระดาษคำตอบ OMR (Optical Mark Recognition Sheet)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  พิมพ์กระดาษคำตอบ OMR มาตรฐานขนาด A4 รองรับการฝนด้วยดินสอ 2B สำหรับนำไปตรวจด้วยเครื่องตรวจข้อสอบ OMR หรือแอปพลิเคชันสแกนกระดาษคำตอบ
                </p>
              </div>

              <button
                onClick={handlePrintOMR}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                <span>พิมพ์กระดาษคำตอบฝน OMR (Print OMR Sheet)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>V-SCENE Offline & Emergency Exam Infrastructure</span>
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 transition">
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};

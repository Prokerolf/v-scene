import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, CheckCircle, FileText, Image, Upload } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export type ExamCategory = 'pretest_batch1' | 'pretest_batch2' | 'posttest' | 'kfp' | 'kfq';

interface ExamEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ExamCategory;
  initialQuestion?: any;
  onSaveSuccess: (updatedItem: any) => void;
  onDeleteSuccess?: (itemId: string) => void;
}

export const ExamEditorModal: React.FC<ExamEditorModalProps> = ({
  isOpen,
  onClose,
  category,
  initialQuestion,
  onSaveSuccess,
}) => {
  // --- Form State (Standard Choice Question / ปรนัย) ---
  const [questionId, setQuestionId] = useState('');
  const [caseKey, setCaseKey] = useState<'case_a' | 'case_b' | 'case_c' | 'general'>('case_a');
  const [questionText, setQuestionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [options, setOptions] = useState<string[]>(['a. ', 'b. ', 'c. ', 'd. ', 'e. ']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [relatedSlide, setRelatedSlide] = useState('');
  const [explanation, setExplanation] = useState('');

  const [saving, setSaving] = useState(false);
  const [editorName, setEditorName] = useState('Research Team Member');

  // Initialize form when initialQuestion or category or isOpen changes
  useEffect(() => {
    if (!isOpen) return;

    if (auth.currentUser) {
      setEditorName(auth.currentUser.displayName || auth.currentUser.email || 'Researcher');
    }

    if (initialQuestion) {
      setQuestionId(initialQuestion.id || `q_${Date.now()}`);
      setCaseKey(initialQuestion.caseKey || 'case_a');
      setQuestionText(initialQuestion.question || initialQuestion.questionPrompt || initialQuestion.vignette || '');
      setImageUrl(initialQuestion.imageUrl || initialQuestion.image || '');
      setOptions(initialQuestion.options && initialQuestion.options.length > 0 ? [...initialQuestion.options] : ['a. Option 1', 'b. Option 2', 'c. Option 3', 'd. Option 4']);
      setCorrectAnswerIndex(initialQuestion.correctAnswerIndex ?? 0);
      setRelatedSlide(initialQuestion.relatedSlide || initialQuestion.title || '');
      setExplanation(initialQuestion.explanation || '');
    } else {
      // New Question Defaults
      const newId = `${category}_${Date.now().toString(36)}`;
      setQuestionId(newId);
      setCaseKey('case_a');
      setQuestionText('');
      setImageUrl('');
      setOptions(['a. ตัวเลือก ก', 'b. ตัวเลือก ข', 'c. ตัวเลือก ค', 'd. ตัวเลือก ง', 'e. ตัวเลือก จ']);
      setCorrectAnswerIndex(0);
      setRelatedSlide('');
      setExplanation('');
    }
  }, [isOpen, initialQuestion, category]);

  // Real-time Presence Tracking for Exam Editors
  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;

    const editorId = auth.currentUser.uid;
    const presenceRef = doc(db, 'active_exam_editors', editorId);

    const announcePresence = async () => {
      try {
        await setDoc(presenceRef, {
          userId: editorId,
          userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Team Member',
          editingQuestionId: questionId || 'new_question',
          category,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to set exam editor presence:', err);
      }
    };

    announcePresence();

    return () => {
      deleteDoc(presenceRef).catch(() => {});
    };
  }, [isOpen, questionId, category]);

  // Early Return Guard MUST BE AFTER ALL HOOKS
  if (!isOpen) return null;

  // --- Handlers ---
  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    const prefix = String.fromCharCode(97 + options.length);
    setOptions([...options, `${prefix}. ตัวเลือกใหม่`]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return alert('ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก');
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    if (correctAnswerIndex >= updated.length) {
      setCorrectAnswerIndex(0);
    }
  };

  // Image Upload Handler (Strictly Teacher Uploaded File Only)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์รูปภาพใหญ่เกินไป (กรุณาใช้รูปภาพขนาดไม่เกิน 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!questionText.trim()) {
      alert('กรุณากรอกโจทย์คำถาม');
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        id: questionId,
        caseKey,
        question: questionText,
        imageUrl, // Actual teacher uploaded image ONLY
        options,
        correctAnswerIndex,
        relatedSlide,
        explanation,
        category,
        updatedAt: new Date().toISOString(),
        updatedBy: editorName
      };

      const docRef = doc(db, 'exams', `${category}_${questionId}`);
      await setDoc(docRef, payload);

      onSaveSuccess(payload);
      onClose();
    } catch (err) {
      console.error('Error saving question:', err);
      alert('ไม่สามารถบันทึกข้อสอบได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryTitle = (cat: ExamCategory) => {
    switch (cat) {
      case 'pretest_batch1': return 'Pre-test (Batch 1)';
      case 'pretest_batch2': return 'Pre-test (Batch 2)';
      case 'posttest': return 'Post-test (Final)';
      case 'kfp': return 'KFP (Key Feature Problem - Choice)';
      case 'kfq': return 'KFQ (Key Feature Question - Choice)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <FileText className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {initialQuestion ? 'แก้ไขข้อสอบ Choice (ปรนัย)' : 'สร้างข้อสอบ Choice ใหม่'}
                <span className="text-xs font-semibold px-2.5 py-1 bg-sky-500/30 rounded-full border border-sky-300/30 text-sky-100 uppercase">
                  {getCategoryTitle(category)}
                </span>
              </h2>
              <p className="text-xs text-sky-100/80">
                ผู้แก้ไข: <span className="font-semibold text-white">{editorName}</span> (Real-time Synced)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เคสประจำโจทย์ (Target Case)</label>
              <select
                value={caseKey}
                onChange={(e: any) => setCaseKey(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="case_a">Case A (Neurocysticercosis)</option>
                <option value="case_b">Case B (Parasitic Infection B)</option>
                <option value="case_c">Case C (Parasitic Infection C)</option>
                <option value="general">General / Comprehensive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Question ID</label>
              <input
                type="text"
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">สไลด์/แท็กอ้างอิง (Related Slide)</label>
              <input
                type="text"
                placeholder="เช่น Slide NCC-04"
                value={relatedSlide}
                onChange={(e) => setRelatedSlide(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Question Statement */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              โจทย์คำถามปรนัย (Question Statement) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="พิมพ์โจทย์สถานการณ์วิเคราะห์ทางคลินิกและคำถามที่นี่..."
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Teacher Image Upload Section (User Uploaded Images ONLY) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-purple-600" />
                รูปภาพประกอบโจทย์ข้อสอบ (EKG, CT/MRI, Pathology Slide, Diagram)
                <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-medium">เฉพาะรูปที่อัปโหลดเท่านั้น</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ลบรูปภาพ
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 max-h-60 bg-slate-900 flex flex-col items-center justify-center p-2">
                <img src={imageUrl} alt="Exam Figure" className="max-h-52 w-auto object-contain rounded-lg" />
                <span className="text-[10px] text-slate-300 mt-1">รูปภาพประกอบที่อาจารย์อัปโหลด</span>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-white transition group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-purple-600 mb-1.5 transition" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">คลิกเพื่อเลือกไฟล์รูปภาพข้อสอบจากเครื่องของคุณ</span>
                <span className="text-[10px] text-slate-400 mt-0.5">รองรับไฟล์ JPG, PNG, WEBP (อัปโหลดจริง ไม่มีการสร้างรูปด้วย AI)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Options (Choice List) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">ตัวเลือกคำตอบปรนัย (Multiple Choice Options)</label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> เพิ่มตัวเลือก
              </button>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswerIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      correctAnswerIndex === idx
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {correctAnswerIndex === idx ? '✓ เฉลยข้อถูก' : 'เลือกเฉลย'}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={`ตัวเลือก ${String.fromCharCode(97 + idx)}.`}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">คำอธิบายเฉลย / Rationale (Explanation)</label>
            <textarea
              rows={2}
              placeholder="คำอธิบายเฉลยเหตุผลข้อสอบ..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100 transition text-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อสอบ (Save)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

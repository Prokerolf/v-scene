import React, { useState } from 'react';
import { X, Image as ImageIcon, Save, CheckCircle, Plus, Trash2, Check } from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { labOptions } from './LabOrderScene';
import { drugOptions } from './TreatmentScene';

type Tab = 'general' | 'pretest' | 'history' | 'labs' | 'treatments';

const SearchableMultiSelect = ({ 
  options, 
  selectedIds, 
  onToggle, 
  placeholder 
}: { 
  options: {id: string, name: string}[], 
  selectedIds: string[], 
  onToggle: (id: string) => void,
  placeholder: string
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative mb-6">
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedIds.map(id => {
          const opt = options.find(o => o.id === id);
          if (!opt) return null;
          return (
            <span key={id} className="bg-primary text-on-primary px-3 py-1.5 rounded-full font-label-sm flex items-center gap-1.5 shadow-sm">
              {opt.name}
              <button onClick={() => onToggle(id)} className="hover:text-error transition-colors bg-black/10 rounded-full p-0.5"><X className="w-3 h-3" /></button>
            </span>
          );
        })}
        {selectedIds.length === 0 && (
          <span className="text-on-surface-variant text-sm italic py-1">No items selected.</span>
        )}
      </div>
      <div className="relative">
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary outline-none shadow-sm transition-shadow"
        />
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container border border-outline-variant rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 py-2">
            {filteredOptions.map(opt => (
              <div 
                key={opt.id} 
                onClick={() => { onToggle(opt.id); setQuery(''); }}
                className="px-4 py-2.5 hover:bg-surface-variant cursor-pointer text-sm flex items-center justify-between transition-colors"
              >
                <span className="font-label-md text-on-surface">{opt.name}</span>
                {selectedIds.includes(opt.id) && <Check className="w-5 h-5 text-primary" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CaseEditModal = ({ isOpen, onClose, caseData, onSave }: { isOpen: boolean, onClose: () => void, caseData: any, onSave: () => void }) => {
  const [editingCase, setEditingCase] = useState<any>(caseData);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  React.useEffect(() => {
    if (isOpen && caseData) {
      setEditingCase(caseData);
      setActiveTab('general');
    }
  }, [isOpen, caseData]);

  if (!isOpen || !editingCase) return null;

  // Generic Field Updater
  const updateField = (field: string, value: any) => setEditingCase({ ...editingCase, [field]: value });

  // Pre-test Methods
  const addPreTestQuestion = () => {
    const qList = editingCase.preTestQuestions || [];
    updateField('preTestQuestions', [...qList, { question: '', options: ['', '', '', ''], correctAnswerIndex: 0, category: '' }]);
  };

  const removePreTestQuestion = (index: number) => {
    const qList = [...(editingCase.preTestQuestions || [])];
    qList.splice(index, 1);
    updateField('preTestQuestions', qList);
  };

  const updatePreTest = (index: number, field: string, value: any) => {
    const qList = [...(editingCase.preTestQuestions || [])];
    qList[index] = { ...qList[index], [field]: value };
    updateField('preTestQuestions', qList);
  };

  const updatePreTestOption = (qIndex: number, optIndex: number, value: string) => {
    const qList = [...(editingCase.preTestQuestions || [])];
    const options = [...qList[qIndex].options];
    options[optIndex] = value;
    qList[qIndex] = { ...qList[qIndex], options };
    updateField('preTestQuestions', qList);
  };

  // Lab Methods
  const handleLabTextChange = (labId: string, text: string) => {
    setEditingCase({
      ...editingCase,
      specificLabResults: {
        ...(editingCase.specificLabResults || {}),
        [labId]: { ...(editingCase.specificLabResults?.[labId] || {}), text }
      }
    });
  };

  const handleLabImageChange = (labId: string, imageUrl: string) => {
    setEditingCase({
      ...editingCase,
      specificLabResults: {
        ...(editingCase.specificLabResults || {}),
        [labId]: { ...(editingCase.specificLabResults?.[labId] || {}), imageUrl }
      }
    });
  };

  const handleLabImageUpload = async (labId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(labId);
    try {
      const storageRef = ref(storage, `cases/${editingCase.id}/labs/${labId}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      handleLabImageChange(labId, url);
    } catch (err: any) {
      alert("Error uploading image: " + err.message);
    }
    setIsUploading(null);
  };

  const toggleArrayItem = (field: 'goldStandardLabs' | 'goldStandardDrugs' | 'contraindicatedDrugs', id: string) => {
    const currentArr = editingCase[field] || [];
    if (currentArr.includes(id)) {
      updateField(field, currentArr.filter((item: string) => item !== id));
    } else {
      updateField(field, [...currentArr, id]);
    }
  };

  const handleSave = async (targetStatus: 'draft' | 'deployed' | 'keep') => {
    setIsSaving(true);
    try {
      const caseRef = doc(db, 'cases', editingCase.id);
      
      let finalStatus = editingCase.status;
      if (targetStatus !== 'keep') {
        finalStatus = targetStatus;
      }
      
      const updateData = JSON.parse(JSON.stringify({
        ...editingCase,
        status: finalStatus
      }));
      
      // Use setDoc with merge instead of updateDoc to handle cases that might not exist yet,
      // and JSON.parse/stringify removes undefined values which crash Firestore.
      await setDoc(caseRef, updateData, { merge: true });
      onSave();
      onClose();
    } catch (e: any) {
      alert("Error saving case: " + e.message);
    }
    setIsSaving(false);
  };

  const isDeployed = editingCase.status === 'deployed';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
      <div className="bg-surface-container-lowest w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col border border-outline-variant overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h2 className="font-headline-md text-xl text-on-surface">Case CMS: {editingCase.diseaseName}</h2>
            <p className="font-label-sm text-on-surface-variant">Edit details, pre-test, labs, and treatments before deploying.</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-outline-variant px-6 bg-surface-container-low/50">
          {[
            { id: 'general', label: 'General Info' },
            { id: 'pretest', label: 'Pre-Test' },
            { id: 'history', label: 'History & DDx' },
            { id: 'labs', label: 'Labs & Images' },
            { id: 'treatments', label: 'Treatments' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-3 font-label-md transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary font-bold bg-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-surface">
          
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm mb-1 text-on-surface-variant">Disease Name</label>
                  <input type="text" value={editingCase.diseaseName || ''} onChange={e => updateField('diseaseName', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block font-label-sm mb-1 text-on-surface-variant">Patient Name</label>
                  <input type="text" value={editingCase.patientName || ''} onChange={e => updateField('patientName', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block font-label-sm mb-1 text-on-surface-variant">Age</label>
                  <input type="number" value={editingCase.age || 0} onChange={e => updateField('age', Number(e.target.value))} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block font-label-sm mb-1 text-on-surface-variant">Gender</label>
                  <select value={editingCase.gender || ''} onChange={e => updateField('gender', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm mb-1 text-on-surface-variant">Tier</label>
                  <select value={editingCase.tier || 'Low'} onChange={e => updateField('tier', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    <option value="Low">Low</option>
                    <option value="Mid">Mid</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-sm mb-1 text-on-surface-variant">Tier Explanation (คำอธิบายระดับความยากที่ AI วิเคราะห์)</label>
                <textarea value={editingCase.tierExplanation || ''} onChange={e => updateField('tierExplanation', e.target.value)} placeholder="เช่น เคสนี้ยากเพราะมีโรคแทรกซ้อนที่ต้องอาศัยการแปลผลแล็บที่ซับซ้อน..." className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" rows={2} />
              </div>
              <div>
                <label className="block font-label-sm mb-1 text-on-surface-variant">Chief Complaint</label>
                <textarea value={editingCase.chiefComplaint || ''} onChange={e => updateField('chiefComplaint', e.target.value)} className="w-full h-20 bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none resize-none" />
              </div>
              <div>
                <label className="block font-label-sm mb-1 text-on-surface-variant">Persona Details (For AI)</label>
                <textarea value={editingCase.personaDetails || ''} onChange={e => updateField('personaDetails', e.target.value)} className="w-full h-32 bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none resize-none" />
              </div>
            </div>
          )}

          {activeTab === 'pretest' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="font-body-sm text-on-surface-variant">Configure the pre-test questions shown before the case.</p>
                <button onClick={addPreTestQuestion} className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-label-sm flex items-center gap-2 hover:opacity-90 transition-colors">
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>
              {(editingCase.preTestQuestions || []).map((q: any, qIdx: number) => (
                <div key={qIdx} className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-label-md font-bold text-primary">Question {qIdx + 1}</span>
                    <button onClick={() => removePreTestQuestion(qIdx)} className="text-error hover:bg-error-container p-1 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-label-sm mb-1 text-on-surface-variant">Question Text</label>
                      <input type="text" value={q.question || ''} onChange={e => updatePreTest(qIdx, 'question', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(q.options || []).map((opt: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${qIdx}`} checked={q.correctAnswerIndex === optIdx} onChange={() => updatePreTest(qIdx, 'correctAnswerIndex', optIdx)} className="accent-primary w-4 h-4" />
                          <input type="text" value={opt || ''} onChange={e => updatePreTestOption(qIdx, optIdx, e.target.value)} className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:border-primary outline-none" placeholder={`Option ${optIdx + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <label className="block font-label-sm mb-1 text-on-surface-variant">DDx Keywords (Comma separated)</label>
                <input type="text" value={(editingCase.ddxKeywords || []).join(', ')} onChange={e => updateField('ddxKeywords', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" placeholder="e.g. Asthma, COPD, Pneumonia" />
              </div>
              <div>
                <label className="block font-label-sm mb-1 text-on-surface-variant">Final Diagnosis Keywords (Comma separated)</label>
                <input type="text" value={(editingCase.finalDiagnosisKeywords || []).join(', ')} onChange={e => updateField('finalDiagnosisKeywords', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" placeholder="e.g. Paragonimiasis" />
              </div>
              <div>
                <label className="block font-label-sm mb-1 text-on-surface-variant">DDx Group Title</label>
                <input type="text" value={editingCase.ddxGroup || ''} onChange={e => updateField('ddxGroup', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" placeholder="e.g. Acute Respiratory Failure" />
              </div>
              <div>
                <label className="block font-label-sm mb-1 text-on-surface-variant">DDx Explanation (Shown at end)</label>
                <textarea value={editingCase.ddxExplanation || ''} onChange={e => updateField('ddxExplanation', e.target.value)} className="w-full h-24 bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none resize-none" />
              </div>
              <div>
                <label className="block font-label-sm mb-1 text-on-surface-variant">Final Diagnosis Explanation</label>
                <textarea value={editingCase.diagnosisExplanation || ''} onChange={e => updateField('diagnosisExplanation', e.target.value)} className="w-full h-24 bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none resize-none" />
              </div>
            </div>
          )}

          {activeTab === 'labs' && (
            <div>
              <p className="font-body-sm text-on-surface-variant mb-4">
                Select essential labs to confirm the diagnosis, and provide results (Text or Image URL).
              </p>

              <SearchableMultiSelect 
                options={labOptions}
                selectedIds={editingCase.goldStandardLabs || []}
                onToggle={(id) => toggleArrayItem('goldStandardLabs', id)}
                placeholder="Search to add lab investigations..."
              />

              <div className="space-y-4">
                {(!editingCase.goldStandardLabs || editingCase.goldStandardLabs.length === 0) ? (
                  <p className="text-on-surface-variant text-sm italic p-4 bg-surface-container rounded-lg">No labs selected.</p>
                ) : (
                  (editingCase.goldStandardLabs || []).map((labId: string) => {
                    const labName = labOptions.find(l => l.id === labId)?.name || labId;
                    const labResult = editingCase.specificLabResults?.[labId] || {};
                    return (
                      <div key={labId} className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest">
                        <h4 className="font-label-md font-bold text-on-surface mb-3">{labName}</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-label-sm text-on-surface-variant mb-1">Textual Finding (Markdown)</label>
                            <textarea
                              value={labResult.text || ''}
                              onChange={(e) => handleLabTextChange(labId, e.target.value)}
                              className="w-full h-24 bg-surface border border-outline-variant rounded-lg p-2 text-sm focus:border-primary outline-none resize-none"
                            />
                          </div>
                          <div>
                            <label className="block font-label-sm text-on-surface-variant mb-1">Image URL (Optional)</label>
                            <div className="flex gap-2 mb-2 items-center">
                              <ImageIcon className="w-5 h-5 text-on-surface-variant shrink-0" />
                              <input
                                type="text"
                                value={labResult.imageUrl || ''}
                                onChange={(e) => handleLabImageChange(labId, e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                placeholder="https://..."
                              />
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-on-surface-variant uppercase tracking-wider">or</span>
                              <label className="cursor-pointer bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 px-3 py-1.5 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-1">
                                {isUploading === labId ? 'Uploading...' : 'Upload Image'}
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleLabImageUpload(labId, e)}
                                  disabled={isUploading === labId}
                                />
                              </label>
                            </div>

                            {labResult.imageUrl && (
                              <div className="mt-2 rounded-lg border border-outline-variant overflow-hidden bg-surface-variant/30 flex items-center justify-center relative">
                                <img src={labResult.imageUrl} alt={labName} className="max-h-32 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                <button 
                                  onClick={() => handleLabImageChange(labId, '')}
                                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                  title="Remove image"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-sm text-lg text-on-surface mb-2">Gold Standard Drugs / Interventions</h3>
                <p className="font-body-sm text-on-surface-variant mb-4">Required treatments for this case to pass.</p>
                <SearchableMultiSelect 
                  options={drugOptions}
                  selectedIds={editingCase.goldStandardDrugs || []}
                  onToggle={(id) => toggleArrayItem('goldStandardDrugs', id)}
                  placeholder="Search to add gold standard treatments..."
                />
              </div>

              <div>
                <h3 className="font-headline-sm text-lg text-error mb-2">Contraindicated Drugs</h3>
                <p className="font-body-sm text-on-surface-variant mb-4">Drugs that will cause immediate failure if selected.</p>
                <SearchableMultiSelect 
                  options={drugOptions}
                  selectedIds={editingCase.contraindicatedDrugs || []}
                  onToggle={(id) => toggleArrayItem('contraindicatedDrugs', id)}
                  placeholder="Search to add contraindicated treatments..."
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex flex-wrap justify-between items-center gap-3">
          <button onClick={onClose} className="text-on-surface-variant font-label-md px-4 py-2 rounded-full hover:bg-surface-variant transition-colors">
            Cancel
          </button>
          <div className="flex flex-wrap gap-3">
            {isDeployed ? (
              <>
                <button 
                  onClick={() => handleSave('draft')}
                  disabled={isSaving}
                  className="bg-error/10 text-error font-label-md px-6 py-2.5 rounded-full hover:bg-error/20 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Unpublish
                </button>
                <button 
                  onClick={() => handleSave('keep')}
                  disabled={isSaving}
                  className="bg-primary text-on-primary font-label-md font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-primary-fixed-variant transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Edits
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleSave('keep')}
                  disabled={isSaving}
                  className="bg-surface-container-highest text-on-surface font-label-md px-6 py-2.5 rounded-full hover:bg-outline-variant transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Draft
                </button>
                <button 
                  onClick={() => handleSave('deployed')}
                  disabled={isSaving}
                  className="bg-primary text-on-primary font-label-md font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-primary-fixed-variant transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Publish Case
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Image as ImageIcon, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { labOptions } from './LabOrderScene';

export const CaseEditModal = ({ isOpen, onClose, caseData, onSave }: { isOpen: boolean, onClose: () => void, caseData: any, onSave: () => void }) => {
  const [editingCase, setEditingCase] = useState<any>(caseData);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !editingCase) return null;

  const handleLabTextChange = (labId: string, text: string) => {
    setEditingCase({
      ...editingCase,
      specificLabResults: {
        ...(editingCase.specificLabResults || {}),
        [labId]: {
          ...(editingCase.specificLabResults?.[labId] || {}),
          text
        }
      }
    });
  };

  const handleLabImageChange = (labId: string, imageUrl: string) => {
    setEditingCase({
      ...editingCase,
      specificLabResults: {
        ...(editingCase.specificLabResults || {}),
        [labId]: {
          ...(editingCase.specificLabResults?.[labId] || {}),
          imageUrl
        }
      }
    });
  };

  const toggleGoldStandardLab = (labId: string) => {
    const currentLabs = editingCase.goldStandardLabs || [];
    if (currentLabs.includes(labId)) {
      setEditingCase({
        ...editingCase,
        goldStandardLabs: currentLabs.filter((id: string) => id !== labId)
      });
    } else {
      setEditingCase({
        ...editingCase,
        goldStandardLabs: [...currentLabs, labId]
      });
    }
  };

  const handleSave = async (deploy: boolean = false) => {
    setIsSaving(true);
    try {
      const caseRef = doc(db, 'cases', editingCase.id);
      const updateData = {
        ...editingCase,
        status: deploy ? 'deployed' : editingCase.status || 'draft'
      };
      await updateDoc(caseRef, updateData);
      onSave();
      onClose();
    } catch (e: any) {
      alert("Error saving case: " + e.message);
    }
    setIsSaving(false);
  };

  const goldStandardLabIds = editingCase.goldStandardLabs || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
      <div className="bg-surface-container-lowest w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col border border-outline-variant overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h2 className="font-headline-md text-xl text-on-surface">Review & Edit Case</h2>
            <p className="font-label-sm text-on-surface-variant">Review AI-generated labs and attach images before deploying.</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-surface">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <h3 className="font-label-md font-bold text-on-surface mb-2">Patient Details</h3>
              <p className="font-body-sm text-on-surface-variant"><span className="font-label-sm">Name:</span> {editingCase.patientName} ({editingCase.age} {editingCase.gender})</p>
              <p className="font-body-sm text-on-surface-variant"><span className="font-label-sm">Disease:</span> {editingCase.diseaseName}</p>
              <p className="font-body-sm text-on-surface-variant"><span className="font-label-sm">Tier:</span> {editingCase.tier || 'Low'}</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <h3 className="font-label-md font-bold text-on-surface mb-2">Clinical Presentation</h3>
              <p className="font-body-sm text-on-surface-variant line-clamp-3"><span className="font-label-sm">CC:</span> {editingCase.chiefComplaint}</p>
              <p className="font-body-sm text-on-surface-variant line-clamp-3 mt-1"><span className="font-label-sm">Persona:</span> {editingCase.personaDetails}</p>
            </div>
          </div>

          <div>
            <h3 className="font-headline-sm text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-rounded text-primary">science</span> Gold Standard Labs
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-4">
              Select only the absolute essential labs (1-3 max) to confirm the diagnosis. Do not select basic routine labs like CBC unless necessary.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {labOptions.map(lab => (
                <button
                  key={lab.id}
                  onClick={() => toggleGoldStandardLab(lab.id)}
                  className={`px-3 py-1.5 rounded-full font-label-sm border transition-colors flex items-center gap-1 ${
                    goldStandardLabIds.includes(lab.id)
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {goldStandardLabIds.includes(lab.id) && <span className="material-symbols-rounded text-[14px]">check</span>}
                  {lab.name}
                </button>
              ))}
            </div>

            <h3 className="font-headline-sm text-lg text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-rounded text-primary">edit_document</span> Lab Results (Text & Images)
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-4">
              You can edit the text and paste an image URL (e.g. CT Scan) for each selected lab.
            </p>
            
            <div className="space-y-6">
              {goldStandardLabIds.length === 0 ? (
                <p className="text-on-surface-variant text-sm italic p-4 bg-surface-container rounded-lg">No gold standard labs defined by AI.</p>
              ) : (
                goldStandardLabIds.map((labId: string) => {
                  const labName = labOptions.find(l => l.id === labId)?.name || labId;
                  const labResult = editingCase.specificLabResults?.[labId] || {};
                  
                  return (
                    <div key={labId} className="border border-outline-variant rounded-xl p-5 bg-surface-container-lowest">
                      <h4 className="font-label-md font-bold text-on-surface mb-3 flex items-center gap-2">
                        {labName}
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-label-sm text-on-surface-variant mb-1">Textual Finding (Markdown)</label>
                          <textarea
                            value={labResult.text || ''}
                            onChange={(e) => handleLabTextChange(labId, e.target.value)}
                            className="w-full h-32 bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                            placeholder="e.g. **CT Brain:** Normal findings."
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="block font-label-sm text-on-surface-variant mb-1">Image URL (Optional)</label>
                          <div className="flex gap-2 mb-2">
                            <ImageIcon className="w-5 h-5 text-on-surface-variant shrink-0 mt-2" />
                            <input
                              type="text"
                              value={labResult.imageUrl || ''}
                              onChange={(e) => handleLabImageChange(labId, e.target.value)}
                              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                              placeholder="https://example.com/ct-scan.jpg"
                            />
                          </div>
                          {labResult.imageUrl && (
                            <div className="mt-2 flex-1 rounded-lg border border-outline-variant overflow-hidden bg-surface-variant/30 flex items-center justify-center">
                              <img src={labResult.imageUrl} alt={labName} className="max-h-32 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
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
        </div>

        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex justify-between items-center">
          <button 
            onClick={onClose}
            className="text-on-surface-variant font-label-md px-4 py-2 rounded-full hover:bg-surface-variant transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="bg-surface-container-highest text-on-surface font-label-md px-6 py-2.5 rounded-full hover:bg-outline-variant transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="bg-primary text-on-primary font-label-md font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-primary-fixed-variant transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Deploy Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { db } from './firebase';
import { collection, getDocs, doc, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { BATCH1_QUESTIONS, BATCH2_QUESTIONS, DEFAULT_KFP_QUESTIONS, DEFAULT_KFQ_QUESTIONS } from '../data/exams';
import type { ExamCategory } from '../components/ExamEditorModal';

/**
 * Merges questions from Firestore (`dbExams`) with base questions.
 * Guarantee: STRICT EXACT ID MATCHING ONLY. Zero cross-category leakage or duplicate corruption.
 */
export function getResolvedExams(dbExams: any[], category: ExamCategory): any[] {
  // 1. Load base default questions for target category
  let baseQuestions: any[] = [];
  if (category === 'pretest_batch1') {
    baseQuestions = BATCH1_QUESTIONS.map((q, idx) => ({ ...q, category: 'pretest_batch1', originalIndex: idx }));
  } else if (category === 'pretest_batch2') {
    baseQuestions = BATCH2_QUESTIONS.map((q, idx) => ({ ...q, category: 'pretest_batch2', originalIndex: idx }));
  } else if (category === 'posttest') {
    baseQuestions = BATCH1_QUESTIONS.map((q, idx) => ({ ...q, category: 'posttest', originalIndex: idx }));
  } else if (category === 'kfp') {
    baseQuestions = DEFAULT_KFP_QUESTIONS.map((q, idx) => ({ ...q, category: 'kfp', originalIndex: idx }));
  } else if (category === 'kfq') {
    baseQuestions = DEFAULT_KFQ_QUESTIONS.map((q, idx) => ({ ...q, category: 'kfq', originalIndex: idx }));
  }

  // Filter Firestore items strictly matching target category
  const dbCategoryExams = (dbExams || []).filter((e: any) => e && e.category === category);

  if (dbCategoryExams.length === 0) {
    return baseQuestions;
  }

  // Map Firestore items by EXACT ID and docId only
  const dbMapExact = new Map<string, any>();

  dbCategoryExams.forEach((item: any) => {
    if (item.id) {
      dbMapExact.set(String(item.id), item);
    }
    if (item.docId) {
      dbMapExact.set(String(item.docId), item);
    }
  });

  // Merge: Overlay LATEST Firestore items onto base questions by STRICT EXACT ID
  const merged = baseQuestions.map((baseQ) => {
    const qId = String(baseQ.id);

    // Look for exact ID match ONLY (No loose number matching)
    const dbMatch = dbMapExact.get(qId) || 
                    dbMapExact.get(`${category}_${qId}`);

    if (dbMatch) {
      return {
        ...baseQ,
        ...dbMatch, // Firestore document OVERWRITES base question 100%
        id: baseQ.id, // Preserve consistent base ID
        question: dbMatch.question !== undefined ? dbMatch.question : (dbMatch.questionPrompt || baseQ.question),
        options: (dbMatch.options && dbMatch.options.length > 0) ? dbMatch.options : baseQ.options,
        correctAnswerIndex: dbMatch.correctAnswerIndex !== undefined ? dbMatch.correctAnswerIndex : baseQ.correctAnswerIndex,
        explanation: dbMatch.explanation !== undefined ? dbMatch.explanation : baseQ.explanation,
        caseKey: dbMatch.caseKey || baseQ.caseKey,
        imageUrl: dbMatch.imageUrl || dbMatch.image || baseQ.imageUrl,
        isCustomized: true,
        updatedAt: dbMatch.updatedAt,
        updatedBy: dbMatch.updatedBy
      };
    }
    return baseQ;
  });

  // Append any additional custom questions created in Firestore beyond baseQuestions
  dbCategoryExams.forEach((dbQ: any) => {
    const isAlreadyMerged = merged.some((m) => String(m.id) === String(dbQ.id));
    if (!isAlreadyMerged && dbQ.id && String(dbQ.id).startsWith(category)) {
      merged.push({ ...dbQ, isCustomized: true });
    }
  });

  return merged;
}

/**
 * Reset an edited question back to original base version by removing Firestore doc
 */
export async function resetQuestionToOriginal(category: ExamCategory, questionId: string): Promise<void> {
  const docRef1 = doc(db, 'exams', `${category}_${questionId}`);
  const docRef2 = doc(db, 'exams', questionId);
  await Promise.all([
    deleteDoc(docRef1).catch(() => {}),
    deleteDoc(docRef2).catch(() => {})
  ]);
}

/**
 * Clean all corrupted/duplicate documents from Firestore and restore clean default exams
 */
export async function clearAllCorruptedExamsFromFirestore(): Promise<void> {
  const examsSnap = await getDocs(collection(db, 'exams'));
  const batch = writeBatch(db);
  examsSnap.forEach(docSnap => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}

/**
 * Batch seeds all base questions for a category to Firestore `exams` collection
 */
export async function seedCategoryExamsToFirestore(category: ExamCategory): Promise<number> {
  let baseQuestions: any[] = [];
  if (category === 'pretest_batch1') baseQuestions = BATCH1_QUESTIONS;
  else if (category === 'pretest_batch2') baseQuestions = BATCH2_QUESTIONS;
  else if (category === 'posttest') baseQuestions = BATCH1_QUESTIONS;
  else if (category === 'kfp') baseQuestions = DEFAULT_KFP_QUESTIONS;
  else if (category === 'kfq') baseQuestions = DEFAULT_KFQ_QUESTIONS;

  const batch = writeBatch(db);
  let count = 0;

  for (let i = 0; i < baseQuestions.length; i++) {
    const q = baseQuestions[i];
    const qId = q.id ? String(q.id) : `q_${i + 1}`;
    const docRef = doc(db, 'exams', `${category}_${qId}`);
    
    const payload = {
      ...q,
      id: qId,
      category,
      caseKey: q.caseKey || 'case_a',
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Auto-Seed'
    };

    batch.set(docRef, payload, { merge: true });
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Directly fetches and merges exams for students or exporter components.
 */
export async function fetchAndMergeExamsForCategory(category: ExamCategory): Promise<any[]> {
  try {
    const examsSnap = await getDocs(collection(db, 'exams'));
    const dbExams: any[] = [];
    examsSnap.forEach(docSnap => {
      dbExams.push({ docId: docSnap.id, ...docSnap.data() });
    });
    return getResolvedExams(dbExams, category);
  } catch (err) {
    console.error('Failed to fetch exams from Firestore:', err);
    return getResolvedExams([], category);
  }
}

/**
 * Sanitizes questions for student view by removing correctAnswerIndex and explanations
 * so answer keys can NEVER be inspected or scraped via DevTools / F12 / JS Memory.
 */
export function sanitizeQuestionsForStudent(questions: any[]): any[] {
  return (questions || []).map(q => {
    const { correctAnswerIndex, explanation, answerKey, ...sanitized } = q;
    return sanitized;
  });
}

/**
 * Securely evaluates student submission against original master questions.
 */
export function gradeStudentSubmission(studentAnswers: number[], masterQuestions: any[]): number {
  let score = 0;
  (studentAnswers || []).forEach((ans, idx) => {
    const masterQ = masterQuestions[idx];
    if (masterQ && masterQ.correctAnswerIndex !== undefined && ans === masterQ.correctAnswerIndex) {
      score++;
    }
  });
  return score;
}


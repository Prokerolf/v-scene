export interface GatewayQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  relatedSlide: string;
  caseKey: 'case_a' | 'case_b' | 'case_c';
}

const generateQuestions = (): GatewayQuestion[] => {
  const questions: GatewayQuestion[] = [];
  
  // Case A Questions
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: `g_a_${i}`,
      question: `(Case A) Mock Pretest Question ${i}`,
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswerIndex: 0,
      relatedSlide: `Slide A${i}`,
      caseKey: 'case_a'
    });
  }

  // Case B Questions
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: `g_b_${i}`,
      question: `(Case B) Mock Pretest Question ${i}`,
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswerIndex: 0,
      relatedSlide: `Slide B${i}`,
      caseKey: 'case_b'
    });
  }

  // Case C Questions
  for (let i = 1; i <= 10; i++) {
    questions.push({
      id: `g_c_${i}`,
      question: `(Case C) Mock Pretest Question ${i}`,
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswerIndex: 0,
      relatedSlide: `Slide C${i}`,
      caseKey: 'case_c'
    });
  }

  return questions;
};

export const GATEWAY_QUESTIONS: GatewayQuestion[] = generateQuestions();

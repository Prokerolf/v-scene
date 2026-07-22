import { CLINICAL_CASES } from './src/data/cases.js';
console.log(JSON.stringify(CLINICAL_CASES.map(c => c.patientName)));

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyAmMvnnSBJvXiniq7snNKnHVd6q0KgnUuc",
  authDomain: "gen-lang-client-0374663187.firebaseapp.com",
  projectId: "gen-lang-client-0374663187",
  storageBucket: "gen-lang-client-0374663187.firebasestorage.app",
  messagingSenderId: "68546674847",
  appId: "1:68546674847:web:8aed661ea0cf6b0456e2aa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generate() {
  console.log("Generating 100 student accounts...");
  const batch1 = writeBatch(db);
  
  let csvData = "Username,Password,Role\n";
  
  batch1.set(doc(collection(db, 'accounts'), 'admin'), {
    username: 'admin',
    password: 'password123',
    role: 'admin'
  });
  csvData += `admin,password123,admin\n`;

  for (let i = 1; i <= 100; i++) {
    const username = `VS${i.toString().padStart(3, '0')}`;
    const password = Math.floor(10000 + Math.random() * 90000).toString(); 
    
    batch1.set(doc(collection(db, 'accounts'), username), {
      username,
      password,
      role: 'student'
    });
    
    csvData += `${username},${password},student\n`;
  }

  await batch1.commit();
  
  fs.writeFileSync('V-SCENE_Accounts.csv', csvData);
  console.log("Successfully generated accounts and saved to V-SCENE_Accounts.csv!");
  process.exit(0);
}

generate().catch(console.error);

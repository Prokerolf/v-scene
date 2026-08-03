import React from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface ConsentFormProps {
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-on-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center mb-6">
          <img src={logoImg} alt="V-SCENE Logo" className="h-32 w-auto object-contain" />
        </div>
        
        <div className="bg-surface-container-lowest py-8 px-6 shadow-xl sm:rounded-3xl sm:px-10 border border-outline-variant animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-6 border-b pb-4 border-outline-variant">
            <div className="p-3 bg-primary-container text-on-primary-container rounded-2xl">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-headline-md font-bold text-on-surface">เอกสารชี้แจงผู้เข้าร่วมโครงการวิจัย</h2>
              <p className="text-sm font-label-md text-on-surface-variant">Informed Consent Form</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-on-surface-variant space-y-4 max-h-[400px] overflow-y-auto pr-4 font-body-md custom-scrollbar">
            <p>
              <strong className="text-on-surface font-bold">ชื่อโครงการวิจัย:</strong> การประเมินประสิทธิภาพการเรียนรู้ด้วยระบบสถานการณ์จำลอง (V-Scene) เปรียบเทียบกับการเรียนรู้จากกรณีศึกษาแบบดั้งเดิม (Traditional CBL)
            </p>
            
            <h3 className="font-headline-sm font-bold text-on-surface mt-4">1. วัตถุประสงค์ของการวิจัย</h3>
            <p>
              เพื่อเปรียบเทียบผลสัมฤทธิ์ทางการเรียนรู้ ทักษะการคิดอย่างมีวิจารณญาณ (Critical Thinking) และการคงอยู่ของความรู้ (Knowledge Retention) ระหว่างการใช้ระบบ V-Scene และการเรียนแบบดั้งเดิม
            </p>

            <h3 className="font-headline-sm font-bold text-on-surface mt-4">2. การปฏิบัติตัวของผู้เข้าร่วมวิจัย</h3>
            <p>
              หากท่านตกลงเข้าร่วม ท่านจะได้ใช้งานแอปพลิเคชันจำลองสถานการณ์ผู้ป่วย (V-Scene) โดยระบบจะทำการบันทึกข้อมูลการโต้ตอบ เช่น ระยะเวลาที่ใช้, คะแนนการทดสอบก่อนและหลัง (Pre-test / Post-test), และการตัดสินใจทางคลินิก
            </p>

            <h3 className="font-headline-sm font-bold text-on-surface mt-4">3. ความเสี่ยงและประโยชน์</h3>
            <p>
              การวิจัยนี้ไม่มีความเสี่ยงทางร่างกายหรือจิตใจใดๆ ข้อมูลที่ได้จะเป็นประโยชน์อย่างยิ่งในการพัฒนาระบบเทคโนโลยีการศึกษาทางการแพทย์ของคณะฯ ในอนาคต
            </p>

            <h3 className="font-headline-sm font-bold text-on-surface mt-4">4. การรักษาความลับ</h3>
            <p>
              ข้อมูลส่วนบุคคลและข้อมูลการใช้งานทั้งหมดของท่านจะถูก <strong className="text-on-surface">เก็บรักษาเป็นความลับอย่างเคร่งครัด</strong> และจะนำเสนอผลการวิจัยในภาพรวมเท่านั้น ไม่มีการระบุชื่อของท่านในรายงานการวิจัย
            </p>

            <h3 className="font-headline-sm font-bold text-on-surface mt-4">5. สิทธิของผู้เข้าร่วมวิจัย</h3>
            <p>
              การเข้าร่วมโครงการนี้เป็นไปโดยความสมัครใจ ท่านมีสิทธิปฏิเสธการเข้าร่วม หรือถอนตัวออกจากโครงการได้ตลอดเวลา โดยจะไม่มีผลกระทบต่อการเรียนหรือผลการประเมินใดๆ ของท่าน
            </p>
          </div>

          <div className="mt-8 bg-secondary-container/30 p-4 rounded-2xl border border-secondary-fixed-dim flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface font-medium font-body-md">
              ข้าพเจ้าได้อ่านและทำความเข้าใจรายละเอียดของโครงการวิจัยนี้แล้ว และ <strong className="text-primary font-bold">ยินดี</strong> เข้าร่วมการวิจัย
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onAccept}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary-fixed-variant text-on-primary font-label-lg font-bold rounded-full shadow-sm transition-all hover:shadow-md text-center"
            >
              ยินยอมเข้าร่วมวิจัย (Accept)
            </button>
            <button
              onClick={onDecline}
              className="py-3 px-6 bg-surface border border-outline-variant hover:bg-surface-container-high text-on-surface-variant font-label-md rounded-full transition-colors text-center"
            >
              ไม่ยินยอม (Decline)
            </button>
          </div>
          <p className="text-center font-label-sm text-on-surface-variant opacity-70 mt-4">
            * หากท่านเลือกไม่ยินยอม ท่านจะไม่สามารถเข้าใช้งานระบบ V-Scene ได้
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;

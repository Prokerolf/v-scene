import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  th: {
    translation: {
      "app": {
        "switch_teacher": "สลับมุมมองอาจารย์",
        "switch_student": "มุมมองนักศึกษา",
        "logout": "ออกจากระบบ"
      },
      "auth": {
        "title": "Welcome to V-SCENE",
        "subtitle": "ระบบฝึกซักประวัติและวินิจฉัยโรคเสมือนจริงด้วย AI",
        "login_button": "เข้าสู่ระบบด้วย Google",
        "footer_text": "© 2026 V-SCENE AI. All rights reserved."
      },
      "dashboard": {
        "title": "ยินดีต้อนรับ,",
        "subtitle": "เลือกเคสผู้ป่วยด้านล่างเพื่อเริ่มต้นการฝึกซักประวัติ",
        "progress_title": "ความก้าวหน้าของคุณ",
        "overall_progress": "ความก้าวหน้าโดยรวม",
        "xp_points": "แต้มสะสม (XP)",
        "cases_completed": "เคสที่ผ่านแล้ว",
        "active_cases": "เคสปัจจุบัน",
        "recent_logs": "ประวัติการเล่นล่าสุด",
        "no_logs": "ยังไม่มีประวัติการเล่น",
        "difficulty": "ความยาก:",
        "start_case": "เริ่มทำเคสนี้",
        "continue_case": "ทำต่อ"
      },
      "scenes": {
        "history": {
          "title": "การซักประวัติ (History Taking)",
          "end_consult": "จบการซักประวัติ (เสนอ DDx)"
        },
        "lab_order": {
          "title": "สั่งตรวจทางห้องปฏิบัติการ (Order Labs)",
          "order_labs": "สั่งตรวจ",
          "next_step": "ขั้นตอนถัดไป"
        },
        "diagnostic": {
          "title": "สรุปการวินิจฉัย (Final Diagnosis)",
          "submit": "ยืนยันการวินิจฉัย"
        },
        "treatment": {
          "title": "แผนการรักษา (Treatment Plan)",
          "submit": "ยืนยันการรักษา"
        }
      },
      "common": {
        "cancel": "ยกเลิก",
        "confirm": "ยืนยัน",
        "close": "ปิด",
        "next": "ถัดไป",
        "back": "ย้อนกลับ",
        "loading": "กำลังโหลด..."
      },
      "teacher": {
        "title": "แผงควบคุม",
        "monitoring": "ติดตามการเรียน",
        "approvals": "จัดการเนื้อหาเคส",
        "bugs": "รายงานปัญหา",
        "logout": "ออกจากระบบ",
        "portal": "พอร์ทัลสำหรับอาจารย์",
        "student_view": "มุมมองนักศึกษา",
        "dashboard_title": "หน้าจอหลักของอาจารย์",
        "dashboard_subtitle": "ติดตามและจัดการเนื้อหาแบบเรียลไทม์",
        "export": "ส่งออกรายงาน",
        "class_avg": "คะแนนเฉลี่ยรวม",
        "based_on_pretest": "วัดจากคะแนนก่อนเรียน",
        "ai_queue": "คลังเคสจำลอง",
        "total_cases": "จำนวนเคสทั้งหมดในระบบ",
        "alerts": "แจ้งเตือนช่วยเหลือนักศึกษา",
        "students_flagged": "นักศึกษาที่ต้องดูแลพิเศษ",
        "class_overview": "ภาพรวมชั้นเรียน - ติดตามสด",
        "student_name": "ชื่อ-สกุล นักศึกษา",
        "tier": "ระดับความยาก / เคสปัจจุบัน",
        "pretest_score": "คะแนน Pre-test",
        "action": "การจัดการ",
        "review": "ตรวจดูประวัติ",
        "case_approval_title": "จัดการเนื้อหาเคสผู้ป่วย",
        "case_approval_subtitle": "สร้าง ตรวจสอบ และเผยแพร่เคสให้นักศึกษา",
        "generate_new": "สร้างเคสใหม่",
        "drafts": "เคสฉบับร่าง (รอการตรวจสอบ)",
        "no_drafts": "ไม่มีเคสฉบับร่าง",
        "deployed": "เคสที่เผยแพร่แล้ว (นักศึกษากำลังใช้งาน)",
        "no_deployed": "ไม่มีเคสที่เผยแพร่",
        "preview": "ดูตัวอย่าง",
        "edit_deploy": "แก้ไขและเผยแพร่",
        "edit": "แก้ไข",
        "bug_reports_title": "รายงานปัญหาจากนักศึกษา",
        "date_time": "วัน/เวลา",
        "stage_case": "หน้าจอและเคสที่พบปัญหา",
        "description": "รายละเอียดการรายงาน",
        "no_bugs": "ไม่มีรายงานปัญหา",
        "analytics_title": "ภาพรวมการเรียนรู้วิชา (Class Analytics)",
        "analytics_subtitle": "วิเคราะห์จุดแข็ง จุดอ่อน เพื่อปรับปรุงการสอน",
        "performance_dist": "การกระจายตัวของผลการเรียน (จาก Pre-test)",
        "high_tier": "กลุ่มคะแนนสูง (7-9)",
        "mid_tier": "กลุ่มปานกลาง (4-6)",
        "low_tier": "กลุ่มต้องการความช่วยเหลือ (0-3)",
        "skills_breakdown": "วิเคราะห์ทักษะย่อย (Simulated Data)",
        "history_skill": "การซักประวัติ",
        "lab_skill": "การส่งตรวจแล็บ",
        "ddx_skill": "การวินิจฉัยแยกโรค",
        "treatment_skill": "การวางแผนการรักษา",
        "ai_insights": "คำแนะนำจาก AI (Actionable Insights)",
        "ai_insights_desc": "สรุปจากข้อมูลนักศึกษา: นักศึกษาส่วนใหญ่สามารถซักประวัติได้ดี แต่อาจจะต้องเน้นย้ำเรื่อง 'การแปลผลแล็บและการเลือกยาเฉพาะทาง' ในคาบเรียนถัดไป เนื่องจากเป็นจุดที่ถูกหักคะแนนบ่อยที่สุด"
      }
    }
  },
  en: {
    translation: {
      "app": {
        "switch_teacher": "Switch to Teacher View",
        "switch_student": "Student View",
        "logout": "Logout"
      },
      "auth": {
        "title": "Welcome to V-SCENE",
        "subtitle": "AI-Powered Virtual Clinical History Taking & Diagnostic System",
        "login_button": "Sign in with Google",
        "footer_text": "© 2026 V-SCENE AI. All rights reserved."
      },
      "dashboard": {
        "title": "Welcome,",
        "subtitle": "Select a patient case below to begin your training",
        "progress_title": "Your Progress",
        "overall_progress": "Overall Progress",
        "xp_points": "Experience Points (XP)",
        "cases_completed": "Cases Completed",
        "active_cases": "Active Cases",
        "recent_logs": "Recent Activity",
        "no_logs": "No recent activity",
        "difficulty": "Difficulty:",
        "start_case": "Start Case",
        "continue_case": "Continue"
      },
      "scenes": {
        "history": {
          "title": "History Taking",
          "end_consult": "End Consult (Propose DDx)"
        },
        "lab_order": {
          "title": "Order Laboratory Tests",
          "order_labs": "Order Labs",
          "next_step": "Next Step"
        },
        "diagnostic": {
          "title": "Final Diagnosis",
          "submit": "Submit Diagnosis"
        },
        "treatment": {
          "title": "Treatment Plan",
          "submit": "Submit Treatment"
        }
      },
      "common": {
        "cancel": "Cancel",
        "confirm": "Confirm",
        "close": "Close",
        "next": "Next",
        "back": "Back",
        "loading": "Loading..."
      },
      "teacher": {
        "title": "Teacher Control",
        "monitoring": "Silent Monitoring",
        "approvals": "Case Approvals",
        "bugs": "Bug Reports",
        "logout": "Logout",
        "portal": "Teacher Portal",
        "student_view": "Student View",
        "dashboard_title": "Teacher Dashboard",
        "dashboard_subtitle": "Live telemetry and content review for students.",
        "export": "Export Report",
        "class_avg": "Class Average Score",
        "based_on_pretest": "Based on Pre-Test",
        "ai_queue": "AI Content Queue",
        "total_cases": "Total Cases Available",
        "alerts": "Remediation Alerts",
        "students_flagged": "Students flagged",
        "class_overview": "Class Overview - Live Telemetry",
        "student_name": "Student Name",
        "tier": "Tier / Current Case",
        "pretest_score": "Pre-Test Score",
        "action": "Action",
        "review": "Review",
        "case_approval_title": "Case Content Approval",
        "case_approval_subtitle": "Review, approve, and generate new simulated cases.",
        "generate_new": "Generate New Case",
        "drafts": "Draft Cases (Pending Review)",
        "no_drafts": "No draft cases.",
        "deployed": "Deployed Cases (Active for Students)",
        "no_deployed": "No deployed cases.",
        "preview": "Preview",
        "edit_deploy": "Edit & Deploy",
        "edit": "Edit",
        "bug_reports_title": "Student Bug Reports",
        "date_time": "Date / Time",
        "stage_case": "Stage & Case",
        "description": "Report Description",
        "no_bugs": "No bug reports found.",
        "analytics_title": "Class Analytics Dashboard",
        "analytics_subtitle": "Analyze strengths and weaknesses to improve teaching.",
        "performance_dist": "Performance Distribution (Pre-test)",
        "high_tier": "High Tier (7-9)",
        "mid_tier": "Mid Tier (4-6)",
        "low_tier": "Low Tier / Needs Help (0-3)",
        "skills_breakdown": "Skills Breakdown (Simulated Data)",
        "history_skill": "History Taking",
        "lab_skill": "Laboratory Orders",
        "ddx_skill": "Differential Diagnosis",
        "treatment_skill": "Treatment Planning",
        "ai_insights": "AI Actionable Insights",
        "ai_insights_desc": "Based on student data: Most students excel at History Taking but struggle with interpreting specific Lab results and selecting contraindication-free Treatments. Consider focusing the next lecture on these areas."
      }
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "th", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;

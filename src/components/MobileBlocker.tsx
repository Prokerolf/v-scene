import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, ShieldAlert, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { VSCENE_CI } from '../lib/vsceneCI';

interface MobileBlockerProps {
  children: React.ReactNode;
}

export default function MobileBlocker({ children }: MobileBlockerProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [bypass, setBypass] = useState<boolean>(false);

  const checkDevice = () => {
    // Smartphone check: screen width < 768px or user agent matching mobile phones (excluding iPad/tablets)
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileUA = /iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth < 768;

    // iPad detection (iOS 13+ reports Macintosh with maxTouchPoints > 0)
    const isIPadUA = /iPad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIPadUA) {
      // iPad is fully supported regardless of width
      setIsMobile(false);
    } else if (isSmallScreen || isMobileUA) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isMobile && !bypass) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden font-sans select-none"
        style={{ backgroundColor: VSCENE_CI.surface.bg }}
      >
        {/* Soft V-SCENE Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40" style={{ backgroundColor: VSCENE_CI.brand.pinkAccent }}></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40" style={{ backgroundColor: VSCENE_CI.brand.skyBlue }}></div>

        {/* Main V-SCENE CI Card */}
        <div 
          className="w-full max-w-md bg-white border rounded-3xl p-7 shadow-xl relative z-10 text-center"
          style={{ borderColor: VSCENE_CI.surface.pinkBorder }}
        >
          {/* Header Brand Logo */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black tracking-tight" style={{ color: VSCENE_CI.brand.logo }}>
                V-SCENE
              </span>
              <span 
                className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest rounded-full uppercase border shadow-2xs"
                style={{ 
                  backgroundColor: VSCENE_CI.brand.pinkAccent, 
                  color: VSCENE_CI.brand.logo,
                  borderColor: VSCENE_CI.surface.pinkBorder 
                }}
              >
                MED EXAM
              </span>
            </div>
            <span className="text-[11px] font-medium tracking-wide mt-0.5 text-slate-400">
              your case, your pace
            </span>
          </div>

          {/* Warning Icon Badge */}
          <div 
            className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center border shadow-xs"
            style={{ 
              backgroundColor: VSCENE_CI.brand.pinkAccent, 
              borderColor: VSCENE_CI.surface.pinkBorder,
              color: VSCENE_CI.brand.primary 
            }}
          >
            <ShieldAlert size={34} className="animate-pulse" />
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            ไม่รองรับการใช้งานบนโทรศัพท์มือถือ
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            ระบบทำข้อสอบและจำลองสถานการณ์ทางการแพทย์ <span className="font-semibold" style={{ color: VSCENE_CI.brand.primary }}>V-SCENE</span> ถูกออกแบบเพื่อประสิทธิภาพสูงสุดบนหน้าจอขนาดใหญ่สำหรับอ่านโจทย์ วาดไฮไลต์ และวิเคราะห์เคส
          </p>

          {/* Device Compatibility Matrix */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-left space-y-3 shadow-inner">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              อุปกรณ์ที่รองรับ (RECOMMENDED DEVICES)
            </div>

            {/* iPad & Tablets */}
            <div 
              className="flex items-center justify-between p-3 rounded-xl border transition shadow-xs"
              style={{ 
                backgroundColor: VSCENE_CI.status.successBg, 
                borderColor: VSCENE_CI.status.successBorder 
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Tablet size={18} className="text-emerald-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">iPad & Tablets</div>
                  <div className="text-[11px] font-medium text-emerald-800">รองรับ Apple Pencil / Stylus ดรอว์อิ้ง</div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-full shadow-2xs shrink-0 flex items-center gap-1">
                <CheckCircle2 size={11} /> รองรับ 100%
              </span>
            </div>

            {/* Mac & Windows PC */}
            <div 
              className="flex items-center justify-between p-3 rounded-xl border transition shadow-xs"
              style={{ 
                backgroundColor: VSCENE_CI.status.successBg, 
                borderColor: VSCENE_CI.status.successBorder 
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Monitor size={18} className="text-emerald-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Mac & Windows PC</div>
                  <div className="text-[11px] font-medium text-emerald-800">Chrome, Safari, Edge, Firefox</div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-full shadow-2xs shrink-0 flex items-center gap-1">
                <CheckCircle2 size={11} /> รองรับ 100%
              </span>
            </div>

            {/* Smartphones */}
            <div 
              className="flex items-center justify-between p-3 rounded-xl border transition shadow-xs opacity-90"
              style={{ 
                backgroundColor: VSCENE_CI.status.alertBg, 
                borderColor: VSCENE_CI.status.alertBorder 
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                  <Smartphone size={18} className="text-rose-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Smartphones (iPhone / Android)</div>
                  <div className="text-[11px] font-medium text-rose-800">ขนาดหน้าจอเล็กเกินไป</div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-rose-700 text-white px-2.5 py-1 rounded-full shadow-2xs shrink-0 flex items-center gap-1">
                <XCircle size={11} /> ไม่รองรับ
              </span>
            </div>
          </div>

          {/* Action Instruction */}
          <div className="text-xs text-slate-500 mb-5 flex items-center justify-center gap-2 font-medium">
            <RefreshCw size={14} className="animate-spin text-purple-600" />
            <span>กรุณาเปิดลิงก์นี้บน iPad, Mac หรือ PC</span>
          </div>

          {/* Force Desktop Mode Button (Matching V-SCENE CI Primary Pill Button) */}
          <button
            onClick={() => setBypass(true)}
            className="w-full py-3 px-5 text-white rounded-full text-xs font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 active:scale-98"
            style={{ 
              backgroundColor: VSCENE_CI.brand.primary,
            }}
          >
            <span>บังคับเข้าใช้งานเวอร์ชันเดสก์ท็อป (Force Desktop Mode)</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

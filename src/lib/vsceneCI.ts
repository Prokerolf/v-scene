/**
 * V-SCENE Official Corporate Identity (CI) & Design Tokens
 * 
 * Based on V-SCENE Medical Examination Platform visual guidelines:
 * - Primary Brand Color: Medical Plum / Magenta (#9E3B68 / #70384B)
 * - Secondary Accent: Soft Pink Tint (#FCE7F0) & Sky Blue (#BEE7F9)
 * - Canvas Background: Medical Light Slate (#FAF9FB / #F8FAFC)
 * - Surfaces: White cards (#FFFFFF) with soft rounded pill geometry
 */

export const VSCENE_CI = {
  brand: {
    logo: '#9E3B68',
    primary: '#70384B',
    primaryHover: '#5C2E3E',
    pinkAccent: '#FCE7F0',
    skyBlue: '#BEE7F9',
    skyBlueText: '#0369A1',
  },
  surface: {
    bg: '#FAF9FB',
    card: '#FFFFFF',
    border: '#F1F5F9',
    pinkBorder: '#F3E8EE',
  },
  status: {
    successBg: '#E6F4EA',
    successBorder: '#A7F3D0',
    successText: '#15803D',
    successBadge: '#166534',
    
    alertBg: '#FFE4E6',
    alertBorder: '#FECDD3',
    alertText: '#991B1B',
    alertBadge: '#DC2626',
    
    warningBg: '#FEF3C7',
    warningBorder: '#FDE68A',
    warningText: '#B45309',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
  },
  radius: {
    pill: '9999px',
    card: '1.5rem',
  }
};

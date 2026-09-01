import { ThemeMode } from '../types';

export interface ThemeDefinition {
  id: ThemeMode;
  name: string;
  categoryLabel: string;
  description: string;
  emoji: string;
  previewBg: string;
  previewBorder: string;
  previewText: string;
  accentColor: string;
  
  // Layout tokens
  bodyClass: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  
  // Search input tokens
  searchBg: string;
  searchBorder: string;
  searchFocus: string;
  searchPlaceholder: string;
  
  // Summary button
  summaryBtn: string;
  
  // Inquiries / Prompts button
  promptsBtn: string;

  // Music toggle button in header
  musicBtn: string;
  
  // Theme switcher trigger
  themeToggleBtn: string;
  
  // User profile button & dropdown
  userBtn: string;
  dropdownBg: string;
  dropdownBorder: string;
  
  // Feed & filter tokens
  feedText: string;
  filterBarBg: string;
  filterBarBorder: string;
  dateBadgeBg: string;
  dateBadgeText: string;
  dateBadgeBorder: string;
  dividerColor: string;
  
  // Journal entry card tokens
  cardUserBg: string;
  cardAiBg: string;
  cardUserBorder: string;
  cardAiBorder: string;
  cardAiLeftBorder: string;
  cardUserText: string;
  cardAiText: string;
  authorUserText: string;
  authorAiText: string;
  aiBadge: string;
  tagBadge: string;
  
  // Input composer tokens
  composerBg: string;
  composerBorder: string;
  composerInnerBg: string;
  composerInnerBorder: string;
  composerInnerText: string;
  composerPlaceholder: string;
  sendBtnActive: string;
  sendBtnInactive: string;
  moodBtnActive: string;
  moodBtnInactive: string;
  tagBarBg: string;
  tagBarBorder: string;
  
  // Stable Vertical Music Bar tokens
  verticalMusicWidgetBg: string;
  verticalMusicWidgetBorder: string;
  verticalMusicWidgetText: string;

  // Reflecting AI loader
  aiLoaderCard: string;
  aiLoaderIcon: string;

  // Sidebar tokens (Opaque, Solid, Non-transparent)
  sidebarBg: string;
  sidebarBorder: string;
  sidebarCardBg: string;
  sidebarActiveSession: string;
  buttonPrimary: string;
}

export const THEMES: Record<ThemeMode, ThemeDefinition> = {
  'teal-quill': {
    id: 'teal-quill',
    name: 'Teal Quill',
    categoryLabel: 'Teal & Quill',
    description: 'Serene deep teal, crisp editorial slate, and calm sanctuary tones matching your quill logo',
    emoji: '🪶',
    previewBg: '#EAF6F3',
    previewBorder: '#9FD3CB',
    previewText: '#064E52',
    accentColor: '#0F766E',
    
    bodyClass: 'bg-[#F2FAF7] text-[#0A3D39]',
    headerBg: 'bg-[#E3F4EF] border-b border-[#A6DCD1] text-[#073F3A] shadow-xs backdrop-blur-md',
    headerBorder: 'border-[#A6DCD1]',
    headerText: 'text-[#073F3A]',
    
    searchBg: 'bg-white text-[#073F3A]',
    searchBorder: 'border-[#9FD3CB]',
    searchFocus: 'focus:bg-white focus:border-[#0D746B] focus:ring-2 focus:ring-[#0D746B]/20',
    searchPlaceholder: 'placeholder:text-[#4F8B83]',
    
    summaryBtn: 'bg-[#0D746B] hover:bg-[#095851] text-white border-[#095851] shadow-xs font-semibold',
    promptsBtn: 'bg-[#D2EDE6] hover:bg-[#BEE5DC] text-[#074742] border-[#9FD3CB] font-medium',
    musicBtn: 'bg-[#D2EDE6] hover:bg-[#BEE5DC] text-[#074742] border-[#9FD3CB] font-medium',
    themeToggleBtn: 'bg-[#D2EDE6] hover:bg-[#BEE5DC] text-[#074742] border-[#9FD3CB] font-medium',
    
    userBtn: 'bg-white hover:bg-[#E8F6F2] border-[#9FD3CB] text-[#073F3A] shadow-2xs',
    dropdownBg: 'bg-[#F0FAF7]/98 backdrop-blur-xl text-[#073F3A]',
    dropdownBorder: 'border-[#A6DCD1]',
    
    feedText: 'text-[#073F3A]',
    filterBarBg: 'bg-[#E4F4EF] backdrop-blur-md text-[#073F3A]',
    filterBarBorder: 'border-[#A6DCD1]',
    dateBadgeBg: 'bg-[#D7EFE9] backdrop-blur-sm',
    dateBadgeText: 'text-[#074742] font-semibold',
    dateBadgeBorder: 'border-[#9FD3CB]',
    dividerColor: 'bg-[#BFE5DD]',
    
    cardUserBg: 'bg-white shadow-xs',
    cardAiBg: 'bg-[#EBF7F4] shadow-2xs',
    cardUserBorder: 'border border-[#BBE4DC]',
    cardAiBorder: 'border-t border-r border-b border-[#A6DCD1]',
    cardAiLeftBorder: 'border-l-4 border-l-[#0D746B]',
    cardUserText: 'text-[#073F3A]',
    cardAiText: 'text-[#083531]',
    authorUserText: 'text-[#073F3A]',
    authorAiText: 'text-[#0D746B] font-bold',
    aiBadge: 'bg-[#D0EDE6] text-[#074742] border-[#9FD3CB]',
    tagBadge: 'bg-[#DDF2EC] hover:bg-[#CEEBE3] text-[#074742] border-[#A8DDD3]',
    
    composerBg: 'bg-[#E4F4EF]/95 backdrop-blur-md text-[#073F3A]',
    composerBorder: 'border-[#A6DCD1]',
    composerInnerBg: 'bg-white shadow-sm',
    composerInnerBorder: 'border-[#A6DCD1] focus-within:border-[#0D746B] focus-within:ring-2 focus-within:ring-[#0D746B]/20',
    composerInnerText: 'text-[#073F3A]',
    composerPlaceholder: 'placeholder:text-[#5E978F]',
    sendBtnActive: 'bg-[#0D746B] hover:bg-[#095851] text-white font-semibold',
    sendBtnInactive: 'bg-[#D7ECE6] text-[#78ABA2]',
    moodBtnActive: 'bg-[#0D746B] text-white border-[#0D746B] font-semibold ring-2 ring-[#0D746B]/30 shadow-xs',
    moodBtnInactive: 'bg-[#E1F3EE] hover:bg-[#D0EDE5] text-[#074742] border-[#A6DCD1]',
    tagBarBg: 'bg-[#EBF7F4] backdrop-blur-md shadow-xs',
    tagBarBorder: 'border-[#A6DCD1]',
    
    verticalMusicWidgetBg: 'bg-[#E3F4EF]/98 backdrop-blur-xl text-[#073F3A]',
    verticalMusicWidgetBorder: 'border-[#9FD3CB] shadow-xl shadow-teal-950/10',
    verticalMusicWidgetText: 'text-[#073F3A]',

    aiLoaderCard: 'bg-[#EBF7F4] border-[#A6DCD1] text-[#073F3A] shadow-xs',
    aiLoaderIcon: 'bg-[#D0EDE6] text-[#0D746B] border border-[#9FD3CB]',

    // Solid Non-transparent Sidebar styling
    sidebarBg: 'bg-[#E6F3EF] border-r border-[#A6DCD1] text-[#073F3A]',
    sidebarBorder: 'border-[#A6DCD1]',
    sidebarCardBg: 'bg-[#D8EDE7] border-[#A6DCD1]',
    sidebarActiveSession: 'bg-white border-[#9FD3CB] shadow-xs text-[#064E52]',
    buttonPrimary: 'bg-[#0D746B] hover:bg-[#095851] text-white border-[#095851]',
  },

  'peaceful-sage': {
    id: 'peaceful-sage',
    name: 'Peaceful Sage',
    categoryLabel: 'Peaceful Sage',
    description: 'Grounding earthy sage green and calming sanctuary tones',
    emoji: '🌿',
    previewBg: '#E8F2E6',
    previewBorder: '#B1CFAC',
    previewText: '#18381C',
    accentColor: '#2D5E34',
    
    bodyClass: 'bg-[#EFF6EE] text-[#193B1E]',
    headerBg: 'bg-[#E1EFE0] border-b border-[#AED2AC] text-[#16361A] shadow-xs backdrop-blur-md',
    headerBorder: 'border-[#AED2AC]',
    headerText: 'text-[#16361A]',
    
    searchBg: 'bg-white text-[#16361A]',
    searchBorder: 'border-[#A6CCA4]',
    searchFocus: 'focus:bg-white focus:border-[#2A5731] focus:ring-2 focus:ring-[#2A5731]/20',
    searchPlaceholder: 'placeholder:text-[#587E5C]',
    
    summaryBtn: 'bg-[#2A5731] hover:bg-[#1E4324] text-white border-[#1E4324] shadow-xs font-semibold',
    promptsBtn: 'bg-[#D3E8D1] hover:bg-[#C2E0C0] text-[#173A1B] border-[#A6CCA4] font-medium',
    musicBtn: 'bg-[#D3E8D1] hover:bg-[#C2E0C0] text-[#173A1B] border-[#A6CCA4] font-medium',
    themeToggleBtn: 'bg-[#D3E8D1] hover:bg-[#C2E0C0] text-[#173A1B] border-[#A6CCA4] font-medium',
    
    userBtn: 'bg-white hover:bg-[#EAF4E8] border-[#A6CCA4] text-[#16361A] shadow-2xs',
    dropdownBg: 'bg-[#EEF7EC]/98 backdrop-blur-xl text-[#16361A]',
    dropdownBorder: 'border-[#AED2AC]',
    
    feedText: 'text-[#16361A]',
    filterBarBg: 'bg-[#E2EFE0] backdrop-blur-md text-[#16361A]',
    filterBarBorder: 'border-[#AED2AC]',
    dateBadgeBg: 'bg-[#D6EAD3] backdrop-blur-sm',
    dateBadgeText: 'text-[#173A1B] font-semibold',
    dateBadgeBorder: 'border-[#A6CCA4]',
    dividerColor: 'bg-[#C3DEC1]',
    
    cardUserBg: 'bg-white shadow-xs',
    cardAiBg: 'bg-[#EAF5E8] shadow-2xs',
    cardUserBorder: 'border border-[#C0DDC0]',
    cardAiBorder: 'border-t border-r border-b border-[#AED2AC]',
    cardAiLeftBorder: 'border-l-4 border-l-[#2A5731]',
    cardUserText: 'text-[#16361A]',
    cardAiText: 'text-[#163519]',
    authorUserText: 'text-[#16361A]',
    authorAiText: 'text-[#2A5731] font-bold',
    aiBadge: 'bg-[#D0E7CE] text-[#173A1B] border-[#A6CCA4]',
    tagBadge: 'bg-[#DCEEE8] hover:bg-[#CCE5DC] text-[#173A1B] border-[#AED2AC]',
    
    composerBg: 'bg-[#E1EFE0]/95 backdrop-blur-md text-[#16361A]',
    composerBorder: 'border-[#AED2AC]',
    composerInnerBg: 'bg-white shadow-sm',
    composerInnerBorder: 'border-[#AED2AC] focus-within:border-[#2A5731] focus-within:ring-2 focus-within:ring-[#2A5731]/20',
    composerInnerText: 'text-[#16361A]',
    composerPlaceholder: 'placeholder:text-[#5E8863]',
    sendBtnActive: 'bg-[#2A5731] hover:bg-[#1E4324] text-white font-semibold',
    sendBtnInactive: 'bg-[#D7E9D5] text-[#7A9E7D]',
    moodBtnActive: 'bg-[#2A5731] text-white border-[#2A5731] font-semibold ring-2 ring-[#2A5731]/30 shadow-xs',
    moodBtnInactive: 'bg-[#E0EFE0] hover:bg-[#CFE8CE] text-[#173A1B] border-[#AED2AC]',
    tagBarBg: 'bg-[#EAF5E8] backdrop-blur-md shadow-xs',
    tagBarBorder: 'border-[#AED2AC]',
    
    verticalMusicWidgetBg: 'bg-[#E1EFE0]/98 backdrop-blur-xl text-[#16361A]',
    verticalMusicWidgetBorder: 'border-[#A6CCA4] shadow-xl shadow-green-950/10',
    verticalMusicWidgetText: 'text-[#16361A]',

    aiLoaderCard: 'bg-[#EAF5E8] border-[#AED2AC] text-[#16361A] shadow-xs',
    aiLoaderIcon: 'bg-[#D0E7CE] text-[#2A5731] border border-[#A6CCA4]',

    // Solid Non-transparent Sidebar styling
    sidebarBg: 'bg-[#E4EFE2] border-r border-[#AED2AC] text-[#16361A]',
    sidebarBorder: 'border-[#AED2AC]',
    sidebarCardBg: 'bg-[#D6E8D3] border-[#AED2AC]',
    sidebarActiveSession: 'bg-white border-[#A6CCA4] shadow-xs text-[#173A1B]',
    buttonPrimary: 'bg-[#2A5731] hover:bg-[#1E4324] text-white border-[#1E4324]',
  },

  'midnight-black': {
    id: 'midnight-black',
    name: 'Midnight Black',
    categoryLabel: 'Midnight Sanctuary',
    description: 'Deep indigo midnight mode with clean sapphire contrast',
    emoji: '🌑',
    previewBg: '#0F172A',
    previewBorder: '#1E293B',
    previewText: '#F8FAFC',
    accentColor: '#6366F1',
    
    bodyClass: 'bg-[#0B1120] text-slate-100',
    headerBg: 'bg-[#0F172A]/90 border-b border-[#1E293B] text-slate-100 shadow-sm backdrop-blur-md',
    headerBorder: 'border-[#1E293B]',
    headerText: 'text-slate-100',
    
    searchBg: 'bg-[#131C31] text-slate-100',
    searchBorder: 'border-[#1E293B]',
    searchFocus: 'focus:bg-[#131C31] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25',
    searchPlaceholder: 'placeholder:text-slate-400',
    
    summaryBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-sm font-semibold',
    promptsBtn: 'bg-[#1E293B] hover:bg-[#27354A] text-slate-200 border-[#334155] font-medium',
    musicBtn: 'bg-[#1E293B] hover:bg-[#27354A] text-emerald-300 border-[#334155] font-medium',
    themeToggleBtn: 'bg-[#1E293B] hover:bg-[#27354A] text-slate-200 border-[#334155] font-medium',
    
    userBtn: 'bg-[#131C31] hover:bg-[#1E293B] border-[#1E293B] text-slate-200 shadow-sm',
    dropdownBg: 'bg-[#0F172A]/98 backdrop-blur-xl text-slate-100',
    dropdownBorder: 'border-[#1E293B]',
    
    feedText: 'text-slate-100',
    filterBarBg: 'bg-[#131C31] backdrop-blur-md text-slate-200',
    filterBarBorder: 'border-[#1E293B]',
    dateBadgeBg: 'bg-[#1E293B] backdrop-blur-sm',
    dateBadgeText: 'text-indigo-300 font-semibold',
    dateBadgeBorder: 'border-[#334155]',
    dividerColor: 'bg-[#1E293B]',
    
    cardUserBg: 'bg-[#131C31]/90',
    cardAiBg: 'bg-[#0F172A]/90',
    cardUserBorder: 'border border-[#1E293B]',
    cardAiBorder: 'border-t border-r border-b border-[#1E293B]',
    cardAiLeftBorder: 'border-l-4 border-l-indigo-500',
    cardUserText: 'text-slate-100',
    cardAiText: 'text-slate-200',
    authorUserText: 'text-slate-200',
    authorAiText: 'text-indigo-400 font-bold',
    aiBadge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    tagBadge: 'bg-[#1E293B]/80 hover:bg-[#27354A] text-slate-300 border-[#334155]',
    
    composerBg: 'bg-[#0F172A]/95 backdrop-blur-md text-slate-100',
    composerBorder: 'border-[#1E293B]',
    composerInnerBg: 'bg-[#131C31] shadow-sm',
    composerInnerBorder: 'border-[#1E293B] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/25',
    composerInnerText: 'text-slate-100',
    composerPlaceholder: 'placeholder:text-slate-400',
    sendBtnActive: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold',
    sendBtnInactive: 'bg-[#1E293B] text-slate-500',
    moodBtnActive: 'bg-indigo-600 text-white border-indigo-500 font-semibold ring-2 ring-indigo-500/40 shadow-sm',
    moodBtnInactive: 'bg-[#131C31] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]',
    tagBarBg: 'bg-[#0F172A] backdrop-blur-md',
    tagBarBorder: 'border-[#1E293B]',
    
    verticalMusicWidgetBg: 'bg-[#0F172A]/98 backdrop-blur-xl text-slate-100',
    verticalMusicWidgetBorder: 'border-[#1E293B] shadow-xl shadow-black/60',
    verticalMusicWidgetText: 'text-slate-100',

    aiLoaderCard: 'bg-[#131C31] border-[#1E293B] text-slate-200',
    aiLoaderIcon: 'bg-[#1E293B] text-indigo-300 border border-[#334155]',

    // Solid Non-transparent Sidebar styling
    sidebarBg: 'bg-[#0F172A] border-r border-[#1E293B] text-slate-100',
    sidebarBorder: 'border-[#1E293B]',
    sidebarCardBg: 'bg-[#131C31] border-[#1E293B]',
    sidebarActiveSession: 'bg-[#1E293B] border-indigo-500/40 shadow-sm text-indigo-300',
    buttonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500',
  },

  'clean-white': {
    id: 'clean-white',
    name: 'Clean White',
    categoryLabel: 'Crisp Sapphire',
    description: 'Crisp minimalist light layout with refined sapphire balance',
    emoji: '⚪',
    previewBg: '#EEF4FA',
    previewBorder: '#B2C7DE',
    previewText: '#0B2035',
    accentColor: '#1A436E',
    
    bodyClass: 'bg-[#F4F7FB] text-[#0B2035]',
    headerBg: 'bg-[#E6EFF7] border-b border-[#B8CCE0] text-[#0B2035] shadow-xs backdrop-blur-md',
    headerBorder: 'border-[#B8CCE0]',
    headerText: 'text-[#0B2035]',
    
    searchBg: 'bg-white text-[#0B2035]',
    searchBorder: 'border-[#ADC3D9]',
    searchFocus: 'focus:bg-white focus:border-[#1A436E] focus:ring-2 focus:ring-[#1A436E]/20',
    searchPlaceholder: 'placeholder:text-[#527092]',
    
    summaryBtn: 'bg-[#1A436E] hover:bg-[#123152] text-white border-[#123152] shadow-xs font-semibold',
    promptsBtn: 'bg-[#D6E4F2] hover:bg-[#C5D8EB] text-[#0B2035] border-[#ADC3D9] font-medium',
    musicBtn: 'bg-[#D6E4F2] hover:bg-[#C5D8EB] text-[#0B2035] border-[#ADC3D9] font-medium',
    themeToggleBtn: 'bg-[#D6E4F2] hover:bg-[#C5D8EB] text-[#0B2035] border-[#ADC3D9] font-medium',
    
    userBtn: 'bg-white hover:bg-[#EBF2F9] border-[#ADC3D9] text-[#0B2035] shadow-2xs',
    dropdownBg: 'bg-[#F1F6FB]/98 backdrop-blur-xl text-[#0B2035]',
    dropdownBorder: 'border-[#B8CCE0]',
    
    feedText: 'text-[#0B2035]',
    filterBarBg: 'bg-[#E5EFF8] backdrop-blur-md text-[#0B2035]',
    filterBarBorder: 'border-[#B8CCE0]',
    dateBadgeBg: 'bg-[#DAE8F5] backdrop-blur-sm',
    dateBadgeText: 'text-[#0B2035] font-semibold',
    dateBadgeBorder: 'border-[#ADC3D9]',
    dividerColor: 'bg-[#C7D9EC]',
    
    cardUserBg: 'bg-white shadow-xs',
    cardAiBg: 'bg-[#EDF4FA] shadow-2xs',
    cardUserBorder: 'border border-[#C3D6E8]',
    cardAiBorder: 'border-t border-r border-b border-[#B8CCE0]',
    cardAiLeftBorder: 'border-l-4 border-l-[#1A436E]',
    cardUserText: 'text-[#0B2035]',
    cardAiText: 'text-[#0C2238]',
    authorUserText: 'text-[#0B2035]',
    authorAiText: 'text-[#1A436E] font-bold',
    aiBadge: 'bg-[#D2E3F2] text-[#0B2035] border-[#ADC3D9]',
    tagBadge: 'bg-[#DCE8F5] hover:bg-[#CDDDF0] text-[#0B2035] border-[#B6CAE0]',
    
    composerBg: 'bg-[#E6EFF7]/95 backdrop-blur-md text-[#0B2035]',
    composerBorder: 'border-[#B8CCE0]',
    composerInnerBg: 'bg-white shadow-sm',
    composerInnerBorder: 'border-[#B8CCE0] focus-within:border-[#1A436E] focus-within:ring-2 focus-within:ring-[#1A436E]/20',
    composerInnerText: 'text-[#0B2035]',
    composerPlaceholder: 'placeholder:text-[#5B799C]',
    sendBtnActive: 'bg-[#1A436E] hover:bg-[#123152] text-white font-semibold',
    sendBtnInactive: 'bg-[#D8E6F3] text-[#7E9DBF]',
    moodBtnActive: 'bg-[#1A436E] text-white border-[#1A436E] font-semibold ring-2 ring-[#1A436E]/30 shadow-xs',
    moodBtnInactive: 'bg-[#DFECF7] hover:bg-[#CFE1F0] text-[#0B2035] border-[#B8CCE0]',
    tagBarBg: 'bg-[#EDF4FA] backdrop-blur-md shadow-xs',
    tagBarBorder: 'border-[#B8CCE0]',
    
    verticalMusicWidgetBg: 'bg-[#E6EFF7]/98 backdrop-blur-xl text-[#0B2035]',
    verticalMusicWidgetBorder: 'border-[#ADC3D9] shadow-xl shadow-blue-950/10',
    verticalMusicWidgetText: 'text-[#0B2035]',

    aiLoaderCard: 'bg-white border-[#B8CCE0] text-[#0B2035] shadow-xs',
    aiLoaderIcon: 'bg-[#D6E4F2] text-[#1A436E] border border-[#ADC3D9]',

    // Solid Non-transparent Sidebar styling
    sidebarBg: 'bg-[#E7EFF7] border-r border-[#B8CCE0] text-[#0B2035]',
    sidebarBorder: 'border-[#B8CCE0]',
    sidebarCardBg: 'bg-[#D9E6F3] border-[#B8CCE0]',
    sidebarActiveSession: 'bg-white border-[#B8CCE0] shadow-xs text-[#0B2035]',
    buttonPrimary: 'bg-[#1A436E] hover:bg-[#123152] text-white border-[#123152]',
  },
};


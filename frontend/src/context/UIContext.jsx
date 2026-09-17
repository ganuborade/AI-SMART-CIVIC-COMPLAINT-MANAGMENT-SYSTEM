import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext(null);

export const TRANSLATIONS = {
  en: {
    // Brand & Nav
    appName: 'CivicAI',
    appPulse: 'Pulse',
    aiPowered: 'AI Powered',
    signIn: 'Sign In',
    register: 'Register',
    citizenRegister: 'Register',
    logout: 'Log Out',
    activityAlerts: 'Activity Alerts',
    noAlerts: 'No notifications yet.',
    inspectComplaint: 'Inspect Complaint',
    reportProblem: 'Report Civic Issue',
    welcomeBack: 'Welcome back',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    language: 'Language',
    
    // Roles
    citizen: 'Citizen',
    employee: 'Municipal Officer',
    admin: 'Administrator',
    
    // KPIs
    totalReported: 'Total Reported',
    pendingReview: 'Pending Review',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    allTimeIssues: 'All time filed issues',
    underAiTriage: 'Under AI & Admin triage',
    fieldDispatched: 'Field officers dispatched',
    fixedAndClosed: 'Successfully fixed & closed',
    
    // Tabs & Filters
    all: 'All',
    active: 'Active',
    searchPlaceholder: 'Search reports, landmarks, IDs...',
    allCategories: 'All Categories',
    allPriorities: 'All Priorities',
    allStatuses: 'All Statuses',
    
    // Categories
    ROAD_DAMAGE: 'Road Damage & Potholes',
    WATER_LEAKAGE: 'Water Supply & Leakage',
    STREET_LIGHT: 'Street Lights & Electricity',
    GARBAGE_WASTE: 'Solid Waste & Sanitation',
    DRAINAGE_OVERFLOW: 'Stormwater & Drainage',
    OTHER: 'Other Municipal Issue',
    
    // Priorities
    LOW: 'Low Priority',
    MEDIUM: 'Medium Priority',
    HIGH: 'High Priority',
    CRITICAL: 'Emergency / Critical',
    
    // Statuses
    SUBMITTED: 'Submitted',
    AI_ANALYZED: 'AI Analyzed',
    UNDER_REVIEW: 'Under Review',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',

    // Tables
    tableId: 'ID',
    tableTitle: 'Issue Title',
    tableCategory: 'Category',
    tablePriority: 'Priority',
    tableLocation: 'Location / Landmark',
    tableStatus: 'Status',
    tableDate: 'Reported Date',
    tableAction: 'Action',
    viewDetails: 'View Details',
    startWork: 'Start Work',
    markResolved: 'Upload Proof & Resolve',
    
    // Registration Form
    accountType: 'Select Account Role',
    citizenAccount: 'Citizen (Public User)',
    employeeAccount: 'Municipal Staff / Officer',
    adminAccount: 'System Administrator',
    staffSecretKey: 'Municipal Staff Security Passkey',
    staffKeyPlaceholder: 'Enter staff authorization passkey (STAFF@2026)',
    adminSecretKey: 'Administrator Security Passkey',
    adminKeyPlaceholder: 'Enter admin authorization passkey (ADMIN@2026)',
    selectDept: 'Select Municipal Department',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Mobile Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    
    // Real-Time GPS
    detectingGps: 'Detecting live satellite GPS...',
    gpsLocked: 'Real-Time GPS Locked',
    liveCoords: 'Live Coordinates',
    capturedAt: 'Captured At',
    reverseGeocoded: 'Live Verified Address',
    dropPinHint: 'Click anywhere on the interactive map to fine-tune issue location',
    autoGpsBtn: 'Live GPS Auto-Detect'
  },
  
  hi: {
    // Brand & Nav
    appName: 'सिविक एआई',
    appPulse: 'पल्स',
    aiPowered: 'एआई संचालित',
    signIn: 'लॉग इन करें',
    register: 'पंजीकरण',
    citizenRegister: 'रजिस्टर करें',
    logout: 'लॉग आउट',
    activityAlerts: 'गतिविधि सूचनाएं',
    noAlerts: 'कोई सूचना नहीं है।',
    inspectComplaint: 'शिकायत देखें',
    reportProblem: 'नागरिक समस्या दर्ज करें',
    welcomeBack: 'स्वागत है',
    themeDark: 'डार्क मोड',
    themeLight: 'लाइट मोड',
    language: 'भाषा',
    
    // Roles
    citizen: 'नागरिक',
    employee: 'नगरपालिका अधिकारी',
    admin: 'प्रशासक',
    
    // KPIs
    totalReported: 'कुल दर्ज शिकायतें',
    pendingReview: 'समीक्षाधीन',
    inProgress: 'प्रगति पर है',
    resolved: 'समाधान हो चुका',
    allTimeIssues: 'अब तक की कुल समस्याएं',
    underAiTriage: 'एआई व प्रशासन द्वारा जांच',
    fieldDispatched: 'क्षेत्रीय कर्मचारी कार्यरत',
    fixedAndClosed: 'सफलतापूर्वक दुरुस्त',
    
    // Tabs & Filters
    all: 'सभी',
    active: 'सक्रिय',
    searchPlaceholder: 'शिकायत, पता, आईडी खोजें...',
    allCategories: 'सभी श्रेणियां',
    allPriorities: 'सभी प्राथमिकताएं',
    allStatuses: 'सभी स्थितियां',
    
    // Categories
    ROAD_DAMAGE: 'सड़क गड्ढे व मरम्मत',
    WATER_LEAKAGE: 'जल आपूर्ति व पाइप रिसाव',
    STREET_LIGHT: 'स्ट्रीट लाइट व बिजली',
    GARBAGE_WASTE: 'कचरा प्रबंधन व सफाई',
    DRAINAGE_OVERFLOW: 'नाली व जल निकासी',
    OTHER: 'अन्य नागरिक समस्या',
    
    // Priorities
    LOW: 'निम्न प्राथमिकता',
    MEDIUM: 'मध्यम प्राथमिकता',
    HIGH: 'उच्च प्राथमिकता',
    CRITICAL: 'आपातकालीन / गंभीर',
    
    // Statuses
    SUBMITTED: 'दर्ज की गई',
    AI_ANALYZED: 'एआई विश्लेषण पूरा',
    UNDER_REVIEW: 'जांच जारी',
    ASSIGNED: 'अधिकारी को सौंपा गया',
    IN_PROGRESS: 'काम चालू है',
    RESOLVED: 'निराकरण संपन्न',
    CLOSED: 'बंद',
    REJECTED: 'अस्वीकृत',

    // Tables
    tableId: 'आईडी',
    tableTitle: 'समस्या का शीर्षक',
    tableCategory: 'श्रेणी',
    tablePriority: 'प्राथमिकता',
    tableLocation: 'स्थान / लैंडमार्क',
    tableStatus: 'स्थिति',
    tableDate: 'दर्ज तिथि',
    tableAction: 'कार्रवाई',
    viewDetails: 'विवरण देखें',
    startWork: 'काम शुरू करें',
    markResolved: 'सबूत अपलोड कर बंद करें',
    
    // Registration Form
    accountType: 'खाता प्रकार चुनें',
    citizenAccount: 'नागरिक खाता (आम जनता)',
    employeeAccount: 'नगरपालिका कर्मचारी / अधिकारी',
    adminAccount: 'सिस्टम प्रशासक (Admin)',
    staffSecretKey: 'कर्मचारी सुरक्षा पासकी (Passkey)',
    staffKeyPlaceholder: 'स्टाफ सुरक्षा पासकी डालें (STAFF@2026)',
    adminSecretKey: 'प्रशासक सुरक्षा पासकी (Passkey)',
    adminKeyPlaceholder: 'एडमिन सुरक्षा पासकी डालें (ADMIN@2026)',
    selectDept: 'नगरपालिका विभाग चुनें',
    fullName: 'पूरा नाम',
    emailAddress: 'ईमेल पता',
    phoneNumber: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    
    // Real-Time GPS
    detectingGps: 'उपग्रह द्वारा लाइव जीपीएस खोजा जा रहा है...',
    gpsLocked: 'रीयल-टाइम जीपीएस लॉक',
    liveCoords: 'लाइव निर्देशांक',
    capturedAt: 'दर्ज समय',
    reverseGeocoded: 'लाइव सत्यापित पता',
    dropPinHint: 'सटीक स्थान चुनने के लिए मानचित्र पर कहीं भी क्लिक करें',
    autoGpsBtn: 'लाइव जीपीएस ऑटो-डिटेक्ट'
  },
  
  mr: {
    // Brand & Nav
    appName: 'सिव्हिक एआय',
    appPulse: 'पल्स',
    aiPowered: 'एआय सक्षम',
    signIn: 'लॉगिन करा',
    register: 'नोंदणी करा',
    citizenRegister: 'नोंदणी करा',
    logout: 'लॉग आउट',
    activityAlerts: 'सूचना व अपडेट्स',
    noAlerts: 'कोणत्याही नवीन सूचना नाहीत.',
    inspectComplaint: 'तक्रार पहा',
    reportProblem: 'नागरी तक्रार नोंदवा',
    welcomeBack: 'स्वागत आहे',
    themeDark: 'डार्क थीम',
    themeLight: 'लाइट थीम',
    language: 'भाषा',
    
    // Roles
    citizen: 'नागरिक',
    employee: 'महापालिका अधिकारी',
    admin: 'मुख्य प्रशासक',
    
    // KPIs
    totalReported: 'एकूण नोंदवलेल्या तक्रारी',
    pendingReview: 'तपासणी सुरू',
    inProgress: 'दुरुस्ती चालू आहे',
    resolved: 'तक्रार निवारण पूर्ण',
    allTimeIssues: 'आतापर्यंत दाखल समस्या',
    underAiTriage: 'एआय व अधिकाऱ्यांद्वारे वर्गीकरण',
    fieldDispatched: 'प्रत्यक्ष जागेवर काम सुरू',
    fixedAndClosed: 'यशस्वीरीत्या दुरुस्त व बंद',
    
    // Tabs & Filters
    all: 'सर्व',
    active: 'सक्रिय',
    searchPlaceholder: 'तक्रार, ठिकाण किंवा आयडी शोधा...',
    allCategories: 'सर्व वर्गवारी',
    allPriorities: 'सर्व प्राधान्यक्रम',
    allStatuses: 'सर्व स्थिती',
    
    // Categories
    ROAD_DAMAGE: 'खड्डे व रस्ता दुरुस्ती',
    WATER_LEAKAGE: 'पाणी पुरवठा व गळती',
    STREET_LIGHT: 'रस्त्यावरील दिवे व वीज',
    GARBAGE_WASTE: 'कचरा व्यवस्थापन व स्वच्छता',
    DRAINAGE_OVERFLOW: 'गटारे व सांडपाणी निचरा',
    OTHER: 'इतर नागरी समस्या',
    
    // Priorities
    LOW: 'सामान्य',
    MEDIUM: 'मध्यम',
    HIGH: 'तातडीचे',
    CRITICAL: 'अति-तातडीचे / आणीबाणी',
    
    // Statuses
    SUBMITTED: 'दाखल केली',
    AI_ANALYZED: 'एआय विश्लेषण पूर्ण',
    UNDER_REVIEW: 'पुनरावलोकन चालू',
    ASSIGNED: 'अधिकाऱ्याकडे नियुक्त',
    IN_PROGRESS: 'काम सुरू झाले आहे',
    RESOLVED: 'निवारण पूर्ण झाले',
    CLOSED: 'बंद',
    REJECTED: 'नाकारली',

    // Tables
    tableId: 'क्रमांक',
    tableTitle: 'समस्येचे नाव',
    tableCategory: 'विभाग / वर्गवारी',
    tablePriority: 'प्राधान्य',
    tableLocation: 'पत्ता व ठिकाण',
    tableStatus: 'स्थिती',
    tableDate: 'नोंदणी तारीख',
    tableAction: 'कृती',
    viewDetails: 'सविस्तर पहा',
    startWork: 'काम सुरू करा',
    markResolved: 'पुरावा फोटो जोडून पूर्ण करा',
    
    // Registration Form
    accountType: 'खात्याचा प्रकार निवडा',
    citizenAccount: 'नागरिक खाते (सर्वसामान्य जनता)',
    employeeAccount: 'महापालिका कर्मचारी / अधिकारी',
    adminAccount: 'सिस्टम प्रशासक (Admin)',
    staffSecretKey: 'कर्मचारी सुरक्षा पासकी (Passkey)',
    staffKeyPlaceholder: 'कर्मचारी गुप्त पासकी टाका (STAFF@2026)',
    adminSecretKey: 'प्रशासक सुरक्षा पासकी (Passkey)',
    adminKeyPlaceholder: 'प्रशासक गुप्त पासकी टाका (ADMIN@2026)',
    selectDept: 'महापालिका विभाग निवडा',
    fullName: 'पूर्ण नाव',
    emailAddress: 'ईमेल पत्ता',
    phoneNumber: 'मोबाईल नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड पुन्हा टाका',
    
    // Real-Time GPS
    detectingGps: 'उपग्रहाद्वारे थेट जीपीएस स्थान शोधत आहे...',
    gpsLocked: 'थेट जीपीएस स्थान निश्चित झाले',
    liveCoords: 'थेट अक्षांश व रेखांश',
    capturedAt: 'नोंदणी वेळ',
    reverseGeocoded: 'थेट तपासलेला पत्ता',
    dropPinHint: 'नकाशावर कुठेही क्लिक करून अचूक ठिकाण निवडा',
    autoGpsBtn: 'थेट जीपीएस ऑटो-डिटेक्ट'
  }
};

export function UIProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('civic_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('civic_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('civic_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('civic_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <UIContext.Provider value={{ language, setLanguage, theme, toggleTheme, t }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

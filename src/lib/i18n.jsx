import { createContext, useContext, useState, useCallback } from 'react'

const LANG_KEY = 'kc_language'

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
]

const dict = {
  en: {
    'nav.home': 'Home',
    'nav.weather': 'Weather',
    'nav.mandi': 'Mandi',
    'nav.motor': 'Motor',
    'nav.more': 'More',

    'login.tagline': 'Your complete farming companion',
    'login.loginTitle': 'Login to continue',
    'login.loginSub': "We'll send a one-time password to verify your number",
    'login.mobileLabel': 'Mobile Number',
    'login.sendOtp': 'Send OTP',
    'login.sendingOtp': 'Sending OTP…',
    'login.terms': "By continuing, you agree to KisanConnect's Terms of Service & Privacy Policy",
    'login.verifyTitle': 'Verify OTP',
    'login.verifyAuto': "it'll verify automatically",
    'login.verifying': 'Verifying…',
    'login.resendPrompt': "Didn't receive the code?",
    'login.resendAction': 'Resend OTP',
    'login.trust': 'Secure OTP login · Trusted by 50,000+ farmers',

    'home.quickAccess': 'Quick Access',
    'home.sprayAdvisory': "Today's Spray Advisory",

    'quick.weather': 'Weather',
    'quick.mandi': 'Mandi Prices',
    'quick.motor': 'Motor Control',
    'quick.calendar': 'Calendar',
    'quick.cropDoctor': 'Crop Doctor',
    'quick.marketplace': 'Marketplace',
    'quick.schemes': 'Govt Schemes',
    'quick.community': 'Community',

    'more.title': 'More',
    'more.subtitle': 'Explore all KisanConnect features',
    'more.calendar.label': 'Farming Calendar',
    'more.calendar.desc': 'Sowing, irrigation & harvest reminders',
    'more.cropDoctor.label': 'Crop Doctor (AI)',
    'more.cropDoctor.desc': 'Photo-based disease detection',
    'more.marketplace.label': 'Marketplace',
    'more.marketplace.desc': 'Buy & sell produce directly',
    'more.schemes.label': 'Govt Schemes',
    'more.schemes.desc': 'Subsidies & eligibility checker',
    'more.equipment.label': 'Equipment Rental',
    'more.equipment.desc': 'Tractors, harvesters & drones',
    'more.loans.label': 'Loans & Insurance',
    'more.loans.desc': 'Compare crop loan offers',
    'more.soilHealth.label': 'Soil Health Advisor',
    'more.soilHealth.desc': 'Soil report & fertilizer advice',
    'more.community.label': 'Community Forum',
    'more.community.desc': 'Q&A, experts & success stories',

    'profile.title': 'My Profile',
    'profile.farmSize': 'Farm Size',
    'profile.activeCrops': 'Active Crops',
    'profile.appLanguage': 'App Language',
    'profile.notifications': 'Notifications',
    'profile.darkMode': 'Dark Mode',
    'profile.helpSupport': 'Help & Support',
    'profile.logout': 'Log Out',
  },
  hi: {
    'nav.home': 'होम',
    'nav.weather': 'मौसम',
    'nav.mandi': 'मंडी',
    'nav.motor': 'मोटर',
    'nav.more': 'अधिक',

    'login.tagline': 'आपका संपूर्ण कृषि साथी',
    'login.loginTitle': 'जारी रखने के लिए लॉगिन करें',
    'login.loginSub': 'हम आपका नंबर सत्यापित करने के लिए एक बार का पासवर्ड भेजेंगे',
    'login.mobileLabel': 'मोबाइल नंबर',
    'login.sendOtp': 'OTP भेजें',
    'login.sendingOtp': 'OTP भेजा जा रहा है…',
    'login.terms': 'जारी रखकर, आप KisanConnect की सेवा की शर्तों और गोपनीयता नीति से सहमत होते हैं',
    'login.verifyTitle': 'OTP सत्यापित करें',
    'login.verifyAuto': 'यह स्वचालित रूप से सत्यापित हो जाएगा',
    'login.verifying': 'सत्यापित हो रहा है…',
    'login.resendPrompt': 'कोड नहीं मिला?',
    'login.resendAction': 'OTP पुनः भेजें',
    'login.trust': 'सुरक्षित OTP लॉगिन · 50,000+ किसानों का भरोसा',

    'home.quickAccess': 'त्वरित पहुंच',
    'home.sprayAdvisory': 'आज की स्प्रे सलाह',

    'quick.weather': 'मौसम',
    'quick.mandi': 'मंडी भाव',
    'quick.motor': 'मोटर नियंत्रण',
    'quick.calendar': 'कैलेंडर',
    'quick.cropDoctor': 'फसल चिकित्सक',
    'quick.marketplace': 'बाज़ार',
    'quick.schemes': 'सरकारी योजनाएं',
    'quick.community': 'समुदाय',

    'more.title': 'अधिक',
    'more.subtitle': 'KisanConnect की सभी सुविधाएं देखें',
    'more.calendar.label': 'खेती कैलेंडर',
    'more.calendar.desc': 'बुवाई, सिंचाई और कटाई अनुस्मारक',
    'more.cropDoctor.label': 'फसल चिकित्सक (AI)',
    'more.cropDoctor.desc': 'फोटो आधारित रोग पहचान',
    'more.marketplace.label': 'बाज़ार',
    'more.marketplace.desc': 'उपज सीधे खरीदें और बेचें',
    'more.schemes.label': 'सरकारी योजनाएं',
    'more.schemes.desc': 'सब्सिडी और पात्रता जांचकर्ता',
    'more.equipment.label': 'उपकरण किराया',
    'more.equipment.desc': 'ट्रैक्टर, हार्वेस्टर और ड्रोन',
    'more.loans.label': 'ऋण और बीमा',
    'more.loans.desc': 'फसल ऋण प्रस्तावों की तुलना करें',
    'more.soilHealth.label': 'मृदा स्वास्थ्य सलाहकार',
    'more.soilHealth.desc': 'मिट्टी रिपोर्ट और उर्वरक सलाह',
    'more.community.label': 'समुदाय मंच',
    'more.community.desc': 'प्रश्नोत्तर, विशेषज्ञ और सफलता की कहानियां',

    'profile.title': 'मेरी प्रोफाइल',
    'profile.farmSize': 'खेत का आकार',
    'profile.activeCrops': 'सक्रिय फसलें',
    'profile.appLanguage': 'ऐप भाषा',
    'profile.notifications': 'सूचनाएं',
    'profile.darkMode': 'डार्क मोड',
    'profile.helpSupport': 'सहायता और समर्थन',
    'profile.logout': 'लॉग आउट',
  },
  mr: {
    'nav.home': 'होम',
    'nav.weather': 'हवामान',
    'nav.mandi': 'बाजार',
    'nav.motor': 'मोटर',
    'nav.more': 'अधिक',

    'login.tagline': 'तुमचा संपूर्ण शेती साथी',
    'login.loginTitle': 'सुरू ठेवण्यासाठी लॉगिन करा',
    'login.loginSub': 'तुमचा नंबर सत्यापित करण्यासाठी आम्ही वन-टाइम पासवर्ड पाठवू',
    'login.mobileLabel': 'मोबाइल नंबर',
    'login.sendOtp': 'OTP पाठवा',
    'login.sendingOtp': 'OTP पाठवत आहे…',
    'login.terms': 'पुढे चालू ठेवून, तुम्ही KisanConnect च्या सेवा अटी आणि गोपनीयता धोरणाशी सहमत आहात',
    'login.verifyTitle': 'OTP सत्यापित करा',
    'login.verifyAuto': 'ते आपोआप सत्यापित होईल',
    'login.verifying': 'सत्यापित होत आहे…',
    'login.resendPrompt': 'कोड मिळाला नाही?',
    'login.resendAction': 'OTP पुन्हा पाठवा',
    'login.trust': 'सुरक्षित OTP लॉगिन · 50,000+ शेतकऱ्यांचा विश्वास',

    'home.quickAccess': 'जलद प्रवेश',
    'home.sprayAdvisory': 'आजचा फवारणी सल्ला',

    'quick.weather': 'हवामान',
    'quick.mandi': 'बाजार भाव',
    'quick.motor': 'मोटर नियंत्रण',
    'quick.calendar': 'दिनदर्शिका',
    'quick.cropDoctor': 'पीक डॉक्टर',
    'quick.marketplace': 'बाजारपेठ',
    'quick.schemes': 'सरकारी योजना',
    'quick.community': 'समुदाय',

    'more.title': 'अधिक',
    'more.subtitle': 'KisanConnect ची सर्व वैशिष्ट्ये पहा',
    'more.calendar.label': 'शेती दिनदर्शिका',
    'more.calendar.desc': 'पेरणी, सिंचन आणि कापणी स्मरणपत्रे',
    'more.cropDoctor.label': 'पीक डॉक्टर (AI)',
    'more.cropDoctor.desc': 'फोटो आधारित रोग ओळख',
    'more.marketplace.label': 'बाजारपेठ',
    'more.marketplace.desc': 'उत्पादन थेट खरेदी आणि विक्री करा',
    'more.schemes.label': 'सरकारी योजना',
    'more.schemes.desc': 'अनुदान आणि पात्रता तपासक',
    'more.equipment.label': 'उपकरण भाडे',
    'more.equipment.desc': 'ट्रॅक्टर, हार्वेस्टर आणि ड्रोन',
    'more.loans.label': 'कर्ज आणि विमा',
    'more.loans.desc': 'पीक कर्ज ऑफरची तुलना करा',
    'more.soilHealth.label': 'माती आरोग्य सल्लागार',
    'more.soilHealth.desc': 'माती अहवाल आणि खत सल्ला',
    'more.community.label': 'समुदाय मंच',
    'more.community.desc': 'प्रश्नोत्तरे, तज्ञ आणि यशोगाथा',

    'profile.title': 'माझी प्रोफाइल',
    'profile.farmSize': 'शेताचा आकार',
    'profile.activeCrops': 'सक्रिय पिके',
    'profile.appLanguage': 'अ‍ॅप भाषा',
    'profile.notifications': 'सूचना',
    'profile.darkMode': 'डार्क मोड',
    'profile.helpSupport': 'मदत आणि समर्थन',
    'profile.logout': 'लॉग आउट',
  },
  te: {
    'nav.home': 'హోమ్',
    'nav.weather': 'వాతావరణం',
    'nav.mandi': 'మార్కెట్',
    'nav.motor': 'మోటార్',
    'nav.more': 'మరిన్ని',

    'login.tagline': 'మీ సంపూర్ణ వ్యవసాయ సహచరుడు',
    'login.loginTitle': 'కొనసాగించడానికి లాగిన్ చేయండి',
    'login.loginSub': 'మీ నంబర్‌ను ధృవీకరించడానికి మేము వన్-టైమ్ పాస్‌వర్డ్ పంపుతాము',
    'login.mobileLabel': 'మొబైల్ నంబర్',
    'login.sendOtp': 'OTP పంపండి',
    'login.sendingOtp': 'OTP పంపుతోంది…',
    'login.terms': 'కొనసాగించడం ద్వారా, మీరు KisanConnect యొక్క సేవా నిబంధనలు & గోప్యతా విధానానికి అంగీకరిస్తున్నారు',
    'login.verifyTitle': 'OTPని ధృవీకరించండి',
    'login.verifyAuto': 'ఇది స్వయంచాలకంగా ధృవీకరించబడుతుంది',
    'login.verifying': 'ధృవీకరిస్తోంది…',
    'login.resendPrompt': 'కోడ్ రాలేదా?',
    'login.resendAction': 'OTPని మళ్లీ పంపండి',
    'login.trust': 'సురక్షిత OTP లాగిన్ · 50,000+ మంది రైతుల నమ్మకం',

    'home.quickAccess': 'త్వరిత యాక్సెస్',
    'home.sprayAdvisory': 'నేటి స్ప్రే సలహా',

    'quick.weather': 'వాతావరణం',
    'quick.mandi': 'మార్కెట్ ధరలు',
    'quick.motor': 'మోటార్ నియంత్రణ',
    'quick.calendar': 'క్యాలెండర్',
    'quick.cropDoctor': 'పంట వైద్యుడు',
    'quick.marketplace': 'మార్కెట్‌ప్లేస్',
    'quick.schemes': 'ప్రభుత్వ పథకాలు',
    'quick.community': 'సంఘం',

    'more.title': 'మరిన్ని',
    'more.subtitle': 'KisanConnect యొక్క అన్ని ఫీచర్‌లను అన్వేషించండి',
    'more.calendar.label': 'వ్యవసాయ క్యాలెండర్',
    'more.calendar.desc': 'విత్తడం, నీటిపారుదల & కోత రిమైండర్‌లు',
    'more.cropDoctor.label': 'పంట వైద్యుడు (AI)',
    'more.cropDoctor.desc': 'ఫోటో ఆధారిత వ్యాధి గుర్తింపు',
    'more.marketplace.label': 'మార్కెట్‌ప్లేస్',
    'more.marketplace.desc': 'పంటను నేరుగా కొనండి & అమ్మండి',
    'more.schemes.label': 'ప్రభుత్వ పథకాలు',
    'more.schemes.desc': 'సబ్సిడీలు & అర్హత చెకర్',
    'more.equipment.label': 'పరికరాల అద్దె',
    'more.equipment.desc': 'ట్రాక్టర్లు, హార్వెస్టర్లు & డ్రోన్‌లు',
    'more.loans.label': 'రుణాలు & బీమా',
    'more.loans.desc': 'పంట రుణ ఆఫర్‌లను పోల్చండి',
    'more.soilHealth.label': 'నేల ఆరోగ్య సలహాదారు',
    'more.soilHealth.desc': 'నేల నివేదిక & ఎరువుల సలహా',
    'more.community.label': 'కమ్యూనిటీ ఫోరమ్',
    'more.community.desc': 'ప్రశ్నోత్తరాలు, నిపుణులు & విజయ గాథలు',

    'profile.title': 'నా ప్రొఫైల్',
    'profile.farmSize': 'పొలం పరిమాణం',
    'profile.activeCrops': 'క్రియాశీల పంటలు',
    'profile.appLanguage': 'యాప్ భాష',
    'profile.notifications': 'నోటిఫికేషన్‌లు',
    'profile.darkMode': 'డార్క్ మోడ్',
    'profile.helpSupport': 'సహాయం & మద్దతు',
    'profile.logout': 'లాగ్ అవుట్',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return sessionStorage.getItem(LANG_KEY) || 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = useCallback((code) => {
    setLangState(code)
    try {
      sessionStorage.setItem(LANG_KEY, code)
    } catch {
      // storage unavailable — language still applies for this page load
    }
  }, [])

  const t = useCallback(
    (key) => dict[lang]?.[key] ?? dict.en[key] ?? key,
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

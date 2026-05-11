import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      "app_name": "HOB AI",
      "slogan": "عصر جديد من الذكاء الاصطناعي",
      "get_started": "ابدأ الآن",
      "chat": "محادثة",
      "features": "المميزات",
      "pricing": "الأسعار",
      "about": "من نحن",
      "settings": "الإعدادات",
      "dashboard": "لوحة التحكم",
      "login": "تسجيل الدخول",
      "signup": "إنشاء حساب",
      "ai_assistant": "مساعد الذكاء الاصطناعي",
      "type_message": "اكتب رسالتك هنا...",
      "streaming": "جارٍ جلب الرد...",
      "models": "الموديلات",
      "dark_mode": "الوضع الليلي",
      "light_mode": "الوضع النهاري",
      "language": "اللغة",
      "premium": "بريميوم",
      "free": "مجاني",
      "admin": "مسؤول",
      "logout": "تسجيل الخروج"
    }
  },
  en: {
    translation: {
      "app_name": "HOB AI",
      "slogan": "A New Era of Intelligence",
      "get_started": "Get Started",
      "chat": "Chat",
      "features": "Features",
      "pricing": "Pricing",
      "about": "About",
      "settings": "Settings",
      "dashboard": "Dashboard",
      "login": "Login",
      "signup": "Sign Up",
      "ai_assistant": "AI Assistant",
      "type_message": "Type your message here...",
      "streaming": "Streaming response...",
      "models": "Models",
      "dark_mode": "Dark Mode",
      "light_mode": "Light Mode",
      "language": "Language",
      "premium": "Premium",
      "free": "Free",
      "admin": "Admin",
      "logout": "Logout"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;

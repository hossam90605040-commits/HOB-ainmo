import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Globe, 
  Shield, 
  Zap, 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  ArrowRight,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const features = [
    { icon: <MessageSquare className="w-6 h-6 text-cyan-400" />, title_key: "chat", desc_ar: "نظام دردشة ذكي يدعم استجابات فورية ومعالجة لغوية متقدمة.", desc_en: "Advanced AI chat system with streaming responses." },
    { icon: <ImageIcon className="w-6 h-6 text-purple-400" />, title_key: "images", title_ar: "توليد الصور", title_en: "Image Generation", desc_ar: "أنشئ صوراً مذهلة من مجرد وصف نصي بسيط.", desc_en: "Create stunning visuals from simple text prompts." },
    { icon: <Video className="w-6 h-6 text-red-400" />, title_key: "video", title_ar: "توليد الفيديو", title_en: "Video Creation", desc_ar: "حول أفكارك إلى مشاهد فيديو سينمائية بالذكاء الاصطناعي.", desc_en: "Turn ideas into cinematic AI video scenes." },
    { icon: <Cpu className="w-6 h-6 text-green-400" />, title_key: "code", title_ar: "البرمجة", title_en: "Programming", desc_ar: "مساعد برمجي متكامل لكتابة وتصحيح الأكواد بذكاء.", desc_en: "Integrated coding assistant for writing and debugging." },
    { icon: <Mic className="w-6 h-6 text-yellow-400" />, title_key: "voice", title_ar: "الصوت", title_en: "Voice", desc_ar: "تحويل النص إلى كلام وتنسيق الأصوات بدقة عالية.", desc_en: "High-quality text-to-speech and voice cloning." },
    { icon: <Globe className="w-6 h-6 text-blue-400" />, title_key: "search", title_ar: "البحث الذكي", title_en: "Smart Search", desc_ar: "الوصول اللحظي للمعلومات من الويب مع التوثيق الكامل.", desc_en: "Real-time web information access with citations." },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_50%)]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                <img src="https://i.ibb.co/h7n25wY0/1715446168128.webp" alt="HOB AI Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                {t('app_name')}
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <Link to="/features" className="hover:text-white transition-colors">{t('features')}</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">{t('pricing')}</Link>
              <Link to="/about" className="hover:text-white transition-colors">{t('about')}</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-slate-400 hover:text-white">
              <Languages className="w-5 h-5" />
            </Button>
            <ThemeToggle />
            {user ? (
              <Button onClick={() => navigate('/chat')} className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-full px-6">
                {t('dashboard')}
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  {t('login')}
                </Link>
                <Button onClick={() => navigate('/login')} className="bg-white hover:bg-slate-200 text-slate-950 font-bold rounded-full px-6">
                  {t('signup')}
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-4 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8"
        >
          <Zap className="w-4 h-4" />
          {i18n.language === 'ar' ? 'مستقبل الذكاء هنا' : 'The Future of AI is Here'}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
            {t('slogan')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl text-slate-400 text-lg md:text-xl mb-12 leading-relaxed"
        >
          {i18n.language === 'ar' 
            ? 'منصة بريميوم تجمع لك كل أدوات الذكاء الاصطناعي في واجهة واحدة مبتكرة. محادثات ذكية، توليد صور وفيديو، وبرمجة احترافية باللغة العربية.'
            : 'A premium platform bringing all AI tools into one innovative interface. Smart chats, image & video generation, and professional coding in Arabic.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button 
            size="lg" 
            onClick={() => navigate('/chat')}
            className="h-16 px-10 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-lg font-bold group"
          >
            {t('get_started')}
            <ArrowRight className={`${i18n.language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
          </Button>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 relative w-full max-w-6xl aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-2xl shadow-2xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2664&auto=format&fit=crop" 
            alt="AI Interface Preview"
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg space-y-6 px-4">
             <div className="flex justify-end order-1">
               <div className="bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md p-4 rounded-2xl rounded-tr-none max-w-[80%]">
                 <p className="text-cyan-400 text-sm font-bold">
                    {i18n.language === 'ar' ? 'مرحباً، كيف يمكنني مساعدتك اليوم؟' : 'Hello, how can I help you today?'}
                 </p>
               </div>
             </div>
             <div className="flex justify-start order-2">
               <div className="bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                 <p className="text-white text-sm">
                    {i18n.language === 'ar' ? 'أريد تصميم نظام ذكاء اصطناعي متطور.' : 'I want to design a sophisticated AI system.'}
                 </p>
               </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-32 relative z-10 border-t border-white/5">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black mb-6">{i18n.language === 'ar' ? 'قوة لا تضاهى' : 'Unmatched Power'}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {i18n.language === 'ar' ? 'نظام بيئي متكامل مبني على أقوى المحركات اللغوية في العالم.' : 'A complete ecosystem built on the world\'s most powerful language engines.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">
                {i18n.language === 'ar' ? feature.title_ar || t(feature.title_key) : feature.title_en || t(feature.title_key)}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {i18n.language === 'ar' ? feature.desc_ar : feature.desc_en}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 px-4 bg-slate-950/20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src="https://i.ibb.co/h7n25wY0/1715446168128.webp" alt="HOB AI Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold">{t('app_name')}</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              {i18n.language === 'ar' 
                ? 'المنصة الرائدة للذكاء الاصطناعي في العالم العربي. نبتكر من أجل الغد.' 
                : 'The leading AI platform in the Arab world. Innovating for tomorrow.'}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white">{t('features')}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/chat" className="hover:text-cyan-400 transition-colors">{t('chat')}</Link></li>
              <li>{i18n.language === 'ar' ? 'توليد الصور' : 'Image Gen'}</li>
              <li>{i18n.language === 'ar' ? 'توليد الفيديو' : 'Video Gen'}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white">{t('pricing')}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li>{t('free')}</li>
              <li>{t('premium')}</li>
              <li>{i18n.language === 'ar' ? 'اشتراك الشركات' : 'Enterprise'}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-white">{t('about')}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li>
                <a 
                  href="https://wa.me/201067844199" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-cyan-400 transition-colors"
                >
                  {i18n.language === 'ar' ? 'تواصل معنا' : 'Contact'}
                </a>
              </li>
              <li>{i18n.language === 'ar' ? 'الخصوصية' : 'Privacy'}</li>
              <li>{i18n.language === 'ar' ? 'الشروط' : 'Terms'}</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

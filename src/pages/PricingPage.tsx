import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Check, Zap, Shield, Rocket, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const plans = [
    {
      name_ar: "المجاني",
      name_en: "Free",
      price: "0",
      desc_ar: "مثالي للاستكشاف والتعرف على قدرات النظام.",
      desc_en: "Perfect for exploring the system's capabilities.",
      features_ar: ["100 رسالة يومياً", "دخول للموديل السريع", "دعم مجتمعي"],
      features_en: ["100 messages/day", "Fast model access", "Community support"],
      cta_ar: "ابدأ مجاناً",
      cta_en: "Start for Free",
      popular: false
    },
    {
      name_ar: "بريميوم",
      name_en: "Premium",
      price: "19",
      desc_ar: "للمحترفين الذين يحتاجون لأعلى أداء وذكاء.",
      desc_en: "For professionals who need peak performance.",
      features_ar: ["رسائل غير محدودة", "أحدث موديلات Gemini Pro", "توليد صور وفيديو عالي الدقة", "أولوية الوصول للمميزات", "دعم فني VIP"],
      features_en: ["Unlimited messages", "Latest Gemini Pro models", "HD Image & Video Gen", "Priority feature access", "VIP Tech Support"],
      cta_ar: "اشترك الآن",
      cta_en: "Subscribe Now",
      popular: true
    },
    {
      name_ar: "الشركات",
      name_en: "Enterprise",
      price: "Custom",
      desc_ar: "حلول مخصصة للفرق والشركات الكبيرة.",
      desc_en: "Custom solutions for teams and large companies.",
      features_ar: ["إدارة المستخدمين", "تأمين بيانات متطور", "API للمطورين", "تدريب مخصص للموديل"],
      features_en: ["User Management", "Advanced data security", "Developer API", "Custom model training"],
      cta_ar: "تواصل معنا",
      cta_en: "Contact Us",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-32 px-4 relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center mb-24 z-10 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8"
          >
            <Shield className="w-4 h-4" />
            {i18n.language === 'ar' ? 'خطط بسيطة وشفافة' : 'Simple transparent pricing'}
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-8">
            {i18n.language === 'ar' ? 'اختر خطة ذكائك' : 'Choose Your Intelligence Plan'}
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            {i18n.language === 'ar' ? 'ابدأ اليوم مجاناً وقم بالترقية عندما تحتاج إلى المزيد من القوة.' : 'Start for free today and upgrade when you need more power.'}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 z-10 relative">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`h-full border-white/5 bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-6 relative flex flex-col ${plan.popular ? 'border-cyan-500/30 ring-1 ring-cyan-500/20 shadow-2xl shadow-cyan-500/10' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute top-6 left-6 bg-cyan-500 text-slate-950 font-bold px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">
                    {i18n.language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl font-black">{i18n.language === 'ar' ? plan.name_ar : plan.name_en}</CardTitle>
                  <CardDescription className="text-slate-400 mt-2">{i18n.language === 'ar' ? plan.desc_ar : plan.desc_en}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-6 pt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">${plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-slate-500 text-sm">{i18n.language === 'ar' ? '/شهرياً' : '/mo'}</span>}
                  </div>
                  
                  <ul className="space-y-4">
                    {(i18n.language === 'ar' ? plan.features_ar : plan.features_en).map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-500'}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-6">
                  <Button 
                    onClick={() => {
                      if (plan.price === 'Custom') {
                        window.open('https://wa.me/201067844199', '_blank');
                      } else {
                        navigate('/login');
                      }
                    }}
                    className={`w-full h-14 rounded-2xl text-lg font-bold transition-all ${
                      plan.popular 
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-500/20' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                    }`}
                  >
                    {i18n.language === 'ar' ? plan.cta_ar : plan.cta_en}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 text-center">
           <Button variant="link" onClick={() => navigate('/')} className="text-slate-500 hover:text-white font-bold">
             {i18n.language === 'ar' ? 'الرجوع للرئيسية' : 'Back to Home'}
           </Button>
        </div>
    </div>
  );
}

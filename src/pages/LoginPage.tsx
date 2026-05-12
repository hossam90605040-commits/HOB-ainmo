import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Globe, Github, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { signIn, signInGuest } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signIn();
      toast.success(i18n.language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully');
      navigate('/chat');
    } catch (error) {
      toast.error(i18n.language === 'ar' ? 'فشل تسجيل الدخول' : 'Sign in failed');
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInGuest();
      toast.success(i18n.language === 'ar' ? 'تم الدخول كزائر' : 'Entered as guest');
      navigate('/chat');
    } catch (error: any) {
      console.error("Guest sign-in error:", error);
      toast.error(i18n.language === 'ar' ? `فشل الدخول كزائر: ${error.message}` : `Guest access failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] p-4">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20">
                <img src="https://i.ibb.co/h7n25wY0/1715446168128.webp" alt="HOB AI" className="w-full h-full object-cover" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              {i18n.language === 'ar' ? 'مرحباً بك مجدداً' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              {i18n.language === 'ar' ? 'سجل دخولك للوصول إلى ذكائك الاصطناعي' : 'Sign in to access your AI empire'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 flex items-center gap-3 text-lg font-bold transition-all hover:scale-[1.02]"
              onClick={handleSignIn}
            >
              <Globe className="w-5 h-5 text-cyan-400" />
              {i18n.language === 'ar' ? 'الدخول باستخدام جوجل' : 'Sign in with Google'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 flex items-center gap-3 text-lg font-bold transition-all hover:scale-[1.02]"
              disabled
            >
              <Github className="w-5 h-5 text-slate-400" />
              {i18n.language === 'ar' ? 'الدخول باستخدام GitHub' : 'Sign in with GitHub'}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 flex items-center justify-center gap-3 text-lg font-bold transition-all hover:scale-[1.02]"
              onClick={handleGuestSignIn}
            >
              {i18n.language === 'ar' ? 'التسجيل لاحقاً' : 'Register Later'}
            </Button>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#020617] px-2 text-slate-500 font-bold tracking-widest">
                  {i18n.language === 'ar' ? 'أو عبر البريد' : 'Or via email'}
                </span>
              </div>
            </div>

            <Button 
              variant="link" 
              className="w-full text-slate-400 hover:text-cyan-400 transition-colors font-bold"
              onClick={() => navigate('/')}
            >
              {i18n.language === 'ar' ? 'الرجوع للرئيسية' : 'Back to home'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

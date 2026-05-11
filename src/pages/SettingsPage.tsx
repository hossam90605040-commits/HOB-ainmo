import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  User, 
  Globe, 
  Moon, 
  Shield, 
  Bell, 
  ChevronLeft,
  Settings as SettingsIcon,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full text-slate-400">
            <ChevronLeft className={i18n.language === 'ar' ? 'rotate-180' : ''} />
          </Button>
          <h1 className="text-3xl font-black">{t('settings')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
             <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
               <div className="h-24 bg-gradient-to-r from-cyan-600 to-blue-700" />
               <div className="p-6 -mt-12 flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 border-4 border-[#020617] shadow-xl">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-cyan-500 text-slate-950 font-bold text-xl">
                      {profile?.displayName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-bold text-xl">{profile?.displayName}</h3>
                  <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">{profile?.role}</p>
               </div>
             </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
             <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-4">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    <CardTitle>{i18n.language === 'ar' ? 'بيانات الملف الشخصي' : 'Profile Information'}</CardTitle>
                  </div>
                  <CardDescription>{i18n.language === 'ar' ? 'تحكم في اسمك وبريدك الإلكتروني.' : 'Manage your name and email.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{i18n.language === 'ar' ? 'الاسم المعروض' : 'Display Name'}</label>
                      <Input defaultValue={profile?.displayName} className="bg-white/5 border-white/10 rounded-xl" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                      <Input defaultValue={profile?.email} disabled className="bg-white/5 border-white/10 rounded-xl opacity-50 cursor-not-allowed" />
                   </div>
                   <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl px-8 mt-4">
                     {i18n.language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                   </Button>
                </CardContent>
             </Card>

             <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-4">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <SettingsIcon className="w-5 h-5 text-purple-400" />
                    <CardTitle>{i18n.language === 'ar' ? 'تفضيلات النظام' : 'System Preferences'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Moon className="w-4 h-4 text-slate-400" />
                        <span className="font-bold">{t('dark_mode')}</span>
                     </div>
                     <Switch 
                       checked={theme === 'dark'} 
                       onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Languages className="w-4 h-4 text-slate-400" />
                        <span className="font-bold">{t('language')}</span>
                     </div>
                     <Button onClick={toggleLanguage} variant="outline" className="border-white/10 bg-white/5 rounded-lg h-8 text-xs px-3">
                        {i18n.language === 'ar' ? 'English' : 'العربية'}
                     </Button>
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span className="font-bold">{i18n.language === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
                     </div>
                     <Switch checked />
                   </div>
                </CardContent>
             </Card>

             <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl rounded-[2.5rem] p-4">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <CardTitle className="text-red-400">{i18n.language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-slate-500 mb-6">{i18n.language === 'ar' ? 'حذف حسابك سيؤدي لإزالة كافة بياناتك ومحادثاتك بشكل نهائي.' : 'Deleting your account will permanently remove all your data and conversations.'}</p>
                   <Button variant="destructive" className="rounded-xl font-bold px-8">
                    {i18n.language === 'ar' ? 'حذف الحساب نهائياً' : 'Permanently Delete Account'}
                   </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

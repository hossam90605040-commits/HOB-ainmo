import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Activity, 
  Users, 
  CreditCard, 
  Zap, 
  Brain, 
  History, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Cpu,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate, Link } from 'react-router-dom';

const data = [
  { name: 'Mon', usage: 4000, cost: 2400 },
  { name: 'Tue', usage: 3000, cost: 1398 },
  { name: 'Wed', usage: 2000, cost: 9800 },
  { name: 'Thu', usage: 2780, cost: 3908 },
  { name: 'Fri', usage: 1890, cost: 4800 },
  { name: 'Sat', usage: 2390, cost: 3800 },
  { name: 'Sun', usage: 3490, cost: 4300 },
];

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { title: i18n.language === 'ar' ? 'إجمالي المحادثات' : 'Total Chats', value: '1,284', icon: <MessageSquare className="w-5 h-5 text-cyan-400" />, trend: '+12%' },
    { title: i18n.language === 'ar' ? 'الرسائل المرسلة' : 'Messages Sent', value: '42,502', icon: <Zap className="w-5 h-5 text-purple-400" />, trend: '+5%' },
    { title: i18n.language === 'ar' ? 'ساعات العمل' : 'Work Hours', value: '156h', icon: <Activity className="w-5 h-5 text-green-400" />, trend: '+24%' },
    { title: i18n.language === 'ar' ? 'الرصيد المتبقي' : 'Credits Left', value: '8.4k', icon: <CreditCard className="w-5 h-5 text-yellow-400" />, trend: '-2%' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-l md:border-r border-white/5 bg-slate-950/40 backdrop-blur-xl flex flex-col hidden md:flex">
         <div className="p-6">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img src="https://i.ibb.co/h7n25wY0/1715446168128.webp" alt="HOB AI" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl">{t('app_name')}</span>
            </Link>
            
            <nav className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('dashboard')}
              </Button>
              <Button 
                onClick={() => navigate('/creative')}
                variant="ghost" 
                className="w-full justify-start gap-3 text-slate-400 hover:text-white"
              >
                <Sparkles className="w-4 h-4" />
                {i18n.language === 'ar' ? 'استوديو الإبداع' : 'Creative Studio'}
              </Button>
              <Button 
                onClick={() => navigate('/chat')}
                variant="ghost" 
                className="w-full justify-start gap-3 text-slate-400 hover:text-white"
              >
                <MessageSquare className="w-4 h-4" />
                {t('chat')}
              </Button>
              <Button 
                onClick={() => navigate('/settings')}
                variant="ghost" 
                className="w-full justify-start gap-3 text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
                {t('settings')}
              </Button>
            </nav>
         </div>

         <div className="mt-auto p-4 border-t border-white/5">
            <div className="bg-white/5 rounded-2xl p-4 mb-4">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                 {i18n.language === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
               </p>
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">Premium</span>
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">85%</Badge>
               </div>
               <Progress value={85} className="h-1.5 bg-white/5" />
            </div>
            
            <Button 
              onClick={signOut}
              variant="ghost" 
              className="w-full justify-start gap-3 text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </Button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-black">{t('dashboard')}</h1>
                  <p className="text-slate-500 mt-1">
                    {i18n.language === 'ar' ? 'أهلاً بك مجدداً، ' : 'Welcome back, '}
                    <span className="text-white font-bold">{profile?.displayName}</span>
                  </p>
               </div>
               <div className="flex items-center gap-4">
                  <Button variant="outline" className="border-white/10 bg-white/5 rounded-xl gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    {i18n.language === 'ar' ? 'تقارير مخصصة' : 'Custom Reports'}
                  </Button>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {stats.map((stat, i) => (
                 <Card key={i} className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-3xl p-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                       <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
                       {stat.icon}
                    </CardHeader>
                    <CardContent>
                       <div className="text-2xl font-black">{stat.value}</div>
                       <p className={`text-[10px] mt-1 font-bold ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.trend} {i18n.language === 'ar' ? 'عن الشهر الماضي' : 'from last month'}
                       </p>
                    </CardContent>
                 </Card>
               ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="lg:col-span-2 border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-6">
                  <CardHeader>
                     <CardTitle>{i18n.language === 'ar' ? 'إحصائيات الاستخدام' : 'Usage Analytics'}</CardTitle>
                     <CardDescription>{i18n.language === 'ar' ? 'تتبع استهلاك الموديلات يومياً' : 'Track model consumption daily'}</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 w-full mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                           <defs>
                              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                           <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                              itemStyle={{ color: '#06b6d4' }}
                           />
                           <Area type="monotone" dataKey="usage" stroke="#06b6d4" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={3} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </CardContent>
               </Card>

               <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-6">
                  <CardHeader>
                     <CardTitle>{i18n.language === 'ar' ? 'توزيع الموديلات' : 'Model Distribution'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 mt-4">
                     <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-cyan-400" />
                              <span className="font-bold">Gemini 3.1 Flash</span>
                           </div>
                           <span className="text-slate-500">65%</span>
                        </div>
                        <Progress value={65} className="h-2 bg-white/5" />
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-purple-400" />
                              <span className="font-bold">Gemini 3.1 Pro</span>
                           </div>
                           <span className="text-slate-500">25%</span>
                        </div>
                        <Progress value={25} className="h-2 bg-white/5" />
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-green-400" />
                              <span className="font-bold">Models V2</span>
                           </div>
                           <span className="text-slate-500">10%</span>
                        </div>
                        <Progress value={10} className="h-2 bg-white/5" />
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </main>
    </div>
  );
}

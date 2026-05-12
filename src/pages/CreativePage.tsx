import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Zap, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Download, 
  Share2, 
  RotateCcw,
  Sparkles,
  Command,
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  Trash2,
  Paperclip,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { generateImageAI, generateVideoAI } from '@/services/ai';
import { toast } from 'sonner';

export default function CreativePage() {
  const { t, i18n } = useTranslation();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{url: string, type: string, name: string} | null>(null);
  const [gallery, setGallery] = useState<{type: 'image' | 'video', url: string, prompt: string, id: string}[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          url: reader.result as string,
          type: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (url: string, type: 'image' | 'video' = 'image') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `hob-ai-${type}-${Date.now()}.${type === 'image' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(i18n.language === 'ar' ? 'بدأ التحميل' : 'Download started');
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setResult(null);

    try {
      if (activeTab === 'image') {
        const url = await generateImageAI(prompt);
        setResult(url);
        setGallery(prev => [{ type: 'image', url, prompt, id: Date.now().toString() }, ...prev]);
      } else {
        const url = await generateVideoAI(prompt, selectedImage ? [selectedImage] : []);
        setResult(url);
        setGallery(prev => [{ type: 'video', url, prompt, id: Date.now().toString() }, ...prev]);
      }
      toast.success(i18n.language === 'ar' ? 'تم التوليد بنجاح' : 'Generated successfully');
    } catch (error: any) {
      console.error("Creative generation error:", error);
      toast.error(i18n.language === 'ar' ? `حدث خطأ أثناء التوليد: ${error.message || 'غير معروف'}` : `Error during generation: ${error.message || 'unknown'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans overflow-hidden">
      {/* Sidebar - Consistent with Dashboard */}
      <aside className="w-64 border-l md:border-r border-white/5 bg-slate-950/40 backdrop-blur-xl flex flex-col hidden md:flex">
         <div className="p-6">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-950" fill="currentColor" />
              </div>
              <span className="font-bold text-xl">{t('app_name')}</span>
            </Link>
            
            <nav className="space-y-2">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="ghost" 
                className="w-full justify-start gap-3 text-slate-400 hover:text-white"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('dashboard')}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl"
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
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-cyan-400"
            >
              <Sparkles className="w-3 h-3" />
              Ai Creative Studio
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black">{i18n.language === 'ar' ? 'حوّل خيالك إلى حقيقة' : 'Turn Imagination into Reality'}</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {i18n.language === 'ar' ? 'ولد صوراً وفيديوهات احترافية باستخدام أحدث تقنيات الذكاء الاصطناعي.' : 'Generate professional images and videos using the latest AI technologies.'}
            </p>
            {activeTab === 'video' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs py-1 px-3 rounded-full inline-block"
              >
                {i18n.language === 'ar' ? 'وضع الفيديو حالياً في طور العرض التجريبي' : 'Video Gen is currently in Demo mode'}
              </motion.div>
            )}
          </div>

          {/* Toggle Tabs */}
          <div className="flex justify-center">
            <div className="bg-slate-900/50 p-1 rounded-2xl border border-white/10 flex">
              <button 
                onClick={() => { setActiveTab('image'); setResult(null); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'image' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <ImageIcon className="w-4 h-4" />
                {i18n.language === 'ar' ? 'توليد صور' : 'Image Gen'}
              </button>
              <button 
                onClick={() => { setActiveTab('video'); setResult(null); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'video' ? 'bg-purple-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <VideoIcon className="w-4 h-4" />
                {i18n.language === 'ar' ? 'توليد فيديو' : 'Video Gen'}
              </button>
            </div>
          </div>

          {/* Prompt Input Area */}
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-6 shadow-2xl">
            <CardContent className="p-0 space-y-6">
              {activeTab === 'video' && (
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h4 className="text-sm font-bold text-slate-400">
                       {i18n.language === 'ar' ? 'صورة للتحريك (اختياري)' : 'Animation Reference (Optional)'}
                     </h4>
                     {selectedImage && (
                        <Button 
                          onClick={() => setSelectedImage(null)}
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 h-8 gap-2"
                        >
                          <X className="w-4 h-4" />
                          {i18n.language === 'ar' ? 'إزالة' : 'Remove'}
                        </Button>
                     )}
                   </div>
                   
                   {!selectedImage ? (
                     <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group">
                       <div className="flex flex-col items-center justify-center pt-5 pb-6">
                         <Paperclip className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors mb-2" />
                         <p className="text-sm text-slate-500">
                           <span className="font-bold text-cyan-400">{i18n.language === 'ar' ? 'اضغط لرفع صورة' : 'Click to upload image'}</span>
                         </p>
                       </div>
                       <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                     </label>
                   ) : (
                     <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10">
                        <img src={selectedImage.url} className="w-full h-full object-cover" alt="Selected" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                           <span className="text-white font-bold">{selectedImage.name}</span>
                        </div>
                     </div>
                   )}
                </div>
              )}

              <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={activeTab === 'image' ? (i18n.language === 'ar' ? 'صف الصورة التي تريدها بالتفصيل...' : 'Describe the image in detail...') : (i18n.language === 'ar' ? 'صف المشهد الذي تريد تحريكه...' : 'Describe the scene to animate...')}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[120px] focus:ring-2 focus:ring-cyan-500 transition-all text-lg resize-none"
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-500 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Command className="w-3 h-3" />
                    Enter to generate
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full py-8 rounded-3xl text-xl font-black gap-3 transition-all ${activeTab === 'image' ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-purple-500 hover:bg-purple-600'} text-slate-950 shadow-2xl`}
              >
                {isGenerating ? (
                   <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {i18n.language === 'ar' ? 'جاري التوليد...' : 'Generating...'}
                   </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    {activeTab === 'image' ? (i18n.language === 'ar' ? 'توليد الصورة' : 'Generate Image') : (i18n.language === 'ar' ? 'توليد الفيديو' : 'Generate Video')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Display */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900 group">
                  {activeTab === 'image' ? (
                    <img src={result} alt="Generated" className="w-full h-auto" />
                  ) : (
                    <video src={result} controls autoPlay className="w-full" />
                  )}
                  
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      className="rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70"
                      onClick={() => handleDownload(result, activeTab)}
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button size="icon" className="rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold">{i18n.language === 'ar' ? 'أعمالك الأخيرة' : 'Your Recent Works'}</h3>
                <Button variant="ghost" className="text-red-400 hover:bg-red-400/10 gap-2">
                   <Trash2 className="w-4 h-4" />
                   {i18n.language === 'ar' ? 'مسح الكل' : 'Clear All'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((item) => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="group relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-slate-900"
                  >
                    {item.type === 'image' ? (
                      <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    ) : (
                      <div className="w-full h-full bg-purple-500/20 flex items-center justify-center">
                         <VideoIcon className="w-12 h-12 text-purple-400" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                       <p className="text-sm font-medium line-clamp-2 mb-4">{item.prompt}</p>
                       <div className="flex gap-2">
                         <Button 
                          size="sm" 
                          className="bg-white/10 hover:bg-white/20 rounded-xl flex-1 backdrop-blur-md"
                          onClick={() => handleDownload(item.url, item.type)}
                         >
                           {i18n.language === 'ar' ? 'تحميل' : 'Download'}
                         </Button>
                         <Button size="icon" variant="ghost" className="bg-white/10 rounded-xl backdrop-blur-md">
                           <RotateCcw className="w-4 h-4" />
                         </Button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

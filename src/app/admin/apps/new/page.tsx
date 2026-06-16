"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { 
  ArrowUpCircle, 
  ImageIcon, 
  FileCode, 
  Loader2, 
  X,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  LayoutGrid,
  FileText,
  Save,
  Check,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  adminAutoGenerateAppDescription, 
  AdminAutoGenerateAppDescriptionOutput 
} from "@/ai/flows/admin-auto-generate-app-description";

const CATEGORIES = ["Social", "Games", "Productivity", "Photography", "Tools", "Education", "Entertainment", "General"];

function AddOrUpdateAppForm() {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  
  const [iconPreview, setIconPreview] = useState<string>("");
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  
  const [aiResult, setAiResult] = useState<AdminAutoGenerateAppDescriptionOutput | null>(null);
  const [showAiPreview, setShowAiPreview] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    version: "",
    category: "General",
    developer: "ShanPalia",
    apkSize: "N/A",
    packageName: "",
    whatsNew: "",
    isFeatured: false,
    iconUrl: "",
    apkUrl: "",
    screenshotUrl: ""
  });

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setEditingId(editId);
      supabase.from('apps').select('*').eq('id', editId).single().then(({ data: app }) => {
        if (app) {
          setFormData({
            appName: app.app_name,
            description: app.description,
            version: app.version,
            category: app.category || "General",
            developer: app.developer || "ShanPalia",
            apkSize: app.apk_size || "N/A",
            packageName: app.package_name || "",
            whatsNew: app.whats_new || "",
            isFeatured: app.is_featured || false,
            iconUrl: app.icon_url,
            apkUrl: app.apk_url,
            screenshotUrl: app.screenshot_url || ""
          });
          setIconPreview(app.icon_url);
          setScreenshotPreview(app.screenshot_url || "");
        }
      });
    }
  }, [searchParams]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setApkFile(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFormData(prev => ({ ...prev, apkSize: `${sizeMb} MB` }));
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleAiGeneration = async () => {
    if (!formData.appName || !formData.version) {
      toast({ 
        title: "Context Missing", 
        description: "Please enter App Name and Version to generate a description.", 
        variant: "destructive" 
      });
      return;
    }
    
    setAiLoading(true);
    try {
      const result = await adminAutoGenerateAppDescription({
        appName: formData.appName,
        appVersion: formData.version,
        category: formData.category,
        developer: formData.developer
      });
      setAiResult(result);
      setShowAiPreview(true);
      toast({ title: "Draft Generated", description: "Hub Assistant has drafted a professional entry." });
    } catch (e: any) {
      toast({ title: "Generation Fault", description: "AI service offline. Using basic template.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiContent = () => {
    if (aiResult) {
      setFormData({
        ...formData,
        description: aiResult.fullDescription,
        whatsNew: aiResult.versionChangelog
      });
      setShowAiPreview(false);
      toast({ title: "Content Applied", description: "Injected AI content into Hub Editor." });
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appName || !formData.version) {
      toast({ title: "Missing Data", description: "App Name and Version are required protocols.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setUploadProgress(10);
    try {
      let finalIconUrl = formData.iconUrl;
      let finalApkUrl = formData.apkUrl;
      let finalScreenshotUrl = formData.screenshotUrl;

      if (iconFile) {
        setCurrentPhase("Injecting Icon...");
        finalIconUrl = await uploadFile(iconFile, 'app-icons');
        setUploadProgress(30);
      } else if (!editingId) {
        throw new Error("Hub Icon is required for new entries.");
      }

      if (apkFile) {
        setCurrentPhase("Transferring Binary...");
        finalApkUrl = await uploadFile(apkFile, 'apk-files');
        setUploadProgress(60);
      } else if (!editingId) {
        throw new Error("APK Binary is required for new entries.");
      }

      if (screenshotFile) {
        setCurrentPhase("Syncing Media...");
        finalScreenshotUrl = await uploadFile(screenshotFile, 'screenshots');
        setUploadProgress(80);
      }

      setCurrentPhase("Finalizing Registry...");
      const payload = {
        app_name: formData.appName,
        description: formData.description,
        version: formData.version,
        category: formData.category,
        developer: formData.developer,
        apk_size: formData.apkSize,
        package_name: formData.packageName,
        whats_new: formData.whatsNew,
        is_featured: formData.isFeatured,
        icon_url: finalIconUrl,
        apk_url: finalApkUrl,
        screenshot_url: finalScreenshotUrl,
        downloads: editingId ? undefined : 0
      };

      if (editingId) {
        await supabase.from('apps').update(payload).eq('id', editingId);
        toast({ title: "Registry Updated" });
      } else {
        await supabase.from('apps').insert([payload]);
        toast({ title: "Binary Published to Hub" });
      }
      router.push("/admin/apps");
    } catch (error: any) {
      toast({ title: "Infrastructure Fault", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setCurrentPhase("");
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => router.push('/admin/apps')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            {editingId ? "Modify Hub Entry" : "Publish New Binary"}
          </h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Supabase Production Node</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-12">
          <Card className="rounded-[3.5rem] p-12 bg-white shadow-xl border-none">
            <form onSubmit={handleSubmit} className="space-y-16">
              {/* SECTION: IDENTITY */}
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" /> App Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">App Name *</label>
                    <Input placeholder="e.g. WhatsApp" className="h-14 rounded-2xl bg-muted/20 border-none font-bold px-6" value={formData.appName} onChange={e => setFormData({...formData, appName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Version *</label>
                    <Input placeholder="e.g. 2.24.1" className="h-14 rounded-2xl bg-muted/20 border-none font-bold px-6" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Category</label>
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none font-bold px-6">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Developer</label>
                    <Input placeholder="Developer Entity" className="h-14 rounded-2xl bg-muted/20 border-none font-bold px-6" value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* SECTION: ASSETS */}
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4" /> Asset Injection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Hub Icon *</label>
                    <div className="relative aspect-square rounded-[2.5rem] border-2 border-dashed border-gray-100 flex items-center justify-center bg-gray-50/50 overflow-hidden cursor-pointer group hover:bg-muted/30 transition-all">
                      {iconPreview ? <img src={iconPreview} className="w-full h-full object-cover" /> : <ImageIcon className="h-10 w-10 text-muted-foreground/30 group-hover:scale-110 transition-transform" />}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleIconChange} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Binary APK *</label>
                    <div className="relative aspect-square rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer text-center p-6 group hover:bg-muted/30 transition-all">
                      {apkFile ? (
                        <>
                          <div className="p-4 bg-primary/10 rounded-2xl mb-3">
                             <FileCode className="h-8 w-8 text-primary" />
                          </div>
                          <span className="text-[10px] font-black truncate w-full text-primary uppercase">{apkFile.name}</span>
                          <span className="text-[9px] font-bold text-muted-foreground mt-1">{formData.apkSize}</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="h-10 w-10 text-muted-foreground/30 group-hover:scale-110 transition-transform mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select APK</span>
                        </>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".apk" onChange={handleApkChange} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Screenshot</label>
                    <div className="relative aspect-square rounded-[2.5rem] border-2 border-dashed border-gray-100 flex items-center justify-center bg-gray-50/50 overflow-hidden cursor-pointer group hover:bg-muted/30 transition-all">
                      {screenshotPreview ? <img src={screenshotPreview} className="w-full h-full object-cover" /> : <ImageIcon className="h-10 w-10 text-muted-foreground/30 group-hover:scale-110 transition-transform" />}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleScreenshotChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: DESCRIPTION */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Hub Description
                  </h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="rounded-full h-11 px-6 font-black text-[10px] uppercase bg-primary/10 text-primary border-none hover:bg-primary/20 transition-all" 
                    onClick={handleAiGeneration} 
                    disabled={aiLoading}
                  >
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    ✨ Generate AI Description
                  </Button>
                </div>

                {showAiPreview && aiResult && (
                  <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">Intelligence Report Output</h4>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" className="rounded-full text-[10px] font-black uppercase" onClick={() => setShowAiPreview(false)}>Discard</Button>
                        <Button type="button" className="rounded-full h-9 px-6 bg-primary text-white text-[10px] font-black uppercase shadow-lg shadow-primary/20" onClick={applyAiContent}>
                          <Check className="h-3 w-3 mr-2" /> Use Generated Content
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
                        {aiResult.fullDescription}
                      </p>
                    </div>
                  </div>
                )}

                <Textarea 
                  placeholder="Describe binary functionality and features..." 
                  className="min-h-[300px] rounded-[2.5rem] p-10 bg-muted/10 border-none font-medium leading-relaxed resize-none focus-visible:ring-primary shadow-inner" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              {loading && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between text-[10px] font-black uppercase text-primary tracking-widest">
                    <span className="flex items-center gap-2"><Terminal className="h-3 w-3" /> {currentPhase}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3 rounded-full bg-muted shadow-inner" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-50">
                <Button type="button" variant="outline" className="h-16 rounded-[2rem] font-black text-xs uppercase tracking-widest border-gray-100 hover:bg-gray-50">Save as Draft</Button>
                <Button type="submit" className="h-16 rounded-[2rem] font-black text-sm premium-gradient text-white uppercase shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (editingId ? 'Update Registry' : 'Initialize Distribution')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* PREVIEW SIDEBAR */}
        <div className="space-y-8">
          <div className="sticky top-12 space-y-8">
            <h3 className="text-sm font-black uppercase tracking-widest px-6 opacity-40">Hub Store Preview</h3>
            <Card className="rounded-[3.5rem] p-10 bg-white border-none shadow-2xl flex flex-col items-center text-center gap-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
               <div className="w-28 h-28 rounded-[2rem] bg-gray-50 overflow-hidden shadow-xl border-4 border-white transition-transform group-hover:scale-105 duration-500">
                  {iconPreview ? <img src={iconPreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><LayoutGrid className="h-10 w-10" /></div>}
               </div>
               <div className="space-y-2">
                  <h4 className="text-2xl font-black tracking-tighter line-clamp-1">{formData.appName || "App Identity"}</h4>
                  <div className="flex flex-col items-center gap-2">
                    <Badge variant="secondary" className="rounded-full font-black text-[8px] uppercase tracking-widest px-3 py-1">{formData.category}</Badge>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">v{formData.version}</p>
                  </div>
               </div>
               <Button className="w-full h-16 rounded-2xl font-black text-xs uppercase premium-gradient text-white shadow-xl pointer-events-none opacity-50">
                  Download APK
               </Button>
               <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest pt-4">
                  <ShieldCheck className="h-4 w-4" /> Secure Hub Verified
               </div>
            </Card>

            <div className="bg-black text-white p-8 rounded-[2.5rem] space-y-4 shadow-xl">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">System Protocol</h4>
               <p className="text-[11px] font-medium leading-relaxed opacity-60 italic">
                 "Ensure all binaries are signature-verified before initializing the distribution sequence."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddOrUpdateApp() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen gap-6"><Loader2 className="animate-spin h-12 w-12 text-primary" /><p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Loading Hub Terminal...</p></div>}>
      <AddOrUpdateAppForm />
    </Suspense>
  );
}

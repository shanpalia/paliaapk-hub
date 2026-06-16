
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
  Copy,
  Check,
  History,
  FileText,
  Save,
  Eye,
  LayoutGrid,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  adminAutoGenerateAppDescription, 
  AdminAutoGenerateAppDescriptionOutput,
  checkAiHealth 
} from "@/ai/flows/admin-auto-generate-app-description";

const CATEGORIES = ["Games", "Tools", "Social", "Entertainment", "Education", "Lifestyle", "Productivity"];

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
  const [apiStatus, setApiStatus] = useState<'idle' | 'connected' | 'invalid_key' | 'quota_exceeded' | 'unavailable'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>("Handshake Required");
  const [copied, setCopied] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    version: "",
    category: "Games",
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
            category: app.category || "Games",
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
      toast({ title: "Identification Required", description: "Enter App Name and Version for AI context.", variant: "destructive" });
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
      setApiStatus('connected');
    } catch (e) {
      setApiStatus('unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appName || !formData.version) return;

    setLoading(true);
    setUploadProgress(10);
    try {
      let finalIconUrl = formData.iconUrl;
      let finalApkUrl = formData.apkUrl;
      let finalScreenshotUrl = formData.screenshotUrl;

      if (iconFile) {
        setCurrentPhase("Uploading Icon...");
        finalIconUrl = await uploadFile(iconFile, 'app-icons');
        setUploadProgress(30);
      }

      if (apkFile) {
        setCurrentPhase("Uploading APK...");
        finalApkUrl = await uploadFile(apkFile, 'apk-files');
        setUploadProgress(60);
      }

      if (screenshotFile) {
        setCurrentPhase("Uploading Screenshot...");
        finalScreenshotUrl = await uploadFile(screenshotFile, 'screenshots');
        setUploadProgress(80);
      }

      setCurrentPhase("Saving Metadata...");
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
        downloads: 0
      };

      if (editingId) {
        await supabase.from('apps').update(payload).eq('id', editingId);
        toast({ title: "Hub Entry Updated" });
      } else {
        await supabase.from('apps').insert([payload]);
        toast({ title: "App Published Successfully" });
      }
      router.push("/admin/apps");
    } catch (error: any) {
      toast({ title: "Storage Fault", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          {editingId ? "Modify Hub Entry" : "Publish Binary"}
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-12">
          <Card className="rounded-[3.5rem] p-12 bg-white shadow-xl border-none">
            <form onSubmit={handleSubmit} className="space-y-16">
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" /> App Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input placeholder="App Name" className="h-14 rounded-2xl" value={formData.appName} onChange={e => setFormData({...formData, appName: e.target.value})} />
                  <Input placeholder="Version (e.g. 1.0.0)" className="h-14 rounded-2xl" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger className="h-14 rounded-2xl">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Developer" className="h-14 rounded-2xl" value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} />
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4" /> Asset Injection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Hub Icon</label>
                    <div className="relative aspect-square rounded-[2rem] border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer">
                      {iconPreview ? <img src={iconPreview} className="w-full h-full object-cover" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleIconChange} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Binary APK</label>
                    <div className="relative aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center bg-gray-50 cursor-pointer text-center p-4">
                      {apkFile ? <><FileCode className="h-8 w-8 text-primary mb-2" /><span className="text-[9px] font-black truncate w-full">{apkFile.name}</span></> : <><ArrowUpCircle className="h-8 w-8 text-muted-foreground" /><span className="text-[9px] font-black mt-2">Inject APK</span></>}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".apk" onChange={handleApkChange} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Screenshot</label>
                    <div className="relative aspect-square rounded-[2rem] border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer">
                      {screenshotPreview ? <img src={screenshotPreview} className="w-full h-full object-cover" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleScreenshotChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Hub Description
                  </h3>
                  <Button type="button" variant="outline" className="rounded-full h-10 px-6 font-black text-[10px] uppercase bg-primary/10 text-primary border-none" onClick={handleAiGeneration} disabled={aiLoading}>
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                    ✨ Generate AI Content
                  </Button>
                </div>
                <Textarea placeholder="Describe app functionality..." className="min-h-[250px] rounded-[2rem] p-8" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              {loading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase text-primary">
                    <span>{currentPhase}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 rounded-full" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
                <Button type="button" variant="outline" className="h-16 rounded-2xl font-black text-[10px] uppercase bg-white">Save Draft</Button>
                <Button type="submit" className="h-16 rounded-2xl font-black text-xs premium-gradient text-white uppercase shadow-xl" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : (editingId ? 'Update Entry' : 'Publish to Store')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="sticky top-12 space-y-8">
            <h3 className="text-sm font-black uppercase tracking-widest px-4">Instant Hub Preview</h3>
            <Card className="rounded-[3rem] p-8 bg-white border-none shadow-xl flex flex-col items-center text-center gap-6">
               <div className="w-24 h-24 rounded-[2rem] bg-gray-50 overflow-hidden shadow-inner border border-gray-100">
                  {iconPreview && <img src={iconPreview} className="w-full h-full object-cover" />}
               </div>
               <div>
                  <h4 className="text-2xl font-black tracking-tighter">{formData.appName || "App Identity"}</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{formData.category}</p>
               </div>
               <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase premium-gradient text-white shadow-lg pointer-events-none">
                  Download APK
               </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddOrUpdateApp() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <AddOrUpdateAppForm />
    </Suspense>
  );
}

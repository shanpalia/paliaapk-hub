
"use client";

import { useState, useEffect, Suspense } from "react";
import { 
  ArrowUpCircle, 
  CheckCircle2, 
  ImageIcon, 
  FileCode, 
  Loader2, 
  X,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Wand2
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
import { useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { AppCard } from "@/components/app-card";
import { uploadToGithubRelease } from "@/lib/github-actions";
import { adminAutoGenerateAppDescription } from "@/ai/flows/admin-auto-generate-app-description";

const CATEGORIES = ["Games", "Tools", "Social", "Entertainment", "Education", "Lifestyle", "Productivity"];

function AddOrUpdateAppForm() {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [publishStep, setPublishStep] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  
  const [iconPreview, setIconPreview] = useState<string>("");
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();

  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    version: "",
    category: "Games",
    developer: "ShanPalia",
    apkSize: "N/A",
    packageName: "unknown",
    whatsNew: "",
    isFeatured: false,
    isHidden: false,
    iconUrl: "",
    apkUrl: "",
    screenshots: [] as string[]
  });

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && db) {
      setEditingId(editId);
      getDoc(doc(db, "apps", editId)).then(snap => {
        if (snap.exists()) {
          const app = snap.data();
          setFormData({
            appName: app.appName || "",
            description: app.description || "",
            version: app.version || "",
            category: app.category || "Games",
            developer: app.developer || "ShanPalia",
            apkSize: app.apkSize || "N/A",
            packageName: app.packageName || "unknown",
            whatsNew: app.whatsNew || "",
            isFeatured: app.isFeatured || false,
            isHidden: app.isHidden || false,
            iconUrl: app.iconUrl || "",
            apkUrl: app.apkUrl || "",
            screenshots: app.screenshots || []
          });
          setIconPreview(app.iconUrl || "");
          setScreenshotPreviews(app.screenshots || []);
        }
      });
    }
  }, [searchParams, db]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
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
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setScreenshotFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setScreenshotPreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
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
        featureSummary: formData.description.substring(0, 100) || "Modern utility app for Android."
      });
      setFormData(prev => ({
        ...prev,
        description: result.appDescription,
        whatsNew: result.versionChangelog
      }));
      toast({ title: "AI Generation Complete", description: "Hub metadata optimized." });
    } catch (e: any) {
      toast({ title: "AI Fault", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (!formData.appName || !formData.version) return;
    if (!editingId && (!iconFile || !apkFile)) return;

    setLoading(true);
    try {
      let finalIconUrl = formData.iconUrl;
      let finalApkUrl = formData.apkUrl;
      let finalScreenshots = [...formData.screenshots];

      const filesToUpload = [];

      if (iconFile) {
        setPublishStep("Uploading Hub Icon...");
        filesToUpload.push({
          name: `icon-${Date.now()}.${iconFile.name.split('.').pop()}`,
          type: iconFile.type,
          base64: await fileToBase64(iconFile)
        });
      }

      if (apkFile) {
        setPublishStep("Uploading APK Binary...");
        filesToUpload.push({
          name: apkFile.name,
          type: 'application/vnd.android.package-archive',
          base64: await fileToBase64(apkFile)
        });
      }

      for (let i = 0; i < screenshotFiles.length; i++) {
        setPublishStep(`Preparing screenshot ${i + 1}...`);
        filesToUpload.push({
          name: `shot-${i}-${Date.now()}.${screenshotFiles[i].name.split('.').pop()}`,
          type: screenshotFiles[i].type,
          base64: await fileToBase64(screenshotFiles[i])
        });
      }

      if (filesToUpload.length > 0) {
        setPublishStep("Distributing Assets to GitHub...");
        const uploadResults = await uploadToGithubRelease(formData.version, filesToUpload);
        
        const newScreenshots: string[] = [];
        uploadResults.forEach(res => {
          if (res.name.includes('icon-')) {
            finalIconUrl = res.assetUrl;
          } else if (res.name.endsWith('.apk')) {
            finalApkUrl = res.assetUrl;
          } else if (res.name.includes('shot-')) {
            newScreenshots.push(res.assetUrl);
          }
        });
        
        if (newScreenshots.length > 0) {
           finalScreenshots = [...finalScreenshots, ...newScreenshots];
        }
      }

      setPublishStep("Finalizing Hub Metadata...");
      const appData = {
        ...formData,
        iconUrl: finalIconUrl,
        apkUrl: finalApkUrl,
        screenshots: finalScreenshots,
        status: "published",
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, "apps", editingId), appData);
        toast({ title: "Hub Entry Updated" });
      } else {
        await addDoc(collection(db, "apps"), {
          ...appData,
          downloads: 0,
          createdAt: serverTimestamp()
        });
        toast({ title: "App Published Successfully" });
      }
      router.push("/admin/apps");
    } catch (error: any) {
      toast({ title: "Protocol Fault", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setPublishStep(null);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase">
            {editingId ? "Modify Hub Entry" : "Publish Binary"}
          </h1>
          <p className="text-primary text-[9px] font-black uppercase tracking-[0.3em] mt-2">New Distribution Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          <Card className="rounded-[3.5rem] border-none shadow-sm bg-white p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4" /> Binary Hub Distribution
                  </h3>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={handleAiGeneration}
                    disabled={aiLoading}
                  >
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Wand2 className="h-3 w-3 mr-2" />}
                    AI Optimization
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Hub Icon (Square)</label>
                    <div className="flex justify-center">
                      <div className="relative group">
                        <div className={`w-36 h-36 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 overflow-hidden shadow-inner ${iconPreview ? 'border-none p-0' : ''}`}>
                          {iconPreview ? (
                            <img src={iconPreview} className="w-full h-full object-cover object-center" alt="Icon preview" />
                          ) : (
                            <>
                              <ImageIcon className="h-7 w-7 text-muted-foreground group-hover:text-primary" />
                              <span className="text-[8px] font-black uppercase">Identify</span>
                            </>
                          )}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleIconChange} />
                        </div>
                        {iconPreview && (
                          <Button 
                            type="button" 
                            size="icon" 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 rounded-full h-8 w-8 shadow-lg" 
                            onClick={() => { setIconFile(null); setIconPreview(""); }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Android Binary (.apk)</label>
                    <div className={`w-full h-36 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 relative shadow-inner ${apkFile ? 'border-primary/30 bg-primary/5' : ''}`}>
                       {apkFile ? (
                         <div className="text-center p-6 space-y-2">
                           <FileCode className="h-10 w-10 text-primary mx-auto" />
                           <p className="text-[10px] font-black truncate max-w-[140px]">{apkFile.name}</p>
                           <Badge variant="outline" className="text-[8px] bg-white">{formData.apkSize}</Badge>
                         </div>
                       ) : (
                         <>
                           <ArrowUpCircle className="h-7 w-7 text-muted-foreground" />
                           <span className="text-[9px] font-black uppercase">Inject APK</span>
                         </>
                       )}
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".apk" onChange={handleApkChange} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Intelligence Gallery (Screenshots)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {screenshotPreviews.map((src, idx) => (
                      <div key={idx} className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                        <img src={src} className="w-full h-full object-cover" alt="shot" />
                        <button 
                          type="button" 
                          onClick={() => setScreenshotPreviews(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="relative aspect-[9/16] rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-colors">
                      <ImageIcon className="h-5 w-5 text-gray-300" />
                      <span className="text-[8px] font-black uppercase text-gray-400">Add shot</span>
                      <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleScreenshotChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Metadata Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">App Identity</label>
                    <Input placeholder="e.g. Social Finder" className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 font-bold" value={formData.appName} onChange={e => setFormData({...formData, appName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Release Code</label>
                    <Input placeholder="e.g. 1.0.4" className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 font-bold" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Distribution Category</label>
                    <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                      <SelectTrigger className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 font-bold">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Entity Developer</label>
                    <Input placeholder="Developer Name" className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 font-bold" value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Hub Description (HTML/Rich Text)</label>
                  <Textarea placeholder="Detailed app summary..." className="rounded-[2rem] min-h-[160px] bg-gray-50/50 border-gray-100 p-8 font-medium text-sm leading-relaxed" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Intelligence Report (Changelog)</label>
                  <Textarea placeholder="Version updates..." className="rounded-2xl min-h-[100px] bg-gray-50/50 border-gray-100 p-6 font-bold text-xs" value={formData.whatsNew} onChange={e => setFormData({...formData, whatsNew: e.target.value})} />
                </div>
              </div>

              {loading && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                    <span>{publishStep}</span>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                  <Progress value={publishStep?.includes('Binary') ? 40 : publishStep?.includes('Assets') ? 70 : 90} className="h-2 rounded-full" />
                </div>
              )}

              <Button type="submit" className="w-full h-20 rounded-[2.5rem] font-black text-xl premium-gradient text-white uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (editingId ? 'Execute Update' : 'Initialize Distribution')}
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="sticky top-12 space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] px-4">Tactical Preview</h3>
            <div className="pointer-events-none scale-95 origin-top opacity-90 drop-shadow-2xl">
              <AppCard app={{ ...formData, id: 'preview', iconUrl: iconPreview } as any} />
            </div>
            <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">Distribution Integrity</span>
              </div>
              <p className="text-[11px] font-medium text-emerald-700 leading-relaxed">
                Binary will be verified through the GitHub Release API v3. All assets are served via high-performance Global CDN endpoints.
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <AddOrUpdateAppForm />
    </Suspense>
  );
}

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
  Copy,
  Check,
  History,
  FileText,
  Save,
  Eye,
  LayoutGrid,
  Zap,
  ShieldAlert,
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
import { useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { AppCard } from "@/components/app-card";
import { uploadToGithubRelease } from "@/lib/github-actions";
import { 
  adminAutoGenerateAppDescription, 
  AdminAutoGenerateAppDescriptionOutput,
  checkAiHealth 
} from "@/ai/flows/admin-auto-generate-app-description";

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
  
  // AI & Connection States
  const [aiResult, setAiResult] = useState<AdminAutoGenerateAppDescriptionOutput | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'connected' | 'invalid_key' | 'quota_exceeded' | 'unavailable'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>("Handshake Required");
  const [copied, setCopied] = useState(false);

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

  const testConnection = async () => {
    setApiStatus('idle');
    setStatusMessage("Validating Gateway...");
    try {
      const { status, message } = await checkAiHealth();
      setApiStatus(status);
      setStatusMessage(message);
      if (status === 'connected') {
        toast({ title: "Hub Secure", description: "AI Node connectivity verified." });
      } else {
        toast({ title: "Protocol Fault", description: message, variant: "destructive" });
      }
    } catch (e) {
      setApiStatus('unavailable');
      setStatusMessage("Service Unreachable");
    }
  };

  const generateFallback = () => {
    const fallback: AdminAutoGenerateAppDescriptionOutput = {
      fullDescription: `Overview:\n${formData.appName} is a powerful application in the ${formData.category} category.\n\nFeatures:\n• Easy to use\n• Fast performance\n• Modern interface\n\nDeveloper: ${formData.developer}\nVersion: ${formData.version}`,
      seoSummary: `${formData.appName} v${formData.version} - Professional APK from PaliaAPK Hub.`,
      versionChangelog: `Version ${formData.version} stability updates and performance optimizations.`
    };
    setAiResult(fallback);
    toast({ title: "Fallback Triggered", description: "AI was unavailable; tactical template generated instead." });
  };

  const handleAiGeneration = async () => {
    if (!formData.appName || !formData.version) {
      toast({ title: "Identification Required", description: "Enter App Name and Version for AI context.", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await adminAutoGenerateAppDescription({
        appName: formData.appName,
        appVersion: formData.version,
        category: formData.category,
        developer: formData.developer,
        keywords: `${formData.appName}, APK, Hub, Android, ${formData.category}`
      });
      setAiResult(result);
      setApiStatus('connected');
      setStatusMessage("Node: Online");
      toast({ title: "AI Assistant Ready", description: "Description protocols generated successfully." });
    } catch (e: any) {
      console.error("AI Node Failure:", e.message);
      // Map error types for status display
      if (e.message.includes('AUTH_FAULT')) setApiStatus('invalid_key');
      else if (e.message.includes('QUOTA_FAULT')) setApiStatus('quota_exceeded');
      else setApiStatus('unavailable');
      
      setStatusMessage(e.message || "AI service temporarily unavailable.");
      toast({ title: "AI Service Fault", description: "Generating tactical fallback content...", variant: "destructive" });
      generateFallback();
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiText = () => {
    if (!aiResult) return;
    setFormData(prev => ({
      ...prev,
      description: aiResult.fullDescription,
      whatsNew: aiResult.versionChangelog
    }));
    setAiResult(null);
    toast({ title: "Content Applied", description: "Hub description updated with generated text." });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to Clipboard" });
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
        
        uploadResults.forEach(res => {
          if (res.name.includes('icon-')) {
            finalIconUrl = res.assetUrl;
          } else if (res.name.endsWith('.apk')) {
            finalApkUrl = res.assetUrl;
          } else if (res.name.includes('shot-')) {
            finalScreenshots.push(res.assetUrl);
          }
        });
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
      toast({ title: "Distribution Fault", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setPublishStep(null);
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-12">
          <Card className="rounded-[3.5rem] border-none shadow-sm bg-white p-12">
            <form onSubmit={handleSubmit} className="space-y-16">
              
              {/* 1. App Information */}
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" /> App Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">App Identity</label>
                    <Input placeholder="e.g. Social Finder" className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 font-bold" value={formData.appName} onChange={e => setFormData({...formData, appName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Release Code (Version)</label>
                    <Input placeholder="e.g. 1.0.4" className="rounded-2xl h-14 bg-gray-50/50 border-gray-100 font-bold" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Category</label>
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
              </div>

              {/* 2. Media Uploads */}
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4" /> Media & Binary Assets
                </h3>
                
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
                  <label className="text-[9px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Hub Screenshots (Optional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {screenshotPreviews.map((src, i) => (
                      <div key={i} className="aspect-[9/16] rounded-2xl overflow-hidden border border-gray-100 relative group">
                        <img src={src} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setScreenshotPreviews(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-2 right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="aspect-[9/16] rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors relative cursor-pointer">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-[8px] font-black uppercase">Add Media</span>
                      <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleScreenshotChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Hub Description Section */}
              <div className="space-y-8 bg-white p-10 rounded-[3rem] border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Hub Description
                  </h3>
                  
                  {/* API Health Diagnostic */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                      <div className={`h-2 w-2 rounded-full animate-pulse ${
                        apiStatus === 'connected' ? 'bg-emerald-500' : 
                        apiStatus === 'idle' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                        AI Status: {statusMessage}
                      </span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={testConnection}
                      className="h-8 rounded-full px-4 text-[8px] font-black uppercase tracking-widest hover:bg-primary/5"
                    >
                      <Activity className="h-3 w-3 mr-2" /> Test
                    </Button>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="rounded-full h-10 px-6 font-black text-[10px] uppercase tracking-widest bg-emerald-500 text-white border-none hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                    onClick={handleAiGeneration}
                    disabled={aiLoading}
                  >
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    ✨ Generate AI Description
                  </Button>
                </div>

                {/* AI Result Display */}
                {aiLoading && (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-dashed border-primary/20 animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">AI Copywriter is drafting hub assets...</p>
                  </div>
                )}

                {aiResult && !aiLoading && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 bg-emerald-50/30 p-8 rounded-[2rem] border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500 font-black text-[8px] uppercase tracking-widest">
                        {apiStatus === 'connected' ? 'AI Generated Optimization' : 'Tactical Fallback Template'}
                      </Badge>
                      <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(aiResult.fullDescription)} className="h-8 w-8">
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <ScrollArea className="h-48 rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
                      <div className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{aiResult.fullDescription}</div>
                    </ScrollArea>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" onClick={applyAiText} className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600">
                        Use Generated Content
                      </Button>
                      <Button type="button" variant="outline" onClick={handleAiGeneration} className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest">
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Editor (Manual / HTML Mode)</label>
                  </div>
                  <Textarea 
                    placeholder="Describe app functionality, features, and technical highlights..." 
                    className="rounded-[2.5rem] min-h-[300px] bg-gray-50/30 border-gray-100 p-8 font-medium text-sm leading-relaxed shadow-inner" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              {/* Only show Changelog when editing/updating */}
              {editingId && (
                <div className="space-y-8 bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <History className="h-4 w-4" /> Intelligence Report (Changelog)
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Version updates for v{formData.version}</label>
                    <Textarea placeholder="Describe what's new in this release..." className="rounded-2xl min-h-[120px] bg-white border-gray-100 p-6 font-bold text-xs" value={formData.whatsNew} onChange={e => setFormData({...formData, whatsNew: e.target.value})} />
                  </div>
                </div>
              )}

              {loading && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                    <span>{publishStep}</span>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                  <Progress value={publishStep?.includes('Binary') ? 40 : publishStep?.includes('Assets') ? 70 : 90} className="h-2 rounded-full" />
                </div>
              )}

              {/* 4. Publish Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                <Button type="button" variant="outline" className="h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2">
                  <Save className="h-4 w-4" /> Save Draft
                </Button>
                <Button type="button" variant="outline" className="h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2">
                  <Eye className="h-4 w-4" /> Tactical Preview
                </Button>
                <Button type="submit" className="h-16 rounded-2xl font-black text-xs premium-gradient text-white uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (editingId ? 'Execute Update' : 'Initialize Distribution')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="sticky top-12 space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] px-4">Tactical Hub Preview</h3>
            <div className="pointer-events-none scale-95 origin-top opacity-90 drop-shadow-2xl">
              <AppCard app={{ ...formData, id: 'preview', iconUrl: iconPreview } as any} />
            </div>
            
            <Card className="rounded-[2.5rem] p-8 bg-white border-none shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Security Clearance</span>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                Publishing binaries to the PaliaAPK Hub requires direct injection into the Global Distribution framework. Ensure all assets are verified before distribution.
              </p>
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


"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ArrowLeft, Save, Image as ImageIcon, FileArchive, Sparkles, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { generateAppDescription } from "@/ai/flows/generate-app-description";

export default function EditAppPage() {
  const params = useParams();
  const id = params.id as string;
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    description: "",
    category: "General",
    icon_url: "",
    apk_url: "",
    screenshot_url: ""
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const apkInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== "shanpalia786@gmail.com") {
        router.push("/auth/login");
      } else {
        setCheckingAuth(false);
        fetchApp();
      }
    };

    const fetchApp = async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (data) {
          setFormData({
            name: data.app_name,
            version: data.version,
            description: data.description,
            category: data.category || "General",
            icon_url: data.icon_url,
            apk_url: data.apk_url,
            screenshot_url: data.screenshot_url || ""
          });
          setImagePreview(data.icon_url);
          if (data.screenshot_url) setScreenshotPreview(data.screenshot_url);
        }
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error fetching app", description: err.message });
        router.push("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) checkAuth();
  }, [id, router, toast]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      if (screenshotPreview && screenshotPreview.startsWith('blob:')) URL.revokeObjectURL(screenshotPreview);
    };
  }, [imagePreview, screenshotPreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setScreenshotFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.name) {
      toast({ variant: "destructive", title: "Missing App Name", description: "Please enter the app name first." });
      return;
    }
    setGenerating(true);
    try {
      const result = await generateAppDescription({
        appName: formData.name,
        version: formData.version,
        category: formData.category
      });
      setFormData({ ...formData, description: result.description });
      toast({ title: "Description Updated", description: "AI rewrite applied successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate description." });
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.version) {
      toast({ variant: "destructive", title: "Missing Required Fields", description: "App name and version are required." });
      return;
    }

    setSaving(true);
    setUploadProgress(5);
    try {
      let icon_url = formData.icon_url;
      let apkUrl = formData.apk_url;
      let screenshotUrl = formData.screenshot_url;

      // Handle Icon Update
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { error } = await supabase.storage.from('app-icons').upload(path, imageFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('app-icons').getPublicUrl(path);
        icon_url = publicUrl;
      }
      setUploadProgress(30);

      // Handle APK Update
      if (apkFile) {
        const ext = apkFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { error } = await supabase.storage.from('apk-files').upload(path, apkFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('apk-files').getPublicUrl(path);
        apkUrl = publicUrl;
      }
      setUploadProgress(60);

      // Handle Screenshot Update
      if (screenshotFile) {
        const ext = screenshotFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { error } = await supabase.storage.from('screenshots').upload(path, screenshotFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('screenshots').getPublicUrl(path);
        screenshotUrl = publicUrl;
      }
      setUploadProgress(85);

      const { error: dbError } = await supabase.from('apps').update({
        app_name: formData.name,
        category: formData.category,
        description: formData.description,
        icon_url: icon_url,
        version: formData.version,
        apk_url: apkUrl,
        screenshot_url: screenshotUrl
      }).eq('id', id);

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast({ title: "App Updated Successfully" });
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Update Error:", err);
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
      setUploadProgress(0);
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20 lg:pb-0">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full font-bold h-9">
                <Home className="mr-2 h-4 w-4" /> Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-border/50 space-y-10">
          <header className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">Edit Application</h1>
            <p className="text-muted-foreground font-medium text-lg">Update assets and metadata for <span className="text-primary font-bold">{formData.name}</span>.</p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">App Icon</Label>
              <div 
                onClick={() => iconInputRef.current?.click()}
                className="group relative border-2 border-dashed rounded-[2.5rem] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-all aspect-square overflow-hidden bg-muted/10"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-[1.5rem]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[1.5rem]">
                       <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <span className="text-xs font-black uppercase text-muted-foreground">Change Icon</span>
                  </>
                )}
                <input type="file" ref={iconInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">APK Package</Label>
              <div 
                onClick={() => apkInputRef.current?.click()}
                className="group border-2 border-dashed rounded-[2.5rem] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-all aspect-square bg-muted/10"
              >
                <div className={`p-6 rounded-[2rem] ${apkFile ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                  <FileArchive className="h-12 w-12 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-black mt-4 text-center uppercase text-muted-foreground">
                  {apkFile ? "New APK Ready" : "Replace APK File"}
                </span>
                <input type="file" ref={apkInputRef} accept=".apk" className="hidden" onChange={(e) => setApkFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Screenshots</Label>
              <div 
                onClick={() => screenshotInputRef.current?.click()}
                className="group relative border-2 border-dashed rounded-[2.5rem] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-all aspect-square overflow-hidden bg-muted/10"
              >
                {screenshotPreview ? (
                  <div className="relative w-full h-full">
                    <Image src={screenshotPreview} alt="Preview" fill className="object-cover rounded-[1.5rem]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[1.5rem]">
                       <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <span className="text-xs font-black uppercase text-muted-foreground">Replace Screen</span>
                  </>
                )}
                <input type="file" ref={screenshotInputRef} accept="image/*" className="hidden" onChange={handleScreenshotChange} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="font-black uppercase tracking-widest text-[10px] text-muted-foreground ml-1">App Name</Label>
              <Input 
                id="name" 
                className="rounded-2xl h-14 font-black text-lg bg-muted/30 border-none focus-visible:ring-primary px-6" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="version" className="font-black uppercase tracking-widest text-[10px] text-muted-foreground ml-1">Version Number</Label>
              <Input 
                id="version" 
                className="rounded-2xl h-14 font-black text-lg bg-muted/30 border-none focus-visible:ring-primary px-6" 
                value={formData.version} 
                onChange={(e) => setFormData({...formData, version: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground ml-1">App Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none text-lg font-black px-6">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Games">Games</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="desc" className="font-black uppercase tracking-widest text-[10px] text-muted-foreground ml-1">Description</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-primary/5 border-primary/20 text-primary font-black hover:bg-primary/10 transition-colors"
                onClick={handleAiGenerate}
                disabled={generating || !formData.name}
              >
                {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                AI Rewrite
              </Button>
            </div>
            <Textarea 
              id="desc" 
              className="rounded-[2.5rem] min-h-[220px] bg-muted/30 border-none p-8 text-lg font-medium leading-relaxed resize-none focus-visible:ring-primary shadow-inner"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {saving && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                <span>Saving to Cloud...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2.5 bg-muted rounded-full" />
            </div>
          )}

          <div className="flex gap-4">
             <Link href="/admin/dashboard" className="flex-1">
                <Button variant="outline" className="w-full h-16 rounded-[2rem] text-xl font-black border-border/50 hover:bg-muted/50">
                   Cancel
                </Button>
             </Link>
             <Button 
                onClick={handleUpdate} 
                disabled={saving}
                className="flex-[2] h-16 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {saving ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <Save className="mr-3 h-6 w-6" />}
                Update Application
              </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

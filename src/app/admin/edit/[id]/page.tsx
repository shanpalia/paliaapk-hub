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

    if (id) fetchApp();
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
      toast({ title: "Description Generated", description: "AI has refreshed your app description." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate description." });
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.version) {
      toast({ variant: "destructive", title: "Validation Error", description: "App Name and Version are required." });
      return;
    }

    setSaving(true);
    setUploadProgress(5);
    try {
      let icon_url = formData.icon_url;
      let apkUrl = formData.apk_url;
      let screenshotUrl = formData.screenshot_url;

      // 1. Upload Icon if changed
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { data, error } = await supabase.storage.from('app-icons').upload(path, imageFile);
        if (error) throw { source: 'Bucket: app-icons', ...error };
        const { data: { publicUrl } } = supabase.storage.from('app-icons').getPublicUrl(path);
        icon_url = publicUrl;
      }
      setUploadProgress(30);

      // 2. Upload APK if changed
      if (apkFile) {
        const ext = apkFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { data, error } = await supabase.storage.from('apk-files').upload(path, apkFile);
        if (error) throw { source: 'Bucket: apk-files', ...error };
        const { data: { publicUrl } } = supabase.storage.from('apk-files').getPublicUrl(path);
        apkUrl = publicUrl;
      }
      setUploadProgress(60);

      // 3. Upload Screenshot if changed
      if (screenshotFile) {
        const ext = screenshotFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { data, error } = await supabase.storage.from('screenshots').upload(path, screenshotFile);
        if (error) throw { source: 'Bucket: screenshots', ...error };
        const { data: { publicUrl } } = supabase.storage.from('screenshots').getPublicUrl(path);
        screenshotUrl = publicUrl;
      }
      setUploadProgress(85);

      // 4. Update Database
      const { error: dbError } = await supabase.from('apps').update({
        app_name: formData.name,
        category: formData.category,
        description: formData.description,
        icon_url: icon_url,
        version: formData.version,
        apk_url: apkUrl,
        screenshot_url: screenshotUrl
      }).eq('id', id);

      if (dbError) throw { source: 'Table: apps', ...dbError };

      setUploadProgress(100);
      toast({ title: "Success!", description: "App details updated successfully." });
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Update Error:", err);
      const errorDisplay = (
        <div className="mt-4 space-y-2 text-[11px] font-mono whitespace-pre-wrap max-h-[200px] overflow-auto border-t pt-4 border-destructive/20">
          <p className="font-black text-xs uppercase text-red-500">Error Report</p>
          <p><span className="font-black">Source:</span> {err.source || 'Generic'}</p>
          <p><span className="font-black">Code:</span> {err.code || 'N/A'}</p>
          <p><span className="font-black">Message:</span> {err.message || 'An unexpected error occurred.'}</p>
        </div>
      );
      toast({ variant: "destructive", title: "Update Failed", description: errorDisplay, duration: 10000 });
      setUploadProgress(0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 font-black text-muted-foreground uppercase tracking-widest text-xs">Loading App Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-border/50 space-y-8">
          <div>
            <h1 className="text-3xl font-black">Edit {formData.name}</h1>
            <p className="text-muted-foreground">Update app assets or metadata in the marketplace.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="font-bold">Icon</Label>
              <div 
                onClick={() => iconInputRef.current?.click()}
                className="group relative border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all aspect-square overflow-hidden"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-xs font-bold uppercase">Change</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-bold text-muted-foreground">Browse Icon</span>
                  </>
                )}
                <input type="file" ref={iconInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-bold">APK Update</Label>
              <div 
                onClick={() => apkInputRef.current?.click()}
                className="group border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all aspect-square"
              >
                <div className={`p-4 rounded-2xl ${apkFile ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <FileArchive className="h-10 w-10 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold mt-4 text-center">{apkFile ? "New APK Ready" : "Upload New APK"}</span>
                <input type="file" ref={apkInputRef} accept=".apk" className="hidden" onChange={(e) => setApkFile(e.target.files?.[0] || null)} />
              </div>
              {apkFile && <p className="text-[10px] font-bold text-primary truncate text-center">{apkFile.name}</p>}
            </div>

            <div className="space-y-3">
              <Label className="font-bold">Screenshot</Label>
              <div 
                onClick={() => screenshotInputRef.current?.click()}
                className="group relative border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all aspect-square overflow-hidden"
              >
                {screenshotPreview ? (
                  <div className="relative w-full h-full">
                    <Image src={screenshotPreview} alt="Preview" fill className="object-cover rounded-xl" />
                    <div className="absolute top-2 right-2 z-20">
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-6 w-6 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setScreenshotFile(null);
                          setScreenshotPreview(null);
                          setFormData({...formData, screenshot_url: ""});
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-bold text-muted-foreground">Update Screen</span>
                  </>
                )}
                <input type="file" ref={screenshotInputRef} accept="image/*" className="hidden" onChange={handleScreenshotChange} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">App Name</Label>
              <Input id="name" className="rounded-2xl h-14 font-medium bg-muted/30 border-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version" className="font-bold">Version</Label>
              <Input id="version" className="rounded-2xl h-14 font-medium bg-muted/30 border-none" value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Games">Games</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="desc" className="font-bold">Description</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-primary/5 border-primary/20 text-primary font-bold hover:bg-primary/10"
                onClick={handleAiGenerate}
                disabled={generating || !formData.name}
              >
                {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                AI Rewrite
              </Button>
            </div>
            <Textarea 
              id="desc" 
              className="rounded-3xl min-h-[160px] bg-muted/30 border-none p-6"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {saving && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-primary">
                <span>Saving Changes...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleUpdate} 
            disabled={saving}
            className="w-full h-16 rounded-[2rem] text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
          >
            {saving ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
          </Button>
        </div>
      </main>
    </div>
  );
}
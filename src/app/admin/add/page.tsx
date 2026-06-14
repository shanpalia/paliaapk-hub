"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ArrowLeft, Image as ImageIcon, FileArchive, Sparkles, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { generateAppDescription } from "@/ai/flows/generate-app-description";

export default function AddAppPage() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    description: "",
    category: "General"
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

  const isFormValid = formData.name && formData.version && formData.description && imageFile && apkFile;

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [imagePreview, screenshotPreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setScreenshotFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
    } else {
      setScreenshotPreview(null);
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
      toast({ title: "Description Generated", description: "AI has created a professional description for you." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate description. Please try again." });
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setUploadProgress(5);
    try {
      // 1. Upload Icon
      const iconExt = imageFile!.name.split('.').pop();
      const iconPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${iconExt}`;
      const { data: iconData, error: iconError } = await supabase.storage.from('app-icons').upload(iconPath, imageFile!);
      
      if (iconError) {
        console.error("RAW_ICON_UPLOAD_ERROR:", iconError);
        throw { 
          source: 'Storage Bucket: app-icons',
          fileName: imageFile!.name,
          message: iconError.message,
          code: (iconError as any).code || (iconError as any).statusCode || 'UNKNOWN_CODE',
          details: (iconError as any).details || 'No additional details provided by Supabase.',
          hint: (iconError as any).hint || 'No hint available.',
          response: JSON.stringify(iconData || 'No response data')
        };
      }
      
      const { data: { publicUrl: iconUrl } } = supabase.storage.from('app-icons').getPublicUrl(iconPath);
      setUploadProgress(30);

      // 2. Upload APK
      const apkExt = apkFile!.name.split('.').pop();
      const apkPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${apkExt}`;
      const { data: apkData, error: apkError } = await supabase.storage.from('apk-files').upload(apkPath, apkFile!);
      
      if (apkError) {
        console.error("RAW_APK_UPLOAD_ERROR:", apkError);
        throw { 
          source: 'Storage Bucket: apk-files',
          fileName: apkFile!.name,
          message: apkError.message,
          code: (apkError as any).code || (apkError as any).statusCode || 'UNKNOWN_CODE',
          details: (apkError as any).details || 'No additional details provided by Supabase.',
          hint: (apkError as any).hint || 'No hint available.',
          response: JSON.stringify(apkData || 'No response data')
        };
      }

      const { data: { publicUrl: apkUrl } } = supabase.storage.from('apk-files').getPublicUrl(apkPath);
      setUploadProgress(60);

      // 3. Optional Screenshot
      let screenshotUrl = "";
      if (screenshotFile) {
        const ssExt = screenshotFile.name.split('.').pop();
        const ssPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ssExt}`;
        const { data: ssData, error: ssError } = await supabase.storage.from('screenshots').upload(ssPath, screenshotFile);
        
        if (ssError) {
          console.error("RAW_SCREENSHOT_UPLOAD_ERROR:", ssError);
          throw { 
            source: 'Storage Bucket: screenshots',
            fileName: screenshotFile.name,
            message: ssError.message,
            code: (ssError as any).code || (ssError as any).statusCode || 'UNKNOWN_CODE',
            details: (ssError as any).details || 'No additional details provided by Supabase.',
            hint: (ssError as any).hint || 'No hint available.',
            response: JSON.stringify(ssData || 'No response data')
          };
        }

        const { data: { publicUrl: ssUrl } } = supabase.storage.from('screenshots').getPublicUrl(ssPath);
        screenshotUrl = ssUrl;
      }
      setUploadProgress(85);

      // 4. Insert into Database
      const { error: dbError } = await supabase.from('apps').insert({
        app_name: formData.name,
        category: formData.category,
        description: formData.description,
        icon_url: iconUrl,
        version: formData.version,
        apk_url: apkUrl,
        screenshot_url: screenshotUrl,
        downloads: 0,
        created_at: new Date().toISOString()
      });

      if (dbError) {
        console.error("RAW_DATABASE_INSERT_ERROR:", dbError);
        throw { 
          source: 'Database Table: apps',
          message: dbError.message,
          code: dbError.code,
          details: dbError.details || 'No specific database details.',
          hint: dbError.hint || 'Check if columns and RLS policies match.',
          response: 'Database insert failed'
        };
      }

      setUploadProgress(100);
      toast({ title: "Success!", description: "App published successfully." });
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Critical Publishing Error:", err);
      
      const errorDisplay = (
        <div className="mt-4 space-y-2 text-[11px] font-mono whitespace-pre-wrap max-h-[300px] overflow-auto border-t pt-4 border-destructive/20">
          <p className="font-black text-xs uppercase text-red-500">Error Report</p>
          <p><span className="font-black">Source:</span> {err.source || 'Generic Runtime'}</p>
          {err.fileName && <p><span className="font-black">File:</span> {err.fileName}</p>}
          <p><span className="font-black">Code:</span> {err.code || 'N/A'}</p>
          <p><span className="font-black">Message:</span> {err.message || 'An unexpected error occurred.'}</p>
          <p><span className="font-black">Details:</span> {err.details || 'N/A'}</p>
          <p><span className="font-black">Hint:</span> {err.hint || 'N/A'}</p>
          <p className="mt-2 text-[9px] opacity-70"><span className="font-black">Raw Response:</span> {err.response || 'No response object'}</p>
        </div>
      );

      toast({ 
        variant: "destructive", 
        title: "Publishing Failed", 
        description: errorDisplay,
        duration: 10000,
      });
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-border/50 space-y-8">
          <div>
            <h1 className="text-3xl font-black">Publish New App</h1>
            <p className="text-muted-foreground">List your APK in the marketplace repository.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="font-bold">App Icon *</Label>
              <div 
                onClick={() => iconInputRef.current?.click()}
                className="group relative border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all aspect-square overflow-hidden"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-xs font-bold">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-muted-foreground text-center">Click to Browse</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={iconInputRef}
                  accept="image/*" 
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              {imageFile && <p className="text-[10px] font-bold text-primary truncate text-center">{imageFile.name}</p>}
            </div>

            <div className="space-y-3">
              <Label className="font-bold">APK File *</Label>
              <div 
                onClick={() => apkInputRef.current?.click()}
                className="group border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all aspect-square"
              >
                <div className={`p-4 rounded-2xl ${apkFile ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <FileArchive className="h-10 w-10 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold mt-4 text-center">{apkFile ? "APK Selected" : "Click to Browse APK"}</span>
                <input 
                  type="file" 
                  ref={apkInputRef}
                  accept=".apk" 
                  className="hidden"
                  onChange={(e) => setApkFile(e.target.files?.[0] || null)}
                />
              </div>
              {apkFile && <p className="text-[10px] font-bold text-primary truncate text-center">{apkFile.name}</p>}
            </div>

            <div className="space-y-3">
              <Label className="font-bold">Screenshot (Opt)</Label>
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
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-muted-foreground text-center">Add Screen</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={screenshotInputRef}
                  accept="image/*" 
                  className="hidden"
                  onChange={handleScreenshotChange}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">App Name *</Label>
              <Input 
                id="name" 
                placeholder="e.g. WhatsApp" 
                className="rounded-2xl h-14 text-lg font-medium bg-muted/30 border-none focus-visible:ring-primary"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version" className="font-bold">Version *</Label>
              <Input 
                id="version" 
                placeholder="e.g. 2.24.5.1" 
                className="rounded-2xl h-14 text-lg font-medium bg-muted/30 border-none focus-visible:ring-primary"
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger className="rounded-2xl h-14 text-lg bg-muted/30 border-none">
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
              <Label htmlFor="desc" className="font-bold">Description *</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-primary/5 border-primary/20 text-primary font-bold hover:bg-primary/10"
                onClick={handleAiGenerate}
                disabled={generating || !formData.name}
              >
                {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                AI Generate
              </Button>
            </div>
            <Textarea 
              id="desc" 
              placeholder="Describe what your app does..." 
              className="rounded-3xl min-h-[160px] text-lg bg-muted/30 border-none focus-visible:ring-primary p-6"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {loading && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-primary">
                <span>Publishing Assets...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={loading || !isFormValid}
            className="w-full h-16 rounded-[2rem] text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Publish to Store"}
          </Button>
        </div>
      </main>
    </div>
  );
}

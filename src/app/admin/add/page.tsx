"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ArrowLeft, Image as ImageIcon, FileArchive } from "lucide-react";
import Link from "next/link";

export default function AddAppPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    description: "",
    category: "General"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!formData.name || !formData.version || !imageFile || !apkFile) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill required fields and upload Icon/APK." });
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Icon to 'app-icons' bucket
      const iconExt = imageFile.name.split('.').pop();
      const iconPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${iconExt}`;
      const { error: iconError } = await supabase.storage
        .from('app-icons')
        .upload(iconPath, imageFile);
      if (iconError) throw iconError;
      const { data: { publicUrl: imageUrl } } = supabase.storage.from('app-icons').getPublicUrl(iconPath);

      // 2. Upload APK to 'apk-files' bucket
      const apkExt = apkFile.name.split('.').pop();
      const apkPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${apkExt}`;
      const { error: apkError } = await supabase.storage
        .from('apk-files')
        .upload(apkPath, apkFile);
      if (apkError) throw apkError;
      const { data: { publicUrl: apkUrl } } = supabase.storage.from('apk-files').getPublicUrl(apkPath);

      // 3. Optional Screenshot to 'screenshots' bucket
      let screenshotUrl = "";
      if (screenshotFile) {
        const ssExt = screenshotFile.name.split('.').pop();
        const ssPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ssExt}`;
        const { error: ssError } = await supabase.storage
          .from('screenshots')
          .upload(ssPath, screenshotFile);
        if (ssError) throw ssError;
        const { data: { publicUrl: ssUrl } } = supabase.storage.from('screenshots').getPublicUrl(ssPath);
        screenshotUrl = ssUrl;
      }

      // 4. Insert into Database
      const { error: dbError } = await supabase.from('apps').insert({
        app_name: formData.name,
        version: formData.version,
        description: formData.description,
        category: formData.category,
        image_url: imageUrl,
        apk_url: apkUrl,
        screenshot_url: screenshotUrl,
        downloads: 0
      });

      if (dbError) throw dbError;

      toast({ title: "Success!", description: "App published successfully." });
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-border/50 space-y-8">
          <div>
            <h1 className="text-3xl font-black">Publish New App</h1>
            <p className="text-muted-foreground">Fill in the details to list your APK in the store.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>App Icon *</Label>
              <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative h-32">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-[10px] font-bold text-muted-foreground text-center line-clamp-1 px-2">
                  {imageFile ? imageFile.name : "PNG/JPG"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>APK File *</Label>
              <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative h-32">
                <Input 
                  type="file" 
                  accept=".apk" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setApkFile(e.target.files?.[0] || null)}
                />
                <FileArchive className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-[10px] font-bold text-muted-foreground text-center line-clamp-1 px-2">
                  {apkFile ? apkFile.name : "Select APK"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Screenshot (Opt)</Label>
              <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative h-32">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-[10px] font-bold text-muted-foreground text-center line-clamp-1 px-2">
                  {screenshotFile ? screenshotFile.name : "App Screen"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">App Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. WhatsApp" 
                className="rounded-xl h-12"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input 
                id="version" 
                placeholder="e.g. 2.24.5.1" 
                className="rounded-xl h-12"
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Games">Games</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea 
              id="desc" 
              placeholder="Tell users about your app features..." 
              className="rounded-xl min-h-[140px]"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={loading}
            className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Publish to Store"}
          </Button>
        </div>
      </main>
    </div>
  );
}

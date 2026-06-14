
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
import { Upload, Loader2, ArrowLeft } from "lucide-react";
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
  const router = useRouter();
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!formData.name || !formData.version || !imageFile || !apkFile) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill all fields and upload files." });
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Image
      const imageExt = imageFile.name.split('.').pop();
      const imagePath = `icons/${Date.now()}.${imageExt}`;
      const { data: imageData, error: imageError } = await supabase.storage
        .from('apps')
        .upload(imagePath, imageFile);
      if (imageError) throw imageError;

      // 2. Upload APK
      const apkExt = apkFile.name.split('.').pop();
      const apkPath = `apks/${Date.now()}.${apkExt}`;
      const { data: apkData, error: apkError } = await supabase.storage
        .from('apps')
        .upload(apkPath, apkFile);
      if (apkError) throw apkError;

      // Get public URLs
      const { data: { publicUrl: imageUrl } } = supabase.storage.from('apps').getPublicUrl(imagePath);
      const { data: { publicUrl: apkUrl } } = supabase.storage.from('apps').getPublicUrl(apkPath);

      // 3. Insert into Database
      const { error: dbError } = await supabase.from('apps').insert({
        app_name: formData.name,
        version: formData.version,
        description: formData.description,
        category: formData.category,
        image_url: imageUrl,
        apk_url: apkUrl,
        downloads: 0
      });

      if (dbError) throw dbError;

      toast({ title: "Success!", description: "App published successfully." });
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-border/50 space-y-8">
          <h1 className="text-3xl font-black">Upload New App</h1>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>App Icon (PNG/JPG)</Label>
                <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative h-32">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {imageFile ? imageFile.name : "Select Image"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>APK File</Label>
                <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative h-32">
                  <Input 
                    type="file" 
                    accept=".apk" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setApkFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {apkFile ? apkFile.name : "Select APK"}
                  </span>
                </div>
              </div>
            </div>

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

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input 
                  id="version" 
                  placeholder="e.g. 1.0.0" 
                  className="rounded-xl h-12"
                  value={formData.version}
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                />
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea 
                id="desc" 
                placeholder="Tell users about your app..." 
                className="rounded-xl min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Publish App"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}


"use client";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditAppPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    description: "",
    category: "General",
    image_url: "",
    apk_url: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
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
            image_url: data.image_url,
            apk_url: data.apk_url
          });
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

  const handleUpdate = async () => {
    if (!formData.name || !formData.version) {
      toast({ variant: "destructive", title: "Missing fields", description: "App Name and Version are required." });
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.image_url;
      let apkUrl = formData.apk_url;

      // 1. Optional Image Re-upload
      if (imageFile) {
        const imageExt = imageFile.name.split('.').pop();
        const imagePath = `icons/${Date.now()}.${imageExt}`;
        const { error: imageError } = await supabase.storage
          .from('apps')
          .upload(imagePath, imageFile);
        if (imageError) throw imageError;
        const { data: { publicUrl } } = supabase.storage.from('apps').getPublicUrl(imagePath);
        imageUrl = publicUrl;
      }

      // 2. Optional APK Re-upload
      if (apkFile) {
        const apkExt = apkFile.name.split('.').pop();
        const apkPath = `apks/${Date.now()}.${apkExt}`;
        const { error: apkError } = await supabase.storage
          .from('apps')
          .upload(apkPath, apkFile);
        if (apkError) throw apkError;
        const { data: { publicUrl } } = supabase.storage.from('apps').getPublicUrl(apkPath);
        apkUrl = publicUrl;
      }

      // 3. Update Database
      const { error: dbError } = await supabase.from('apps').update({
        app_name: formData.name,
        version: formData.version,
        description: formData.description,
        category: formData.category,
        image_url: imageUrl,
        apk_url: apkUrl,
      }).eq('id', id);

      if (dbError) throw dbError;

      toast({ title: "Updated!", description: "App details updated successfully." });
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-border/50 space-y-8">
          <h1 className="text-3xl font-black">Edit Application</h1>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Update Icon (Optional)</Label>
                <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative h-32">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-muted-foreground text-center">
                    {imageFile ? imageFile.name : "Select new image to replace current"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Update APK (Optional)</Label>
                <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative h-32">
                  <Input 
                    type="file" 
                    accept=".apk" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setApkFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-muted-foreground text-center">
                    {apkFile ? apkFile.name : "Select new APK to update version"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">App Name</Label>
              <Input 
                id="name" 
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
                  className="rounded-xl h-12"
                  value={formData.version}
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea 
                id="desc" 
                className="rounded-xl min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <Button 
              onClick={handleUpdate} 
              disabled={saving}
              className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20"
            >
              {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

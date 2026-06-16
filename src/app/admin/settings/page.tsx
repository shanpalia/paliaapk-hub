
"use client";

import { 
  ShieldCheck, 
  Activity, 
  Settings as SettingsIcon,
  Server,
  Key,
  Globe,
  Database,
  Cloud
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminSettings() {
  const TEST_ADMIN_EMAIL = "shanpalia786@gmail.com";

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black font-headline tracking-tighter uppercase">System Config</h1>
        <p className="text-primary text-[9px] font-black uppercase tracking-[0.3em] mt-2">Infrastructure Node Parameters</p>
      </div>

      <div className="max-w-3xl space-y-8">
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
          <CardHeader className="p-0 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black font-headline tracking-tighter uppercase">Hub Protocol Security</CardTitle>
            <CardDescription className="text-xs font-bold">Administrative credentials and hub distribution keys.</CardDescription>
          </CardHeader>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Control Node</label>
                <div className="flex items-center h-14 bg-gray-50 rounded-2xl px-6 border-none font-bold text-sm opacity-50">
                  {TEST_ADMIN_EMAIL}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Distribution Engine</label>
                <div className="flex items-center h-14 bg-gray-50 rounded-2xl px-6 border-none font-bold text-sm">
                  Supabase Cloud Infrastructure
                </div>
              </div>
            </div>

            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
              <Activity className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-700 tracking-widest mb-1">Infrastructure Online</p>
                <p className="text-[10px] font-medium text-emerald-600 leading-relaxed">
                  All distribution nodes are operational. Supabase S3-compatible storage buckets are active for binary transfer protocols.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight">Binary Storage</h3>
              <p className="text-[10px] font-bold text-muted-foreground mt-1">Supabase Storage Buckets</p>
            </div>
          </Card>
          <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight">Hub Registry</h3>
              <p className="text-[10px] font-bold text-muted-foreground mt-1">PostgreSQL Live Instance</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

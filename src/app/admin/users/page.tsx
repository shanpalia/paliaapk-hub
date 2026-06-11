
"use client";

import { 
  Users, 
  UserX, 
  UserCheck,
  ShieldCheck,
  Search,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, updateDoc, doc } from "firebase/firestore";
import { UserProfile } from "@/lib/types";

const TEST_ADMIN_EMAIL = "shanpalia786@gmail.com";

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: users, loading } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scanning Identities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black font-headline tracking-tighter uppercase">Security Clearance</h1>
        <p className="text-primary text-[9px] font-black uppercase tracking-[0.3em] mt-2">Authenticated Client Node Manager</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="rounded-2xl h-14 pl-12 bg-white border-gray-100 shadow-sm font-bold" 
          placeholder="Search by identity..." 
        />
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-none">
              <TableHead className="pl-8 font-black text-[9px] uppercase tracking-widest">Client Identity</TableHead>
              <TableHead className="font-black text-[9px] uppercase tracking-widest text-center">Clearance</TableHead>
              <TableHead className="text-right pr-8 font-black text-[9px] uppercase tracking-widest">Security Protocol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id} className="h-24 hover:bg-gray-50/30 border-gray-100">
                <TableCell className="pl-8">
                  <div>
                    <p className="font-black text-base">{user.email}</p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">UID: {user.uid?.substring(0, 12)}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`rounded-full font-black text-[8px] uppercase tracking-widest ${user.role === 'admin' ? 'bg-primary' : 'bg-gray-100 text-muted-foreground'}`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  {user.email !== TEST_ADMIN_EMAIL && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`rounded-full h-10 px-4 font-black text-[9px] uppercase tracking-widest ${user.role === 'blocked' ? 'text-emerald-500' : 'text-red-500'}`}
                      onClick={() => updateDoc(doc(db!, "users", user.id), { role: user.role === 'blocked' ? 'user' : 'blocked' })}
                    >
                      {user.role === 'blocked' ? <><UserCheck className="h-3 w-3 mr-2" /> Restore Access</> : <><UserX className="h-3 w-3 mr-2" /> Block Identity</>}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

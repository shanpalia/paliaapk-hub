
import { Gamepad2, Wrench, Users, Tv, GraduationCap, Briefcase, Heart, Palette } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: 'Games', icon: Gamepad2, color: 'bg-orange-100 text-orange-600' },
  { name: 'Tools', icon: Wrench, color: 'bg-blue-100 text-blue-600' },
  { name: 'Social', icon: Users, color: 'bg-pink-100 text-pink-600' },
  { name: 'Entertainment', icon: Tv, color: 'bg-purple-100 text-purple-600' },
  { name: 'Education', icon: GraduationCap, color: 'bg-green-100 text-green-600' },
  { name: 'Productivity', icon: Briefcase, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Lifestyle', icon: Heart, color: 'bg-red-100 text-red-600' },
  { name: 'Design', icon: Palette, color: 'bg-cyan-100 text-cyan-600' },
];

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-headline">Categories</h1>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/categories/${cat.name.toLowerCase()}`}
            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm active:scale-95 transition-all"
          >
            <div className={`p-4 rounded-2xl mb-3 ${cat.color}`}>
              <cat.icon className="h-8 w-8" />
            </div>
            <span className="font-semibold text-sm">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

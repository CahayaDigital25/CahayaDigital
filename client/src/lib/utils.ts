import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date helper
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000); // difference in seconds
  
  if (diff < 60) {
    return 'Baru saja';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} menit yang lalu`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} jam yang lalu`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} hari yang lalu`;
  } else {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('id-ID', options);
  }
}

// Truncate text helper
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Category label mapping
export const categoryLabels: Record<string, string> = {
  politik: 'POLITIK',
  ekonomi: 'EKONOMI',
  teknologi: 'TEKNOLOGI',
  olahraga: 'OLAHRAGA',
  hiburan: 'HIBURAN',
  pendidikan: 'PENDIDIKAN',
  kesehatan: 'KESEHATAN',
  gaya_hidup: 'GAYA HIDUP',
  otomotif: 'OTOMOTIF',
  properti: 'PROPERTI',
  lingkungan: 'LINGKUNGAN'
};

// Category colors
export const categoryColors: Record<string, string> = {
  politik: 'bg-blue-600',
  ekonomi: 'bg-green-600',
  teknologi: 'bg-purple-600',
  olahraga: 'bg-orange-500',
  hiburan: 'bg-pink-500',
  pendidikan: 'bg-teal-500',
  kesehatan: 'bg-red-500',
  gaya_hidup: 'bg-yellow-500',
  otomotif: 'bg-gray-700',
  properti: 'bg-indigo-500',
  lingkungan: 'bg-emerald-600'
};

// Function to create numbered list for popular articles
export function getNumberString(index: number): string {
  return index < 9 ? `0${index + 1}` : `${index + 1}`;
}

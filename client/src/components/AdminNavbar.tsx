import { Link, useLocation } from 'wouter';
import { Settings, LayoutDashboard, FileText, LogOut, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Settings as SettingsType } from '@shared/schema';

export default function AdminNavbar() {
  const [location] = useLocation();
  
  const { data: settings } = useQuery<SettingsType>({
    queryKey: ['/api/settings'],
  });

  const primaryColor = settings?.primaryColor || '#e53e3e';
  const siteName = settings?.siteName || 'CahayaDigital25';
  const logoText = settings?.logoText || 'CD';

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/admin/articles', label: 'Artikel', icon: <FileText className="h-5 w-5" /> },
    { href: '/admin/users', label: 'Pengguna', icon: <Users className="h-5 w-5" /> },
    { href: '/admin/settings', label: 'Pengaturan', icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    // Clear any auth state if needed
    window.location.href = '/';
  };

  return (
    <div className="fixed top-0 left-0 bottom-0 w-64 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="flex items-center mb-8 mt-2">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-white font-bold font-montserrat text-lg">{logoText}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold">{siteName}</h2>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                  location === item.href 
                    ? 'bg-red-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-8 left-0 right-0 px-4">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-md transition-all text-gray-300 hover:bg-gray-800 w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}

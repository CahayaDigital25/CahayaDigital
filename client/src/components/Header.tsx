import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Settings } from '@shared/schema';

const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Politik', href: '/category/politik' },
  { label: 'Ekonomi', href: '/category/ekonomi' },
  { label: 'Teknologi', href: '/category/teknologi' },
  { label: 'Olahraga', href: '/category/olahraga' },
  { label: 'Hiburan', href: '/category/hiburan' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location] = useLocation();

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const primaryColor = settings?.primaryColor || '#e53e3e';
  const secondaryColor = settings?.secondaryColor || '#333333';
  const logoText = settings?.logoText || 'CD';

  // Admin mode key sequence
  const [keySequence, setKeySequence] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeySequence(prev => {
        const newSequence = prev + e.key;
        if (newSequence.includes('admin')) {
          console.log('Domain configured: cahayadigital25.rf.gd');
          window.location.href = '/admin/panel/login.php';
          return '';
        }
        return newSequence.slice(-5); // Only keep last 5 chars to avoid long strings
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to search page
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-2"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold font-montserrat text-lg">{logoText}</span>
              </div>
              <h1 className="text-2xl font-montserrat font-bold">
                <span style={{ color: primaryColor }}>Cahaya</span>
                <span style={{ color: secondaryColor }}>Digital</span>
                <span style={{ color: primaryColor }}>25</span>
              </h1>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`text-brand-gray hover:text-brand-red font-medium transition duration-150 ${
                  location === item.href ? 'text-brand-red' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-brand-gray hover:text-brand-red"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Search button */}
          <div className="hidden md:block">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-brand-gray hover:text-brand-red"
              onClick={() => document.getElementById('desktop-search')?.classList.toggle('hidden')}
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop search form */}
      <div id="desktop-search" className="hidden bg-white border-t border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md mx-auto">
            <input
              type="search"
              placeholder="Cari berita..."
              className="w-full bg-gray-100 border-gray-300 h-10 px-4 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              className="bg-brand-red hover:bg-red-700 text-white rounded-r-lg px-4"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-brand-gray hover:text-brand-red font-medium py-2 ${
                  location === item.href ? 'text-brand-red' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 relative mx-auto text-gray-600">
              <form onSubmit={handleSearchSubmit} className="flex w-full">
                <input
                  type="search"
                  placeholder="Cari berita..."
                  className="w-full bg-gray-100 border-gray-300 h-10 px-4 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="bg-brand-red hover:bg-red-700 text-white rounded-r-lg px-4"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

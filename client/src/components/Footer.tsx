import { Link } from 'wouter';
import { MapPin, Mail, Phone } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { Settings } from '@shared/schema';

export default function Footer() {
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const primaryColor = settings?.primaryColor || '#e53e3e';
  const secondaryColor = settings?.secondaryColor || '#333333';
  const siteName = settings?.siteName || 'CahayaDigital25';
  const logoText = settings?.logoText || 'CD';
  
  // Split the siteName to apply different colors
  const parts = siteName.split(/(\d+)/);
  const firstPart = parts[0];
  const numberPart = parts[1] || '';

  return (
    <footer className="bg-brand-gray text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-2"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold font-montserrat text-lg">{logoText}</span>
              </div>
              <h3 className="text-xl font-montserrat font-bold">
                <span style={{ color: primaryColor }}>{firstPart}</span>
                <span className="text-white">Digital</span>
                <span style={{ color: primaryColor }}>{numberPart}</span>
              </h3>
            </div>
            <p className="text-gray-300 mb-4">Portal berita digital terkemuka yang menyajikan informasi terkini, terpercaya, dan berimbang untuk masyarakat Indonesia.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaYoutube className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Beranda</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">Tentang Kami</Link></li>
              <li><Link href="/editors" className="text-gray-300 hover:text-white">Redaksi</Link></li>
              <li><Link href="/guidelines" className="text-gray-300 hover:text-white">Pedoman Media Siber</Link></li>
              <li><Link href="/ethics" className="text-gray-300 hover:text-white">Kode Etik Jurnalistik</Link></li>
              <li><Link href="/careers" className="text-gray-300 hover:text-white">Karir</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kategori</h4>
            <ul className="space-y-2">
              <li><Link href="/category/politik" className="text-gray-300 hover:text-white">Politik</Link></li>
              <li><Link href="/category/ekonomi" className="text-gray-300 hover:text-white">Ekonomi</Link></li>
              <li><Link href="/category/teknologi" className="text-gray-300 hover:text-white">Teknologi</Link></li>
              <li><Link href="/category/olahraga" className="text-gray-300 hover:text-white">Olahraga</Link></li>
              <li><Link href="/category/hiburan" className="text-gray-300 hover:text-white">Hiburan</Link></li>
              <li><Link href="/category/gaya_hidup" className="text-gray-300 hover:text-white">Gaya Hidup</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-brand-red" />
                <span className="text-gray-300">Gedung Digital, Jl. Teknologi No. 25, Jakarta</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 mt-0.5 text-brand-red" />
                <span className="text-gray-300">info@cahayadigital25.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 mt-0.5 text-brand-red" />
                <span className="text-gray-300">+62 21 1234 5678</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} {siteName}. Hak Cipta Dilindungi.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white">Kebijakan Privasi</Link>
              <Link href="/terms" className="hover:text-white">Syarat dan Ketentuan</Link>
              <Link href="/help" className="hover:text-white">Bantuan</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

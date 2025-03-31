import { FaFacebook, FaTwitter, FaWhatsapp, FaTelegram, FaLink } from 'react-icons/fa';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface SocialMediaShareProps {
  url: string;
  title?: string;
  className?: string;
}

export default function SocialMediaShare({ url, title = '', className = '' }: SocialMediaShareProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `http://cahayadigital25.rf.gd${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast({
        title: "URL Disalin",
        description: "URL artikel berhasil disalin ke clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-gray-500">Bagikan:</span>
      <div className="flex space-x-2">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
          aria-label="Bagikan ke Facebook"
        >
          <FaFacebook className="w-4 h-4" />
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer" 
          className="p-2 text-sky-500 bg-sky-50 rounded-full hover:bg-sky-100 transition-colors"
          aria-label="Bagikan ke Twitter"
        >
          <FaTwitter className="w-4 h-4" />
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition-colors"
          aria-label="Bagikan ke WhatsApp"
        >
          <FaWhatsapp className="w-4 h-4" />
        </a>
        <a
          href={shareLinks.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-500 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
          aria-label="Bagikan ke Telegram"
        >
          <FaTelegram className="w-4 h-4" />
        </a>
        <button
          onClick={copyToClipboard}
          className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Salin URL"
        >
          <FaLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
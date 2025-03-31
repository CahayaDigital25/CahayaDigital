import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from 'lucide-react';

// Define interface for upload response
interface UploadResponse {
  success: boolean;
  fileUrl: string;
  message: string;
}

interface FileUploaderProps {
  onUploadSuccess: (fileUrl: string) => void;
  label?: string;
  accept?: string;
  buttonText?: string;
  className?: string;
}

const FileUploader = ({ 
  onUploadSuccess, 
  label = "Unggah Gambar", 
  accept = "image/*", 
  buttonText = "Unggah",
  className = ""
}: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Silakan pilih file terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Manual fetch request for file upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      // Parse the response data
      const data = await response.json() as UploadResponse;

      if (data && data.success) {
        toast({
          title: "Berhasil",
          description: data.message || "File berhasil diunggah",
        });
        setFile(null);
        onUploadSuccess(data.fileUrl);
      } else {
        throw new Error(data && data.message ? data.message : 'Gagal mengunggah file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengunggah file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium">{label}</div>
      <div className="flex gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="flex-1"
        />
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sedang Mengunggah...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
// src/components/FileUpload.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FileUploadProps {
  projectId?: string;
  onUploadComplete?: (file: File) => void;
}

function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast.success(`File "${selectedFile.name}" uploaded successfully`);
      onUploadComplete?.(selectedFile);
      setSelectedFile(null);
    }, 1000); // Simulate upload delay
  };

  return (
    <div className="bg-white border border-[#E6E9F4] rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-medium text-[#2E3A8C]">Upload Deliverable File</h3>
      <Input type="file" onChange={handleFileChange} />
      <Button 
        onClick={handleUpload} 
        disabled={uploading || !selectedFile}
        className="bg-[#2E3A8C] hover:bg-[#1B276F]"
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>
    </div>
  );
}

export default FileUpload;

import React, { useState, useRef } from 'react';
import { Camera, Upload, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RockUploadProps {
  onAnalyze: (image: File | null, description: string) => void;
  isAnalyzing: boolean;
}

export const RockUpload: React.FC<RockUploadProps> = ({ onAnalyze, isAnalyzing }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAnalyze = () => {
    if (selectedImage || description.trim()) {
      onAnalyze(selectedImage, description);
    }
  };

  const canAnalyze = selectedImage || description.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <Card className="p-6">
        <Label className="text-base font-semibold mb-4 block">Upload Rock Photo</Label>
        
        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Rock specimen"
                className="w-full h-64 object-cover rounded-lg shadow-specimen"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-earth rounded-full">
                <Camera className="h-8 w-8 text-foreground" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium">Take or Upload a Photo</p>
              <p className="text-muted-foreground">
                Drag and drop an image, or click to browse
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <FileImage className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                JPG, PNG, WEBP up to 10MB
              </span>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </Card>

      {/* Description Section */}
      <Card className="p-6">
        <Label htmlFor="description" className="text-base font-semibold mb-4 block">
          Describe Your Rock
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the rock's color, texture, weight, where you found it, crystal structure, any visible minerals, etc. The more detail, the better the identification!"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 resize-none"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Optional but helpful for accurate identification
        </p>
      </Card>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button
          variant="geological"
          size="lg"
          onClick={handleAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="w-full max-w-md"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              Analyzing Rock...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Identify This Rock
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
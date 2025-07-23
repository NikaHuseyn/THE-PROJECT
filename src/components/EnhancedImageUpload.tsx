import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  Scissors, 
  Palette, 
  Edit3, 
  Eye,
  FileImage,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageProcessor, type ProcessedImageResult, type ImageProcessingOptions } from '@/utils/imageProcessing';
import ImageEditor from './ImageEditor';

interface EnhancedImageUploadProps {
  onImageProcessed?: (result: ProcessedImageResult) => void;
  onFinalImage?: (blob: Blob, metadata?: any) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  showEditor?: boolean;
}

export const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  onImageProcessed,
  onFinalImage,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showEditor = true
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  
  // Processing options
  const [enableCompression, setEnableCompression] = useState(true);
  const [enableBackgroundRemoval, setEnableBackgroundRemoval] = useState(false);
  const [enableColorAnalysis, setEnableColorAnalysis] = useState(true);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a valid image.');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setActiveTab('preview');
    toast.success('Image uploaded successfully!');
  }, [acceptedTypes, maxSize]);

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const options: ImageProcessingOptions = {
        compress: enableCompression,
        removeBackground: enableBackgroundRemoval,
        extractColors: enableColorAnalysis,
        maxSizeMB: 1,
        maxWidthOrHeight: 1920
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await ImageProcessor.processImage(selectedFile, options);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setProcessedResult(result);
      onImageProcessed?.(result);
      
      toast.success('Image processing completed!');
      setActiveTab('results');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const handleSelectFinal = (blob: Blob) => {
    onFinalImage?.(blob, processedResult?.metadata);
    toast.success('Image selected successfully!');
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Enhanced Image Upload & Processing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedFile}>Preview</TabsTrigger>
            <TabsTrigger value="results" disabled={!processedResult}>Results</TabsTrigger>
            {showEditor && <TabsTrigger value="editor" disabled={!selectedFile}>Editor</TabsTrigger>}
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Select Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}. 
                  Max size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Processing Options:</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Image Compression</Label>
                    <p className="text-xs text-muted-foreground">Reduce file size for better performance</p>
                  </div>
                  <Switch checked={enableCompression} onCheckedChange={setEnableCompression} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Background Removal</Label>
                    <p className="text-xs text-muted-foreground">Remove background for clean outfit photos</p>
                  </div>
                  <Switch checked={enableBackgroundRemoval} onCheckedChange={setEnableBackgroundRemoval} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Color Analysis</Label>
                    <p className="text-xs text-muted-foreground">Extract color palette for style recommendations</p>
                  </div>
                  <Switch checked={enableColorAnalysis} onCheckedChange={setEnableColorAnalysis} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {previewUrl && (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full max-h-96 object-contain bg-gray-50"
                  />
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={processImage} 
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Process Image'}
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={processingProgress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      Processing image... {processingProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {processedResult && (
              <div className="space-y-6">
                {/* Image Variants */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Original */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Original
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <img 
                        src={previewUrl!} 
                        alt="Original" 
                        className="w-full h-32 object-cover rounded border"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(processedResult.metadata.originalSize)}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(processedResult.originalBlob, 'original.jpg')}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelectFinal(processedResult.originalBlob)}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compressed */}
                  {processedResult.compressedBlob && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileImage className="h-4 w-4" />
                          Compressed
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <img 
                          src={URL.createObjectURL(processedResult.compressedBlob)} 
                          alt="Compressed" 
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(processedResult.metadata.compressedSize!)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {processedResult.metadata.compressionRatio?.toFixed(1)}x smaller
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(processedResult.compressedBlob!, 'compressed.jpg')}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSelectFinal(processedResult.compressedBlob!)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Background Removed */}
                  {processedResult.backgroundRemovedBlob && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Scissors className="h-4 w-4" />
                          Background Removed
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="relative">
                          <img 
                            src={URL.createObjectURL(processedResult.backgroundRemovedBlob)} 
                            alt="Background removed" 
                            className="w-full h-32 object-contain rounded border bg-gray-100"
                            style={{ backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px' }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">PNG with transparency</p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(processedResult.backgroundRemovedBlob!, 'no-background.png')}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSelectFinal(processedResult.backgroundRemovedBlob!)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Color Palette */}
                {processedResult.colors && processedResult.colors.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Color Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Dominant Color:</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-8 h-8 rounded border shadow-sm"
                              style={{ backgroundColor: processedResult.dominantColor }}
                            />
                            <span className="text-sm font-mono">{processedResult.dominantColor}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Color Palette:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {processedResult.colors.map((color, index) => (
                              <div 
                                key={index}
                                className="flex flex-col items-center gap-1"
                              >
                                <div 
                                  className="w-8 h-8 rounded border shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-mono">{color}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {showEditor && (
            <TabsContent value="editor" className="space-y-4">
              {previewUrl && (
                <ImageEditor
                  imageUrl={previewUrl}
                  onSave={(blob) => {
                    handleSelectFinal(blob);
                    setActiveTab('results');
                  }}
                  width={800}
                  height={600}
                />
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedImageUpload;
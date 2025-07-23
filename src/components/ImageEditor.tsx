import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, FabricText, PencilBrush, FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
// import { ColorPicker } from '@/components/ui/color-picker';
import { 
  Download, 
  Undo, 
  Redo, 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Paintbrush2, 
  Move,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorProps {
  imageUrl?: string;
  onSave?: (blob: Blob) => void;
  width?: number;
  height?: number;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  onSave,
  width = 800,
  height = 600
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState([2]);
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'rectangle' | 'circle' | 'text'>('select');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
    });

    // Initialize drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushWidth[0];

    // Load background image if provided
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const fabricImage = new FabricImage(img);
        
        // Scale image to fit canvas
        const scaleX = width / fabricImage.width!;
        const scaleY = height / fabricImage.height!;
        const scale = Math.min(scaleX, scaleY);
        
        fabricImage.scale(scale);
        fabricImage.set({
          left: (width - fabricImage.width! * scale) / 2,
          top: (height - fabricImage.height! * scale) / 2,
          selectable: false,
          evented: false
        });
        
        canvas.add(fabricImage);
        canvas.sendObjectToBack(fabricImage); // Send to back
        canvas.renderAll();
      };
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        toast.error('Failed to load image');
      };
      img.src = imageUrl;
    }

    // Setup history tracking
    const saveState = () => {
      setCanUndo(true);
      setCanRedo(false);
    };

    canvas.on('path:created', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);
    canvas.on('object:modified', saveState);

    setFabricCanvas(canvas);
    toast.success('Image editor ready!');

    return () => {
      canvas.dispose();
    };
  }, [imageUrl, width, height]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushWidth[0];
    }
  }, [activeTool, activeColor, brushWidth, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 100,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        radius: 50,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === 'text') {
      const text = new FabricText('Click to edit', {
        left: 100,
        top: 100,
        fill: activeColor,
        fontSize: 24,
        fontFamily: 'Arial',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    }
    
    fabricCanvas.renderAll();
  };

  const handleUndo = () => {
    // Simple undo by removing last object
    const objects = fabricCanvas?.getObjects();
    if (objects && objects.length > 1) { // Keep background image
      fabricCanvas?.remove(objects[objects.length - 1]);
      fabricCanvas?.renderAll();
      setCanUndo(objects.length > 2);
    }
  };

  const handleRedo = () => {
    // Simplified redo - in a full implementation, you'd maintain a proper history stack
    setCanRedo(false);
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    const backgroundImage = objects[0]; // Assuming first object is background
    
    fabricCanvas.clear();
    if (backgroundImage && backgroundImage.type === 'image') {
      fabricCanvas.add(backgroundImage);
    } else {
      fabricCanvas.backgroundColor = '#ffffff';
    }
    fabricCanvas.renderAll();
    setCanUndo(false);
    setCanRedo(false);
    toast.success('Canvas cleared!');
  };

  const handleRotate = () => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (activeObject) {
      activeObject.rotate((activeObject.angle || 0) + 90);
      fabricCanvas?.renderAll();
    }
  };

  const handleDelete = () => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (activeObject) {
      fabricCanvas?.remove(activeObject);
      fabricCanvas?.renderAll();
    }
  };

  const handleSave = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1
    });
    
    // Convert data URL to blob
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => {
        if (onSave) {
          onSave(blob);
        } else {
          // Download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'edited-image.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        toast.success('Image saved!');
      })
      .catch(() => {
        toast.error('Failed to save image');
      });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Image Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center justify-between border-b pb-4">
          <div className="flex gap-2 items-center">
            <Button
              variant={activeTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('select')}
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'draw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('draw')}
            >
              <Paintbrush2 className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('rectangle')}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('circle')}
            >
              <CircleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('text')}
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Color:</label>
            <input
              type="color"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
          </div>

          {activeTool === 'draw' && (
            <div className="flex items-center gap-2 min-w-[200px]">
              <label className="text-sm font-medium">Brush Size:</label>
              <Slider
                value={brushWidth}
                onValueChange={setBrushWidth}
                max={50}
                min={1}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8">{brushWidth[0]}</span>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSave}>
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-gray-50 flex justify-center">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageEditor;
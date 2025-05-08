
import { useEffect, useRef, useState } from "react";
import { Canvas, Object as FabricObject, Rect, Circle, IText } from "fabric";
import { Button } from "@/components/ui/button";
import { Pen, Square, Circle as CircleIcon, Text, StickyNote, Move, Trash2, Download } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

type Tool = "select" | "pen" | "rect" | "circle" | "text" | "sticky";

interface WhiteboardCanvasProps {
  blueprintId?: string;
  readOnly?: boolean;
}

export function WhiteboardCanvas({ blueprintId, readOnly = false }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeColor, setActiveColor] = useState("#9b87f5");
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('id');
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = new Canvas(canvasRef.current, {
      width: window.innerWidth * 0.9,
      height: window.innerHeight * 0.7,
      backgroundColor: "#f9f9f9",
      isDrawingMode: false,
    });

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.7,
      });
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);
    
    setFabricCanvas(canvas);
    
    // Load existing canvas if available
    loadCanvas();
    
    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [workshopId, blueprintId]);

  // Update drawing mode based on active tool
  useEffect(() => {
    if (!fabricCanvas) return;
    
    fabricCanvas.isDrawingMode = activeTool === "pen";
    
    if (activeTool === "pen") {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 3;
    }
    
    fabricCanvas.defaultCursor = activeTool === "select" ? "default" : "crosshair";
  }, [activeTool, activeColor, fabricCanvas]);

  // Save canvas state
  const saveCanvas = async () => {
    if (!fabricCanvas || !workshopId) return;
    
    try {
      setIsSaving(true);
      const canvasJSON = JSON.stringify(fabricCanvas.toJSON());
      
      // First check if whiteboard already exists
      const { data, error: selectError } = await supabase
        .from('workshop_whiteboards')
        .select('id')
        .eq('workshop_id', workshopId)
        .eq('blueprint_id', blueprintId || null)
        .maybeSingle();
        
      if (selectError) throw selectError;
      
      if (data) {
        // Update existing whiteboard
        const { error } = await supabase
          .from('workshop_whiteboards')
          .update({
            canvas_data: canvasJSON,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
          
        if (error) throw error;
      } else {
        // Create new whiteboard
        const { error } = await supabase
          .from('workshop_whiteboards')
          .insert({
            workshop_id: workshopId,
            blueprint_id: blueprintId || null,
            canvas_data: canvasJSON
          });
          
        if (error) throw error;
      }
      
      toast.success("Whiteboard saved successfully");
    } catch (err) {
      console.error("Error saving whiteboard:", err);
      toast.error("Failed to save whiteboard");
    } finally {
      setIsSaving(false);
    }
  };

  // Load canvas state
  const loadCanvas = async () => {
    if (!fabricCanvas || !workshopId) return;
    
    try {
      const { data, error } = await supabase
        .from('workshop_whiteboards')
        .select('canvas_data')
        .eq('workshop_id', workshopId)
        .eq('blueprint_id', blueprintId || null)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.canvas_data) {
        fabricCanvas.loadFromJSON(data.canvas_data, fabricCanvas.renderAll.bind(fabricCanvas));
        toast.success("Whiteboard loaded");
      }
    } catch (err) {
      console.error("Error loading whiteboard:", err);
      toast.error("Failed to load whiteboard");
    }
  };

  // Handle tool selection
  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);
    
    if (tool === "select") {
      // Enable object selection
      if (fabricCanvas) {
        fabricCanvas.isDrawingMode = false;
      }
    }
  };

  // Handle object creation
  const handleObjectCreate = (e: React.MouseEvent) => {
    if (!fabricCanvas || activeTool === "select" || activeTool === "pen") return;
    
    // Get canvas position
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let obj: FabricObject;
    
    switch (activeTool) {
      case "rect":
        obj = new Rect({
          left: x,
          top: y,
          fill: activeColor,
          width: 100,
          height: 80,
          opacity: 0.7,
        });
        break;
      case "circle":
        obj = new Circle({
          left: x,
          top: y,
          fill: activeColor,
          radius: 50,
          opacity: 0.7,
        });
        break;
      case "text":
        obj = new IText("Edit this text", {
          left: x,
          top: y,
          fontFamily: "Arial",
          fill: "#333333",
          fontSize: 20,
        });
        break;
      case "sticky":
        // Create a sticky note (rect + text)
        obj = new Rect({
          left: x,
          top: y,
          fill: "#FFEB3B",
          width: 150,
          height: 150,
          opacity: 1,
        });
        
        const text = new IText("Sticky note", {
          left: x + 20,
          top: y + 20,
          fontFamily: "Arial",
          fill: "#333333",
          fontSize: 14,
          width: 120,
        });
        
        fabricCanvas.add(obj, text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
        return;
      default:
        return;
    }
    
    fabricCanvas.add(obj);
    fabricCanvas.setActiveObject(obj);
    fabricCanvas.renderAll();
  };

  // Handle clear canvas
  const handleClear = () => {
    if (!fabricCanvas) return;
    
    if (window.confirm("Are you sure you want to clear the whiteboard?")) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "#f9f9f9";
      fabricCanvas.renderAll();
      toast.info("Whiteboard cleared");
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (!fabricCanvas) return;
    
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        fabricCanvas.remove(obj);
      });
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  };

  // Export canvas as image
  const handleExport = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1
    });
    
    const link = document.createElement('a');
    link.download = `whiteboard-${new Date().toISOString()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Whiteboard exported as image");
  };
  
  // Colors
  const colors = [
    "#9b87f5",  // Primary Purple
    "#0EA5E9",  // Ocean Blue
    "#F97316",  // Bright Orange
    "#D946EF",  // Magenta Pink
    "#22C55E",  // Green
    "#EF4444",  // Red
    "#333333",  // Dark Gray
  ];

  return (
    <div className="flex flex-col gap-4 mb-8 bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={activeTool === "select" ? "default" : "outline"} 
            onClick={() => handleToolClick("select")}
            title="Select Mode"
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={activeTool === "pen" ? "default" : "outline"} 
            onClick={() => handleToolClick("pen")}
            title="Pen Tool"
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={activeTool === "rect" ? "default" : "outline"} 
            onClick={() => handleToolClick("rect")}
            title="Rectangle Tool"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={activeTool === "circle" ? "default" : "outline"} 
            onClick={() => handleToolClick("circle")}
            title="Circle Tool"
          >
            <CircleIcon className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={activeTool === "text" ? "default" : "outline"} 
            onClick={() => handleToolClick("text")}
            title="Text Tool"
          >
            <Text className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant={activeTool === "sticky" ? "default" : "outline"} 
            onClick={() => handleToolClick("sticky")}
            title="Sticky Note Tool"
          >
            <StickyNote className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            {colors.map((color) => (
              <div 
                key={color}
                onClick={() => setActiveColor(color)}
                className={`w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform ${
                  activeColor === color ? "ring-2 ring-black" : ""
                }`}
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleDeleteSelected}
            title="Delete Selected"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleClear}
            title="Clear Whiteboard"
          >
            Clear
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleExport}
            title="Export as Image"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={saveCanvas}
            disabled={isSaving || readOnly}
            title="Save Whiteboard"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden bg-gray-50">
        <canvas
          ref={canvasRef}
          onClick={handleObjectCreate}
          className="w-full"
        />
      </div>
    </div>
  );
}

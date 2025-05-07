
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface WorkshopTitleProps {
  workshopName: string;
  setWorkshopName: (name: string) => void;
}

export function WorkshopTitle({ workshopName, setWorkshopName }: WorkshopTitleProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="workshop-name" className="text-base font-medium">Workshop Title</Label>
      <Input 
        id="workshop-name" 
        value={workshopName}
        onChange={(e) => setWorkshopName(e.target.value)}
        placeholder="Enter workshop title"
      />
    </div>
  );
}

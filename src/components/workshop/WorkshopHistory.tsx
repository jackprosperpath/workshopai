
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

type Workshop = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

interface WorkshopHistoryProps {
  workshops: Workshop[];
  isLoading: boolean;
}

export function WorkshopHistory({ workshops, isLoading }: WorkshopHistoryProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-center py-4">Loading workshops...</div>;
  }

  if (workshops.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No workshops found. Create your first one!
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workshops.map((workshop) => (
            <TableRow key={workshop.id}>
              <TableCell className="font-medium">{workshop.name}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(workshop.updated_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(workshop.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/workshop?id=${workshop.id}`)}
                >
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

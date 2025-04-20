
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
import { Share2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (workshopId: string) => {
    try {
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;
      toast.success("Workshop deleted successfully");
      // The parent component should handle refreshing the list
    } catch (error) {
      console.error("Error deleting workshop:", error);
      toast.error("Failed to delete workshop");
    }
  };

  const handleShare = async (workshopId: string) => {
    try {
      const shareUrl = `${window.location.origin}/workshop?id=${workshopId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      console.error("Error copying share link:", error);
      toast.error("Failed to copy share link");
    }
  };

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
            <TableHead className="text-right">Actions</TableHead>
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
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/workshop?id=${workshop.id}`)}
                  >
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare(workshop.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workshop</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this workshop? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(workshop.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

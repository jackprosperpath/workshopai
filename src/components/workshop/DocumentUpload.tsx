
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type Document = {
  name: string;
  path: string;
  size: number;
};

type DocumentUploadProps = {
  onDocumentsUpdate: (documents: Document[]) => void;
};

export function DocumentUpload({ onDocumentsUpdate }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files) return;

      setUploading(true);
      const uploadedDocs: Document[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('workshop-documents')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        uploadedDocs.push({
          name: file.name,
          path: filePath,
          size: file.size,
        });
      }

      const newDocuments = [...documents, ...uploadedDocs];
      setDocuments(newDocuments);
      onDocumentsUpdate(newDocuments);
      toast.success("Documents uploaded successfully");
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (doc: Document) => {
    try {
      const { error } = await supabase.storage
        .from('workshop-documents')
        .remove([doc.path]);

      if (error) throw error;

      const newDocuments = documents.filter(d => d.path !== doc.path);
      setDocuments(newDocuments);
      onDocumentsUpdate(newDocuments);
      toast.success("Document removed successfully");
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error("Failed to remove document");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="w-full"
          disabled={uploading}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Documents"}
        </Button>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Documents</h4>
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.path}
                className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
              >
                <span className="truncate flex-1">{doc.name}</span>
                <button
                  onClick={() => removeDocument(doc)}
                  className="ml-2 text-destructive hover:text-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

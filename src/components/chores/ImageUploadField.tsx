
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  previewUrl: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export function ImageUploadField({ previewUrl, onImageChange, onRemoveImage }: ImageUploadFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Image (Optional)</Label>
      <div className="flex flex-col gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="cursor-pointer"
        />
        {previewUrl && (
          <div className="relative mt-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-40 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onRemoveImage}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

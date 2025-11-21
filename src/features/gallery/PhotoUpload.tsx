import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
} from "@mui/material";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { photoStorage } from "../../utils/photoStorage";
import { useTripStore } from "../../store/useTripStore";
import type { Photo } from "../../types";

interface PhotoUploadProps {
  tripId: string;
  dayId?: string;
  activityId?: string;
  onUploadComplete?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const PhotoUpload = ({
  tripId,
  dayId,
  activityId,
  onUploadComplete,
}: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const addPhoto = useTripStore((state) => state.addPhoto);

  const createThumbnail = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const fileArray = Array.from(files);

    // Validate files
    const validFiles = fileArray.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`File type ${file.type} not supported`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create previews
    const newPreviews = await Promise.all(
      validFiles.map(async (file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    );

    setPreviews(newPreviews);
  }, []);

  const handleUpload = useCallback(async () => {
    if (previews.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < previews.length; i++) {
        const { file } = previews[i];
        const photoId = uuidv4();

        // Create thumbnail
        const thumbnailUrl = await createThumbnail(file);

        // Save to IndexedDB
        const dbId = await photoStorage.savePhoto(file, tripId, photoId);

        // Create photo metadata
        const photo: Photo = {
          id: photoId,
          tripId,
          dayId,
          activityId,
          fileName: file.name,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          captureDate: new Date(file.lastModified || Date.now()).toISOString(),
          thumbnailUrl,
          photoId: dbId,
        };

        // Add to store
        addPhoto(tripId, photo);

        // Update progress
        setProgress(((i + 1) / previews.length) * 100);
      }

      // Cleanup
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setProgress(0);
      onUploadComplete?.();
    } catch (err) {
      setError("Failed to upload photos");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [
    previews,
    tripId,
    dayId,
    activityId,
    createThumbnail,
    addPhoto,
    onUploadComplete,
  ]);

  const removePreviews = useCallback((index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <Box sx={{ width: "100%" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: "2px dashed",
          borderColor: isDragging ? "primary.main" : "divider",
          backgroundColor: isDragging ? "action.hover" : "background.paper",
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        <input
          type="file"
          id="photo-upload"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        <label htmlFor="photo-upload" style={{ cursor: "pointer" }}>
          <Upload size={48} style={{ color: "#1976d2", marginBottom: 16 }} />
          <Typography variant="h6" gutterBottom>
            Drag & Drop Photos Here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to browse (Max 10MB per file)
          </Typography>
        </label>
      </Paper>

      {previews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {previews.length} photo(s) ready to upload
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 2,
              mt: 2,
            }}
          >
            {previews.map((preview, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  paddingTop: "100%",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  onClick={() => removePreviews(index)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: "50%",
                    p: 0.5,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <X size={16} color="white" />
                </Box>
              </Box>
            ))}
          </Box>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                Uploading: {Math.round(progress)}%
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              startIcon={<ImageIcon />}
              fullWidth
            >
              {uploading
                ? "Uploading..."
                : `Upload ${previews.length} Photo(s)`}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                previews.forEach((p) => URL.revokeObjectURL(p.url));
                setPreviews([]);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

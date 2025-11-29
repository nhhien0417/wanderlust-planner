import { useState, useEffect, useCallback } from "react";
import { Dialog, Box, IconButton, Typography, Fade } from "@mui/material";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Trash2,
  Edit2,
} from "lucide-react";
import type { Photo } from "../../../../types";
import { photoStorage } from "../../../../utils/photoStorage";
import { isVideo } from "../../../../utils/mediaUtils";

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
  onEdit?: (photo: Photo) => void;
  readonly?: boolean;
}

export const PhotoLightbox = ({
  photos,
  initialIndex,
  open,
  onClose,
  onDelete,
  onEdit,
  readonly,
}: PhotoLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const currentPhoto = photos[currentIndex];

  // Sync initial index when opening a different photo
  useEffect(() => {
    if (!open) return;
    const safeIndex = Math.min(initialIndex, Math.max(photos.length - 1, 0));
    setCurrentIndex(safeIndex);
  }, [initialIndex, photos.length, open]);

  useEffect(() => {
    if (!open) return;
    setCurrentIndex((prev) => Math.min(prev, Math.max(photos.length - 1, 0)));
  }, [photos.length, open]);

  useEffect(() => {
    if (open && photos.length === 0) {
      onClose();
    }
  }, [open, photos.length, onClose]);

  // Load photo URL from IndexedDB
  useEffect(() => {
    if (!currentPhoto) return;
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadPhoto = async () => {
      const url = await photoStorage.getPhotoUrl(currentPhoto.id);
      if (!isMounted) {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
        return;
      }
      objectUrl = url;
      setPhotoUrl(url);
    };

    loadPhoto();

    return () => {
      isMounted = false;
      if (objectUrl && objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [currentPhoto?.id]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "+":
        case "=":
          setZoom((z) => Math.min(z + 0.25, 3));
          break;
        case "-":
          setZoom((z) => Math.max(z - 0.25, 0.5));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, handleNext, handlePrevious, onClose]);

  // Reset zoom when photo changes
  useEffect(() => {
    setZoom(1);
  }, [currentIndex]);

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.25, 0.5));
  };

  const handleDelete = () => {
    if (currentPhoto && onDelete) {
      onDelete(currentPhoto.id);
      // Move to next photo or close if last one
      if (photos.length > 1) {
        if (currentIndex === photos.length - 1) {
          setCurrentIndex(currentIndex - 1);
        }
      } else {
        onClose();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (photoUrl && photoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  if (!currentPhoto) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.95)",
        },
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
        }}
      >
        <Typography variant="h6" sx={{ color: "white" }}>
          {currentIndex + 1} / {photos.length}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={handleZoomOut} sx={{ color: "white" }}>
            <ZoomOut size={20} />
          </IconButton>
          <IconButton onClick={handleZoomIn} sx={{ color: "white" }}>
            <ZoomIn size={20} />
          </IconButton>
          {!readonly && onEdit && (
            <IconButton
              onClick={() => onEdit(currentPhoto)}
              sx={{ color: "white" }}
            >
              <Edit2 size={20} />
            </IconButton>
          )}
          {!readonly && onDelete && (
            <IconButton onClick={handleDelete} sx={{ color: "white" }}>
              <Trash2 size={20} />
            </IconButton>
          )}
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Main Image */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          overflow: "hidden",
          cursor: zoom > 1 ? "grab" : "default",
        }}
        onClick={() => setShowInfo(!showInfo)}
      >
        <Fade in={Boolean(photoUrl)} timeout={300}>
          {currentPhoto && isVideo(currentPhoto.fileName) ? (
            <Box
              component="video"
              src={photoUrl || ""}
              controls
              autoPlay
              sx={{
                maxWidth: "90%",
                maxHeight: "90%",
                outline: "none",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Box
              component="img"
              src={photoUrl || currentPhoto.thumbnailUrl}
              alt={currentPhoto.description || "Photo"}
              sx={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
                transform: `scale(${zoom})`,
                transition: "transform 0.2s",
                userSelect: "none",
              }}
            />
          )}
        </Fade>
      </Box>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <ChevronLeft size={32} />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <ChevronRight size={32} />
          </IconButton>
        </>
      )}

      {/* Bottom Info Bar */}
      <Fade in={showInfo}>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            p: 3,
            background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
            color: "white",
          }}
        >
          {currentPhoto.description && (
            <Typography variant="h6" gutterBottom>
              {currentPhoto.description}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {currentPhoto.captureDate && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Date: {new Date(currentPhoto.captureDate).toLocaleString()}
              </Typography>
            )}
            {currentPhoto.location && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Location: {currentPhoto.location.name}
              </Typography>
            )}
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Size: {(currentPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Dialog>
  );
};

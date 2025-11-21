import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { MoreVertical, Image as ImageIcon, PlayCircle } from "lucide-react";
import { isVideo } from "../../utils/mediaUtils";
import { useTripStore } from "../../store/useTripStore";
import { photoStorage } from "../../utils/photoStorage";
import type { Photo } from "../../types";

const EMPTY_PHOTOS: Photo[] = [];

interface PhotoGalleryProps {
  tripId: string;
  photos?: Photo[];
  onPhotoClick?: (photo: Photo, index: number) => void;
  onEditPhoto?: (photo: Photo) => void;
  onPhotosChange?: (photos: Photo[]) => void;
  filterByActivityId?: string;
  filterByDayId?: string;
}

export const PhotoGallery = ({
  tripId,
  photos: photosProp,
  onPhotoClick,
  onEditPhoto,
  onPhotosChange,
  filterByActivityId,
  filterByDayId,
}: PhotoGalleryProps) => {
  const trip = useTripStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const deletePhoto = useTripStore((state) => state.deletePhoto);

  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const photos = photosProp ?? trip?.photos ?? EMPTY_PHOTOS;

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      if (filterByActivityId && photo.activityId !== filterByActivityId)
        return false;
      if (filterByDayId && photo.dayId !== filterByDayId) return false;
      return true;
    });
  }, [photos, filterByActivityId, filterByDayId]);

  // Load photo URLs from IndexedDB
  useEffect(() => {
    let isMounted = true;
    let createdUrls: string[] = [];

    const loadPhotos = async () => {
      setLoading(true);
      const urls: Record<string, string> = {};

      for (const photo of filteredPhotos) {
        try {
          const url = await photoStorage.getPhotoUrl(photo.id);
          if (url) {
            urls[photo.id] = url;
            createdUrls.push(url);
          }
        } catch (error) {
          console.error("Failed to load photo", error);
        }
      }

      if (!isMounted) {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setPhotoUrls((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return urls;
      });
      setLoading(false);
    };

    loadPhotos();

    // Cleanup object URLs on unmount
    return () => {
      isMounted = false;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filteredPhotos]);

  useEffect(() => {
    onPhotosChange?.(filteredPhotos);
  }, [filteredPhotos, onPhotosChange]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    photo: Photo
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPhoto(photo);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPhoto(null);
  };

  const handleDelete = async () => {
    if (selectedPhoto) {
      await deletePhoto(tripId, selectedPhoto.id);
      handleMenuClose();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (filteredPhotos.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 2,
        }}
      >
        <ImageIcon size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Photos Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload some photos to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 2,
        }}
      >
        {filteredPhotos.map((photo, index) => (
          <Paper
            key={photo.id}
            elevation={2}
            sx={{
              position: "relative",
              paddingTop: "100%",
              overflow: "hidden",
              cursor: "pointer",
              borderRadius: 2,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: 6,
              },
            }}
            onClick={() => onPhotoClick?.(photo, index)}
          >
            <Box
              component="img"
              src={
                isVideo(photo.fileName)
                  ? photo.thumbnailUrl
                  : photoUrls[photo.id] || photo.thumbnailUrl
              }
              alt={photo.description || `Photo ${index + 1}`}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Video Overlay */}
            {isVideo(photo.fileName) && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  opacity: 0.9,
                  zIndex: 1,
                }}
              >
                <PlayCircle size={48} fill="rgba(0,0,0,0.5)" />
              </Box>
            )}

            {/* Overlay */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              {photo.description && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {photo.description}
                </Typography>
              )}
              {photo.captureDate && (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {new Date(photo.captureDate).toLocaleDateString()}
                </Typography>
              )}
              {photo.location?.name && (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {photo.location.name}
                </Typography>
              )}
            </Box>

            {/* Menu Button */}
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, photo)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <MoreVertical size={18} />
            </IconButton>
          </Paper>
        ))}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onEditPhoto && (
          <MenuItem
            onClick={() => {
              if (selectedPhoto) {
                onEditPhoto(selectedPhoto);
              }
              handleMenuClose();
            }}
          >
            Edit Details
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>Delete Photo</MenuItem>
      </Menu>
    </Box>
  );
};

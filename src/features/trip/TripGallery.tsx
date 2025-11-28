import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { SelectChangeEvent } from "@mui/material";
import {
  Box,
  Container,
  Typography,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTripsStore } from "../../store/useTripsStore";
import { usePhotosStore } from "../../store/usePhotosStore";
import { PhotoGallery } from "./components/gallery/PhotoGallery";
import { PhotoUpload } from "./components/gallery/PhotoUpload";
import { PhotoLightbox } from "./components/gallery/PhotoLightbox";
import { PhotoMetadataForm } from "./components/gallery/PhotoMetadataForm";
import type { Photo } from "../../types";

const EMPTY_PHOTOS: Photo[] = [];

interface TripGalleryProps {
  tripId: string;
}

export const TripGallery = ({ tripId }: TripGalleryProps) => {
  const trip = useTripsStore((state) =>
    state.trips.find((t) => t.id === tripId)
  );
  const tripPhotos = useTripsStore((state) => {
    const found = state.trips.find((t) => t.id === tripId);
    return found?.photos ?? EMPTY_PHOTOS;
  });

  const { deletePhoto } = usePhotosStore();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [photoDayFilter, setPhotoDayFilter] = useState("");
  const [photoActivityFilter, setPhotoActivityFilter] = useState("");

  if (!trip) return null;

  // Photo Logic
  const filteredPhotos = tripPhotos.filter((photo) => {
    if (photoDayFilter && photo.dayId !== photoDayFilter) return false;
    if (photoActivityFilter && photo.activityId !== photoActivityFilter)
      return false;
    return true;
  });

  const handlePhotoClick = (photo: Photo) => {
    const index = filteredPhotos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handlePhotoDelete = async (photoId: string) => {
    await deletePhoto(trip.id, photoId);
    if (filteredPhotos.length <= 1) {
      setLightboxOpen(false);
    }
  };

  const handlePhotoEdit = (photo: Photo) => {
    setEditingPhoto(photo);
  };

  const selectedDay = trip.days.find((d) => d.id === photoDayFilter);
  const activitiesForFilter = selectedDay ? selectedDay.activities : [];

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
          gap: 3,
        }}
      >
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Upload Photos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Attach uploads to a day or activity to keep memories organized.
          </Typography>
          <PhotoUpload
            tripId={trip.id}
            dayId={photoDayFilter || undefined}
            activityId={photoActivityFilter || undefined}
          />
        </Card>

        <Card sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Gallery ({filteredPhotos.length})
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="day-filter-label">Day</InputLabel>
                <Select
                  labelId="day-filter-label"
                  label="Day"
                  value={photoDayFilter}
                  onChange={(event: SelectChangeEvent<string>) => {
                    setPhotoDayFilter(event.target.value);
                    if (!event.target.value) {
                      setPhotoActivityFilter("");
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>All days</em>
                  </MenuItem>
                  {trip.days.map((day, index) => (
                    <MenuItem key={day.id} value={day.id}>
                      Day {index + 1} - {format(parseISO(day.date), "MMM d")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedDay && (
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="activity-filter-label">Activity</InputLabel>
                  <Select
                    labelId="activity-filter-label"
                    label="Activity"
                    value={photoActivityFilter}
                    onChange={(event: SelectChangeEvent<string>) =>
                      setPhotoActivityFilter(event.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>All activities</em>
                    </MenuItem>
                    {activitiesForFilter.map((activity) => (
                      <MenuItem key={activity.id} value={activity.id}>
                        {activity.location?.name || activity.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <PhotoGallery
              tripId={trip.id}
              photos={filteredPhotos}
              onPhotoClick={handlePhotoClick}
              onEditPhoto={handlePhotoEdit}
            />
          </Box>
        </Card>
      </Box>

      <PhotoLightbox
        photos={filteredPhotos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onDelete={handlePhotoDelete}
        onEdit={handlePhotoEdit}
      />

      {editingPhoto && (
        <PhotoMetadataForm
          tripId={trip.id}
          photo={editingPhoto}
          open={Boolean(editingPhoto)}
          onClose={() => setEditingPhoto(null)}
        />
      )}
    </Container>
  );
};

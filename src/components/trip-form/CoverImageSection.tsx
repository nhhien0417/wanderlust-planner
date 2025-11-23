import { Box, Button, IconButton } from "@mui/material";
import { Image as ImageIcon, X } from "lucide-react";

interface CoverImageSectionProps {
  coverImage: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

export const CoverImageSection = ({
  coverImage,
  onImageChange,
  onImageRemove,
}: CoverImageSectionProps) => {
  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="cover-image-upload"
        type="file"
        onChange={onImageChange}
      />
      <label htmlFor="cover-image-upload">
        <Button
          variant="outlined"
          component="span"
          fullWidth
          startIcon={<ImageIcon />}
          sx={{
            height: 56,
            borderStyle: "dashed",
            borderColor: coverImage ? "primary.main" : "grey.400",
            color: coverImage ? "primary.main" : "text.secondary",
          }}
        >
          {coverImage ? "Change Cover Image" : "Upload Cover Image"}
        </Button>
      </label>
      {coverImage && (
        <Box
          sx={{
            mt: 2,
            position: "relative",
            width: "100%",
            height: 160,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={coverImage}
            alt="Cover Preview"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              onImageRemove();
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.5)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

import React, { useState, useEffect } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import apiClient from "../../services/api";

interface LazyImageProps {
  imageUrl: string | null | undefined;
  initials: string;
  altText: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ imageUrl, initials, altText }) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (imageUrl) {
      let isMounted = true;
      setLoading(true);
      setError(false);

      apiClient
        .get(imageUrl, { responseType: "arraybuffer" })
        .then((response) => {
          if (!isMounted) return;
          const imageStr = btoa(
            new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
          );
          setLoadedSrc(`data:image/jpeg;base64,${imageStr}`);
        })
        .catch(() => {
          if (isMounted) setError(true);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setLoading(false);
    }
  }, [imageUrl]);

  // If no image URL is provided at all, show initials box
  if (!imageUrl) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: 180, md: 240 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.200",
          borderRadius: 1,
        }}
      >
        <Typography variant="h4" sx={{ color: "text.secondary" }}>
          {initials}
        </Typography>
      </Box>
    );
  }

  // While fetching the image, show a skeleton
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{ width: "100%", height: { xs: 180, md: 240 }, borderRadius: 1 }}
      />
    );
  }

  // If there was an error fetching, show a broken image icon
  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: 180, md: 240 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.200",
          borderRadius: 1,
        }}
      >
        <BrokenImageIcon sx={{ color: "text.secondary", fontSize: 40 }} />
      </Box>
    );
  }

  // If image is successfully loaded, display it
  return (
    <Box
      component="img"
      src={loadedSrc || ""}
      alt={altText}
      sx={{
        width: "100%",
        height: { xs: "auto", md: 240 },
        objectFit: "cover",
        borderRadius: 1,
        boxShadow: 1,
      }}
    />
  );
};

export default LazyImage;

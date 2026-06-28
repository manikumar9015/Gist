package com.easyread.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload an image to Cloudinary and return the secure HTTPS URL.
     */
    public String uploadImage(MultipartFile file) throws IOException {
        try {
            log.info("Uploading image to Cloudinary: name={}, size={} bytes, type={}",
                    file.getOriginalFilename(), file.getSize(), file.getContentType());

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "folder", "easyread/thumbnails"
                    )
            );

            // Prefer secure_url (HTTPS) over url (HTTP)
            String url = uploadResult.containsKey("secure_url")
                    ? uploadResult.get("secure_url").toString()
                    : uploadResult.get("url").toString();

            log.info("Cloudinary upload successful: {}", url);
            return url;
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected Cloudinary error: {}", e.getMessage(), e);
            throw new IOException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }
}

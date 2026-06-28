package com.easyread.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookDto {
    private Long id;
    private String title;
    private String author;
    private String genre;
    private String description;
    private String thumbnailUrl;
    private Integer totalChunks;
    private String fileSource;
    private Integer views;
    private String uploaderUsername;
}

package com.easyread.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProgressDto {
    private Long bookId;
    private Integer lastChunk;
    private Boolean easyReadOn;
    private Integer totalChunks;
}

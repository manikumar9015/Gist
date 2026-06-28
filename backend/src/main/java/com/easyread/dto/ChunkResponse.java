package com.easyread.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChunkResponse {
    private Long bookId;
    private Integer chunkIndex;
    private String content;
    private Boolean simplified;
    private Integer totalChunks;
}

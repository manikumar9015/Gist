package com.easyread.controller;

import com.easyread.entity.Role;
import com.easyread.entity.User;
import com.easyread.repository.UserRepository;
import com.easyread.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final BookService bookService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        User user = userRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();
        user.setRole(role);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}

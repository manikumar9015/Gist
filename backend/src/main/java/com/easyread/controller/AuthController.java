package com.easyread.controller;

import com.easyread.dto.AuthResponse;
import com.easyread.dto.LoginRequest;
import com.easyread.dto.RegisterRequest;
import com.easyread.entity.User;
import com.easyread.repository.UserRepository;
import com.easyread.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .message("Username is already taken")
                    .build()
            );
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .message("Email is already registered")
                    .build()
            );
        }

        // Create new user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(java.util.Objects.requireNonNull(user));

        // Generate token
        String token = tokenProvider.generateTokenFromUsername(user.getUsername());

        log.info("User registered successfully: {}", user.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(
            AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Registration successful")
                .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow();

        log.info("User logged in: {}", user.getUsername());

        return ResponseEntity.ok(
            AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Login successful")
                .build()
        );
    }
}

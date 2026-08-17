package com.example.app.network.models

// for request
data class RegisterRequest(
    val email: String,
    val password: String,
    val full_name: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

// for response
data class UserDto(
    val id: Int,
    val email: String,
    val full_name: String,
    val role: String,
)

data class AuthResponse(
    val message: String,
    val token: String?,
    val user: UserDto?
)

data class UserProfileResponse(
    val profile: UserDto
)

data class DashboardStats(
    val total_projects: Int,
    val completed_tasks: Int,
    val learning_streak_days: Int,
    val last_active: String
)

data class DashboardResponse(
    val welcome_message: String,
    val stats: DashboardStats
)
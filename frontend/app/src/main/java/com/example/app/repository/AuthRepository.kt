package com.example.app.repository

import com.example.app.network.ApiService
import com.example.app.network.NetworkResult
import com.example.app.network.TokenManager
import com.example.app.network.models.*
import android.net.Network

class AuthRepository(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) {
  
    suspend fun login(email: String, password: String):
    NetworkResult<AuthResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                val authBody = response.body()!!
                authBody.token?.let { tokenManager.saveToken(it) }
                NetworkResult.Success(authBody)
            } else {
                NetworkResult.Error("login failed: ${response.message()}")
            }
        } catch (e: Exception) {
            NetworkResult.Error("Network exception: ${e.localizedMessage}")
        }
    }
}
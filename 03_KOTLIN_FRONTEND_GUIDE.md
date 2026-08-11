# 03. Kotlin Android Frontend REST API Integration Guide

This guide explains how to connect an Android application written in Kotlin to your Express + PostgreSQL backend using **Retrofit2**, **OkHttp3**, **Coroutines**, and **MVVM Architecture**.

---

## 1. Dependencies & Manifest Setup

### Gradle (`build.gradle.kts` - Module :app)
Add Retrofit, Gson Converter, Logging Interceptor, Coroutines, and ViewModel:

```kotlin
dependencies {
    // Retrofit & Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")

    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // ViewModel & Lifecycle
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
}
```

### Android Manifest (`AndroidManifest.xml`)
Allow internet access and cleartext network traffic (for testing localhost `http://10.0.2.2:5000`):

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:usesCleartextTraffic="true" ...>
    </application>
</manifest>
```

> **Note on Emulator Localhost**: Inside an Android emulator, `http://127.0.0.1` refers to the emulator itself! To talk to your Node server running on your computer, use **`http://10.0.2.2:5000/`**.

---

## 2. Kotlin Data Models (DTOs)

Create `network/models/AuthModels.kt`:

```kotlin
package com.example.app.network.models

// Request DTOs
data class RegisterRequest(
    val email: String,
    val password_hash: String, // Or plain password sent to API
    val full_name: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

// Response DTOs
data class UserDto(
    val id: Int,
    val email: String,
    val full_name: String,
    val role: String
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
```

---

## 3. Token Storage Manager (`TokenManager.kt`)

Save and retrieve the JWT safely in Android:

```kotlin
package com.example.app.network

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_JWT_TOKEN = "jwt_token"
    }

    fun saveToken(token: String) {
        prefs.edit().putString(KEY_JWT_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return prefs.getString(KEY_JWT_TOKEN, null)
    }

    fun clearToken() {
        prefs.edit().remove(KEY_JWT_TOKEN).apply()
    }
}
```

---

## 4. Auth Interceptor & Retrofit Client Builder

### Auth Interceptor (`AuthInterceptor.kt`)
Automatically attaches `Authorization: Bearer <JWT>` to every outgoing HTTP request:

```kotlin
package com.example.app.network

import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = tokenManager.getToken()

        // If no token exists, send request as-is (for login/register)
        if (token.isNullOrEmpty()) {
            return chain.proceed(originalRequest)
        }

        // Attach JWT token to header
        val authenticatedRequest = originalRequest.newBuilder()
            .header("Authorization", "Bearer $token")
            .build()

        return chain.proceed(authenticatedRequest)
    }
}
```

### Retrofit Service Interface (`ApiService.kt`)

```kotlin
package com.example.app.network

import com.example.app.network.models.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @GET("api/user/profile")
    suspend fun getProfile(): Response<UserProfileResponse>

    @GET("api/dashboard")
    suspend fun getDashboard(): Response<DashboardResponse>
}
```

### Retrofit Singleton Provider (`RetrofitClient.kt`)

```kotlin
package com.example.app.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // 10.0.2.2 points to computer host from Android Emulator
    private const val BASE_URL = "http://10.0.2.2:5000/"

    fun create(tokenManager: TokenManager): ApiService {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenManager))
            .addInterceptor(logging)
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
```

---

## 5. Repository & State Management

### Sealed Class for Network State (`NetworkResult.kt`)

```kotlin
package com.example.app.network

sealed class NetworkResult<T>(
    val data: T? = null,
    val message: String? = null
) {
    class Success<T>(data: T) : NetworkResult<T>(data)
    class Error<T>(message: String, data: T? = null) : NetworkResult<T>(data, message)
    class Loading<T> : NetworkResult<T>()
}
```

### Auth Repository (`AuthRepository.kt`)

```kotlin
package com.example.app.repository

import com.example.app.network.ApiService
import com.example.app.network.NetworkResult
import com.example.app.network.TokenManager
import com.example.app.network.models.*

class AuthRepository(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) {
    suspend fun login(email: String, password: String): NetworkResult<AuthResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                val authBody = response.body()!!
                authBody.token?.let { tokenManager.saveToken(it) }
                NetworkResult.Success(authBody)
            } else {
                NetworkResult.Error("Login failed: ${response.message()}")
            }
        } catch (e: Exception) {
            NetworkResult.Error("Network Exception: ${e.localizedMessage}")
        }
    }
}
```

---

## 6. ViewModel Pattern (`AuthViewModel.kt`)

```kotlin
package com.example.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.app.network.NetworkResult
import com.example.app.network.models.AuthResponse
import com.example.app.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: AuthRepository) : ViewModel() {

    private val _loginState = MutableStateFlow<NetworkResult<AuthResponse>?>(null)
    val loginState: StateFlow<NetworkResult<AuthResponse>?> = _loginState

    fun loginUser(email: String, password: String) {
        viewModelScope.launch {
            _loginState.value = NetworkResult.Loading()
            val result = repository.login(email, password)
            _loginState.value = result
        }
    }
}
```

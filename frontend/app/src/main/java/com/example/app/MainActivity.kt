package com.example.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.app.network.TokenManager
import com.example.app.repository.AuthRepository
import com.example.app.ui.AuthViewModel
import com.example.app.ui.LoginScreen
import com.example.app.network.RetrofitClient

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val tokenManager = TokenManager(applicationContext)
        val apiService = RetrofitClient.create(tokenManager)
        val repository = AuthRepository(apiService, tokenManager)
        val viewModel = AuthViewModel(repository)

        setContent {
            LoginScreen(viewModel = viewModel)
        }
    }
}
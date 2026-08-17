package com.example.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.app.network.NetworkResult
import com.example.app.network.models.AuthResponse
import com.example.app.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: AuthRepository) :
ViewModel() {
    private val _loginState=
    MutableStateFlow<NetworkResult<AuthResponse>?>(null)
    val loginState: StateFlow<NetworkResult<AuthResponse>?> =
    _loginState

    fun loginUser(email: String, password: String) {
        viewModelScope.launch{
            _loginState.value = NetworkResult.Loading()
            val result = repository.login(email, password)
            _loginState.value = result
        }
    }
}
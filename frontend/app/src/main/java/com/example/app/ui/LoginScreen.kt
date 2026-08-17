package com.example.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.app.network.NetworkResult

@Composable
fun LoginScreen(viewModel: AuthViewModel) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val loginState by viewModel.loginState.collectAsState()

    Column(modifier = Modifier.padding(16.dp)) {
        TextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") }
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { viewModel.loginUser(email, password) }) {
            Text("Log in")
        }

        when (val state = loginState) {
            is NetworkResult.Loading -> {
                Spacer(modifier = Modifier.height(8.dp))
                CircularProgressIndicator()
            }
            is NetworkResult.Error -> {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = state.message ?: "Unknown error",
                    color = MaterialTheme.colorScheme.error
                )
            }
            is NetworkResult.Success -> {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Login successful!",
                    color = MaterialTheme.colorScheme.primary
                )
            }
            null -> { /* initial state, show nothing */ }
        }
    }
}


package com.example.app.network

import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val tokenMananger: TokenManager) :
Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = tokenMananger.getToken()

        if (token.isNullOrEmpty()){
            return chain.proceed(originalRequest)
        }

        val authenticatedRequest = originalRequest.newBuilder()
            .header("Authorization", "Bearer $token")
            .build()

        return chain.proceed(authenticatedRequest)
    }
}
package com.example.app.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import com.example.app.network.TokenManager
import com.example.app.network.ApiService
import com.example.app.network.AuthInterceptor

object RetrofitClient {
    private const val BASE_URL = "http://localhost:5000/"

    fun create(tokenManager: TokenManager): ApiService {
        val logging = HttpLoggingInterceptor().apply { 
            level = HttpLoggingInterceptor.Level.BODY
         }

         val client = OkHttpClient.Builder()
            .addInterceptor ( AuthInterceptor(tokenManager) )
            .addInterceptor (logging)
            .build()

        return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
    }

}
package com.mobilenext.milliways.data

import com.mobilenext.milliways.BuildConfig
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

sealed class ApiResult<out T> {
    data class Ok<T>(val value: T) : ApiResult<T>()
    data class Err(val message: String) : ApiResult<Nothing>()
}

class ApiRepository(
    baseUrl: String = BuildConfig.MILLIWAYS_API_BASE_URL.trimEnd('/'),
) {
    private val root = if (baseUrl.endsWith("/")) baseUrl.dropLast(1) else baseUrl
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    fun signUp(email: String, password: String): ApiResult<AuthSession> =
        postJson("/auth/signup", json.encodeToString(AuthBody.serializer(), AuthBody(email, password)))

    fun signIn(email: String, password: String): ApiResult<AuthSession> =
        postJson("/auth/signin", json.encodeToString(AuthBody.serializer(), AuthBody(email, password)))

    fun fetchMenu(): ApiResult<List<MenuSection>> {
        val (body, err) = get("/menu", token = null)
        if (body == null) return ApiResult.Err(err ?: "Request failed")
        return try {
            ApiResult.Ok(json.decodeFromString(MenuResponse.serializer(), body).sections)
        } catch (e: Exception) {
            ApiResult.Err(e.message ?: "Invalid menu response")
        }
    }

    fun createOrder(items: List<CreateOrderItem>, token: String): ApiResult<BackendOrder> {
        val payload = json.encodeToString(CreateOrderRequest.serializer(), CreateOrderRequest(items))
        val (body, err) = post("/orders", token, payload)
        if (body == null) return ApiResult.Err(err ?: "Request failed")
        return try {
            ApiResult.Ok(json.decodeFromString(OrderResponse.serializer(), body).order)
        } catch (e: Exception) {
            ApiResult.Err(e.message ?: "Invalid order response")
        }
    }

    fun fetchOrders(token: String): ApiResult<List<BackendOrder>> {
        val (body, err) = get("/orders", token)
        if (body == null) return ApiResult.Err(err ?: "Request failed")
        return try {
            ApiResult.Ok(json.decodeFromString(OrdersResponse.serializer(), body).orders)
        } catch (e: Exception) {
            ApiResult.Err(e.message ?: "Invalid orders response")
        }
    }

    fun fetchOrderStatus(orderId: Int, token: String): ApiResult<BackendOrderStatus> {
        val (body, err) = get("/orders/$orderId/status", token)
        if (body == null) return ApiResult.Err(err ?: "Request failed")
        return try {
            ApiResult.Ok(json.decodeFromString(OrderStatusResponse.serializer(), body).order)
        } catch (e: Exception) {
            ApiResult.Err(e.message ?: "Invalid status response")
        }
    }

    private fun postJson(path: String, jsonBody: String): ApiResult<AuthSession> {
        val (body, err) = post(path, null, jsonBody)
        if (body == null) return ApiResult.Err(err ?: "Request failed")
        return try {
            ApiResult.Ok(json.decodeFromString(AuthSession.serializer(), body))
        } catch (e: Exception) {
            ApiResult.Err(e.message ?: "Invalid auth response")
        }
    }

    private fun get(path: String, token: String?): Pair<String?, String?> {
        val url = "$root$path"
        val builder = Request.Builder().url(url).get().header("Accept", "application/json")
        if (token != null) builder.header("Authorization", "Bearer $token")
        return execute(builder.build())
    }

    private fun post(path: String, token: String?, jsonBody: String): Pair<String?, String?> {
        val url = "$root$path"
        val body = jsonBody.toRequestBody(jsonMedia)
        val builder = Request.Builder()
            .url(url)
            .post(body)
            .header("Accept", "application/json")
            .header("Content-Type", "application/json")
        if (token != null) builder.header("Authorization", "Bearer $token")
        return execute(builder.build())
    }

    private fun execute(request: Request): Pair<String?, String?> {
        return try {
            client.newCall(request).execute().use { response ->
                val bodyStr = response.body?.string().orEmpty()
                if (response.code in 200..299) {
                    if (bodyStr.isEmpty()) return null to "The server returned an empty response"
                    bodyStr to null
                } else {
                    val msg = try {
                        json.decodeFromString(ServerError.serializer(), bodyStr).error
                    } catch (_: Exception) {
                        bodyStr.ifBlank { "Request failed with status ${response.code}" }
                    }
                    null to msg
                }
            }
        } catch (e: Exception) {
            null to (e.message ?: "Network error")
        }
    }
}

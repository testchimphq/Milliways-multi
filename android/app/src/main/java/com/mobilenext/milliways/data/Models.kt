package com.mobilenext.milliways.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class DemoUser(val id: Int, val email: String)

@Serializable
data class AuthSession(val user: DemoUser, val token: String)

@Serializable
data class MenuSection(val title: String, val items: List<MenuItem>)

@Serializable
data class MenuItem(
    val id: Int,
    val name: String,
    val description: String,
    @SerialName("priceCents") val priceCents: Int,
    val color: String,
    @SerialName("imageName") val imageName: String? = null,
) {
    val price: Double get() = priceCents / 100.0
}

@Serializable
data class MenuResponse(val sections: List<MenuSection>)

@Serializable
data class CreateOrderRequest(val items: List<CreateOrderItem>)

@Serializable
data class CreateOrderItem(
    @SerialName("menuItemId") val menuItemId: Int,
    val quantity: Int,
)

@Serializable
data class OrderResponse(val order: BackendOrder)

@Serializable
data class OrdersResponse(val orders: List<BackendOrder>)

@Serializable
data class OrderStatusResponse(val order: BackendOrderStatus)

@Serializable
data class BackendOrder(
    val id: Int,
    val status: String,
    @SerialName("totalCents") val totalCents: Int,
    @SerialName("createdAt") val createdAt: String,
    @SerialName("updatedAt") val updatedAt: String? = null,
)

@Serializable
data class BackendOrderStatus(
    val id: Int,
    val status: String,
    @SerialName("updatedAt") val updatedAt: String,
)

@Serializable
data class ServerError(val error: String)

@Serializable
data class AuthBody(val email: String, val password: String)

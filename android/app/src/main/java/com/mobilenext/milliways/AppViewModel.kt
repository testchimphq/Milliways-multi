package com.mobilenext.milliways

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mobilenext.milliways.data.ApiRepository
import com.mobilenext.milliways.data.ApiResult
import com.mobilenext.milliways.data.AuthSession
import com.mobilenext.milliways.data.BackendOrder
import com.mobilenext.milliways.data.BackendOrderStatus
import com.mobilenext.milliways.data.CreateOrderItem
import com.mobilenext.milliways.data.DemoUser
import com.mobilenext.milliways.data.MenuItem
import com.mobilenext.milliways.data.MenuSection
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

data class CartLine(
    val id: String = UUID.randomUUID().toString(),
    val menuItem: MenuItem,
    var quantity: Int,
) {
    val totalPrice: Double get() = quantity * menuItem.price
}

class AppViewModel(
    private val api: ApiRepository = ApiRepository(),
) : ViewModel() {

    var session by mutableStateOf<AuthSession?>(null)
        private set

    val user: DemoUser? get() = session?.user
    val token: String? get() = session?.token

    var authLoading by mutableStateOf(false)
        private set
    var authError by mutableStateOf<String?>(null)
        private set

    val cartLines = mutableStateListOf<CartLine>()
    var couponDiscount by mutableStateOf(0.0)
        private set
    var appliedCouponCode by mutableStateOf<String?>(null)
        private set
    var submittedOrder by mutableStateOf<BackendOrder?>(null)
        private set
    var latestOrderStatus by mutableStateOf<BackendOrderStatus?>(null)
        private set

    var menuSections by mutableStateOf<List<MenuSection>>(emptyList())
        private set
    var menuLoading by mutableStateOf(false)
        private set
    var menuError by mutableStateOf<String?>(null)
        private set

    var orders by mutableStateOf<List<BackendOrder>>(emptyList())
        private set
    var ordersLoading by mutableStateOf(false)
        private set
    var ordersError by mutableStateOf<String?>(null)
        private set

    val totalPrice: Double get() = cartLines.sumOf { it.totalPrice }
    val finalTotal: Double get() = totalPrice - couponDiscount
    val totalQuantity: Int get() = cartLines.sumOf { it.quantity }

    suspend fun performSignIn(email: String, password: String): Boolean {
        authLoading = true
        authError = null
        val ok = when (val r = withContext(Dispatchers.IO) { api.signIn(email, password) }) {
            is ApiResult.Ok -> {
                session = r.value
                MilliwaysRum.emit(
                    "auth_session_started",
                    mapOf("entry.auth_kind" to "sign_in"),
                )
                true
            }
            is ApiResult.Err -> {
                authError = r.message
                false
            }
        }
        authLoading = false
        return ok
    }

    suspend fun performSignUp(email: String, password: String): Boolean {
        authLoading = true
        authError = null
        val ok = when (val r = withContext(Dispatchers.IO) { api.signUp(email, password) }) {
            is ApiResult.Ok -> {
                session = r.value
                MilliwaysRum.emit(
                    "auth_session_started",
                    mapOf("entry.auth_kind" to "sign_up"),
                )
                true
            }
            is ApiResult.Err -> {
                authError = r.message
                false
            }
        }
        authLoading = false
        return ok
    }

    fun signOut() {
        session = null
        authError = null
        clearOrder()
    }

    fun addItem(item: MenuItem, quantity: Int) {
        cartLines.add(CartLine(menuItem = item, quantity = quantity))
    }

    fun removeLine(lineId: String) {
        val idx = cartLines.indexOfFirst { it.id == lineId }
        if (idx >= 0) cartLines.removeAt(idx)
    }

    fun applyCoupon(code: String): Boolean {
        if (code.uppercase() != "MARVIN") return false
        couponDiscount = 20.0
        appliedCouponCode = "MARVIN"
        return true
    }

    fun clearOrder() {
        cartLines.clear()
        couponDiscount = 0.0
        appliedCouponCode = null
        submittedOrder = null
        latestOrderStatus = null
    }

    fun loadMenu() {
        viewModelScope.launch {
            menuLoading = true
            menuError = null
            when (val r = withContext(Dispatchers.IO) { api.fetchMenu() }) {
                is ApiResult.Ok -> {
                    menuSections = r.value
                    MilliwaysRum.emit(
                        "menu_loaded",
                        mapOf(
                            "menu.section_count_bucket" to MilliwaysRum.menuSectionCountBucket(r.value.size),
                            "cart.line_item_count_bucket" to MilliwaysRum.lineItemCountBucket(cartLines.size),
                        ),
                    )
                }
                is ApiResult.Err -> menuError = r.message
            }
            menuLoading = false
        }
    }

    fun loadOrders() {
        val t = token ?: return
        viewModelScope.launch {
            ordersLoading = true
            ordersError = null
            when (val r = withContext(Dispatchers.IO) { api.fetchOrders(t) }) {
                is ApiResult.Ok -> orders = r.value
                is ApiResult.Err -> ordersError = r.message
            }
            ordersLoading = false
        }
    }

    suspend fun submitOrder(): Result<Unit> {
        val t = token ?: return Result.failure(IllegalStateException("Please sign in first"))
        val items = cartLines.map { CreateOrderItem(menuItemId = it.menuItem.id, quantity = it.quantity) }
        return when (val r = withContext(Dispatchers.IO) { api.createOrder(items, t) }) {
            is ApiResult.Ok -> {
                submittedOrder = r.value
                latestOrderStatus = BackendOrderStatus(
                    id = r.value.id,
                    status = r.value.status,
                    updatedAt = r.value.createdAt,
                )
                MilliwaysRum.emit(
                    "order_submitted_success",
                    mapOf(
                        "cart.line_item_count_bucket" to MilliwaysRum.lineItemCountBucket(cartLines.size),
                        "order.has_coupon" to if (appliedCouponCode != null) "true" else "false",
                    ),
                )
                Result.success(Unit)
            }
            is ApiResult.Err -> Result.failure(Exception(r.message))
        }
    }

    suspend fun refreshSubmittedOrderStatus() {
        val t = token ?: return
        val orderId = submittedOrder?.id ?: return
        when (val r = withContext(Dispatchers.IO) { api.fetchOrderStatus(orderId, t) }) {
            is ApiResult.Ok -> latestOrderStatus = r.value
            is ApiResult.Err -> { /* keep last status */ }
        }
    }
}

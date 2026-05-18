package com.mobilenext.milliways.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.mobilenext.milliways.AppViewModel
import com.mobilenext.milliways.R
import com.mobilenext.milliways.data.MenuItem
import com.mobilenext.milliways.ui.theme.MilliwaysTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.random.Random
import java.util.Locale

/** Stable currency text for UI and automation (always `.` decimal separator). */
private fun usMoney(amount: Double): String =
    "₭${String.format(Locale.US, "%.2f", amount)}"

private fun usMoneyDiscount(amount: Double): String = "-${usMoney(amount)}"

@Composable
fun MilliwaysRoot(vm: AppViewModel) {
    MilliwaysTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            val nav = rememberNavController()
            NavHost(navController = nav, startDestination = "sign_in") {
                composable("sign_in") { SignInRoute(nav, vm) }
                composable("sign_up") { SignUpRoute(nav, vm) }
                composable("welcome") { WelcomeRoute(nav, vm) }
                composable("menu") { MenuRoute(nav, vm) }
                composable("order") { OrderRoute(nav, vm) }
                composable("delivery") { DeliveryRoute(nav, vm) }
            }
        }
    }
}

@Composable
private fun SignInRoute(nav: NavHostController, vm: AppViewModel) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.weight(1f))
        Text("Welcome to Milliways", fontSize = 30.sp, fontWeight = FontWeight.Bold)
        Text(
            "Sign in to order from the restaurant at the end of the universe.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp, bottom = 24.dp),
        )
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .semantics { contentDescription = "Email" },
        )
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp)
                .semantics { contentDescription = "Password" },
        )
        vm.authError?.let {
            Text(it, color = Color.Red, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 8.dp))
        }
        Button(
            onClick = {
                scope.launch {
                    if (vm.performSignIn(email, password)) {
                        nav.navigate("welcome") {
                            popUpTo("sign_in") { inclusive = true }
                        }
                    }
                }
            },
            enabled = !vm.authLoading && email.isNotBlank() && password.isNotBlank(),
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
        ) {
            if (vm.authLoading) CircularProgressIndicator(Modifier.size(22.dp), color = Color.White)
            else Text("Sign In")
        }
        TextButton(onClick = { nav.navigate("sign_up") }, modifier = Modifier.padding(top = 8.dp)) {
            Text("Create an account")
        }
        Spacer(Modifier.weight(1f))
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SignUpRoute(nav: NavHostController, vm: AppViewModel) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sign Up") },
                navigationIcon = {
                    IconButton(onClick = { nav.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { pad ->
        Column(
            Modifier
                .padding(pad)
                .padding(24.dp),
        ) {
            Text("Create Account", fontSize = 30.sp, fontWeight = FontWeight.Bold)
            Text(
                "Use any email and password. This demo creates the account immediately.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 8.dp, bottom = 24.dp),
            )
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp),
            )
            vm.authError?.let {
                Text(it, color = Color.Red, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 8.dp))
            }
            Button(
                onClick = {
                    scope.launch {
                        if (vm.performSignUp(email, password)) {
                            nav.navigate("welcome") {
                                popUpTo("sign_in") { inclusive = true }
                            }
                        }
                    }
                },
                enabled = !vm.authLoading && email.isNotBlank() && password.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
            ) {
                if (vm.authLoading) CircularProgressIndicator(Modifier.size(22.dp), color = Color.White)
                else Text("Sign Up")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun WelcomeRoute(nav: NavHostController, vm: AppViewModel) {
    var accountOpen by remember { mutableStateOf(false) }
    val float = rememberInfiniteTransition(label = "hero")
    val offset by float.animateFloat(
        initialValue = 0f,
        targetValue = 20f,
        animationSpec = infiniteRepeatable(tween(2000, easing = LinearEasing), RepeatMode.Reverse),
        label = "y",
    )
    Box(Modifier.fillMaxSize()) {
        Image(
            painter = painterResource(R.drawable.hero_background),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
        )
        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                "Welcome to Milliways",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(top = 20.dp),
            )
            Image(
                painter = painterResource(R.drawable.hero_foreground),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 40.dp)
                    .padding(top = 8.dp)
                    .offset(y = (offset - 10).dp),
                contentScale = ContentScale.Fit,
            )
            Spacer(Modifier.weight(1f))
            Button(
                onClick = { nav.navigate("menu") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 60.dp)
                    .padding(bottom = 24.dp)
                    .semantics { contentDescription = "New Order" },
                shape = RoundedCornerShape(50),
                colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800)),
            ) {
                Text("New Order", color = Color.White)
            }
        }
        IconButton(
            onClick = { accountOpen = true },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(12.dp),
        ) {
            Icon(Icons.Default.Person, contentDescription = "Account", tint = Color.White)
        }
    }
    if (accountOpen) {
        ModalBottomSheet(onDismissRequest = { accountOpen = false }) {
            AccountSheet(nav, vm) { accountOpen = false }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AccountSheet(nav: NavHostController, vm: AppViewModel, onClose: () -> Unit) {
    LaunchedEffect(Unit) { vm.loadOrders() }
    val totalSpent = remember(vm.orders) {
        vm.orders.sumOf { it.totalCents } / 100.0
    }
    Column(Modifier.padding(16.dp)) {
        Text("My Account", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Row(
            Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                val profileEmail = vm.user?.email ?: "Signed in"
                Text(
                    profileEmail,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .testTag("account_profile_email")
                        .semantics { contentDescription = profileEmail },
                )
                Text("Pro Cosmic Foodie", color = Color(0xFFFF9800), style = MaterialTheme.typography.bodyMedium)
            }
            Image(
                painter = painterResource(R.drawable.avatar),
                contentDescription = null,
                modifier = Modifier
                    .size(70.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop,
            )
        }
        Row(Modifier.fillMaxWidth().padding(vertical = 16.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("${vm.orders.size}", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("Orders", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(usMoney(totalSpent), style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("Total Spent", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("19", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("Light-years", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        Text("Past Orders", style = MaterialTheme.typography.titleSmall, modifier = Modifier.padding(bottom = 8.dp))
        when {
            vm.ordersLoading -> CircularProgressIndicator(Modifier.align(Alignment.CenterHorizontally))
            vm.ordersError != null -> Text(vm.ordersError!!, color = Color.Red)
            vm.orders.isEmpty() -> Text("No orders yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
            else -> {
                vm.orders.forEach { order ->
                    ListItem(
                        headlineContent = { Text("Order #${order.id}") },
                        supportingContent = { Text(order.status.replaceFirstChar { it.uppercaseChar() }) },
                        trailingContent = {
                            Text(
                                usMoney(order.totalCents / 100.0),
                                color = Color(0xFFFF9800),
                            )
                        },
                    )
                }
            }
        }
        TextButton(
            onClick = {
                vm.signOut()
                onClose()
                nav.navigate("sign_in") {
                    popUpTo(nav.graph.id) { inclusive = true }
                }
            },
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
        ) {
            Text("Sign Out", color = Color.Red)
        }
        Spacer(Modifier.height(24.dp))
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MenuRoute(nav: NavHostController, vm: AppViewModel) {
    var detailItem by remember { mutableStateOf<MenuItem?>(null) }
    val detailSheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    LaunchedEffect(Unit) {
        if (vm.menuSections.isEmpty() && !vm.menuLoading) vm.loadMenu()
    }
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Milliways") },
                navigationIcon = {
                    IconButton(onClick = { nav.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    BadgedBox(
                        badge = {
                            if (vm.totalQuantity > 0) {
                                Badge { Text("${vm.totalQuantity}", fontSize = 10.sp) }
                            }
                        },
                    ) {
                        IconButton(onClick = { nav.navigate("order") }) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "Shopping Cart")
                        }
                    }
                },
            )
        },
        bottomBar = {
            if (vm.cartLines.isNotEmpty()) {
                Button(
                    onClick = { nav.navigate("order") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800)),
                ) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("View Order", color = Color.White, fontWeight = FontWeight.Bold)
                        Text("${vm.totalQuantity} items", color = Color.White)
                        Text(usMoney(vm.totalPrice), color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
    ) { pad ->
        Box(Modifier.padding(pad)) {
            when {
                vm.menuLoading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                vm.menuError != null -> Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(vm.menuError!!, color = Color.Red, textAlign = TextAlign.Center)
                    Button(onClick = { vm.loadMenu() }) { Text("Try Again") }
                }
                else -> {
                    LazyColumn(Modifier.fillMaxSize()) {
                        vm.menuSections.forEach { section ->
                            items(listOf(section.title), key = { "hdr-$it" }) {
                                Text(
                                    section.title,
                                    style = MaterialTheme.typography.titleSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(MaterialTheme.colorScheme.surface)
                                        .padding(horizontal = 16.dp, vertical = 8.dp),
                                )
                            }
                            items(section.items, key = { it.id }) { item ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                        .clickable { detailItem = item },
                                    colors = CardDefaults.cardColors(),
                                ) {
                                    Row(
                                        Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Column(Modifier.weight(1f)) {
                                            Text(item.name, style = MaterialTheme.typography.titleMedium)
                                            Text(
                                                item.description,
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                maxLines = 2,
                                            )
                                            Text(usMoney(item.price), color = Color(0xFF2196F3), modifier = Modifier.padding(top = 4.dp))
                                        }
                                        MenuItemThumbnail(item, 60.dp)
                                    }
                                }
                            }
                        }
                        items(listOf(Unit), key = { "footer-disclaimer" }) {
                            Text(
                                "* Shipping beyond 5 light-years distance might cost extra",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                modifier = Modifier.padding(16.dp, 24.dp, 16.dp, 48.dp),
                            )
                        }
                    }
                }
            }
        }
    }
    detailItem?.let { item ->
        ModalBottomSheet(
            onDismissRequest = { detailItem = null },
            sheetState = detailSheetState,
        ) {
            MenuItemDetailContent(item, onAdd = { qty ->
                vm.addItem(item, qty)
                detailItem = null
            }, onDismiss = { detailItem = null })
        }
    }
}

@Composable
private fun MenuItemDetailContent(item: MenuItem, onAdd: (Int) -> Unit, onDismiss: () -> Unit) {
    var quantity by remember { mutableIntStateOf(1) }
    val maxBody = LocalConfiguration.current.screenHeightDp.dp * 9f / 10f
    Column(
        Modifier
            .fillMaxWidth()
            .heightIn(max = maxBody),
    ) {
        Box(Modifier.fillMaxWidth()) {
            val res = when (item.imageName) {
                "Steak" -> R.drawable.steak
                "GreenSalad" -> R.drawable.greensalad
                "Soup" -> R.drawable.soup
                "Shrimp" -> R.drawable.shrimp
                "FriedLogic" -> R.drawable.friedlogic
                "PanGalacticGargleBlaster" -> R.drawable.pangalacticgargleblaster
                "Water" -> R.drawable.water
                "Coffee" -> R.drawable.coffee
                "InfiniteImprobabilityFloat" -> R.drawable.infiniteimprobabilityfloat
                "DarkMatterMartini" -> R.drawable.darkmattermartini
                else -> null
            }
            if (res != null) {
                Image(
                    painter = painterResource(res),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp),
                    contentScale = ContentScale.Fit,
                )
            } else {
                Box(
                    Modifier
                        .fillMaxWidth()
                        .height(220.dp)
                        .background(menuColor(item.color)),
                )
            }
            IconButton(onClick = onDismiss, modifier = Modifier.align(Alignment.TopEnd)) {
                Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
            }
        }
        Column(
            Modifier
                .fillMaxWidth()
                .weight(1f)
                .verticalScroll(rememberScrollState()),
        ) {
            Column(Modifier.padding(16.dp)) {
                Text(item.name, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text(usMoney(item.price), style = MaterialTheme.typography.titleLarge, color = Color(0xFFFF9800))
                Text(item.description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(24.dp))
            }
        }
        Row(
            Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(10.dp))
                    .padding(horizontal = 4.dp),
            ) {
                TextButton(onClick = { if (quantity > 1) quantity-- }, enabled = quantity > 1) {
                    Icon(Icons.Default.Remove, contentDescription = "−")
                }
                Text("$quantity", modifier = Modifier.padding(horizontal = 8.dp), style = MaterialTheme.typography.titleMedium)
                TextButton(onClick = { quantity++ }) {
                    Icon(Icons.Default.Add, contentDescription = "+")
                }
            }
            Button(
                onClick = { onAdd(quantity) },
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 12.dp)
                    .semantics { contentDescription = "Add to Order" },
                colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = Color(0xFFFF9800)),
            ) {
                Text("Add to Order", color = Color.White)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun OrderRoute(nav: NavHostController, vm: AppViewModel) {
    var couponCode by remember { mutableStateOf("") }
    var couponError by remember { mutableStateOf<String?>(null) }
    var orderError by remember { mutableStateOf<String?>(null) }
    var submitting by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Your Order") },
                navigationIcon = {
                    IconButton(onClick = { nav.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { pad ->
        Column(
            Modifier
                .padding(pad)
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
        ) {
            if (vm.cartLines.isEmpty()) {
                Column(
                    Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Icon(Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(80.dp), tint = Color.Gray)
                    Text("Your order is empty", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Button(
                    onClick = { },
                    enabled = false,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .semantics { contentDescription = "Place Order disabled" },
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),
                ) {
                    Text("Place Order", color = Color.White)
                }
            } else {
                LazyColumn(Modifier.weight(1f)) {
                    items(vm.cartLines, key = { it.id }) { line ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            MenuItemThumbnail(line.menuItem, 50.dp)
                            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                                Text(line.menuItem.name, fontWeight = FontWeight.Bold)
                                Text(
                                    "${line.quantity} × ₭${String.format(Locale.US, "%.2f", line.menuItem.price)}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            Text(usMoney(line.totalPrice), fontWeight = FontWeight.Bold)
                            IconButton(onClick = { vm.removeLine(line.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red)
                            }
                        }
                        HorizontalDivider()
                    }
                    if (vm.couponDiscount > 0) {
                        item {
                            ListItem(
                                headlineContent = { Text("Coupon ${vm.appliedCouponCode ?: ""}", color = Color(0xFF4CAF50)) },
                                trailingContent = { Text(usMoneyDiscount(vm.couponDiscount), color = Color(0xFF4CAF50)) },
                            )
                        }
                    }
                    item {
                        ListItem(
                            headlineContent = { Text("Total", fontWeight = FontWeight.Bold) },
                            trailingContent = {
                                Text(
                                    usMoney(vm.finalTotal),
                                    fontWeight = FontWeight.Bold,
                                    color = if (vm.finalTotal < 0) Color.Red else Color.Unspecified,
                                )
                            },
                        )
                    }
                }
                if (vm.appliedCouponCode == null) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        OutlinedTextField(
                            value = couponCode,
                            onValueChange = { couponCode = it; couponError = null },
                            label = { Text("Coupon code") },
                            singleLine = true,
                            modifier = Modifier
                                .weight(1f)
                                .semantics { contentDescription = "Coupon code" },
                        )
                        Button(
                            onClick = {
                                if (vm.applyCoupon(couponCode)) {
                                    couponCode = ""
                                    couponError = null
                                } else {
                                    couponError = "Invalid coupon code"
                                }
                            },
                            modifier = Modifier.padding(start = 8.dp),
                        ) {
                            Text("Apply")
                        }
                    }
                    couponError?.let { Text(it, color = Color.Red, modifier = Modifier.padding(horizontal = 16.dp)) }
                }
                orderError?.let {
                    Text(it, color = Color.Red, modifier = Modifier.padding(horizontal = 16.dp), textAlign = TextAlign.Center)
                }
                Button(
                    onClick = {
                        scope.launch {
                            submitting = true
                            orderError = null
                            val cents = (maxOf(vm.finalTotal, 0.0) * 100).toUInt()
                            android.util.Log.d("Milliways", "Processing payment of $cents cents")
                            val result = vm.submitOrder()
                            submitting = false
                            result.fold(
                                onSuccess = { nav.navigate("delivery") },
                                onFailure = { orderError = it.message ?: "Order failed" },
                            )
                        }
                    },
                    enabled = !submitting,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .semantics { contentDescription = "Place Order" },
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),
                ) {
                    if (submitting) CircularProgressIndicator(Modifier.size(22.dp), color = Color.White)
                    else Text("Place Order", color = Color.White)
                }
            }
        }
    }
}

@Composable
private fun DeliveryRoute(nav: NavHostController, vm: AppViewModel) {
    var minutes by remember { mutableDoubleStateOf(Random.nextDouble(2_000_000.0, 3_000_000.0)) }
    var statusText by remember { mutableStateOf("Checking status...") }
    LaunchedEffect(Unit) {
        vm.refreshSubmittedOrderStatus()
        statusText = vm.latestOrderStatus?.status ?: "received"
    }
    LaunchedEffect(Unit) {
        while (isActive) {
            delay(33)
            if (minutes > 0) minutes -= Random.nextDouble(0.01, 0.05)
        }
    }
    Box(Modifier.fillMaxSize()) {
        Image(
            painter = painterResource(R.drawable.nebula_map),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
        )
        Column(
            Modifier
                .fillMaxSize()
                .padding(top = 120.dp, start = 16.dp, end = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            val firstName = vm.cartLines.firstOrNull()?.menuItem?.name ?: "order"
            Text(
                "Your $firstName is on its way!",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center,
            )
            Text(
                "Status: ${statusText.replaceFirstChar { it.uppercaseChar() }}",
                modifier = Modifier
                    .padding(top = 12.dp)
                    .background(Color.Black.copy(alpha = 0.45f), RoundedCornerShape(8.dp))
                    .padding(8.dp),
                color = Color.White,
                style = MaterialTheme.typography.bodyMedium,
            )
            Spacer(Modifier.weight(1f))
            Text(
                "${String.format(Locale.US, "%.8f", minutes)} minutes for delivery",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = Color.White,
                modifier = Modifier
                    .padding(bottom = 60.dp)
                    .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                    .padding(16.dp),
            )
        }
        IconButton(
            onClick = {
                vm.clearOrder()
                nav.popBackStack("welcome", inclusive = false)
            },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 48.dp, end = 12.dp),
        ) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
        }
    }
}

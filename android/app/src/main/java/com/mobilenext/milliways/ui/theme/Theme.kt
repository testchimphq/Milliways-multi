package com.mobilenext.milliways.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Orange = Color(0xFFFF9800)
private val OrangeDark = Color(0xFFE65100)

private val LightColors = lightColorScheme(
    primary = Orange,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFFE0B2),
    secondary = OrangeDark,
)

private val DarkColors = darkColorScheme(
    primary = Orange,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF5D4037),
    secondary = Color(0xFFFFB74D),
)

@Composable
fun MilliwaysTheme(content: @Composable () -> Unit) {
    val dark = isSystemInDarkTheme()
    MaterialTheme(
        colorScheme = if (dark) DarkColors else LightColors,
        content = content,
    )
}

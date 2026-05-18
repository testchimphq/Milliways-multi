package com.mobilenext.milliways.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.mobilenext.milliways.R
import com.mobilenext.milliways.data.MenuItem

fun menuColor(name: String): Color {
    return when (name.lowercase()) {
        "black" -> Color.Black
        "blue" -> Color(0xFF2196F3)
        "brown" -> Color(0xFF795548)
        "cyan" -> Color(0xFF00BCD4)
        "green" -> Color(0xFF4CAF50)
        "orange" -> Color(0xFFFF9800)
        "pink" -> Color(0xFFE91E63)
        "purple" -> Color(0xFF9C27B0)
        "yellow" -> Color(0xFFFFEB3B)
        else -> Color.Gray
    }
}

private fun drawableFor(imageName: String?): Int? {
    if (imageName == null) return null
    return when (imageName) {
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
}

@Composable
fun MenuItemThumbnail(item: MenuItem, size: Dp, modifier: Modifier = Modifier) {
    val res = drawableFor(item.imageName)
    if (res != null) {
        Image(
            painter = painterResource(res),
            contentDescription = item.name,
            modifier = modifier
                .size(size)
                .clip(RoundedCornerShape(8.dp)),
            contentScale = ContentScale.Crop,
        )
    } else {
        Box(
            modifier = modifier
                .size(size)
                .clip(RoundedCornerShape(8.dp))
                .background(menuColor(item.color)),
        )
    }
}

package com.mobilenext.milliways

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mobilenext.milliways.ui.MilliwaysRoot
import io.testchimp.rum.TestChimpRum

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        deliverTruecoverageAutomation(intent)
        enableEdgeToEdge()
        setContent {
            val vm: AppViewModel = viewModel()
            MilliwaysRoot(vm)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        deliverTruecoverageAutomation(intent)
    }

    override fun onResume() {
        super.onResume()
        deliverTruecoverageAutomation(intent)
    }

    /**
     * `adb shell am start -a VIEW -d …` sometimes leaves [Intent.getData] null while [Intent.getDataString] is set.
     * Resolve both before calling the SDK.
     */
    private fun deliverTruecoverageAutomation(intent: Intent?) {
        if (intent == null) return
        val data = intent.data
        val fromString =
            intent.dataString
                ?.trim()
                ?.takeIf { it.isNotEmpty() }
                ?.let { runCatching { Uri.parse(it) }.getOrNull() }
        val uri = data ?: fromString
        if (uri != null) {
            TestChimpRum.handleAutomationUri(uri)
        }
    }
}

package com.mobilenext.milliways

import android.content.Context
import android.util.Log
import io.testchimp.rum.TestChimpEmitInput
import io.testchimp.rum.TestChimpRum
import io.testchimp.rum.TestChimpRumConfig

/**
 * TestChimp TrueCoverage / RUM — mirrors iOS [MilliwaysRum] helper.
 * Credentials and default ingest URL come from [BuildConfig] (Gradle properties); runtime overrides via env.
 * [emit] always adds metadata **platform** = **android** (iOS uses **ios**; web client should use **web**).
 */
object MilliwaysRum {
    private const val TAG = "Milliways"

    fun configureIfNeeded(context: Context) {
        if (BuildConfig.TESTCHIMP_PROJECT_ID.isBlank() || BuildConfig.TESTCHIMP_API_KEY.isBlank()) {
            Log.d(
                TAG,
                "TestChimp RUM skipped: set TESTCHIMP_PROJECT_ID and TESTCHIMP_API_KEY in gradle.properties (or ~/.gradle/gradle.properties).",
            )
            return
        }

        val environment = resolvedRumEnvironmentTag()
        val endpoint = resolvedBackendURL()

        TestChimpRum.initialize(
            context.applicationContext,
            TestChimpRumConfig(
                projectId = BuildConfig.TESTCHIMP_PROJECT_ID,
                apiKey = BuildConfig.TESTCHIMP_API_KEY,
                environment = environment,
                release = BuildConfig.VERSION_NAME,
                options = TestChimpRumConfig.Options(
                    maxEventsPerSession = 100,
                    maxRepeatsPerEvent = 12,
                    testchimpEndpoint = endpoint,
                ),
            ),
        )
    }

    private fun resolvedRumEnvironmentTag(): String {
        System.getenv("TESTCHIMP_ENV")?.trim()?.takeIf { v -> v.isNotEmpty() }?.let { v -> return v }
        return BuildConfig.TESTCHIMP_ENV
    }

    private fun resolvedBackendURL(): String? {
        System.getenv("TESTCHIMP_BACKEND_URL")?.trim()?.takeIf { v -> v.isNotEmpty() }?.let { v -> return v }
        val fromConfig = BuildConfig.TESTCHIMP_BACKEND_URL.trim()
        if (fromConfig.isEmpty()) return null
        return fromConfig
    }

    fun emit(title: String, metadata: Map<String, String> = emptyMap()) {
        val merged = metadata.toMutableMap().apply { put("platform", "android") }
        TestChimpRum.emit(
            TestChimpEmitInput(
                title = title,
                metadata = merged,
            ),
        )
    }

    fun lineItemCountBucket(count: Int): String = when (count) {
        0 -> "0"
        1 -> "1"
        in 2..5 -> "2_5"
        else -> "6_plus"
    }

    fun menuSectionCountBucket(count: Int): String = when (count) {
        0 -> "0"
        1 -> "1"
        in 2..5 -> "2_5"
        else -> "6_plus"
    }
}

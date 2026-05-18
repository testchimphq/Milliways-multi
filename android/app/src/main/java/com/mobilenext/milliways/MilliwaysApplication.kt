package com.mobilenext.milliways

import android.app.Application
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import io.testchimp.rum.TestChimpRum

class MilliwaysApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        MilliwaysRum.configureIfNeeded(this)
        // RUM batches uploads every ~10s by default; flush when the whole app backgrounds so events
        // are not stuck in memory if the process is killed before the next scheduled flush.
        ProcessLifecycleOwner.get().lifecycle.addObserver(
            object : DefaultLifecycleObserver {
                override fun onStop(owner: LifecycleOwner) {
                    TestChimpRum.flush()
                }
            },
        )
    }
}

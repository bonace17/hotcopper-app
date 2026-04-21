package com.example.hotcopper

import android.app.Application
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.example.hotcopper.data.DailyRefreshWorker
import java.time.Duration
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.concurrent.TimeUnit

class HotCopperApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val initialDelay = computeInitialDelayToBeijing7amMinutes()
        val request = PeriodicWorkRequestBuilder<DailyRefreshWorker>(1, TimeUnit.DAYS)
            .setInitialDelay(initialDelay, TimeUnit.MINUTES)
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "daily_refresh_hotcopper",
            ExistingPeriodicWorkPolicy.UPDATE,
            request
        )
    }

    private fun computeInitialDelayToBeijing7amMinutes(): Long {
        val beijingZone = ZoneId.of("Asia/Shanghai")
        val now = ZonedDateTime.now(beijingZone)
        var nextRun = now.withHour(7).withMinute(0).withSecond(0).withNano(0)
        if (!nextRun.isAfter(now)) {
            nextRun = nextRun.plusDays(1)
        }
        return Duration.between(now, nextRun).toMinutes().coerceAtLeast(1)
    }
}

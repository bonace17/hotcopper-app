package com.example.hotcopper.data

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class DailyRefreshWorker(
    appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        val repository = Repository(applicationContext)
        return repository.refreshFromNetwork()
            .fold(
                onSuccess = { Result.success() },
                onFailure = { Result.retry() }
            )
    }
}

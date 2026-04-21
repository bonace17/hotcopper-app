package com.example.hotcopper.data

import android.content.Context

class Repository(
    context: Context,
    private val apiService: ApiService = ApiClient.service
) {
    private val dao = AppDatabase.get(context).summaryDao()

    suspend fun loadFromCache(): Map<String, StockSummary?> {
        val byTicker = dao.getAll().associate { it.ticker to it.toModel() }
        return mapOf("TGM" to byTicker["TGM"], "FAU" to byTicker["FAU"])
    }

    suspend fun refreshFromNetwork(): Result<Map<String, StockSummary?>> {
        return runCatching {
            val data = apiService.getDashboard().data
            val entities = data.values.filterNotNull().map { it.toEntity() }
            if (entities.isNotEmpty()) {
                dao.upsertAll(entities)
            }
            data
        }
    }
}

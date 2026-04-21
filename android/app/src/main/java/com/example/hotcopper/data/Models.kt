package com.example.hotcopper.data

import kotlinx.serialization.Serializable

@Serializable
data class DashboardResponse(
    val updated_at: String,
    val data: Map<String, StockSummary?>
)

@Serializable
data class StockSummary(
    val ticker: String,
    val key_points: List<String>,
    val sentiment: String,
    val risks: List<String>,
    val catalysts: List<String>,
    val updated_at: String
)

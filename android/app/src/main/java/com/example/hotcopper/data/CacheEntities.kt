package com.example.hotcopper.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Entity(tableName = "stock_summary")
data class StockSummaryEntity(
    @PrimaryKey val ticker: String,
    val aiSummary: String,
    val keyPointsJson: String,
    val sentiment: String,
    val risksJson: String,
    val catalystsJson: String,
    val updatedAt: String
)

private val json = Json

fun StockSummary.toEntity(): StockSummaryEntity {
    return StockSummaryEntity(
        ticker = ticker,
        aiSummary = ai_summary,
        keyPointsJson = json.encodeToString(key_points),
        sentiment = sentiment,
        risksJson = json.encodeToString(risks),
        catalystsJson = json.encodeToString(catalysts),
        updatedAt = updated_at
    )
}

fun StockSummaryEntity.toModel(): StockSummary {
    return StockSummary(
        ticker = ticker,
        ai_summary = aiSummary,
        key_points = json.decodeFromString(keyPointsJson),
        sentiment = sentiment,
        risks = json.decodeFromString(risksJson),
        catalysts = json.decodeFromString(catalystsJson),
        updated_at = updatedAt
    )
}

package com.example.hotcopper.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface SummaryDao {
    @Query("SELECT * FROM stock_summary")
    suspend fun getAll(): List<StockSummaryEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(items: List<StockSummaryEntity>)
}

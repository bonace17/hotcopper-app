package com.example.hotcopper.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hotcopper.data.StockSummary

@Composable
fun HomeScreen(viewModel: HomeViewModel) {
    val state by viewModel.state.collectAsState()
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .safeDrawingPadding()
            .verticalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("HotCopper Daily Brief", style = MaterialTheme.typography.headlineSmall)
                Text("TGM & FAU latest summary", style = MaterialTheme.typography.bodyMedium)
            }
            Button(onClick = { viewModel.refresh() }) {
                Text("Refresh")
            }
        }

        HorizontalDivider()

        if (state.loading) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                tonalElevation = 2.dp,
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    "Loading latest TGM/FAU summary...",
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        state.error?.let {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.errorContainer,
                contentColor = MaterialTheme.colorScheme.onErrorContainer,
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Error: $it", modifier = Modifier.padding(12.dp))
            }
        }

        TickerCard("TGM", state.cards["TGM"])
        TickerCard("FAU", state.cards["FAU"])
    }
}

@Composable
private fun TickerCard(ticker: String, summary: StockSummary?) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(ticker, style = MaterialTheme.typography.titleLarge)
                summary?.let {
                    AssistChip(
                        onClick = {},
                        enabled = false,
                        label = { Text(it.sentiment.uppercase()) },
                        colors = AssistChipDefaults.assistChipColors()
                    )
                }
            }

            if (summary == null) {
                Text("No data yet")
                return@Column
            }
            Text("Updated: ${summary.updated_at}", style = MaterialTheme.typography.bodySmall)
            if (summary.ai_summary.isNotBlank()) {
                Text("AI summary", style = MaterialTheme.typography.titleSmall)
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    tonalElevation = 1.dp
                ) {
                    Text(
                        text = summary.ai_summary,
                        modifier = Modifier.padding(10.dp),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
            Text("Key points", style = MaterialTheme.typography.titleSmall)
            summary.key_points.take(5).forEach { point ->
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    tonalElevation = 1.dp
                ) {
                    Text(
                        text = "• $point",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                        style = TextStyle(
                            fontSize = 15.sp,
                            lineHeight = 22.sp
                        )
                    )
                }
            }
            if (summary.risks.isNotEmpty()) {
                Text("Risks", style = MaterialTheme.typography.titleSmall)
                Text(summary.risks.joinToString())
            }
            if (summary.catalysts.isNotEmpty()) {
                Text("Catalysts", style = MaterialTheme.typography.titleSmall)
                Text(summary.catalysts.joinToString())
            }
        }
    }
}

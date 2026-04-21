package com.example.hotcopper

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import com.example.hotcopper.data.Repository
import com.example.hotcopper.ui.HomeScreen
import com.example.hotcopper.ui.HomeViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val viewModel = HomeViewModel(Repository(applicationContext))
        setContent {
            MaterialTheme {
                Surface {
                    HomeScreen(viewModel = viewModel)
                }
            }
        }
    }
}

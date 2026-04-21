package com.example.hotcopper.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.hotcopper.data.Repository
import com.example.hotcopper.data.StockSummary
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val loading: Boolean = true,
    val error: String? = null,
    val cards: Map<String, StockSummary?> = mapOf("TGM" to null, "FAU" to null)
)

class HomeViewModel(
    private val repository: Repository
) : ViewModel() {
    private val _state = MutableStateFlow(HomeUiState())
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    init {
        loadCachedThenRefresh()
    }

    private fun loadCachedThenRefresh() {
        viewModelScope.launch {
            val cached = repository.loadFromCache()
            _state.value = HomeUiState(loading = true, cards = cached)
            refresh()
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            repository.refreshFromNetwork()
                .onSuccess { data ->
                    _state.value = HomeUiState(loading = false, cards = data)
                }
                .onFailure { e ->
                    _state.value = HomeUiState(
                        loading = false,
                        error = e.message ?: "Unknown error",
                        cards = repository.loadFromCache()
                    )
                }
        }
    }
}

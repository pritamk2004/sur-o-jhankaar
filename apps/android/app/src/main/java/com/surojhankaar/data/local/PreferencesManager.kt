package com.surojhankaar.data.local

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore by preferencesDataStore(name = "sur_preferences")

class PreferencesManager(private val context: Context) {
    companion object {
        val KEY_THEME_ID = stringPreferencesKey("theme_id")
        val KEY_VOLUME = floatPreferencesKey("volume")
        val KEY_LAST_STATION_FREQ = doublePreferencesKey("last_station_freq")
    }

    val themeIdFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_THEME_ID] ?: "cinematic_gold_maroon"
    }

    val volumeFlow: Flow<Float> = context.dataStore.data.map { preferences ->
        preferences[KEY_VOLUME] ?: 0.8f
    }

    val lastStationFreqFlow: Flow<Double> = context.dataStore.data.map { preferences ->
        preferences[KEY_LAST_STATION_FREQ] ?: 98.7
    }

    suspend fun setThemeId(themeId: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_THEME_ID] = themeId
        }
    }

    suspend fun setVolume(volume: Float) {
        context.dataStore.edit { preferences ->
            preferences[KEY_VOLUME] = volume
        }
    }

    suspend fun setLastStationFreq(freq: Double) {
        context.dataStore.edit { preferences ->
            preferences[KEY_LAST_STATION_FREQ] = freq
        }
    }
}

package com.surojhankaar

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.surojhankaar.data.model.*
import com.surojhankaar.data.remote.RetrofitClient
import com.surojhankaar.ui.screens.*
import com.surojhankaar.ui.theme.GoldAccent
import com.surojhankaar.ui.theme.SurOJhankaarTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SurOJhankaarTheme {
                var currentScreen by remember { mutableStateOf("splash") }
                var selectedTab by remember { mutableStateOf("home") }
                var currentSong by remember { mutableStateOf<SongDto?>(null) }
                var isPlaying by remember { mutableStateOf(false) }

                var playlists by remember { mutableStateOf<List<PlaylistDto>>(emptyList()) }
                var moods by remember { mutableStateOf<List<MoodDto>>(emptyList()) }
                var radioStations by remember { mutableStateOf<List<RadioStationDto>>(emptyList()) }
                var currentFrequency by remember { mutableStateOf(98.7) }

                val coroutineScope = rememberCoroutineScope()

                // Fetch initial data
                LaunchedEffect(Unit) {
                    try {
                        val plRes = RetrofitClient.instance.getPlaylists()
                        if (plRes.success && plRes.data != null) playlists = plRes.data

                        val moodRes = RetrofitClient.instance.getMoods()
                        if (moodRes.success && moodRes.data != null) moods = moodRes.data

                        val radioRes = RetrofitClient.instance.getRadioStations()
                        if (radioRes.success && radioRes.data != null) radioStations = radioRes.data
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }

                if (currentScreen == "splash") {
                    SplashScreen(onNavigateToHome = { currentScreen = "main" })
                } else {
                    Scaffold(
                        bottomBar = {
                            Column {
                                MiniPlayer(
                                    currentSong = currentSong,
                                    isPlaying = isPlaying,
                                    onTogglePlay = { isPlaying = !isPlaying },
                                    onOpenFullPlayer = { /* Open full player modal */ }
                                )
                                NavigationBar(
                                    containerColor = Color(0xFF140D0E)
                                ) {
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                                        label = { Text("Home") },
                                        selected = selectedTab == "home",
                                        onClick = { selectedTab = "home" },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = GoldAccent,
                                            selectedTextColor = GoldAccent,
                                            indicatorColor = Color(0x33D39B3D)
                                        )
                                    )
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.Radio, contentDescription = "Radio") },
                                        label = { Text("Radio") },
                                        selected = selectedTab == "radio",
                                        onClick = { selectedTab = "radio" },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = GoldAccent,
                                            selectedTextColor = GoldAccent,
                                            indicatorColor = Color(0x33D39B3D)
                                        )
                                    )
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "Mood") },
                                        label = { Text("Mood") },
                                        selected = selectedTab == "mood",
                                        onClick = { selectedTab = "mood" },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = GoldAccent,
                                            selectedTextColor = GoldAccent,
                                            indicatorColor = Color(0x33D39B3D)
                                        )
                                    )
                                    NavigationBarItem(
                                        icon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                                        label = { Text("Search") },
                                        selected = selectedTab == "search",
                                        onClick = { selectedTab = "search" },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = GoldAccent,
                                            selectedTextColor = GoldAccent,
                                            indicatorColor = Color(0x33D39B3D)
                                        )
                                    )
                                }
                            }
                        }
                    ) { innerPadding ->
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(innerPadding)
                                .background(Color(0xFF1A0409))
                        ) {
                            when (selectedTab) {
                                "home" -> HomeScreen(
                                    playlists = playlists,
                                    onSelectPlaylist = { slug -> /* navigate to playlist */ },
                                    onPlaySong = { song ->
                                        currentSong = song
                                        isPlaying = true
                                    }
                                )
                                "radio" -> RadioScreen(
                                    stations = radioStations,
                                    currentFrequency = currentFrequency,
                                    isPlaying = isPlaying,
                                    onSelectStation = { st ->
                                        currentFrequency = st.frequency
                                        isPlaying = true
                                    },
                                    onTogglePlay = { isPlaying = !isPlaying }
                                )
                                "mood" -> MoodScreen(
                                    moods = moods,
                                    onSelectMood = { mood -> /* trigger mood */ }
                                )
                                "search" -> {
                                    // Search screen placeholder
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

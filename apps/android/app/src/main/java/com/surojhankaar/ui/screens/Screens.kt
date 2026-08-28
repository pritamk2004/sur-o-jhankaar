package com.surojhankaar.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.surojhankaar.data.model.*
import com.surojhankaar.ui.theme.*

// 1. Splash Screen
@Composable
fun SplashScreen(onNavigateToHome: () -> Unit) {
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(1800)
        onNavigateToHome()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(Color(0xFF58111A), Color(0xFF1A0409), Color.Black)
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = "🎵", fontSize = 64.sp)
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "SUR O JHANKAAR",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = GoldAccent,
                letterSpacing = 2.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Har Sur Mein Ek Kahaani",
                fontSize = 14.sp,
                color = MutedText,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

// 2. Home Screen
@Composable
fun HomeScreen(
    playlists: List<PlaylistDto>,
    onSelectPlaylist: (String) -> Unit,
    onPlaySong: (SongDto) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Discover Heritage & Melodies",
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White
            )
            Text(
                text = "1,894 timeless songs across Hindi, Bangla, and Bhojpuri",
                fontSize = 12.sp,
                color = MutedText
            )
        }

        // Sunday Suspense Hero Highlight
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF120815)),
                border = BorderStroke(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.4f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSelectPlaylist("sunday-suspense") }
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF2A1038)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🕯️", fontSize = 28.sp)
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Sunday Suspense Audio Drama", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
                        Text("149 thriller audio mystery stories", color = Color(0xFFA78BFA), fontSize = 12.sp)
                    }
                    Icon(Icons.Default.PlayArrow, contentDescription = "Play", tint = Color(0xFFA78BFA))
                }
            }
        }

        // Playlists Grid Section
        item {
            Text(
                text = "Master Curated Playlists (14)",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        items(playlists.chunked(2)) { pair ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                pair.forEach { playlist ->
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0x22FFFFFF)),
                        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f)),
                        modifier = Modifier
                            .weight(1f)
                            .height(130.dp)
                            .clickable { onSelectPlaylist(playlist.slug) }
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(14.dp),
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("🎵", fontSize = 22.sp)
                            Column {
                                Text(
                                    text = playlist.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = Color.White,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = "${playlist.songCount} songs",
                                    fontSize = 11.sp,
                                    color = GoldAccent
                                )
                            }
                        }
                    }
                }
                if (pair.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
        item { Spacer(modifier = Modifier.height(80.dp)) }
    }
}

// 3. Vintage Radio Screen
@Composable
fun RadioScreen(
    stations: List<RadioStationDto>,
    currentFrequency: Double,
    isPlaying: Boolean,
    onSelectStation: (RadioStationDto) -> Unit,
    onTogglePlay: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "SUR O JHANKAAR RADIO",
            fontSize = 22.sp,
            fontWeight = FontWeight.Black,
            color = Color.White,
            letterSpacing = 1.sp
        )

        // Analog Dial Chassis
        Card(
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F0B09)),
            border = BorderStroke(2.dp, Color(0xFF58111A)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Frequency LCD
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = String.format("%.1f", currentFrequency),
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFFBBF24)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "FM",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFD97706)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Ruler Scale Simulation
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(30.dp)
                        .background(Color(0xFF1C130D), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("88.0", fontSize = 9.sp, color = Color(0xFFD97706))
                        Text("91.9 BANGLA", fontSize = 9.sp, color = Color(0xFFFBBF24))
                        Text("92.7 HINDI", fontSize = 9.sp, color = Color(0xFFFBBF24))
                        Text("98.7 AIRWAVE", fontSize = 9.sp, color = Color(0xFFFBBF24))
                        Text("104.0 BHOJPURI", fontSize = 9.sp, color = Color(0xFFFBBF24))
                        Text("108.0", fontSize = 9.sp, color = Color(0xFFD97706))
                    }
                }
            }
        }

        // Station Presets
        Text("Station Presets", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
        stations.forEach { station ->
            val isSelected = station.frequency == currentFrequency
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isSelected) Color(0x33FBBF24) else Color(0x1AFFFFFF)
                ),
                border = BorderStroke(1.dp, if (isSelected) Color(0xFFFBBF24) else Color.White.copy(alpha = 0.1f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSelectStation(station) }
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${station.frequency} FM",
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFBBF24),
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(station.name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Text(station.description, color = MutedText, fontSize = 11.sp, maxLines = 1)
                    }
                }
            }
        }
    }
}

// 4. Music Mood Screen
@Composable
fun MoodScreen(
    moods: List<MoodDto>,
    onSelectMood: (MoodDto) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Music Mood Atmospheres",
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White
            )
            Text(
                text = "Transform your visual and sound experience",
                fontSize = 12.sp,
                color = MutedText
            )
        }

        items(moods) { mood ->
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0x22FFFFFF)),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .clickable { onSelectMood(mood) }
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(mood.icon, fontSize = 28.sp)
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(mood.name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
                        Text(mood.tagline, color = MutedText, fontSize = 11.sp, maxLines = 1)
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = GoldAccent)
                }
            }
        }
    }
}

// 5. Mini Player Bottom Bar
@Composable
fun MiniPlayer(
    currentSong: SongDto?,
    isPlaying: Boolean,
    onTogglePlay: () -> Unit,
    onOpenFullPlayer: () -> Unit
) {
    if (currentSong == null) return

    Card(
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xEE1E1114)),
        border = BorderStroke(1.dp, GoldAccent.copy(alpha = 0.3f)),
        modifier = Modifier
            .fillMaxWidth()
            .height(72.dp)
            .clickable { onOpenFullPlayer() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF3A121A)),
                contentAlignment = Alignment.Center
            ) {
                Text("🎵", fontSize = 18.sp)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = currentSong.title,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 13.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = currentSong.displayArtist ?: currentSong.artists,
                    color = MutedText,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
            IconButton(
                onClick = onTogglePlay,
                modifier = Modifier
                    .size(40.dp)
                    .background(GoldAccent, CircleShape)
            ) {
                Icon(
                    if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = null,
                    tint = Color.Black
                )
            }
        }
    }
}

package com.surojhankaar.data.model

import com.google.gson.annotations.SerializedName

data class SongDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("artists") val artists: String,
    @SerializedName("displayArtist") val displayArtist: String? = null,
    @SerializedName("album") val album: String? = null,
    @SerializedName("durationSeconds") val durationSeconds: Int? = 240,
    @SerializedName("kind") val kind: String = "music",
    @SerializedName("languages") val languages: List<String> = emptyList(),
    @SerializedName("playlists") val playlists: List<String> = emptyList(),
    @SerializedName("score") val score: Int = 50,
    @SerializedName("youtubeUrl") val youtubeUrl: String? = null,
    @SerializedName("youtubeVideoId") val youtubeVideoId: String? = null,
    @SerializedName("spotifyUrl") val spotifyUrl: String? = null,
    @SerializedName("directAudioUrl") val directAudioUrl: String? = null,
    @SerializedName("artworkUrl") val artworkUrl: String? = null,
    @SerializedName("songTheme") val songTheme: String? = null,
    @SerializedName("storySynopsis") val storySynopsis: String? = null
)

data class PlaylistDto(
    @SerializedName("slug") val slug: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("mood_theme") val moodTheme: String,
    @SerializedName("languages") val languages: List<String>,
    @SerializedName("kind") val kind: String,
    @SerializedName("songCount") val songCount: Int = 0
)

data class MoodDto(
    @SerializedName("slug") val slug: String,
    @SerializedName("name") val name: String,
    @SerializedName("icon") val icon: String,
    @SerializedName("gradient") val gradient: String,
    @SerializedName("themeId") val themeId: String,
    @SerializedName("tagline") val tagline: String
)

data class RadioStationDto(
    @SerializedName("name") val name: String,
    @SerializedName("language") val language: String,
    @SerializedName("frequency") val frequency: Double,
    @SerializedName("description") val description: String,
    @SerializedName("themeId") val themeId: String
)

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("message") val message: String? = null
)

package com.surojhankaar.data.remote

import com.surojhankaar.data.model.*
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface ApiService {
    @GET("songs")
    suspend fun getSongs(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("playlist") playlist: String? = null
    ): ApiResponse<SongListResponse>

    @GET("playlists")
    suspend fun getPlaylists(): ApiResponse<List<PlaylistDto>>

    @GET("playlists/{slug}")
    suspend fun getPlaylistBySlug(@Path("slug") slug: String): ApiResponse<PlaylistDetailResponse>

    @GET("moods")
    suspend fun getMoods(): ApiResponse<List<MoodDto>>

    @GET("moods/{slug}/songs")
    suspend fun getMoodSongs(
        @Path("slug") slug: String,
        @Query("language") language: String? = null
    ): ApiResponse<MoodSongsResponse>

    @GET("radio/stations")
    suspend fun getRadioStations(): ApiResponse<List<RadioStationDto>>

    @POST("radio/next")
    suspend fun getNextRadioTrack(@Body body: Map<String, Any>): ApiResponse<RadioTrackResponse>

    @GET("search")
    suspend fun searchAll(
        @Query("query") query: String,
        @Query("language") language: String? = null
    ): ApiResponse<SearchResponse>
}

data class SongListResponse(val songs: List<SongDto>, val total: Int, val totalPages: Int)
data class PlaylistDetailResponse(val playlist: PlaylistDto, val songs: List<SongDto>)
data class MoodSongsResponse(val mood: MoodDto, val theme: Any, val songs: List<SongDto>)
data class RadioTrackResponse(val song: SongDto?, val remainingCandidates: Int)
data class SearchResponse(
    val query: String,
    val songs: List<SongDto>,
    val playlists: List<PlaylistDto>,
    val spokenWord: List<SongDto>,
    val totalMatches: Int
)

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:5000/api/" // Android emulator host localhost loopback

    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}

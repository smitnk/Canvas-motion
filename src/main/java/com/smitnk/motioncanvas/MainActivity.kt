package com.smitnk.motioncanvas

import android.os.Bundle
import android.net.Uri
import android.media.MediaPlayer
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.ui.input.pointer.awaitEachGesture
import androidx.compose.ui.input.pointer.awaitFirstDown
import androidx.compose.ui.input.pointer.calculatePan
import androidx.compose.ui.input.pointer.calculateZoom
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.smitnk.motioncanvas.ui.theme.*
import kotlinx.coroutines.delay

enum class ScreenType {
    HOME, CREATE, SIZE, FPS, EDITOR, SETTINGS, MORE, TIMELINE, LAYERS
}

enum class ToolType {
    Brush, Eraser, Lasso, Fill, Text, More
}

data class DrawPoint(val x: Float, val y: Float)

data class DrawStroke(
    val points: List<DrawPoint>,
    val color: Color,
    val strokeWidth: Float,
    val isEraser: Boolean = false
)

data class Frame(
    val id: String = java.util.UUID.randomUUID().toString(),
    val strokes: MutableList<DrawStroke> = mutableListOf()
)

data class Layer(
    val id: String = java.util.UUID.randomUUID().toString(),
    val name: String = "Layer 1",
    val visible: Boolean = true,
    val opacity: Float = 1.0f
)

data class Project(
    val id: String = java.util.UUID.randomUUID().toString(),
    val name: String,
    val fps: Int = 12,
    val canvasW: Int = 1280,
    val canvasH: Int = 720,
    val frames: MutableList<Frame> = mutableListOf(Frame()),
    val layers: MutableList<Layer> = mutableListOf(Layer()),
    val backgroundColor: Color = Color.White,
    val audioUri: Uri? = null,
    val audioName: String? = null
)

class MainActivity : ComponentActivity() {
    fun setEditorImmersive(enabled: Boolean) {
        WindowCompat.setDecorFitsSystemWindows(window, !enabled)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        if (enabled) {
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } else {
            controller.show(WindowInsetsCompat.Type.systemBars())
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MotionCanvasTheme {
                MotionCanvasApp()
            }
        }
    }
}

@Composable
fun MotionCanvasApp() {
    var screen by remember { mutableStateOf(ScreenType.HOME) }
    var projects by remember {
        mutableStateOf(
            listOf(
                Project(
                    name = "My Animation",
                    fps = 12,
                    frames = mutableListOf(
                        Frame(
                            strokes = mutableListOf(
                                DrawStroke(
                                    points = listOf(DrawPoint(100f, 150f), DrawPoint(150f, 100f), DrawPoint(200f, 150f)),
                                    color = Color.Black,
                                    strokeWidth = 10f
                                )
                            )
                        ),
                        Frame(
                            strokes = mutableListOf(
                                DrawStroke(
                                    points = listOf(DrawPoint(120f, 160f), DrawPoint(170f, 110f), DrawPoint(220f, 160f)),
                                    color = Color.Black,
                                    strokeWidth = 10f
                                )
                            )
                        )
                    )
                ),
                Project(
                    name = "Walk Cycle",
                    fps = 12,
                    frames = mutableListOf(Frame(), Frame(), Frame())
                )
            )
        )
    }

    var activeProject by remember { mutableStateOf<Project?>(null) }
    var currentFrameIndex by remember { mutableIntStateOf(0) }
    var selectedTool by remember { mutableStateOf(ToolType.Brush) }
    var brushColor by remember { mutableStateOf(Color.Black) }
    var brushSize by remember { mutableFloatStateOf(8f) }
    var onionSkin by remember { mutableStateOf(true) }
    var showGrid by remember { mutableStateOf(false) }
    var isPlaying by remember { mutableStateOf(false) }
    var isEditorUiHidden by remember { mutableStateOf(false) }
    var audioUri by remember { mutableStateOf<Uri?>(null) }
    var audioName by remember { mutableStateOf<String?>(null) }

    // Playback loop
    LaunchedEffect(isPlaying, activeProject, activeProject?.fps) {
        if (isPlaying && activeProject != null && activeProject!!.frames.isNotEmpty()) {
            val delayMillis = (1000L / (activeProject?.fps ?: 12)).coerceAtLeast(16L)
            while (isPlaying) {
                delay(delayMillis)
                currentFrameIndex = (currentFrameIndex + 1) % activeProject!!.frames.size
            }
        }
    }

    val activity = LocalContext.current as? MainActivity

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBackground)
    ) {
        when (screen) {
            ScreenType.HOME -> {
                HomeScreen(
                    projects = projects,
                    onOpenProject = { proj ->
                        activeProject = proj
                        currentFrameIndex = 0
                        screen = ScreenType.EDITOR
                    },
                    onCreateNew = {
                        screen = ScreenType.CREATE
                    }
                )
            }
            ScreenType.CREATE -> {
                CreateProjectScreen(
                    onBack = { screen = ScreenType.HOME },
                    onCreate = { name, fps, w, h, bg ->
                        val newProj = Project(
                            name = name.ifEmpty { "Untitled" },
                            fps = fps,
                            canvasW = w,
                            canvasH = h,
                            backgroundColor = bg
                        )
                        projects = projects + newProj
                        activeProject = newProj
                        currentFrameIndex = 0
                        screen = ScreenType.EDITOR
                    },
                    onSelectSize = { screen = ScreenType.SIZE },
                    onSelectFps = { screen = ScreenType.FPS }
                )
            }
            ScreenType.SIZE -> {
                CanvasSizeScreen(
                    onBack = { screen = ScreenType.CREATE },
                    onSelected = { _, _ -> screen = ScreenType.CREATE }
                )
            }
            ScreenType.FPS -> {
                FpsScreen(
                    onBack = { screen = ScreenType.CREATE },
                    onSelected = { screen = ScreenType.CREATE }
                )
            }
            ScreenType.EDITOR -> {
                activeProject?.let { proj ->
                    EditorScreen(
                        project = proj,
                        frameIndex = currentFrameIndex,
                        onFrameIndexChange = { currentFrameIndex = it },
                        tool = selectedTool,
                        onToolChange = { selectedTool = it },
                        color = brushColor,
                        onColorChange = { brushColor = it },
                        size = brushSize,
                        onSizeChange = { brushSize = it },
                        onionSkin = onionSkin,
                        grid = showGrid,
                        isPlaying = isPlaying,
                        onPlayToggle = { isPlaying = !isPlaying },
                        onBack = {
                            isPlaying = false
                            isEditorUiHidden = false
                            activity?.setEditorImmersive(false)
                            screen = ScreenType.HOME
                        },
                        onOpenSettings = { screen = ScreenType.SETTINGS },
                        onOpenTimeline = { screen = ScreenType.TIMELINE },
                        onOpenLayers = { screen = ScreenType.LAYERS },
                        uiHidden = isEditorUiHidden,
                        onToggleUiHidden = {
                            isEditorUiHidden = !isEditorUiHidden
                            activity?.setEditorImmersive(isEditorUiHidden)
                        },
                        audioUri = audioUri,
                        audioName = audioName,
                        onAudioSelected = { uri, name ->
                            audioUri = uri
                            audioName = name
                        },
                        onClearAudio = {
                            audioUri = null
                            audioName = null
                        }
                    )
                }
            }
            ScreenType.SETTINGS -> {
                SettingsScreen(
                    onionSkin = onionSkin,
                    onToggleOnion = { onionSkin = !onionSkin },
                    grid = showGrid,
                    onToggleGrid = { showGrid = !showGrid },
                    onBack = { screen = ScreenType.EDITOR }
                )
            }
            ScreenType.TIMELINE -> {
                activeProject?.let { proj ->
                    TimelineScreen(
                        project = proj,
                        currentIndex = currentFrameIndex,
                        onSelectFrame = {
                            currentFrameIndex = it
                            screen = ScreenType.EDITOR
                        },
                        onAddFrame = {
                            proj.frames.add(Frame())
                            currentFrameIndex = proj.frames.size - 1
                        },
                        onBack = { screen = ScreenType.EDITOR }
                    )
                }
            }
            ScreenType.LAYERS -> {
                activeProject?.let { proj ->
                    LayersScreen(
                        layers = proj.layers,
                        onAddLayer = {
                            proj.layers.add(Layer(name = "Layer ${proj.layers.size + 1}"))
                        },
                        onBack = { screen = ScreenType.EDITOR }
                    )
                }
            }
            else -> {
                screen = ScreenType.HOME
            }
        }
    }
}

// -------------------------------------------------------------------------------------------------
// Screens
// -------------------------------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    projects: List<Project>,
    onOpenProject: (Project) -> Unit,
    onCreateNew: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        containerColor = AppBackground,
        topBar = {
            TopAppBar(
                title = { Text("MotionCanvas", color = White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Menu, contentDescription = "Menu", tint = White)
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onCreateNew,
                containerColor = PinkAccent,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Project", tint = White)
            }
        },
        bottomBar = {
            NavigationBar(containerColor = PanelBackground) {
                NavigationBarItem(
                    selected = true,
                    onClick = {},
                    icon = { Icon(Icons.Default.Home, contentDescription = null) },
                    label = { Text("Home") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PinkAccent,
                        selectedTextColor = PinkAccent,
                        indicatorColor = PanelBackground2
                    )
                )
                NavigationBarItem(
                    selected = false,
                    onClick = {},
                    icon = { Icon(Icons.Default.Explore, contentDescription = null) },
                    label = { Text("Discover") },
                    colors = NavigationBarItemDefaults.colors(unselectedTextColor = TextSecondary)
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = AppBackground,
                contentColor = PinkAccent
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Projects (${projects.size})", color = if (selectedTab == 0) PinkAccent else TextSecondary) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Movies", color = if (selectedTab == 1) PinkAccent else TextSecondary) }
                )
            }

            if (selectedTab == 0) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(projects) { project ->
                        ProjectCard(project = project, onClick = { onOpenProject(project) })
                    }
                }
            } else {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No rendered movies yet. Export one from the editor!", color = TextSecondary)
                }
            }
        }
    }
}

@Composable
fun ProjectCard(project: Project, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PanelBackground)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
                    .background(Color.White)
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val frame = project.frames.firstOrNull()
                    frame?.strokes?.forEach { stroke ->
                        if (stroke.points.size > 1) {
                            val path = Path().apply {
                                moveTo(stroke.points[0].x, stroke.points[0].y)
                                for (i in 1 until stroke.points.size) {
                                    lineTo(stroke.points[i].x, stroke.points[i].y)
                                }
                            }
                            drawPath(
                                path = path,
                                color = stroke.color,
                                style = Stroke(width = stroke.strokeWidth, cap = StrokeCap.Round)
                            )
                        }
                    }
                }
            }
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = project.name,
                    color = White,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${project.frames.size} frames • ${project.fps} FPS",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateProjectScreen(
    onBack: () -> Unit,
    onCreate: (String, Int, Int, Int, Color) -> Unit,
    onSelectSize: () -> Unit,
    onSelectFps: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var fps by remember { mutableIntStateOf(12) }
    var width by remember { mutableIntStateOf(1280) }
    var height by remember { mutableIntStateOf(720) }
    var bg by remember { mutableStateOf(Color.White) }

    Scaffold(
        containerColor = AppBackground,
        topBar = {
            TopAppBar(
                title = { Text("Create Project", color = White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Project Name") },
                placeholder = { Text("e.g. Bouncing Ball") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = White,
                    unfocusedTextColor = White,
                    focusedBorderColor = PinkAccent,
                    unfocusedBorderColor = PanelBackground2
                )
            )

            Text("Background Color", color = White, fontWeight = FontWeight.Medium)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                listOf(Color.White, Color.Black, Color.LightGray).forEach { colorOption ->
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(colorOption)
                            .border(
                                width = if (bg == colorOption) 3.dp else 1.dp,
                                color = if (bg == colorOption) PinkAccent else Color.Gray,
                                shape = CircleShape
                            )
                            .clickable { bg = colorOption }
                    )
                }
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSelectSize() },
                colors = CardDefaults.cardColors(containerColor = PanelBackground)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Canvas Size", color = White, fontWeight = FontWeight.Medium)
                        Text("${width}x${height} (16:9 720p)", color = TextSecondary, fontSize = 13.sp)
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextSecondary)
                }
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSelectFps() },
                colors = CardDefaults.cardColors(containerColor = PanelBackground)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Frames Per Second", color = White, fontWeight = FontWeight.Medium)
                        Text("$fps FPS (Standard)", color = TextSecondary, fontSize = 13.sp)
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = { onCreate(name, fps, width, height, bg) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PinkAccent)
            ) {
                Text("Create Project", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = White)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CanvasSizeScreen(onBack: () -> Unit, onSelected: (Int, Int) -> Unit) {
    val presets = listOf(
        "YouTube 1080p" to Pair(1920, 1080),
        "YouTube 720p" to Pair(1280, 720),
        "Instagram (1:1)" to Pair(1080, 1080),
        "TikTok (9:16)" to Pair(1080, 1920)
    )

    Scaffold(
        containerColor = AppBackground,
        topBar = {
            TopAppBar(
                title = { Text("Canvas Size", color = White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            presets.forEach { (label, dims) ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelected(dims.first, dims.second) },
                    colors = CardDefaults.cardColors(containerColor = PanelBackground)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(label, color = White, fontWeight = FontWeight.Medium)
                        Text("${dims.first} x ${dims.second}", color = TextSecondary)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FpsScreen(onBack: () -> Unit, onSelected: (Int) -> Unit) {
    val fpsOptions = listOf(6, 8, 12, 15, 24, 30)

    Scaffold(
        containerColor = AppBackground,
        topBar = {
            TopAppBar(
                title = { Text("Frames Per Second", color = White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            fpsOptions.forEach { rate ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelected(rate) },
                    colors = CardDefaults.cardColors(containerColor = PanelBackground)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("$rate FPS", color = White, fontWeight = FontWeight.Medium)
                        Text(if (rate == 12) "Recommended" else "", color = PinkAccent)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(
    project: Project,
    frameIndex: Int,
    onFrameIndexChange: (Int) -> Unit,
    tool: ToolType,
    onToolChange: (ToolType) -> Unit,
    color: Color,
    onColorChange: (Color) -> Unit,
    size: Float,
    onSizeChange: (Float) -> Unit,
    onionSkin: Boolean,
    grid: Boolean,
    isPlaying: Boolean,
    onPlayToggle: () -> Unit,
    onBack: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenTimeline: () -> Unit,
    onOpenLayers: () -> Unit,
    uiHidden: Boolean,
    onToggleUiHidden: () -> Unit,
    audioUri: Uri?,
    audioName: String?,
    onAudioSelected: (Uri, String?) -> Unit,
    onClearAudio: () -> Unit
) {
    val currentFrame = project.frames.getOrNull(frameIndex) ?: project.frames.first()
    val previousFrame = if (onionSkin && frameIndex > 0) project.frames.getOrNull(frameIndex - 1) else null
    var currentDrawingPoints = remember { mutableStateListOf<DrawPoint>() }
    var canvasScale by remember { mutableFloatStateOf(1f) }
    var canvasOffset by remember { mutableStateOf(Offset.Zero) }
    val context = LocalContext.current
    val audioPicker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            try { context.contentResolver.takePersistableUriPermission(uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION) } catch (_: SecurityException) { }
            val name = uri.lastPathSegment?.substringAfterLast('/')
            onAudioSelected(uri, name)
        }
    }
    var mediaPlayer by remember { mutableStateOf<MediaPlayer?>(null) }

    DisposableEffect(audioUri) {
        mediaPlayer?.release()
        mediaPlayer = audioUri?.let { uri ->
            try {
                MediaPlayer.create(context, uri)?.apply { isLooping = true }
            } catch (_: Exception) { null }
        }
        onDispose {
            mediaPlayer?.release()
            mediaPlayer = null
        }
    }

    LaunchedEffect(isPlaying, audioUri) {
        mediaPlayer?.let { player ->
            if (isPlaying) {
                if (!player.isPlaying) player.start()
            } else if (player.isPlaying) {
                player.pause()
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
    Scaffold(
        containerColor = AppBackground,
        topBar = {
            if (!uiHidden) {
                TopAppBar(
                    title = { Text(project.name, color = White, fontSize = 16.sp) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                        }
                    },
                    actions = {
                        IconButton(onClick = {
                            if (audioUri == null) audioPicker.launch(arrayOf("audio/*")) else onClearAudio()
                        }) {
                            Icon(
                                if (audioUri == null) Icons.Default.MusicNote else Icons.Default.MusicOff,
                                contentDescription = if (audioUri == null) "Add Audio" else "Remove Audio",
                                tint = if (audioUri == null) White else PinkAccent
                            )
                        }
                        IconButton(onClick = onOpenLayers) {
                            Icon(Icons.Default.Layers, contentDescription = "Layers", tint = White)
                        }
                        IconButton(onClick = onOpenSettings) {
                            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = White)
                        }
                        IconButton(onClick = onToggleUiHidden) {
                            Icon(Icons.Default.Fullscreen, contentDescription = "Hide Editor UI", tint = White)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
                )
            }
        },
        bottomBar = {
            // Filmstrip & Playback control
            Surface(
                color = PanelBackground,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = onPlayToggle) {
                                Icon(
                                    if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                    contentDescription = "Play",
                                    tint = PinkAccent
                                )
                            }
                            Text(
                                "${frameIndex + 1} / ${project.frames.size}",
                                color = White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Row {
                            IconButton(onClick = {
                                project.frames.add(Frame())
                                onFrameIndexChange(project.frames.size - 1)
                            }) {
                                Icon(Icons.Default.Add, contentDescription = "Add Frame", tint = White)
                            }
                            IconButton(onClick = onOpenTimeline) {
                                Icon(Icons.Default.ViewCarousel, contentDescription = "Timeline", tint = White)
                            }
                        }
                    }

                    // Filmstrip thumbnail scroll
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        project.frames.forEachIndexed { idx, _ ->
                            Box(
                                modifier = Modifier
                                    .size(width = 54.dp, height = 36.dp)
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(Color.White)
                                    .border(
                                        width = if (idx == frameIndex) 2.dp else 1.dp,
                                        color = if (idx == frameIndex) PinkAccent else Color.Gray,
                                        shape = RoundedCornerShape(4.dp)
                                    )
                                    .clickable { onFrameIndexChange(idx) },
                                contentAlignment = Alignment.Center
                            ) {
                                Text("${idx + 1}", color = Color.Black, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Left Toolbar
            if (!uiHidden) Column(
                modifier = Modifier
                    .width(56.dp)
                    .fillMaxHeight()
                    .background(PanelBackground)
                    .padding(vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(
                    onClick = { onToolChange(ToolType.Brush) },
                    modifier = Modifier.background(
                        if (tool == ToolType.Brush) PanelBackground2 else Color.Transparent,
                        CircleShape
                    )
                ) {
                    Icon(Icons.Default.Brush, contentDescription = "Brush", tint = if (tool == ToolType.Brush) PinkAccent else White)
                }

                IconButton(
                    onClick = { onToolChange(ToolType.Eraser) },
                    modifier = Modifier.background(
                        if (tool == ToolType.Eraser) PanelBackground2 else Color.Transparent,
                        CircleShape
                    )
                ) {
                    Icon(Icons.Default.CleaningServices, contentDescription = "Eraser", tint = if (tool == ToolType.Eraser) PinkAccent else White)
                }

                IconButton(
                    onClick = { onToolChange(ToolType.Fill) },
                    modifier = Modifier.background(
                        if (tool == ToolType.Fill) PanelBackground2 else Color.Transparent,
                        CircleShape
                    )
                ) {
                    Icon(Icons.Default.FormatColorFill, contentDescription = "Fill", tint = if (tool == ToolType.Fill) PinkAccent else White)
                }

                IconButton(
                    onClick = { onToolChange(ToolType.Text) },
                    modifier = Modifier.background(
                        if (tool == ToolType.Text) PanelBackground2 else Color.Transparent,
                        CircleShape
                    )
                ) {
                    Icon(Icons.Default.TextFields, contentDescription = "Text", tint = if (tool == ToolType.Text) PinkAccent else White)
                }

                Spacer(modifier = Modifier.weight(1f))

                // Active color indicator
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(color)
                        .border(1.dp, White, CircleShape)
                        .clickable {
                            onColorChange(if (color == Color.Black) Color.Red else Color.Black)
                        }
                )
            }

            // Interactive Canvas
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .padding(8.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(project.backgroundColor)
                    .pointerInput(tool, color, size, frameIndex) {
                        awaitEachGesture {
                            awaitFirstDown(requireUnconsumed = false)
                            var multiTouch = false
                            var drawing = true
                            currentDrawingPoints.clear()

                            while (true) {
                                val event = awaitPointerEvent()
                                val pressed = event.changes.count { it.pressed }

                                if (pressed >= 2) {
                                    if (!multiTouch) {
                                        multiTouch = true
                                        drawing = false
                                        currentDrawingPoints.clear()
                                    }

                                    val zoomChange = event.calculateZoom()
                                    val panChange = event.calculatePan()
                                    canvasScale = (canvasScale * zoomChange).coerceIn(0.25f, 8f)
                                    canvasOffset += panChange
                                    event.changes.forEach { it.consume() }
                                } else if (pressed == 1 && !multiTouch && drawing) {
                                    val change = event.changes.firstOrNull { it.pressed }
                                    if (change != null) {
                                        change.consume()
                                        val worldX = (change.position.x - canvasOffset.x) / canvasScale
                                        val worldY = (change.position.y - canvasOffset.y) / canvasScale
                                        currentDrawingPoints.add(DrawPoint(worldX, worldY))
                                    }
                                } else if (pressed == 0) {
                                    if (drawing && currentDrawingPoints.isNotEmpty()) {
                                        currentFrame.strokes.add(
                                            DrawStroke(
                                                points = currentDrawingPoints.toList(),
                                                color = if (tool == ToolType.Eraser) project.backgroundColor else color,
                                                strokeWidth = size / canvasScale,
                                                isEraser = tool == ToolType.Eraser
                                            )
                                        )
                                    }
                                    currentDrawingPoints.clear()
                                    break
                                }
                            }
                        }
                    }
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .graphicsLayer(
                            scaleX = canvasScale,
                            scaleY = canvasScale,
                            translationX = canvasOffset.x,
                            translationY = canvasOffset.y
                        )
                ) {
                    // Grid
                    if (grid) {
                        val step = 40.dp.toPx()
                        for (x in 0 until (this.size.width / step).toInt()) {
                            drawLine(
                                color = Color.LightGray.copy(alpha = 0.4f),
                                start = Offset(x * step, 0f),
                                end = Offset(x * step, this.size.height),
                                strokeWidth = 1f
                            )
                        }
                        for (y in 0 until (this.size.height / step).toInt()) {
                            drawLine(
                                color = Color.LightGray.copy(alpha = 0.4f),
                                start = Offset(0f, y * step),
                                end = Offset(this.size.width, y * step),
                                strokeWidth = 1f
                            )
                        }
                    }

                    // Onion Skin (Previous frame at 25% opacity)
                    previousFrame?.strokes?.forEach { stroke ->
                        if (stroke.points.size > 1) {
                            val path = Path().apply {
                                moveTo(stroke.points[0].x, stroke.points[0].y)
                                for (i in 1 until stroke.points.size) {
                                    lineTo(stroke.points[i].x, stroke.points[i].y)
                                }
                            }
                            drawPath(
                                path = path,
                                color = Color.Red.copy(alpha = 0.25f),
                                style = Stroke(width = stroke.strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
                            )
                        }
                    }

                    // Active Frame Strokes
                    currentFrame.strokes.forEach { stroke ->
                        if (stroke.points.size > 1) {
                            val path = Path().apply {
                                moveTo(stroke.points[0].x, stroke.points[0].y)
                                for (i in 1 until stroke.points.size) {
                                    lineTo(stroke.points[i].x, stroke.points[i].y)
                                }
                            }
                            drawPath(
                                path = path,
                                color = stroke.color,
                                style = Stroke(width = stroke.strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
                            )
                        }
                    }

                    // Active dragging stroke preview
                    if (currentDrawingPoints.size > 1) {
                        val path = Path().apply {
                            moveTo(currentDrawingPoints[0].x, currentDrawingPoints[0].y)
                            for (i in 1 until currentDrawingPoints.size) {
                                lineTo(currentDrawingPoints[i].x, currentDrawingPoints[i].y)
                            }
                        }
                        drawPath(
                            path = path,
                            color = if (tool == ToolType.Eraser) project.backgroundColor else color,
                            style = Stroke(width = size, cap = StrokeCap.Round, join = StrokeJoin.Round)
                        )
                    }
                }
            }
        }
    }

    if (!uiHidden) {
        Surface(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(12.dp),
            color = PanelBackground.copy(alpha = 0.9f),
            shape = RoundedCornerShape(20.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = {
                    canvasScale = (canvasScale / 1.25f).coerceAtLeast(0.25f)
                }) {
                    Icon(Icons.Default.Remove, contentDescription = "Zoom out", tint = White)
                }
                Text("${(canvasScale * 100).toInt()}%", color = White, fontSize = 12.sp)
                IconButton(onClick = {
                    canvasScale = (canvasScale * 1.25f).coerceAtMost(8f)
                }) {
                    Icon(Icons.Default.Add, contentDescription = "Zoom in", tint = White)
                }
                IconButton(onClick = {
                    canvasScale = 1f
                    canvasOffset = Offset.Zero
                }) {
                    Icon(Icons.Default.CenterFocusStrong, contentDescription = "Reset view", tint = White)
                }
            }
        }
    }

    if (uiHidden) {
        IconButton(
            onClick = onToggleUiHidden,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(12.dp)
                .background(PanelBackground.copy(alpha = 0.85f), CircleShape)
        ) {
            Icon(Icons.Default.FullscreenExit, contentDescription = "Show Editor UI", tint = White)
        }
    }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onionSkin: Boolean,
    onToggleOnion: () -> Unit,
    grid: Boolean,
    onToggleGrid: () -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        containerColor = AppBackground,
        topBar = {
            TopAppBar(
                title = { Text("Project Settings", color = White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(colors = CardDefaults.cardColors(containerColor = PanelBackground)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Onion Skinning", color = White, fontWeight = FontWeight.Medium)
                        Text("Display ghost of previous frame", color = TextSecondary, fontSize = 12.sp)
                    }
                    Switch(checked = onionSkin, onCheckedChange = { onToggleOnion() })
                }
            }

            Card(colors = CardDefaults.cardColors(containerColor = PanelBackground)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Alignment Grid", color = White, fontWeight = FontWeight.Medium)
                        Text("Overlay grid on canvas", color = TextSecondary, fontSize = 12.sp)
                    }
                    Switch(checked = grid, onCheckedChange = { onToggleGrid() })
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimelineScreen(
    project: Project,
    currentIndex: Int,
    onSelectFrame: (Int) -> Unit,
    onAddFrame: () -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        containerColor = AppBackground,
        topBar = {
            TopAppBar(
                title = { Text("Frames & Timeline", color = White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                actions = {
                    IconButton(onClick = onAddFrame) {
                        Icon(Icons.Default.Add, contentDescription = "Add Frame", tint = PinkAccent)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
            )
        }
    ) { padding ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(project.frames.size) { index ->
                Box(
                    modifier = Modifier
                        .aspectRatio(16f / 9f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White)
                        .border(
                            width = if (index == currentIndex) 3.dp else 1.dp,
                            color = if (index == currentIndex) PinkAccent else Color.Gray,
                            shape = RoundedCornerShape(8.dp)
                        )
                        .clickable { onSelectFrame(index) },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "Frame ${index + 1}",
                        color = Color.Black,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LayersScreen(
    layers: List<Layer>,
    onAddLayer: () -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        containerColor = AppBackground,
        topBar = {
            TopAppBar(
                title = { Text("Layers", color = White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                actions = {
                    IconButton(onClick = onAddLayer) {
                        Icon(Icons.Default.Add, contentDescription = "Add Layer", tint = PinkAccent)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            layers.forEachIndexed { index, layer ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = PanelBackground)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Layers, contentDescription = null, tint = PinkAccent)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(layer.name, color = White, fontWeight = FontWeight.Medium)
                        }
                        Icon(Icons.Default.Visibility, contentDescription = "Visible", tint = White)
                    }
                }
            }
        }
    }
}

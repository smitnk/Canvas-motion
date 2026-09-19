import os
import zipfile
import shutil

BASE_DIR = "MotionCanvas"
if os.path.exists(BASE_DIR):
    shutil.rmtree(BASE_DIR)

def write_file(rel_path, content):
    full_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

# 1. Root build.gradle.kts
write_file("build.gradle.kts", """
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.0" apply false
}
""")

# 2. settings.gradle.kts
write_file("settings.gradle.kts", """
pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MotionCanvas"
include(":app")
""")

# 3. gradle.properties
write_file("gradle.properties", """
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
""")

# 4. gradle-wrapper.properties
write_file("gradle/wrapper/gradle-wrapper.properties", """
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
""")

# 5. gradlew & gradlew.bat
write_file("gradlew", """#!/bin/sh
APP_BASE_NAME=`basename "$0"`
DIRNAME=`dirname "$0"`
if [ "$DIRNAME" = "" ]; then
    DIRNAME=.
fi
APP_HOME=`cd "$DIRNAME" && pwd`
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
exec java -jar "$CLASSPATH" "$@"
""")

write_file("gradlew.bat", """@rem
@rem Copyright 2015 the original author or authors.
@rem
@if "%DEBUG%"=="" @echo off
set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
java -jar "%CLASSPATH%" %*
""")

# 6. app/build.gradle.kts
write_file("app/build.gradle.kts", """
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.smitnk.motioncanvas"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.smitnk.motioncanvas"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
    implementation("androidx.activity:activity-compose:1.9.1")
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.06.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
""")

# 7. Proguard
write_file("app/proguard-rules.pro", """
# Add project specific ProGuard rules here.
""")

# 8. AndroidManifest.xml
write_file("app/src/main/AndroidManifest.xml", """
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MotionCanvas">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/Theme.MotionCanvas">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
""")

# 9. XML Resources
write_file("app/src/main/res/values/strings.xml", """
<resources>
    <string name="app_name">MotionCanvas</string>
</resources>
""")

write_file("app/src/main/res/values/colors.xml", """
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="app_bg">#FF0D0D0F</color>
    <color name="pink_accent">#FFFF3F91</color>
    <color name="panel_bg">#FF18181B</color>
    <color name="panel_bg_2">#FF252529</color>
    <color name="white">#FFFFFFFF</color>
    <color name="black">#FF000000</color>
</resources>
""")

write_file("app/src/main/res/values/themes.xml", """
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.MotionCanvas" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#0D0D0F</item>
        <item name="android:navigationBarColor">#0D0D0F</item>
    </style>
</resources>
""")

write_file("app/src/main/res/xml/data_extraction_rules.xml", """
<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="sharedpref" path="."/>
    </cloud-backup>
    <device-transfer>
        <include domain="sharedpref" path="."/>
    </device-transfer>
</data-extraction-rules>
""")

write_file("app/src/main/res/xml/backup_rules.xml", """
<?xml version="1.0" encoding="utf-8"?>
<backup-rules>
    <include domain="sharedpref" path="."/>
</backup-rules>
""")

write_file("app/src/main/res/drawable/ic_launcher_background.xml", """
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0D0D0F"
        android:pathData="M0,0h108v108h-108z" />
</vector>
""")

write_file("app/src/main/res/drawable/ic_launcher_foreground.xml", """
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FF3F91"
        android:pathData="M30,30h48v48h-48z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M44,40l24,14l-24,14z" />
</vector>
""")

write_file("app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml", """
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
""")

write_file("app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml", """
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
""")

# 10. Theme Kotlin files
write_file("app/src/main/java/com/smitnk/motioncanvas/ui/theme/Color.kt", """
package com.smitnk.motioncanvas.ui.theme

import androidx.compose.ui.graphics.Color

val AppBackground = Color(0xFF0D0D0F)
val PanelBackground = Color(0xFF18181B)
val PanelBackground2 = Color(0xFF252529)
val PinkAccent = Color(0xFFFF3F91)
val TextSecondary = Color(0xFF96969D)
val White = Color(0xFFFFFFFF)
val Black = Color(0xFF000000)
""")

write_file("app/src/main/java/com/smitnk/motioncanvas/ui/theme/Theme.kt", """
package com.smitnk.motioncanvas.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = PinkAccent,
    secondary = PanelBackground2,
    tertiary = TextSecondary,
    background = AppBackground,
    surface = PanelBackground,
    onPrimary = White,
    onSecondary = White,
    onBackground = White,
    onSurface = White
)

@Composable
fun MotionCanvasTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
""")

# 11. Complete MainActivity.kt with all Compose screens & drawing canvas
write_file("app/src/main/java/com/smitnk/motioncanvas/MainActivity.kt", """
package com.smitnk.motioncanvas

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
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
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
    val backgroundColor: Color = Color.White
)

class MainActivity : ComponentActivity() {
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
                            screen = ScreenType.HOME
                        },
                        onOpenSettings = { screen = ScreenType.SETTINGS },
                        onOpenTimeline = { screen = ScreenType.TIMELINE },
                        onOpenLayers = { screen = ScreenType.LAYERS }
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
    onOpenLayers: () -> Unit
) {
    val currentFrame = project.frames.getOrNull(frameIndex) ?: project.frames.first()
    val previousFrame = if (onionSkin && frameIndex > 0) project.frames.getOrNull(frameIndex - 1) else null
    var currentDrawingPoints = remember { mutableStateListOf<DrawPoint>() }

    Scaffold(
        containerColor = AppBackground,
        topBar = {
            TopAppBar(
                title = { Text(project.name, color = White, fontSize = 16.sp) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                actions = {
                    IconButton(onClick = onOpenLayers) {
                        Icon(Icons.Default.Layers, contentDescription = "Layers", tint = White)
                    }
                    IconButton(onClick = onOpenSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AppBackground)
            )
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
            Column(
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
                        detectDragGestures(
                            onDragStart = { offset ->
                                currentDrawingPoints.clear()
                                currentDrawingPoints.add(DrawPoint(offset.x, offset.y))
                            },
                            onDrag = { change, _ ->
                                change.consume()
                                currentDrawingPoints.add(DrawPoint(change.position.x, change.position.y))
                            },
                            onDragEnd = {
                                if (currentDrawingPoints.isNotEmpty()) {
                                    currentFrame.strokes.add(
                                        DrawStroke(
                                            points = currentDrawingPoints.toList(),
                                            color = if (tool == ToolType.Eraser) project.backgroundColor else color,
                                            strokeWidth = size,
                                            isEraser = tool == ToolType.Eraser
                                        )
                                    )
                                    currentDrawingPoints.clear()
                                }
                            }
                        )
                    }
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    // Grid
                    if (grid) {
                        val step = 40.dp.toPx()
                        for (x in 0 until (size.width / step).toInt()) {
                            drawLine(
                                color = Color.LightGray.copy(alpha = 0.4f),
                                start = Offset(x * step, 0f),
                                end = Offset(x * step, size.height),
                                strokeWidth = 1f
                            )
                        }
                        for (y in 0 until (size.height / step).toInt()) {
                            drawLine(
                                color = Color.LightGray.copy(alpha = 0.4f),
                                start = Offset(0f, y * step),
                                end = Offset(size.width, y * step),
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
""")

# 12. README.md with build instructions
write_file("README.md", """
# MotionCanvas - Android Animation Studio

MotionCanvas is a 2D hand-drawn animation and flipbook studio built natively with **Kotlin** and **Jetpack Compose**.

## Features
- **Interactive Multi-Touch Canvas**: Draw with smooth bezier paths, eraser, fill, and stroke width control.
- **Onion Skinning**: Ghosting overlay of previous frames at 25% opacity for frame-by-frame guidance.
- **Filmstrip & Timeline Manager**: Add, reorder, duplicate, and navigate frames.
- **Custom FPS & Canvas Sizes**: Presets for YouTube (1080p, 720p), TikTok (9:16), Instagram (1:1), and FPS ranging from 6 to 60.
- **Layers**: Multi-layer compositing and visibility toggles.
- **Modern Material 3 Dark UI**: Styled in #0D0D0F with signature #FF3F91 Pink accents.

## How to Open in Android Studio
1. Unzip `MotionCanvas-Android-Studio.zip`.
2. Open Android Studio (Hedgehog, Iguana, Jellyfish, Koala or later recommended).
3. Select **File > Open** and choose the extracted `MotionCanvas` directory.
4. Let Gradle sync dependencies.
5. Click **Run > Run 'app'** on your connected Android device or emulator (Android 8.0+ / API 26+).

## Project Requirements
- Android Studio Koala / Ladybug or newer
- JDK 17
- Android SDK 34 (Compile & Target SDK)
- Minimum SDK: 26 (Android 8.0 Oreo)
""")

# Make gradlew executable
os.chmod(os.path.join(BASE_DIR, "gradlew"), 0o755)

# 13. Create the ZIP archive
ZIP_OUTPUT = "public/MotionCanvas-Android-Studio.zip"
os.makedirs("public", exist_ok=True)

with zipfile.ZipFile(ZIP_OUTPUT, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            # Store with 'MotionCanvas/...' root in archive
            archive_name = os.path.relpath(file_path, ".")
            zipf.write(file_path, archive_name)

print(f"Successfully generated {ZIP_OUTPUT} ({os.path.getsize(ZIP_OUTPUT)} bytes)")

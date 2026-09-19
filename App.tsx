import React, { useState, useEffect } from 'react';
import { ScreenType, Frame, Layer, Project } from './types';
import { INITIAL_PROJECTS } from './data/defaultProjects';
import { AndroidFrame } from './components/AndroidFrame';
import { HomeScreen } from './components/HomeScreen';
import { CreateProjectScreen } from './components/CreateProjectScreen';
import { CanvasSizeScreen } from './components/CanvasSizeScreen';
import { FpsScreen } from './components/FpsScreen';
import { EditorScreen } from './components/EditorScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { MoreToolsScreen } from './components/MoreToolsScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { LayersScreen } from './components/LayersScreen';
import { MovieExportModal } from './components/MovieExportModal';

const STORAGE_KEY = 'motion_canvas_projects_v1';
const MOVIES_STORAGE_KEY = 'motion_canvas_movies_v1';

export default function App() {
  // Load saved projects or fallback to initial ones
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROJECTS;
  });

  const [movies, setMovies] = useState<{ name: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem(MOVIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Active state matching the Jetpack Compose MotionCanvasApp
  const [screen, setScreen] = useState<ScreenType>('HOME');
  const [activeProjectId, setActiveProjectId] = useState<string>('proj_1');
  const [projectName, setProjectName] = useState<string>('My Animation');
  const [fps, setFps] = useState<number>(12);
  const [canvasW, setCanvasW] = useState<number>(1280);
  const [canvasH, setCanvasH] = useState<number>(720);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [frames, setFrames] = useState<Frame[]>([
    { id: 'f_init', strokes: [] }
  ]);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'l_1', name: 'Layer 1', visible: true, opacity: 1 }
  ]);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);
  const [onion, setOnion] = useState<boolean>(true);
  const [grid, setGrid] = useState<boolean>(false);
  const [framesViewer, setFramesViewer] = useState<boolean>(false);
  const [showMovieExport, setShowMovieExport] = useState<boolean>(false);
  const [activeSpecialTool, setActiveSpecialTool] = useState<string>('Rulers');

  // Save projects to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  // Save movies
  useEffect(() => {
    try {
      localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(movies));
    } catch {
      // ignore
    }
  }, [movies]);

  // Sync active project state with `projects` list
  const syncCurrentProject = (updatedFrames: Frame[]) => {
    setFrames(updatedFrames);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              frames: updatedFrames,
              updatedAt: Date.now()
            }
          : p
      )
    );
  };

  // Open an existing project from Home
  const handleOpenProject = (p: Project) => {
    setActiveProjectId(p.id);
    setProjectName(p.name);
    setFps(p.fps || 12);
    setCanvasW(p.canvasW || 1280);
    setCanvasH(p.canvasH || 720);
    setBackgroundColor(p.backgroundColor || '#FFFFFF');
    setFrames(p.frames.length > 0 ? p.frames : [{ id: 'f_1', strokes: [] }]);
    setCurrentFrame(0);
    setLayers(p.layers && p.layers.length > 0 ? p.layers : [{ id: 'l_1', name: 'Layer 1', visible: true, opacity: 1 }]);
    setScreen('EDITOR');
  };

  // Create Project action from Create screen
  const handleConfirmCreateProject = () => {
    const newId = `proj_${Date.now()}`;
    const initialFrame: Frame = { id: `frame_${Date.now()}`, strokes: [] };
    const initialLayers: Layer[] = [{ id: `layer_${Date.now()}`, name: 'Layer 1', visible: true, opacity: 1 }];

    const newProject: Project = {
      id: newId,
      name: projectName.trim() || 'My Animation',
      fps,
      canvasW,
      canvasH,
      backgroundColor,
      frames: [initialFrame],
      layers: initialLayers,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newId);
    setFrames([initialFrame]);
    setCurrentFrame(0);
    setLayers(initialLayers);
    setScreen('EDITOR');
  };

  // Add Image onto current frame
  const handleAddImage = (dataUrl: string) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      // Draw approximate placement or outline
      const strokePoints = [
        { x: 100, y: 100 },
        { x: 100 + Math.min(img.width, 300), y: 100 },
        { x: 100 + Math.min(img.width, 300), y: 100 + Math.min(img.height, 200) },
        { x: 100, y: 100 + Math.min(img.height, 200) },
        { x: 100, y: 100 }
      ];
      const imageBorderStroke = {
        points: strokePoints,
        color: '#FF3F91',
        width: 3
      };
      const updated = [...frames];
      updated[currentFrame] = {
        ...updated[currentFrame],
        strokes: [...(updated[currentFrame]?.strokes || []), imageBorderStroke]
      };
      syncCurrentProject(updated);
    };
  };

  const handleSaveToMovies = (name: string) => {
    const newEntry = {
      name,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setMovies((prev) => [newEntry, ...prev]);
  };

  return (
    <AndroidFrame>
      {/* SCREEN ROUTER */}
      {screen === 'HOME' && (
        <HomeScreen
          projects={projects}
          movies={movies}
          onCreate={() => {
            setProjectName('My Animation');
            setScreen('CREATE');
          }}
          onOpenProject={handleOpenProject}
        />
      )}

      {screen === 'CREATE' && (
        <CreateProjectScreen
          name={projectName}
          onNameChange={setProjectName}
          fps={fps}
          w={canvasW}
          h={canvasH}
          bg={backgroundColor}
          onBgChange={setBackgroundColor}
          onSizeClick={() => setScreen('SIZE')}
          onFpsClick={() => setScreen('FPS')}
          onCreate={handleConfirmCreateProject}
          onBack={() => setScreen('HOME')}
        />
      )}

      {screen === 'SIZE' && (
        <CanvasSizeScreen
          currentW={canvasW}
          currentH={canvasH}
          onSelect={(w, h) => {
            setCanvasW(w);
            setCanvasH(h);
            setScreen('CREATE');
          }}
          onBack={() => setScreen('CREATE')}
        />
      )}

      {screen === 'FPS' && (
        <FpsScreen
          currentFps={fps}
          onSelect={(selectedFps) => {
            setFps(selectedFps);
            setScreen('CREATE');
          }}
          onBack={() => setScreen('CREATE')}
        />
      )}

      {screen === 'EDITOR' && (
        <EditorScreen
          projectName={projectName}
          frames={frames}
          currentFrame={currentFrame}
          fps={fps}
          onion={onion}
          grid={grid}
          canvasW={canvasW}
          canvasH={canvasH}
          onFrameChange={setCurrentFrame}
          onFramesChange={syncCurrentProject}
          onBack={() => setScreen('HOME')}
          onSettings={() => setScreen('SETTINGS')}
          onTimeline={() => setScreen('TIMELINE')}
          onLayers={() => setScreen('LAYERS')}
          onMore={() => setScreen('MORE')}
        />
      )}

      {screen === 'SETTINGS' && (
        <SettingsScreen
          onion={onion}
          grid={grid}
          framesViewer={framesViewer}
          onOnionChange={setOnion}
          onGridChange={setGrid}
          onFramesViewerChange={setFramesViewer}
          onAddImage={handleAddImage}
          onMakeMovie={() => setShowMovieExport(true)}
          onBack={() => setScreen('EDITOR')}
        />
      )}

      {screen === 'MORE' && (
        <MoreToolsScreen
          activeSpecialTool={activeSpecialTool}
          onSelectSpecialTool={setActiveSpecialTool}
          onBack={() => setScreen('EDITOR')}
        />
      )}

      {screen === 'TIMELINE' && (
        <TimelineScreen
          frames={frames}
          currentFrame={currentFrame}
          canvasW={canvasW}
          canvasH={canvasH}
          onSelectFrame={setCurrentFrame}
          onAddFrame={() => {
            const updated = [...frames];
            updated.push({ id: `f_${Date.now()}`, strokes: [] });
            syncCurrentProject(updated);
            setCurrentFrame(updated.length - 1);
          }}
          onDuplicateFrame={() => {
            const updated = [...frames];
            const current = frames[currentFrame];
            updated.splice(currentFrame + 1, 0, {
              id: `f_${Date.now()}`,
              strokes: JSON.parse(JSON.stringify(current.strokes))
            });
            syncCurrentProject(updated);
            setCurrentFrame(currentFrame + 1);
          }}
          onDeleteFrame={() => {
            if (frames.length > 1) {
              const updated = frames.filter((_, idx) => idx !== currentFrame);
              syncCurrentProject(updated);
              setCurrentFrame(Math.min(currentFrame, updated.length - 1));
            }
          }}
          onBack={() => setScreen('EDITOR')}
        />
      )}

      {screen === 'LAYERS' && (
        <LayersScreen
          layers={layers}
          activeLayerIndex={activeLayerIndex}
          onSelectLayer={setActiveLayerIndex}
          onChange={setLayers}
          onBack={() => setScreen('EDITOR')}
        />
      )}

      {/* Movie Export Modal */}
      {showMovieExport && (
        <MovieExportModal
          projectName={projectName}
          frames={frames}
          fps={fps}
          canvasW={canvasW}
          canvasH={canvasH}
          onSaveToMovies={handleSaveToMovies}
          onClose={() => setShowMovieExport(false)}
        />
      )}
    </AndroidFrame>
  );
}

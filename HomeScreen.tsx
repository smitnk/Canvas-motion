import React, { useState } from 'react';
import { Menu, Search, Plus, Home, Compass, Film, X, Download, FolderArchive } from 'lucide-react';
import { Project } from '../types';
import { FrameThumbnail } from './FrameThumbnail';

interface HomeScreenProps {
  projects: Project[];
  onCreate: () => void;
  onOpenProject: (project: Project) => void;
  movies?: { name: string; date: string; url?: string }[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  projects,
  onCreate,
  onOpenProject,
  movies = []
}) => {
  const [tab, setTab] = useState<0 | 1>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [bottomTab, setBottomTab] = useState<'home' | 'discover'>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0F] text-white relative select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="home-menu-btn"
            onClick={() => setMenuOpen(true)}
            className="p-1.5 text-white/90 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-[21px] font-bold tracking-tight text-white">MotionCanvas</h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="home-search-btn"
            onClick={() => setIsSearching(!isSearching)}
            className="p-1.5 text-white/90 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar (if activated) */}
      {isSearching && (
        <div className="px-4 pb-2">
          <div className="flex items-center bg-[#18181B] border border-[#252529] rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-[#96969D] mr-2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-[#96969D]"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#96969D] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs: Projects | Movies */}
      <div className="flex w-full px-4 border-b border-[#18181B] flex-shrink-0">
        <button
          id="tab-projects"
          onClick={() => setTab(0)}
          className="flex-1 py-3 text-center flex flex-col items-center relative transition-colors"
        >
          <span
            className={`text-sm tracking-wide ${
              tab === 0 ? 'text-[#FF3F91] font-bold' : 'text-[#96969D] font-normal'
            }`}
          >
            Projects
          </span>
          {tab === 0 && (
            <div className="w-full h-[2.5px] bg-[#FF3F91] absolute bottom-0 rounded-full" />
          )}
        </button>
        <button
          id="tab-movies"
          onClick={() => setTab(1)}
          className="flex-1 py-3 text-center flex flex-col items-center relative transition-colors"
        >
          <span
            className={`text-sm tracking-wide ${
              tab === 1 ? 'text-[#FF3F91] font-bold' : 'text-[#96969D] font-normal'
            }`}
          >
            Movies
          </span>
          {tab === 1 && (
            <div className="w-full h-[2.5px] bg-[#FF3F91] absolute bottom-0 rounded-full" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 0 ? (
          bottomTab === 'home' ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-20">
              {filteredProjects.map((project) => {
                const totalSeconds = project.frames.length / (project.fps || 12);
                const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
                const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
                const ms = String(Math.floor((totalSeconds % 1) * 100)).padStart(2, '0');
                const durationStr = `00:${mm}:${ss}`;

                return (
                  <div
                    key={project.id}
                    id={`project-card-${project.id}`}
                    onClick={() => onOpenProject(project)}
                    className="flex flex-col cursor-pointer group select-none"
                  >
                    {/* Thumbnail Box */}
                    <div className="w-full aspect-[1.45] rounded-[9px] bg-[#303035] overflow-hidden relative border border-[#3f3f46]/40 transition-transform duration-150 group-hover:scale-[1.02] flex items-center justify-center shadow-md">
                      {project.frames[0] && (
                        <FrameThumbnail
                          frame={project.frames[0]}
                          width={200}
                          height={138}
                          canvasW={project.canvasW}
                          canvasH={project.canvasH}
                          backgroundColor="#202024"
                          className="w-full h-full object-contain"
                        />
                      )}
                      <div className="absolute bottom-1.5 right-1.5 bg-black/75 rounded px-1.5 py-0.5 text-[10px] text-white font-medium backdrop-blur-xs">
                        {project.fps} FPS
                      </div>
                    </div>

                    <div className="mt-1.5 px-0.5">
                      <div className="text-[14px] font-medium text-white truncate leading-tight group-hover:text-[#FF3F91] transition-colors">
                        {project.name}
                      </div>
                      <div className="text-[11px] text-[#96969D] mt-0.5 font-mono">
                        {durationStr} • {project.frames.length} frame{project.frames.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredProjects.length === 0 && (
                <div className="col-span-2 py-16 text-center text-[#96969D] text-sm">
                  No projects found.
                </div>
              )}
            </div>
          ) : (
            /* Discover tab view */
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 text-[#96969D]">
              <Compass className="w-12 h-12 text-[#FF3F91] mb-3 opacity-90" />
              <div className="text-base font-semibold text-white">Discover Animations</div>
              <p className="text-xs text-[#96969D] mt-1 max-w-xs">
                Explore hand-crafted 2D flipbook templates and animation cycles from artists.
              </p>
              <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onOpenProject(p)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#18181B] hover:bg-[#252529] border border-[#252529] text-left text-xs transition-colors"
                  >
                    <span className="text-white font-medium">{p.name}</span>
                    <span className="text-[#FF3F91]">Open & Draw &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )
        ) : (
          /* Movies Tab */
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            {movies.length === 0 ? (
              <div className="text-sm text-[#96969D] flex flex-col items-center gap-2">
                <Film className="w-8 h-8 opacity-40" />
                <span>No exported movies yet</span>
                <span className="text-xs text-[#96969D]/70 max-w-xs">
                  Create an animation and select &ldquo;Make Movie&rdquo; in settings to render your work.
                </span>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 gap-3 pb-20">
                {movies.map((m, idx) => (
                  <div key={idx} className="bg-[#18181B] rounded-lg p-2 border border-[#252529]">
                    <div className="aspect-video bg-black/60 rounded flex items-center justify-center text-xs text-[#FF3F91]">
                      Movie {idx + 1}
                    </div>
                    <div className="text-xs text-white font-medium mt-1 truncate">{m.name}</div>
                    <div className="text-[10px] text-[#96969D]">{m.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Create */}
      <button
        id="fab-create-project"
        onClick={onCreate}
        className="absolute bottom-16 right-4 w-14 h-14 rounded-full bg-[#FF3F91] hover:bg-[#ff2b85] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#FF3F91]/30 transition-all z-20 cursor-pointer"
        aria-label="Create Project"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-around bg-[#18181B] py-2 px-4 border-t border-[#252529] flex-shrink-0 z-10">
        <button
          id="nav-home"
          onClick={() => setBottomTab('home')}
          className="flex flex-col items-center gap-0.5 cursor-pointer"
        >
          <Home
            className={`w-5 h-5 ${
              bottomTab === 'home' ? 'text-[#FF3F91]' : 'text-[#96969D]'
            }`}
          />
          <span
            className={`text-[11px] ${
              bottomTab === 'home' ? 'text-[#FF3F91] font-medium' : 'text-[#96969D]'
            }`}
          >
            Home
          </span>
        </button>

        <button
          id="nav-discover"
          onClick={() => setBottomTab('discover')}
          className="flex flex-col items-center gap-0.5 cursor-pointer"
        >
          <Compass
            className={`w-5 h-5 ${
              bottomTab === 'discover' ? 'text-[#FF3F91]' : 'text-[#96969D]'
            }`}
          />
          <span
            className={`text-[11px] ${
              bottomTab === 'discover' ? 'text-[#FF3F91] font-medium' : 'text-[#96969D]'
            }`}
          >
            Discover
          </span>
        </button>
      </div>

      {/* Slide-in Menu Drawer */}
      {menuOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex">
          <div className="w-72 bg-[#18181B] h-full p-5 flex flex-col shadow-2xl border-r border-[#252529] animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#252529]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF3F91] flex items-center justify-center font-bold text-white text-sm">
                  M
                </div>
                <div>
                  <div className="text-sm font-bold text-white">MotionCanvas</div>
                  <div className="text-[10px] text-[#96969D]">Android 2D Studio</div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-[#96969D] hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2 flex-1 text-sm text-[#96969D]">
              <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-[#96969D]/60 font-semibold">
                App Info
              </div>
              <div className="px-2 py-1.5 text-white">Package: com.smitnk.motioncanvas</div>
              <div className="px-2 py-1.5 text-white">Framework: Jetpack Compose</div>
              <div className="px-2 py-1.5 text-white">Version: 1.0.0</div>

              <div className="pt-4 px-2 py-1 text-[11px] uppercase tracking-wider text-[#96969D]/60 font-semibold">
                Shortcuts & Export
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onCreate();
                }}
                className="w-full text-left px-2 py-1.5 text-white hover:text-[#FF3F91] transition-colors cursor-pointer"
              >
                + New Animation Project
              </button>

              <a
                href="/MotionCanvas-Android-Studio.zip"
                download="MotionCanvas-Android-Studio.zip"
                className="flex items-center gap-2 mt-2 w-full p-2.5 rounded-lg bg-[#FF3F91] hover:bg-[#ff2b85] text-white font-medium text-xs shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Project (.zip)</span>
              </a>
            </div>

            <div className="pt-4 border-t border-[#252529] text-xs text-[#96969D]">
              Built with Jetpack Compose & Material 3
            </div>
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
};

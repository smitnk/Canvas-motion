import { Project, Frame } from '../types';

// Helper to generate stickman walk cycle frames
function createWalkCycleFrames(): Frame[] {
  // Frame 1: Contact
  const f1 = [
    // Head
    { points: [{ x: 300, y: 150 }, { x: 310, y: 145 }, { x: 320, y: 155 }, { x: 310, y: 170 }, { x: 295, y: 165 }, { x: 300, y: 150 }], color: '#FFFFFF', width: 6 },
    // Body
    { points: [{ x: 305, y: 170 }, { x: 305, y: 250 }], color: '#FFFFFF', width: 6 },
    // Left leg forward
    { points: [{ x: 305, y: 250 }, { x: 270, y: 290 }, { x: 245, y: 340 }], color: '#FF3F91', width: 6 },
    // Right leg backward
    { points: [{ x: 305, y: 250 }, { x: 335, y: 290 }, { x: 360, y: 340 }], color: '#38BDF8', width: 6 },
    // Left arm backward
    { points: [{ x: 305, y: 190 }, { x: 335, y: 220 }, { x: 355, y: 245 }], color: '#FF3F91', width: 5 },
    // Right arm forward
    { points: [{ x: 305, y: 190 }, { x: 275, y: 215 }, { x: 255, y: 240 }], color: '#38BDF8', width: 5 },
    // Ground line
    { points: [{ x: 150, y: 345 }, { x: 500, y: 345 }], color: '#52525B', width: 4 }
  ];

  // Frame 2: Passing
  const f2 = [
    // Head
    { points: [{ x: 310, y: 140 }, { x: 320, y: 135 }, { x: 330, y: 145 }, { x: 320, y: 160 }, { x: 305, y: 155 }, { x: 310, y: 140 }], color: '#FFFFFF', width: 6 },
    // Body
    { points: [{ x: 315, y: 160 }, { x: 315, y: 240 }], color: '#FFFFFF', width: 6 },
    // Left leg supporting straight
    { points: [{ x: 315, y: 240 }, { x: 300, y: 290 }, { x: 300, y: 340 }], color: '#FF3F91', width: 6 },
    // Right leg bent passing
    { points: [{ x: 315, y: 240 }, { x: 335, y: 270 }, { x: 325, y: 300 }], color: '#38BDF8', width: 6 },
    // Left arm down
    { points: [{ x: 315, y: 180 }, { x: 315, y: 225 }, { x: 315, y: 245 }], color: '#FF3F91', width: 5 },
    // Right arm down
    { points: [{ x: 315, y: 180 }, { x: 310, y: 220 }, { x: 305, y: 240 }], color: '#38BDF8', width: 5 },
    // Ground line
    { points: [{ x: 150, y: 345 }, { x: 500, y: 345 }], color: '#52525B', width: 4 }
  ];

  // Frame 3: Contact opposite
  const f3 = [
    // Head
    { points: [{ x: 320, y: 150 }, { x: 330, y: 145 }, { x: 340, y: 155 }, { x: 330, y: 170 }, { x: 315, y: 165 }, { x: 320, y: 150 }], color: '#FFFFFF', width: 6 },
    // Body
    { points: [{ x: 325, y: 170 }, { x: 325, y: 250 }], color: '#FFFFFF', width: 6 },
    // Right leg forward
    { points: [{ x: 325, y: 250 }, { x: 290, y: 290 }, { x: 265, y: 340 }], color: '#38BDF8', width: 6 },
    // Left leg backward
    { points: [{ x: 325, y: 250 }, { x: 355, y: 290 }, { x: 380, y: 340 }], color: '#FF3F91', width: 6 },
    // Right arm backward
    { points: [{ x: 325, y: 190 }, { x: 355, y: 220 }, { x: 375, y: 245 }], color: '#38BDF8', width: 5 },
    // Left arm forward
    { points: [{ x: 325, y: 190 }, { x: 295, y: 215 }, { x: 275, y: 240 }], color: '#FF3F91', width: 5 },
    // Ground line
    { points: [{ x: 150, y: 345 }, { x: 500, y: 345 }], color: '#52525B', width: 4 }
  ];

  // Frame 4: Passing opposite
  const f4 = [
    // Head
    { points: [{ x: 310, y: 140 }, { x: 320, y: 135 }, { x: 330, y: 145 }, { x: 320, y: 160 }, { x: 305, y: 155 }, { x: 310, y: 140 }], color: '#FFFFFF', width: 6 },
    // Body
    { points: [{ x: 315, y: 160 }, { x: 315, y: 240 }], color: '#FFFFFF', width: 6 },
    // Right leg supporting
    { points: [{ x: 315, y: 240 }, { x: 315, y: 290 }, { x: 315, y: 340 }], color: '#38BDF8', width: 6 },
    // Left leg bent passing
    { points: [{ x: 315, y: 240 }, { x: 340, y: 270 }, { x: 330, y: 300 }], color: '#FF3F91', width: 6 },
    // Left arm
    { points: [{ x: 315, y: 180 }, { x: 310, y: 220 }, { x: 305, y: 240 }], color: '#FF3F91', width: 5 },
    // Right arm
    { points: [{ x: 315, y: 180 }, { x: 320, y: 220 }, { x: 325, y: 245 }], color: '#38BDF8', width: 5 },
    // Ground line
    { points: [{ x: 150, y: 345 }, { x: 500, y: 345 }], color: '#52525B', width: 4 }
  ];

  return [
    { id: 'f1', strokes: f1 },
    { id: 'f2', strokes: f2 },
    { id: 'f3', strokes: f3 },
    { id: 'f4', strokes: f4 }
  ];
}

function createStickmanParkourFrames(): Frame[] {
  return [
    {
      id: 'sp1',
      strokes: [
        { points: [{ x: 180, y: 260 }, { x: 230, y: 240 }, { x: 260, y: 200 }], color: '#FF3F91', width: 6 },
        { points: [{ x: 260, y: 180 }, { x: 280, y: 160 }, { x: 290, y: 180 }, { x: 270, y: 190 }, { x: 260, y: 180 }], color: '#FFFFFF', width: 6 },
        { points: [{ x: 100, y: 320 }, { x: 250, y: 320 }], color: '#52525B', width: 5 }
      ]
    },
    {
      id: 'sp2',
      strokes: [
        { points: [{ x: 280, y: 180 }, { x: 310, y: 130 }, { x: 350, y: 110 }], color: '#FF3F91', width: 6 },
        { points: [{ x: 350, y: 90 }, { x: 370, y: 80 }, { x: 380, y: 100 }, { x: 360, y: 110 }, { x: 350, y: 90 }], color: '#FFFFFF', width: 6 },
        { points: [{ x: 100, y: 320 }, { x: 250, y: 320 }], color: '#52525B', width: 5 },
        { points: [{ x: 380, y: 320 }, { x: 550, y: 320 }], color: '#52525B', width: 5 }
      ]
    },
    {
      id: 'sp3',
      strokes: [
        { points: [{ x: 380, y: 160 }, { x: 420, y: 220 }, { x: 440, y: 310 }], color: '#FF3F91', width: 6 },
        { points: [{ x: 430, y: 140 }, { x: 450, y: 130 }, { x: 460, y: 150 }, { x: 440, y: 160 }, { x: 430, y: 140 }], color: '#FFFFFF', width: 6 },
        { points: [{ x: 380, y: 320 }, { x: 550, y: 320 }], color: '#52525B', width: 5 }
      ]
    }
  ];
}

function createCharacterTestFrames(): Frame[] {
  return [
    {
      id: 'ct1',
      strokes: [
        { points: [{ x: 250, y: 200 }, { x: 350, y: 200 }, { x: 350, y: 300 }, { x: 250, y: 300 }, { x: 250, y: 200 }], color: '#FF3F91', width: 6 },
        { points: [{ x: 275, y: 240 }, { x: 285, y: 240 }], color: '#FFFFFF', width: 5 },
        { points: [{ x: 315, y: 240 }, { x: 325, y: 240 }], color: '#FFFFFF', width: 5 },
        { points: [{ x: 280, y: 270 }, { x: 300, y: 280 }, { x: 320, y: 270 }], color: '#FBBF24', width: 5 }
      ]
    },
    {
      id: 'ct2',
      strokes: [
        { points: [{ x: 250, y: 200 }, { x: 350, y: 200 }, { x: 350, y: 300 }, { x: 250, y: 300 }, { x: 250, y: 200 }], color: '#FF3F91', width: 6 },
        // Blink eyes
        { points: [{ x: 270, y: 245 }, { x: 290, y: 245 }], color: '#FFFFFF', width: 5 },
        { points: [{ x: 310, y: 245 }, { x: 330, y: 245 }], color: '#FFFFFF', width: 5 },
        // Smile bigger
        { points: [{ x: 275, y: 265 }, { x: 300, y: 285 }, { x: 325, y: 265 }], color: '#FBBF24', width: 5 }
      ]
    }
  ];
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'My Animation',
    fps: 12,
    canvasW: 1280,
    canvasH: 720,
    backgroundColor: '#FFFFFF',
    frames: [
      {
        id: 'init_f1',
        strokes: [
          { points: [{ x: 280, y: 220 }, { x: 300, y: 190 }, { x: 330, y: 200 }, { x: 340, y: 230 }, { x: 320, y: 250 }, { x: 290, y: 240 }, { x: 280, y: 220 }], color: '#FF3F91', width: 6 },
          { points: [{ x: 295, y: 250 }, { x: 295, y: 310 }], color: '#FFFFFF', width: 6 },
          { points: [{ x: 270, y: 270 }, { x: 320, y: 270 }], color: '#38BDF8', width: 5 },
          { points: [{ x: 295, y: 310 }, { x: 275, y: 360 }], color: '#FFFFFF', width: 6 },
          { points: [{ x: 295, y: 310 }, { x: 315, y: 360 }], color: '#FFFFFF', width: 6 }
        ]
      }
    ],
    layers: [{ id: 'l1', name: 'Layer 1', visible: true, opacity: 1 }],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'proj_2',
    name: 'Character Test',
    fps: 12,
    canvasW: 1280,
    canvasH: 720,
    backgroundColor: '#FFFFFF',
    frames: createCharacterTestFrames(),
    layers: [{ id: 'l1', name: 'Layer 1', visible: true, opacity: 1 }],
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000
  },
  {
    id: 'proj_3',
    name: 'Stickman Parkour',
    fps: 12,
    canvasW: 1280,
    canvasH: 720,
    backgroundColor: '#FFFFFF',
    frames: createStickmanParkourFrames(),
    layers: [{ id: 'l1', name: 'Layer 1', visible: true, opacity: 1 }],
    createdAt: Date.now() - 14400000,
    updatedAt: Date.now() - 14400000
  },
  {
    id: 'proj_4',
    name: 'Walk Cycle',
    fps: 12,
    canvasW: 1280,
    canvasH: 720,
    backgroundColor: '#FFFFFF',
    frames: createWalkCycleFrames(),
    layers: [{ id: 'l1', name: 'Layer 1', visible: true, opacity: 1 }],
    createdAt: Date.now() - 28800000,
    updatedAt: Date.now() - 28800000
  }
];

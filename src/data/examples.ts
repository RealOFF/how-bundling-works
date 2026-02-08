import type { ModuleNode, ImportEdge } from '../types/graph';

interface Example {
  name: string;
  description: string;
  learningPoint: string;
  nodes: ModuleNode[];
  edges: ImportEdge[];
}

export const examples: Example[] = [
  {
    name: 'Basic App (Single Chunk)',
    description: 'All static imports — everything ends up in one chunk.',
    learningPoint:
      'When every import is a regular static import, the bundler puts all modules into a single output file. This is the simplest case.',
    nodes: [
      {
        id: 'app',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'App.tsx', isEntry: true },
      },
      {
        id: 'header',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'Header.tsx', isEntry: false },
      },
      {
        id: 'footer',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'Footer.tsx', isEntry: false },
      },
      {
        id: 'utils',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'utils.ts', isEntry: false },
      },
    ],
    edges: [
      {
        id: 'app-header',
        source: 'app',
        target: 'header',
        type: 'static-import',
        data: { importType: 'static' },
      },
      {
        id: 'app-footer',
        source: 'app',
        target: 'footer',
        type: 'static-import',
        data: { importType: 'static' },
      },
      {
        id: 'header-utils',
        source: 'header',
        target: 'utils',
        type: 'static-import',
        data: { importType: 'static' },
      },
    ],
  },
  {
    name: 'Lazy-Loaded Routes',
    description: 'Dynamic imports for Dashboard and Settings create separate async chunks.',
    learningPoint:
      'Dynamic import() tells the bundler to split code at that boundary. Each dynamically imported module becomes its own async chunk, loaded only when the user navigates to that route.',
    nodes: [
      {
        id: 'app',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'App.tsx', isEntry: true },
      },
      {
        id: 'nav',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'Nav.tsx', isEntry: false },
      },
      {
        id: 'dashboard',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'Dashboard.tsx', isEntry: false },
      },
      {
        id: 'chart',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'Chart.tsx', isEntry: false },
      },
      {
        id: 'settings',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'Settings.tsx', isEntry: false },
      },
    ],
    edges: [
      {
        id: 'app-nav',
        source: 'app',
        target: 'nav',
        type: 'static-import',
        data: { importType: 'static' },
      },
      {
        id: 'app-dashboard',
        source: 'app',
        target: 'dashboard',
        type: 'dynamic-import',
        data: { importType: 'dynamic' },
      },
      {
        id: 'app-settings',
        source: 'app',
        target: 'settings',
        type: 'dynamic-import',
        data: { importType: 'dynamic' },
      },
      {
        id: 'dashboard-chart',
        source: 'dashboard',
        target: 'chart',
        type: 'static-import',
        data: { importType: 'static' },
      },
    ],
  },
  {
    name: 'Shared Vendor Code',
    description: 'utils.ts is used by multiple chunks, so it gets extracted into a shared chunk.',
    learningPoint:
      'When a module is imported by two or more chunks, the bundler extracts it into a shared chunk. This prevents the same code from being downloaded twice.',
    nodes: [
      {
        id: 'app',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'App.tsx', isEntry: true },
      },
      {
        id: 'home',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'Home.tsx', isEntry: false },
      },
      {
        id: 'profile',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'Profile.tsx', isEntry: false },
      },
      {
        id: 'utils',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'utils.ts', isEntry: false },
      },
      {
        id: 'api',
        type: 'module',
        position: { x: 0, y: 0 },
        data: { filename: 'api.ts', isEntry: false },
      },
    ],
    edges: [
      {
        id: 'app-home',
        source: 'app',
        target: 'home',
        type: 'static-import',
        data: { importType: 'static' },
      },
      {
        id: 'app-profile',
        source: 'app',
        target: 'profile',
        type: 'dynamic-import',
        data: { importType: 'dynamic' },
      },
      {
        id: 'home-utils',
        source: 'home',
        target: 'utils',
        type: 'static-import',
        data: { importType: 'static' },
      },
      {
        id: 'profile-utils',
        source: 'profile',
        target: 'utils',
        type: 'static-import',
        data: { importType: 'static' },
      },
      {
        id: 'profile-api',
        source: 'profile',
        target: 'api',
        type: 'static-import',
        data: { importType: 'static' },
      },
    ],
  },
];

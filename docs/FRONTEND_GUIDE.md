# Frontend Guide

This document describes the frontend architecture, components, and development patterns for banana-slides.

## Table of Contents

- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Pages](#pages)
- [Components](#components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Adding a New Page](#adding-a-new-page)
- [Adding a New Component](#adding-a-new-component)

---

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   ├── vite-env.d.ts        # Vite type definitions
│   │
│   ├── pages/               # Page components
│   │   ├── Home.tsx         # Project creation
│   │   ├── OutlineEditor.tsx # Outline editing
│   │   ├── DetailEditor.tsx # Description editing
│   │   ├── SlidePreview.tsx # Slide preview & export
│   │   ├── History.tsx      # Project history
│   │   └── Settings.tsx     # App settings
│   │
│   ├── components/          # Reusable components
│   │   ├── shared/          # Shared UI components
│   │   ├── outline/         # Outline-specific components
│   │   ├── preview/         # Preview-specific components
│   │   └── history/         # History-specific components
│   │
│   ├── store/               # State management
│   │   └── useProjectStore.ts # Zustand store
│   │
│   ├── api/                 # API layer
│   │   ├── client.ts        # Axios instance
│   │   └── endpoints.ts     # API functions
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   │
│   ├── utils/               # Utility functions
│   │   ├── index.ts
│   │   └── debounce.ts
│   │
│   ├── hooks/               # Custom React hooks
│   └── config/              # Configuration
│
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Zustand | 4.x | State management |
| React Router | 6.x | Routing |
| Tailwind CSS | 3.x | Styling |
| Axios | 1.x | HTTP client |
| @dnd-kit | 6.x | Drag and drop |
| Lucide React | - | Icons |

---

## Pages

### Home (`Home.tsx`)

**Route:** `/`

**Purpose:** Project creation with three modes:
- **Idea Mode** - Enter a topic/idea
- **Outline Mode** - Enter a structured outline
- **Description Mode** - Enter detailed descriptions

**Key Features:**
- Template selection (upload or choose from library)
- Reference file upload
- "No template" mode with style description

**State Flow:**
```
User Input → initializeProject() → createProject API → Navigate to OutlineEditor
```

---

### OutlineEditor (`OutlineEditor.tsx`)

**Route:** `/project/:projectId/outline`

**Purpose:** Edit and refine the PPT outline.

**Key Features:**
- Drag-and-drop page reordering
- Inline outline editing
- AI refinement via natural language
- Add/delete pages

**Components Used:**
- `OutlineCard` - Individual slide outline
- `AiRefineInput` - Natural language editing
- Drag-and-drop from @dnd-kit

---

### DetailEditor (`DetailEditor.tsx`)

**Route:** `/project/:projectId/detail`

**Purpose:** Edit page descriptions before image generation.

**Key Features:**
- Edit description content per page
- Generate single page description
- Batch generate descriptions
- AI refinement via natural language

**Components Used:**
- `DescriptionCard` - Individual page description
- `AiRefineInput` - Natural language editing

---

### SlidePreview (`SlidePreview.tsx`)

**Route:** `/project/:projectId/preview`

**Purpose:** Preview generated slides and export.

**Key Features:**
- Full-screen slide preview
- Image editing with natural language
- Export to PPTX/PDF
- Image version history
- Material library integration

**Components Used:**
- `SlideCard` - Individual slide preview
- `MaterialSelector` - Select materials
- `MaterialGeneratorModal` - Generate materials
- Image zoom/lightbox

---

### History (`History.tsx`)

**Route:** `/history`

**Purpose:** View and manage past projects.

**Key Features:**
- Project list with thumbnails
- Delete projects
- Resume editing

---

### Settings (`Settings.tsx`)

**Route:** `/settings`

**Purpose:** Configure application settings.

**Key Features:**
- AI provider selection
- API key configuration
- Model selection
- Resolution settings
- Language preferences

---

## Components

### Shared Components (`components/shared/`)

| Component | File | Purpose |
|-----------|------|---------|
| Button | `Button.tsx` | Styled button with variants |
| Card | `Card.tsx` | Container with shadow |
| Modal | `Modal.tsx` | Dialog overlay |
| Input | `Input.tsx` | Text input field |
| Textarea | `Textarea.tsx` | Multi-line text input |
| Loading | `Loading.tsx` | Loading spinner/skeleton |
| Toast | `Toast.tsx` | Notification messages |
| ConfirmDialog | `ConfirmDialog.tsx` | Confirmation modal |
| StatusBadge | `StatusBadge.tsx` | Status indicator |
| Markdown | `Markdown.tsx` | Markdown renderer |

### Feature Components

| Component | File | Purpose |
|-----------|------|---------|
| TemplateSelector | `TemplateSelector.tsx` | Template image picker |
| MaterialSelector | `MaterialSelector.tsx` | Material image library |
| MaterialGeneratorModal | `MaterialGeneratorModal.tsx` | AI material generation |
| ReferenceFileSelector | `ReferenceFileSelector.tsx` | Reference file picker |
| ReferenceFileCard | `ReferenceFileCard.tsx` | Reference file display |
| AiRefineInput | `AiRefineInput.tsx` | Natural language editing |
| ProjectSettingsModal | `ProjectSettingsModal.tsx` | Project config modal |
| ProjectResourcesList | `ProjectResourcesList.tsx` | Project resources panel |
| ImagePreviewList | `ImagePreviewList.tsx` | Image gallery view |
| ShimmerOverlay | `ShimmerOverlay.tsx` | Loading overlay |

### Page-Specific Components

| Component | Directory | Purpose |
|-----------|-----------|---------|
| OutlineCard | `outline/` | Outline item editor |
| SlideCard | `preview/` | Slide preview card |
| DescriptionCard | `preview/` | Description editor |
| ProjectCard | `history/` | History list item |

---

## State Management

### Zustand Store (`useProjectStore.ts`)

The application uses Zustand for global state management. The store manages:

- Current project data
- Loading states
- Task progress
- Error handling

**Key State:**

```typescript
interface ProjectState {
  currentProject: Project | null;
  isGlobalLoading: boolean;
  activeTaskId: string | null;
  taskProgress: { total: number; completed: number } | null;
  error: string | null;
}
```

**Key Actions:**

| Action | Purpose |
|--------|---------|
| `initializeProject()` | Create new project |
| `syncProject()` | Fetch/refresh project data |
| `generateOutline()` | Generate outline from idea |
| `generateDescriptions()` | Batch generate descriptions |
| `generateImages()` | Batch generate images |
| `generatePageImage()` | Generate single page image |
| `editPageImage()` | Edit image with instruction |
| `updatePageLocal()` | Optimistic local update |
| `reorderPages()` | Drag-and-drop reorder |
| `exportPPTX()` | Export as PPTX |
| `exportPDF()` | Export as PDF |

**Task Polling Pattern:**

```typescript
// Start async task
const { task_id } = await generateImages(projectId);

// Poll for completion
const pollTask = async () => {
  const status = await getTaskStatus(projectId, task_id);
  
  if (status === 'COMPLETED') {
    await syncProject(); // Refresh data
  } else if (status === 'RUNNING') {
    updateProgress(status.progress);
    setTimeout(pollTask, 1000);
  } else if (status === 'FAILED') {
    setError(status.error_message);
  }
};
```

**Usage in Components:**

```tsx
import { useProjectStore } from '@/store/useProjectStore';

function MyComponent() {
  const { 
    currentProject, 
    isGlobalLoading,
    generateOutline 
  } = useProjectStore();

  const handleGenerate = async () => {
    await generateOutline();
  };

  return (
    <Button onClick={handleGenerate} disabled={isGlobalLoading}>
      Generate
    </Button>
  );
}
```

---

## API Integration

### API Client (`api/client.ts`)

Axios instance with base configuration:

```typescript
export const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 300000, // 5 minutes for AI operations
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### API Endpoints (`api/endpoints.ts`)

All API calls are organized by resource:

```typescript
// Projects
createProject(data)
getProject(projectId)
updateProject(projectId, data)
deleteProject(projectId)

// Generation
generateOutline(projectId, language)
generateDescriptions(projectId, language)
generateImages(projectId, language)
refineOutline(projectId, requirement)
refineDescriptions(projectId, requirement)

// Pages
updatePage(projectId, pageId, data)
deletePage(projectId, pageId)
generatePageImage(projectId, pageId)
editPageImage(projectId, pageId, instruction)

// Export
exportPPTX(projectId)
exportPDF(projectId)
exportEditablePPTX(projectId)
```

---

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling:

**Configuration:** `tailwind.config.js`

**Common Patterns:**

```tsx
// Card container
<div className="bg-white rounded-lg shadow-md p-4">

// Primary button
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">

// Flex layout
<div className="flex items-center justify-between gap-4">

// Grid layout
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

### Global Styles (`index.css`)

Custom CSS for:
- CSS variables (colors, fonts)
- Animation keyframes
- Scrollbar styling
- Dark mode (if applicable)

---

## Adding a New Page

1. **Create page component:**

```tsx
// src/pages/NewPage.tsx
import { useProjectStore } from '@/store/useProjectStore';

export default function NewPage() {
  const { currentProject } = useProjectStore();

  return (
    <div className="container mx-auto p-4">
      <h1>New Page</h1>
      {/* Page content */}
    </div>
  );
}
```

2. **Add route in `App.tsx`:**

```tsx
import NewPage from '@/pages/NewPage';

function App() {
  return (
    <Routes>
      {/* existing routes */}
      <Route path="/new-page" element={<NewPage />} />
    </Routes>
  );
}
```

3. **Add navigation link (if needed):**

Update the navigation component to include a link to the new page.

---

## Adding a New Component

1. **Create component file:**

```tsx
// src/components/shared/MyComponent.tsx
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div className="p-4 bg-white rounded shadow" onClick={onClick}>
      {title}
    </div>
  );
}
```

2. **Export from index:**

```typescript
// src/components/shared/index.ts
export * from './MyComponent';
```

3. **Use in parent component:**

```tsx
import { MyComponent } from '@/components/shared';

function ParentComponent() {
  return <MyComponent title="Hello" onClick={() => console.log('clicked')} />;
}
```

---

## Best Practices

1. **Type Safety:** Always define TypeScript interfaces for props and state.

2. **Optimistic Updates:** Use `updatePageLocal()` for immediate UI feedback, then sync with server.

3. **Error Handling:** Wrap API calls in try-catch and update error state.

4. **Loading States:** Show loading indicators during async operations.

5. **Component Size:** Keep components focused. Extract complex logic into hooks or separate components.

6. **Naming:** Use descriptive names. Pages are `PascalCase`, utilities are `camelCase`.

# Banana-Slides Architecture

This document provides an overview of the banana-slides system architecture, explaining how components interact and data flows through the application.

## Table of Contents

- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [High-Level Architecture](#high-level-architecture)
- [Request Flow](#request-flow)
- [AI Provider Architecture](#ai-provider-architecture)
- [Async Task Processing](#async-task-processing)
- [File Storage Structure](#file-storage-structure)

---

## System Overview

Banana-slides is an AI-powered presentation generation application built on a modern web stack. It uses the Gemini AI model (via the "nano banana pro" image generation capabilities) to create visually appealing PPT slides from user ideas, outlines, or descriptions.

The application follows a client-server architecture with a React frontend communicating with a Flask backend via REST APIs.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite 5 | Build tool |
| Zustand | State management |
| React Router v6 | Routing |
| Tailwind CSS | Styling |
| @dnd-kit | Drag and drop functionality |
| Axios | HTTP client |
| Lucide React | Icons |

### Backend

| Technology | Purpose |
|------------|---------|
| Python 3.10+ | Runtime |
| Flask 3.0 | Web framework |
| SQLAlchemy | ORM |
| SQLite | Database |
| uv | Package manager |
| python-pptx | PPTX generation |
| Pillow | Image processing |
| ThreadPoolExecutor | Concurrent task execution |
| Flask-CORS | Cross-origin support |

### AI Services

| Provider | Usage |
|----------|-------|
| Google Gemini | Text generation & image generation |
| OpenAI (compatible) | Alternative text/image provider |
| Vertex AI | GCP-hosted Gemini alternative |

---

## High-Level Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (React + TypeScript)"]
        Pages["Pages<br/>Home, OutlineEditor, DetailEditor,<br/>SlidePreview, History, Settings"]
        Components["Shared Components<br/>25+ UI components"]
        Store["Zustand Store<br/>useProjectStore"]
        API["API Client<br/>endpoints.ts"]
        
        Pages --> Components
        Pages --> Store
        Store --> API
    end
    
    subgraph Backend["Backend (Flask + Python)"]
        Controllers["Controllers<br/>project, page, material,<br/>template, export, file,<br/>reference_file, settings"]
        Services["Services<br/>AIService, TaskManager,<br/>ExportService, FileService,<br/>FileParserService"]
        Models["SQLAlchemy Models<br/>Project, Page, Task,<br/>Material, ReferenceFile,<br/>Settings, etc."]
        Prompts["Prompt Templates<br/>prompts.py"]
        
        Controllers --> Services
        Services --> Models
        Services --> Prompts
    end
    
    subgraph External["External Services"]
        Gemini["Google Gemini API"]
        MinerU["MinerU File Parser"]
    end
    
    subgraph Storage["Storage"]
        SQLite["SQLite Database"]
        FileSystem["File System<br/>uploads/, exports/"]
    end
    
    API -->|REST API| Controllers
    Services --> Gemini
    Services --> MinerU
    Models --> SQLite
    Services --> FileSystem
```

---

## Request Flow

### Example: Generate PPT from Idea

This diagram shows how a PPT generation request flows through the system:

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant Store as Zustand Store
    participant API as API Client
    participant Ctrl as Controllers
    participant Svc as Services
    participant AI as AI Provider
    participant DB as SQLite
    
    User->>FE: Enter idea prompt
    FE->>Store: initializeProject()
    Store->>API: createProject()
    API->>Ctrl: POST /api/projects
    Ctrl->>DB: Create Project record
    DB-->>Ctrl: Project created
    Ctrl-->>API: {project_id, status}
    
    User->>FE: Click "Generate Outline"
    FE->>Store: generateOutline()
    Store->>API: generateOutline(projectId)
    API->>Ctrl: POST /api/projects/{id}/generate/outline
    Ctrl->>Svc: AIService.generate_outline()
    Svc->>AI: Text generation request
    AI-->>Svc: Outline JSON
    Svc->>DB: Create Page records
    DB-->>Svc: Pages created
    Ctrl-->>API: {pages}
    Store->>Store: Update state
    
    User->>FE: Click "Generate Images"
    FE->>Store: generateImages()
    Store->>API: generateImages(projectId)
    API->>Ctrl: POST /api/projects/{id}/generate/images
    Ctrl->>Svc: TaskManager.submit_task()
    Svc->>DB: Create Task record
    Ctrl-->>API: {task_id}
    
    loop Poll Task Status
        Store->>API: getTask(taskId)
        API->>Ctrl: GET /api/projects/{id}/tasks/{task_id}
        Ctrl->>DB: Get Task progress
        Ctrl-->>API: {status, progress}
    end
    
    Note over Svc: Background Task
    Svc->>AI: Image generation (parallel)
    AI-->>Svc: Generated images
    Svc->>DB: Update Page.generated_image_path
    Svc->>DB: Update Task.status = COMPLETED
    
    Store->>Store: syncProject()
    FE->>User: Display generated slides
```

---

## AI Provider Architecture

The backend supports multiple AI providers through a pluggable architecture:

```mermaid
classDiagram
    class TextProvider {
        <<abstract>>
        +generate_text(prompt, thinking_budget) str
        +is_available() bool
    }
    
    class ImageProvider {
        <<abstract>>
        +generate_image(prompt, ref_images, aspect_ratio, resolution) Image
        +edit_image(images, prompt, aspect_ratio, resolution) Image
        +is_available() bool
    }
    
    class GeminiTextProvider {
        +generate_text()
        +is_available()
    }
    
    class GeminiImageProvider {
        +generate_image()
        +edit_image()
        +is_available()
    }
    
    class OpenAITextProvider {
        +generate_text()
        +is_available()
    }
    
    class OpenAIImageProvider {
        +generate_image()
        +edit_image()
        +is_available()
    }
    
    class VertexTextProvider {
        +generate_text()
        +is_available()
    }
    
    class VertexImageProvider {
        +generate_image()
        +edit_image()
        +is_available()
    }
    
    class AIService {
        -text_provider: TextProvider
        -image_provider: ImageProvider
        +generate_outline()
        +generate_page_description()
        +generate_image_prompt()
        +generate_image()
        +edit_image()
    }
    
    TextProvider <|-- GeminiTextProvider
    TextProvider <|-- OpenAITextProvider
    TextProvider <|-- VertexTextProvider
    
    ImageProvider <|-- GeminiImageProvider
    ImageProvider <|-- OpenAIImageProvider
    ImageProvider <|-- VertexImageProvider
    
    AIService --> TextProvider
    AIService --> ImageProvider
```

**Provider Selection:**

The provider is selected based on the `AI_PROVIDER_FORMAT` environment variable:
- `gemini` - Uses Google GenAI SDK (default)
- `openai` - Uses OpenAI-compatible API
- `vertex` - Uses Google Vertex AI

---

## Async Task Processing

Long-running operations (image generation, batch descriptions) are handled asynchronously:

```mermaid
flowchart LR
    subgraph Request["Request Handler"]
        A[Client Request] --> B[Create Task Record]
        B --> C[Submit to ThreadPool]
        C --> D[Return task_id]
    end
    
    subgraph Background["Background Processing"]
        E[ThreadPoolExecutor] --> F[Execute Task]
        F --> G[Update Progress]
        G --> H{More work?}
        H -->|Yes| F
        H -->|No| I[Mark Complete]
    end
    
    subgraph Polling["Client Polling"]
        J[Poll /tasks/task_id] --> K{Status?}
        K -->|RUNNING| L[Show Progress]
        L --> J
        K -->|COMPLETED| M[Sync Project]
        K -->|FAILED| N[Show Error]
    end
    
    D --> J
    C --> E
```

**Task Types:**
- `GENERATE_DESCRIPTIONS` - Batch generate page descriptions
- `GENERATE_IMAGES` - Batch generate page images
- `GENERATE_PAGE_IMAGE` - Single page image generation
- `EDIT_PAGE_IMAGE` - Image editing/inpainting
- `GENERATE_MATERIAL_IMAGE` - Material generation
- `EXPORT_EDITABLE_PPTX` - Editable PPTX export

---

## File Storage Structure

```
banana-slides/
├── uploads/                      # Uploaded files root
│   ├── {project_id}/             # Project-specific files
│   │   ├── template/             # Template images
│   │   │   └── template.png
│   │   ├── pages/                # Generated page images
│   │   │   ├── page_0.png
│   │   │   └── page_1.png
│   │   ├── materials/            # Material images
│   │   │   └── material_abc.png
│   │   └── reference_files/      # Uploaded reference docs
│   │       └── document.pdf
│   └── mineru/                   # MinerU parsed files
│       └── {extract_id}/
│           ├── content.json
│           └── images/
├── backend/
│   ├── instance/
│   │   └── database.db           # SQLite database
│   └── exports/                  # Generated exports
│       └── {project_id}/
│           ├── slides.pptx
│           └── slides.pdf
```

---

## Key Design Decisions

1. **SQLite + WAL Mode**: Chosen for simplicity and single-file deployment. WAL mode enables concurrent reads/writes required for async task processing.

2. **ThreadPoolExecutor over Celery**: Simpler deployment without Redis/message queue. Suitable for moderate concurrency.

3. **Pluggable AI Providers**: Enables switching between Gemini, OpenAI, or Vertex with minimal code changes.

4. **JSON in Text Columns**: Page outline/description stored as JSON strings for flexibility, with helper methods for serialization.

5. **Image Versioning**: Each page maintains version history for undo/redo functionality.

6. **Zustand over Redux**: Simpler state management with less boilerplate, suitable for this application's complexity.

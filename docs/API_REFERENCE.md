# API Reference

This document provides a complete reference for all REST API endpoints in banana-slides.

## Table of Contents

- [Overview](#overview)
- [Response Format](#response-format)
- [Projects](#projects)
- [Generation](#generation)
- [Pages](#pages)
- [Materials](#materials)
- [User Templates](#user-templates)
- [Reference Files](#reference-files)
- [Export](#export)
- [Settings](#settings)
- [Tasks](#tasks)

---

## Overview

**Base URL:** `http://localhost:5000`

**Content-Type:** `application/json` (unless specified otherwise)

**Authentication:** None (local deployment)

---

## Response Format

All endpoints return a consistent JSON structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional detailed error description"
}
```

---

## Projects

### Create Project

Creates a new PPT project.

**Endpoint:** `POST /api/projects`

**Request Body:**
```json
{
  "creation_type": "idea",
  "idea_prompt": "A presentation about climate change",
  "outline_text": null,
  "description_text": null,
  "template_style": "Modern minimalist design with blue accents"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `creation_type` | string | Yes | One of: `idea`, `outline`, `descriptions` |
| `idea_prompt` | string | Conditional | Required for `idea` type |
| `outline_text` | string | Conditional | Required for `outline` type |
| `description_text` | string | Conditional | Required for `descriptions` type |
| `template_style` | string | No | Style description for no-template mode |

**Response:**
```json
{
  "success": true,
  "data": {
    "project_id": "abc123-...",
    "idea_prompt": "A presentation about climate change",
    "outline_text": null,
    "description_text": null,
    "extra_requirements": null,
    "creation_type": "idea",
    "template_image_url": null,
    "template_style": "Modern minimalist design with blue accents",
    "status": "DRAFT",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "pages": []
  }
}
```

---

### Upload Template

Uploads a template image for the project.

**Endpoint:** `POST /api/projects/{project_id}/template`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `template_image` | File | Template image file (PNG, JPG, etc.) |

**Response:**
```json
{
  "success": true,
  "data": {
    "template_image_url": "/files/abc123/template/template.png"
  }
}
```

---

### List Projects

Gets all projects (for history page).

**Endpoint:** `GET /api/projects`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Max projects to return (max: 100) |
| `offset` | integer | 0 | Pagination offset |

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "project_id": "abc123-...",
        "idea_prompt": "A presentation about climate change",
        "creation_type": "idea",
        "status": "COMPLETED",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T12:00:00Z"
      }
    ],
    "total": 25
  }
}
```

---

### Get Project

Gets a single project with all pages.

**Endpoint:** `GET /api/projects/{project_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "project_id": "abc123-...",
    "idea_prompt": "A presentation about climate change",
    "outline_text": null,
    "description_text": null,
    "extra_requirements": null,
    "creation_type": "idea",
    "template_image_url": "/files/abc123/template/template.png",
    "template_style": null,
    "status": "COMPLETED",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "pages": [
      {
        "page_id": "page-001",
        "order_index": 0,
        "part": "Introduction",
        "outline_content": {
          "title": "What is Climate Change?",
          "points": ["Definition", "Causes", "Effects"]
        },
        "description_content": {
          "title": "What is Climate Change?",
          "text_content": ["Climate change refers to..."],
          "layout_suggestion": "Title with three-column layout"
        },
        "generated_image_url": "/files/abc123/pages/page_0.png",
        "status": "GENERATED"
      }
    ]
  }
}
```

---

### Update Project

Updates project properties.

**Endpoint:** `PUT /api/projects/{project_id}`

**Request Body:**
```json
{
  "idea_prompt": "Updated idea prompt",
  "extra_requirements": "Use dark theme",
  "pages_order": ["page-002", "page-001", "page-003"]
}
```

**Response:** Same as Get Project

---

### Delete Project

Deletes a project and all related data.

**Endpoint:** `DELETE /api/projects/{project_id}`

**Response:**
```json
{
  "success": true,
  "message": "Project deleted"
}
```

---

## Generation

### Generate Outline

Generates PPT outline from idea prompt.

**Endpoint:** `POST /api/projects/{project_id}/generate/outline`

**Request Body:**
```json
{
  "idea_prompt": "Optional override",
  "language": "en"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `language` | string | Output language: `zh`, `en`, `ja`, `auto` |

**Response:**
```json
{
  "success": true,
  "data": {
    "project_id": "abc123-...",
    "pages": [
      {
        "page_id": "page-001",
        "order_index": 0,
        "part": null,
        "outline_content": {
          "title": "Introduction",
          "points": ["Overview", "Goals", "Agenda"]
        },
        "status": "DRAFT"
      }
    ]
  }
}
```

---

### Generate From Description

Generates outline and page descriptions from description text.

**Endpoint:** `POST /api/projects/{project_id}/generate/from-description`

**Request Body:**
```json
{
  "description_text": "Optional override",
  "language": "en"
}
```

**Response:** Same as Generate Outline but with `description_content` populated.

---

### Generate Descriptions

Batch generates descriptions for all pages (async).

**Endpoint:** `POST /api/projects/{project_id}/generate/descriptions`

**Request Body:**
```json
{
  "max_workers": 5,
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-001",
    "status": "PENDING"
  }
}
```

---

### Generate Images

Batch generates images for all pages (async).

**Endpoint:** `POST /api/projects/{project_id}/generate/images`

**Request Body:**
```json
{
  "max_workers": 8,
  "use_template": true,
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-002",
    "status": "PENDING"
  }
}
```

---

### Refine Outline

Modifies outline based on natural language requirement.

**Endpoint:** `POST /api/projects/{project_id}/refine/outline`

**Request Body:**
```json
{
  "user_requirement": "Add a slide about solutions",
  "previous_requirements": ["Previous modification requests..."],
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pages": [...],
    "message": "Added new slide: Solutions to Climate Change"
  }
}
```

---

### Refine Descriptions

Modifies page descriptions based on natural language requirement.

**Endpoint:** `POST /api/projects/{project_id}/refine/descriptions`

**Request Body:**
```json
{
  "user_requirement": "Make the descriptions more detailed",
  "previous_requirements": [],
  "language": "en"
}
```

**Response:** Same as Refine Outline.

---

## Pages

### Create Page

Adds a new page to the project.

**Endpoint:** `POST /api/projects/{project_id}/pages`

**Request Body:**
```json
{
  "order_index": 2,
  "part": "Section Two",
  "outline_content": {
    "title": "New Slide",
    "points": ["Point 1", "Point 2"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "page_id": "page-003",
    "order_index": 2,
    "part": "Section Two",
    "outline_content": {...},
    "description_content": null,
    "generated_image_url": null,
    "status": "DRAFT"
  }
}
```

---

### Update Page Outline

Updates page outline content.

**Endpoint:** `PUT /api/projects/{project_id}/pages/{page_id}/outline`

**Request Body:**
```json
{
  "outline_content": {
    "title": "Updated Title",
    "points": ["New Point 1", "New Point 2"]
  }
}
```

---

### Update Page Description

Updates page description content.

**Endpoint:** `PUT /api/projects/{project_id}/pages/{page_id}/description`

**Request Body:**
```json
{
  "description_content": {
    "title": "Slide Title",
    "text_content": ["Paragraph 1", "Paragraph 2"],
    "layout_suggestion": "Two-column layout"
  }
}
```

---

### Delete Page

Deletes a page.

**Endpoint:** `DELETE /api/projects/{project_id}/pages/{page_id}`

---

### Generate Page Description

Generates description for a single page.

**Endpoint:** `POST /api/projects/{project_id}/pages/{page_id}/generate/description`

**Request Body:**
```json
{
  "force_regenerate": false,
  "language": "en"
}
```

---

### Generate Page Image

Generates image for a single page (async).

**Endpoint:** `POST /api/projects/{project_id}/pages/{page_id}/generate/image`

**Request Body:**
```json
{
  "use_template": true,
  "force_regenerate": false,
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-003",
    "status": "PENDING"
  }
}
```

---

### Edit Page Image

Edits page image using natural language instruction.

**Endpoint:** `POST /api/projects/{project_id}/pages/{page_id}/edit/image`

**Content-Type:** `multipart/form-data` or `application/json`

**Request Body (JSON):**
```json
{
  "edit_instruction": "Change the chart to a pie chart",
  "context_images": {
    "use_template": true,
    "desc_image_urls": ["/files/abc123/materials/chart.png"]
  }
}
```

**Request Body (multipart/form-data):**
| Field | Type | Description |
|-------|------|-------------|
| `edit_instruction` | string | Natural language edit instruction |
| `use_template` | string | "true" or "false" |
| `desc_image_urls` | string | JSON array of image URLs |
| `context_images` | File[] | Uploaded reference images |

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-004",
    "status": "PENDING"
  }
}
```

---

### Get Page Image Versions

Gets all image versions for a page.

**Endpoint:** `GET /api/projects/{project_id}/pages/{page_id}/image-versions`

**Response:**
```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "version_id": "ver-001",
        "version_number": 1,
        "image_url": "/files/abc123/pages/page_0_v1.png",
        "is_current": false,
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "version_id": "ver-002",
        "version_number": 2,
        "image_url": "/files/abc123/pages/page_0_v2.png",
        "is_current": true,
        "created_at": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

---

### Set Current Image Version

Sets a specific version as the current one.

**Endpoint:** `POST /api/projects/{project_id}/pages/{page_id}/image-versions/{version_id}/set-current`

---

## Materials

### List Materials

Gets materials for a project or all materials.

**Endpoint:** `GET /api/projects/{project_id}/materials` or `GET /api/materials`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | string | `all` for all, `none` for global only |

**Response:**
```json
{
  "success": true,
  "data": {
    "materials": [
      {
        "id": "mat-001",
        "project_id": "abc123",
        "filename": "chart.png",
        "url": "/files/abc123/materials/chart.png",
        "relative_path": "abc123/materials/chart.png",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### Upload Material

Uploads a material image.

**Endpoint:** `POST /api/projects/{project_id}/materials/upload` or `POST /api/materials/upload`

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Image file |

---

### Generate Material

Generates a material image using AI (async).

**Endpoint:** `POST /api/projects/{project_id}/materials/generate`

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | string | Description of image to generate |
| `ref_image` | File | Optional reference image |
| `extra_images` | File[] | Optional additional reference images |

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-005",
    "status": "PENDING"
  }
}
```

---

### Delete Material

**Endpoint:** `DELETE /api/materials/{material_id}`

---

### Associate Materials

Associates materials to a project by URL.

**Endpoint:** `POST /api/materials/associate`

**Request Body:**
```json
{
  "project_id": "abc123",
  "material_urls": ["/files/global/materials/logo.png"]
}
```

---

## User Templates

### List Templates

**Endpoint:** `GET /api/user-templates`

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "template_id": "tmpl-001",
        "name": "Corporate Blue",
        "template_image_url": "/files/templates/corporate_blue.png",
        "created_at": "2024-01-10T08:00:00Z"
      }
    ]
  }
}
```

---

### Upload Template

**Endpoint:** `POST /api/user-templates`

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `template_image` | File | Template image |
| `name` | string | Optional template name |

---

### Delete Template

**Endpoint:** `DELETE /api/user-templates/{template_id}`

---

## Reference Files

### Upload Reference File

Uploads and parses a reference document.

**Endpoint:** `POST /api/reference-files/upload`

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Document file (PDF, DOCX, etc.) |
| `project_id` | string | Optional project ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "ref-001",
      "project_id": "abc123",
      "filename": "document.pdf",
      "file_size": 1024000,
      "file_type": "pdf",
      "parse_status": "pending",
      "markdown_content": null,
      "error_message": null,
      "created_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

---

### Get Reference File

**Endpoint:** `GET /api/reference-files/{file_id}`

---

### List Project Reference Files

**Endpoint:** `GET /api/reference-files/project/{project_id}`

Use `global` or `none` for project_id to get unassociated files.

---

### Delete Reference File

**Endpoint:** `DELETE /api/reference-files/{file_id}`

---

### Trigger File Parse

Manually triggers parsing for a file.

**Endpoint:** `POST /api/reference-files/{file_id}/parse`

---

### Associate File to Project

**Endpoint:** `POST /api/reference-files/{file_id}/associate`

**Request Body:**
```json
{
  "project_id": "abc123"
}
```

---

### Dissociate File from Project

**Endpoint:** `POST /api/reference-files/{file_id}/dissociate`

---

## Export

### Export PPTX

Exports project as PPTX (image-based).

**Endpoint:** `GET /api/projects/{project_id}/export/pptx`

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "/exports/abc123/slides.pptx",
    "download_url_absolute": "http://localhost:5000/exports/abc123/slides.pptx"
  }
}
```

---

### Export PDF

Exports project as PDF.

**Endpoint:** `GET /api/projects/{project_id}/export/pdf`

---

### Export Editable PPTX

Exports project as editable PPTX (async).

**Endpoint:** `POST /api/projects/{project_id}/export/editable-pptx`

**Request Body:**
```json
{
  "filename": "my_presentation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-006"
  }
}
```

---

## Settings

### Get Settings

**Endpoint:** `GET /api/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "settings-001",
    "ai_provider_format": "gemini",
    "text_model": "gemini-3-flash-preview",
    "image_model": "gemini-3-pro-image-preview",
    "api_key_length": 39,
    "api_base": "https://generativelanguage.googleapis.com",
    "output_language": "en",
    "default_resolution": "2K",
    "default_aspect_ratio": "16:9"
  }
}
```

---

### Update Settings

**Endpoint:** `PUT /api/settings`

**Request Body:**
```json
{
  "ai_provider_format": "openai",
  "text_model": "gpt-4",
  "image_model": "dall-e-3",
  "api_key": "sk-...",
  "api_base": "https://api.openai.com/v1",
  "output_language": "en"
}
```

---

### Reset Settings

Resets settings to defaults from environment variables.

**Endpoint:** `POST /api/settings/reset`

---

### Get Output Language

**Endpoint:** `GET /api/output-language`

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "en"
  }
}
```

---

## Tasks

### Get Task Status

Gets status and progress of an async task.

**Endpoint:** `GET /api/projects/{project_id}/tasks/{task_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-001",
    "task_type": "GENERATE_IMAGES",
    "status": "RUNNING",
    "progress": {
      "total": 10,
      "completed": 5,
      "failed": 0
    },
    "error_message": null,
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": null
  }
}
```

**Task Status Values:**
| Status | Description |
|--------|-------------|
| `PENDING` | Task created but not started |
| `RUNNING` | Task is executing |
| `COMPLETED` | Task finished successfully |
| `FAILED` | Task failed with error |

---

## Files

### Serve Static Files

Serves uploaded files and generated images.

**Endpoint:** `GET /files/{project_id}/{type}/{filename}`

**Types:**
- `template` - Template images
- `pages` - Generated slide images
- `materials` - Material images

**Example:** `GET /files/abc123/pages/page_0.png`

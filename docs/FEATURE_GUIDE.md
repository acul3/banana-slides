# Feature Development Guide

This guide explains how to add new features to banana-slides, covering both backend and frontend development patterns.

## Table of Contents

- [Adding a Backend Endpoint](#adding-a-backend-endpoint)
- [Adding a Database Model](#adding-a-database-model)
- [Adding a Frontend Page](#adding-a-frontend-page)
- [Adding a UI Component](#adding-a-ui-component)
- [Modifying AI Prompts](#modifying-ai-prompts)
- [Adding a New AI Provider](#adding-a-new-ai-provider)
- [Adding an Async Task](#adding-an-async-task)

---

## Adding a Backend Endpoint

### Step 1: Choose or Create Controller

Endpoints are organized by resource in `backend/controllers/`:

```
controllers/
├── project_controller.py      # /api/projects
├── page_controller.py         # /api/projects/{id}/pages
├── material_controller.py     # /api/materials
├── template_controller.py     # /api/user-templates
├── reference_file_controller.py # /api/reference-files
├── export_controller.py       # /api/projects/{id}/export
├── file_controller.py         # /files
└── settings_controller.py     # /api/settings
```

### Step 2: Create Endpoint Function

```python
# backend/controllers/project_controller.py

from flask import Blueprint, request
from utils import success_response, error_response, bad_request

@project_bp.route('/<project_id>/my-action', methods=['POST'])
def my_action(project_id):
    """
    POST /api/projects/{project_id}/my-action - Description
    
    Request body:
    {
        "param1": "value"
    }
    """
    try:
        # 1. Get project
        project = Project.query.get(project_id)
        if not project:
            return not_found('Project not found')
        
        # 2. Parse request
        data = request.get_json() or {}
        param1 = data.get('param1')
        
        if not param1:
            return bad_request('param1 is required')
        
        # 3. Business logic
        result = do_something(project, param1)
        
        # 4. Return response
        return success_response({
            'result': result
        })
    
    except Exception as e:
        logger.error(f"Error in my_action: {e}")
        return error_response(str(e))
```

### Step 3: Register Blueprint (if new controller)

```python
# backend/app.py

from controllers.my_controller import my_bp

# In create_app():
app.register_blueprint(my_bp)
```

### Step 4: Add Frontend API Function

```typescript
// frontend/src/api/endpoints.ts

export const myAction = async (
  projectId: string,
  param1: string
): Promise<ApiResponse> => {
  const response = await apiClient.post(`/api/projects/${projectId}/my-action`, {
    param1
  });
  return response.data;
};
```

---

## Adding a Database Model

### Step 1: Create Model File

```python
# backend/models/my_model.py

"""
MyModel model
"""
import uuid
from datetime import datetime
from . import db


class MyModel(db.Model):
    """
    MyModel - description
    """
    __tablename__ = 'my_models'
    
    id = db.Column(db.String(36), primary_key=True, 
                   default=lambda: str(uuid.uuid4()))
    project_id = db.Column(db.String(36), 
                           db.ForeignKey('projects.id'), 
                           nullable=True)
    name = db.Column(db.String(200), nullable=False)
    data = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, nullable=False, 
                           default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, 
                           default=datetime.utcnow, 
                           onupdate=datetime.utcnow)
    
    # Relationships
    project = db.relationship('Project', backref='my_models')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'data': self.data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        return f'<MyModel {self.id}: {self.name}>'
```

### Step 2: Export from `__init__.py`

```python
# backend/models/__init__.py

from .my_model import MyModel

__all__ = [..., 'MyModel']
```

### Step 3: Create Migration

```bash
cd backend
uv run alembic revision --autogenerate -m "Add MyModel table"
uv run alembic upgrade head
```

### Step 4: Add TypeScript Type (Frontend)

```typescript
// frontend/src/types/index.ts

export interface MyModel {
  id: string;
  project_id: string | null;
  name: string;
  data: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Adding a Frontend Page

### Step 1: Create Page Component

```tsx
// frontend/src/pages/MyPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/useProjectStore';
import { Button, Loading } from '@/components/shared';

export default function MyPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, syncProject, isGlobalLoading } = useProjectStore();
  const [localState, setLocalState] = useState<string>('');

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      syncProject(projectId);
    }
  }, [projectId]);

  if (isGlobalLoading) {
    return <Loading />;
  }

  if (!currentProject) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Page</h1>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </header>

      <main>
        {/* Page content */}
      </main>
    </div>
  );
}
```

### Step 2: Add Route

```tsx
// frontend/src/App.tsx

import MyPage from '@/pages/MyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* existing routes */}
        <Route path="/project/:projectId/my-page" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 3: Add Navigation

```tsx
// Add link in relevant component
<Link to={`/project/${project.project_id}/my-page`}>
  Go to My Page
</Link>
```

---

## Adding a UI Component

### Step 1: Create Component

```tsx
// frontend/src/components/shared/MyComponent.tsx

import { ReactNode } from 'react';

interface MyComponentProps {
  title: string;
  children?: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  onClick?: () => void;
}

export function MyComponent({
  title,
  children,
  variant = 'default',
  onClick
}: MyComponentProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-500 text-white',
    danger: 'bg-red-500 text-white'
  };

  return (
    <div
      className={`p-4 rounded-lg ${variantStyles[variant]} cursor-pointer hover:opacity-90`}
      onClick={onClick}
    >
      <h3 className="font-semibold mb-2">{title}</h3>
      {children && <div className="text-sm">{children}</div>}
    </div>
  );
}
```

### Step 2: Export from Index

```typescript
// frontend/src/components/shared/index.ts

export * from './MyComponent';
```

### Step 3: Use Component

```tsx
import { MyComponent } from '@/components/shared';

function ParentComponent() {
  return (
    <MyComponent 
      title="Card Title" 
      variant="primary"
      onClick={() => console.log('clicked')}
    >
      Card content goes here
    </MyComponent>
  );
}
```

---

## Modifying AI Prompts

All AI prompts are centralized in `backend/services/prompts.py`.

### Prompt Functions

| Function | Purpose |
|----------|---------|
| `get_outline_generation_prompt()` | Generate outline from idea |
| `get_outline_parsing_prompt()` | Parse user outline text |
| `get_page_description_prompt()` | Generate page descriptions |
| `get_image_generation_prompt()` | Generate slide images |
| `get_image_edit_prompt()` | Edit existing images |
| `get_outline_refinement_prompt()` | Refine outline per user request |
| `get_descriptions_refinement_prompt()` | Refine descriptions |
| `get_clean_background_prompt()` | Generate clean backgrounds |

### Example: Modifying Image Prompt

```python
# backend/services/prompts.py

def get_image_generation_prompt(
    page_desc: str,
    outline_text: str,
    current_section: str,
    has_material_images: bool = False,
    extra_requirements: str = None,
    language: str = None,
    has_template: bool = True,
    page_index: int = 1
) -> str:
    """Generate image generation prompt"""
    
    lang_instruction = get_ppt_language_instruction(language)
    
    prompt = f"""
Create a professional PPT slide with the following content:

**Section:** {current_section}
**Content:** {page_desc}

**Requirements:**
- Modern, clean design
- Professional typography
- Consistent with presentation outline
{lang_instruction}
"""
    
    if extra_requirements:
        prompt += f"\n**Additional Requirements:** {extra_requirements}"
    
    return prompt.strip()
```

### Language Support

Prompts support multiple output languages via `get_language_instruction()`:

```python
language = request.json.get('language', 'en')
lang_instruction = get_language_instruction(language)
# Returns: "Please output all in English." for 'en'
```

---

## Adding a New AI Provider

### Step 1: Implement Provider Interface

```python
# backend/services/ai_providers/text/my_provider.py

from typing import Optional
from ..base import TextProvider
import logging

logger = logging.getLogger(__name__)


class MyTextProvider(TextProvider):
    """My custom text provider"""
    
    def __init__(self, api_key: str, api_base: str = None):
        self.api_key = api_key
        self.api_base = api_base or "https://api.myprovider.com"
        self.client = None  # Initialize your client
    
    def generate_text(
        self, 
        prompt: str, 
        thinking_budget: int = 1000
    ) -> str:
        """Generate text from prompt"""
        try:
            # Call your API
            response = self._call_api(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            raise
    
    def is_available(self) -> bool:
        """Check if provider is configured"""
        return bool(self.api_key)
```

### Step 2: Register in Factory

```python
# backend/services/ai_providers/__init__.py

from .text.my_provider import MyTextProvider

def get_text_provider(format_type: str = None) -> TextProvider:
    """Factory function to get text provider"""
    format_type = format_type or config.AI_PROVIDER_FORMAT
    
    if format_type == 'my_provider':
        return MyTextProvider(
            api_key=config.MY_API_KEY,
            api_base=config.MY_API_BASE
        )
    # ... existing providers
```

### Step 3: Add Configuration

```python
# backend/config.py

class Config:
    # My Provider config
    MY_API_KEY = os.getenv('MY_API_KEY', '')
    MY_API_BASE = os.getenv('MY_API_BASE', 'https://api.myprovider.com')
```

### Step 4: Update Environment

```bash
# .env
AI_PROVIDER_FORMAT=my_provider
MY_API_KEY=your-api-key
MY_API_BASE=https://api.myprovider.com
```

---

## Adding an Async Task

### Step 1: Create Task Function

```python
# backend/services/task_manager.py

def my_async_task(
    task_id: str,
    project_id: str,
    param1: str,
    app=None
):
    """
    Background task for my operation
    
    Note: app instance MUST be passed from request context
    """
    with app.app_context():
        try:
            # Get task record
            task = Task.query.get(task_id)
            if not task:
                return
            
            # Update status
            task.status = 'RUNNING'
            db.session.commit()
            
            # Do work
            result = do_heavy_work(project_id, param1)
            
            # Update completion
            task.status = 'COMPLETED'
            task.completed_at = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"Task {task_id} completed")
            
        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}")
            task = Task.query.get(task_id)
            if task:
                task.status = 'FAILED'
                task.error_message = str(e)
                db.session.commit()
```

### Step 2: Create Controller Endpoint

```python
# backend/controllers/my_controller.py

@my_bp.route('/<project_id>/my-task', methods=['POST'])
def start_my_task(project_id):
    """Start async task"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return not_found('Project not found')
        
        # Create task record
        task = Task(
            project_id=project_id,
            task_type='MY_TASK',
            status='PENDING'
        )
        db.session.add(task)
        db.session.commit()
        
        # Submit to thread pool
        task_manager.submit_task(
            task.id,
            my_async_task,
            task.id,
            project_id,
            request.json.get('param1'),
            app=current_app._get_current_object()
        )
        
        return success_response({
            'task_id': task.id,
            'status': 'PENDING'
        })
        
    except Exception as e:
        return error_response(str(e))
```

### Step 3: Frontend Polling

```typescript
// frontend/src/api/endpoints.ts

export const startMyTask = async (
  projectId: string,
  param1: string
): Promise<ApiResponse<{ task_id: string }>> => {
  const response = await apiClient.post(
    `/api/projects/${projectId}/my-task`,
    { param1 }
  );
  return response.data;
};
```

```typescript
// In component or store
const startTask = async () => {
  const { task_id } = await startMyTask(projectId, param1);
  
  const poll = async () => {
    const status = await getTaskStatus(projectId, task_id);
    
    if (status.data.status === 'COMPLETED') {
      await syncProject();
    } else if (status.data.status === 'RUNNING') {
      setProgress(status.data.progress);
      setTimeout(poll, 1000);
    } else if (status.data.status === 'FAILED') {
      setError(status.data.error_message);
    }
  };
  
  poll();
};
```

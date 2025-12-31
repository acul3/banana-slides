"""
AI Service Prompts - Centralized management of all AI service prompt templates
"""
import json
import logging
from textwrap import dedent
from typing import List, Dict, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from services.ai_service import ProjectContext

logger = logging.getLogger(__name__)


# 语言配置映射
LANGUAGE_CONFIG = {
    'zh': {
        'name': 'Chinese',
        'instruction': 'Please output all in English。',
        'ppt_text': 'Use English for PPT text。'
    },
    'ja': {
        'name': 'Japanese',
        'instruction': 'すべて日本語で出力してください。',
        'ppt_text': 'PPTのテキストは全て日本語で出力してください。'
    },
    'en': {
        'name': 'English',
        'instruction': 'Please output all in English.',
        'ppt_text': 'Use English for PPT text.'
    },
    'auto': {
        'name': 'Auto',
        'instruction': '',  # No language restriction for auto mode
        'ppt_text': ''
    }
}


def get_default_output_language() -> str:
    """
    获取环境变量中配置的默认输出语言
    
    Returns:
        Language code: 'zh', 'ja', 'en', 'auto'
    """
    from config import Config
    return getattr(Config, 'OUTPUT_LANGUAGE', 'en')


def get_language_instruction(language: str = None) -> str:
    """
    获取语言限制指令文本
    
    Args:
        language: 语言代码，如果为 None 则使用默认语言
    
    Returns:
        语言限制指令，如果是自动模式则返回空字符串
    """
    lang = language if language else get_default_output_language()
    # Force English instruction for consistency as per user request
    return "Please answer in English."


def get_ppt_language_instruction(language: str = None) -> str:
    """
    获取PPT文字语言限制指令
    
    Args:
        language: 语言代码，如果为 None 则使用默认语言
    
    Returns:
        PPT语言限制指令，如果是自动模式则返回空字符串
    """
    lang = language if language else get_default_output_language()
    # Force English for PPT text
    return "Use English for PPT text."


def _format_reference_files_xml(reference_files_content: Optional[List[Dict[str, str]]]) -> str:
    """
    Format reference files content as XML structure
    
    Args:
        reference_files_content: List of dicts with 'filename' and 'content' keys
        
    Returns:
        Formatted XML string
    """
    if not reference_files_content:
        return ""
    
    xml_parts = ["<uploaded_files>"]
    for file_info in reference_files_content:
        filename = file_info.get('filename', 'unknown')
        content = file_info.get('content', '')
        xml_parts.append(f'  <file name="{filename}">')
        xml_parts.append('    <content>')
        xml_parts.append(content)
        xml_parts.append('    </content>')
        xml_parts.append('  </file>')
    xml_parts.append('</uploaded_files>')
    xml_parts.append('')  # Empty line after XML
    
    return '\n'.join(xml_parts)


def get_outline_generation_prompt(project_context: 'ProjectContext', language: str = None) -> str:
    """
    生成 PPT 大纲的 prompt
    
    Args:
        project_context: 项目上下文对象，包含所有原始信息
        language: 输出语言代码（'zh', 'ja', 'en', 'auto'），如果为 None 则使用默认语言
        
    Returns:
        格式化后的 prompt 字符串
    """
    files_xml = _format_reference_files_xml(project_context.reference_files_content)
    idea_prompt = project_context.idea_prompt or ""
    
    prompt = (f"""\
You are a helpful assistant that generates an outline for a ppt.

You can organize the content in two ways:

1. Simple format (for short PPTs without major sections):
[{{"title": "title1", "points": ["point1", "point2"]}}, {{"title": "title2", "points": ["point1", "point2"]}}]

2. Part-based format (for longer PPTs with major sections):
[
    {{
    "part": "Part 1: Introduction",
    "pages": [
        {{"title": "Welcome", "points": ["point1", "point2"]}},
        {{"title": "Overview", "points": ["point1", "point2"]}}
    ]
    }},
    {{
    "part": "Part 2: Main Content",
    "pages": [
        {{"title": "Topic 1", "points": ["point1", "point2"]}},
        {{"title": "Topic 2", "points": ["point1", "point2"]}}
    ]
    }},
    ... (as many parts as needed)
]

Choose the format that best fits the content. Use parts when the PPT has clear major sections.
Unless otherwise specified, the first page should be kept simplest, containing only the title, subtitle, and presenter information.

The user's request: {idea_prompt}. Now generate the outline, don't include any other text.
{get_language_instruction(language)}
""")
    
    final_prompt = files_xml + prompt
    logger.debug(f"[get_outline_generation_prompt] Final prompt:\n{final_prompt}")
    return final_prompt


def get_outline_parsing_prompt(project_context: 'ProjectContext', language: str = None ) -> str:
    """
    解析用户提供的大纲文本的 prompt
    
    Args:
        project_context: 项目上下文对象，包含所有原始信息
        
    Returns:
        格式化后的 prompt 字符串
    """
    files_xml = _format_reference_files_xml(project_context.reference_files_content)
    outline_text = project_context.outline_text or ""
    
    prompt = (f"""\
You are a helpful assistant that parses a user-provided PPT outline text into a structured format.

The user has provided the following outline text:

{outline_text}

Your task is to analyze this text and convert it into a structured JSON format WITHOUT modifying any of the original text content. 
You should only reorganize and structure the existing content, preserving all titles, points, and text exactly as provided.

You can organize the content in two ways:

1. Simple format (for short PPTs without major sections):
[{{"title": "title1", "points": ["point1", "point2"]}}, {{"title": "title2", "points": ["point1", "point2"]}}]

2. Part-based format (for longer PPTs with major sections):
[
    {{
    "part": "Part 1: Introduction",
    "pages": [
        {{"title": "Welcome", "points": ["point1", "point2"]}},
        {{"title": "Overview", "points": ["point1", "point2"]}}
    ]
    }},
    {{
    "part": "Part 2: Main Content",
    "pages": [
        {{"title": "Topic 1", "points": ["point1", "point2"]}},
        {{"title": "Topic 2", "points": ["point1", "point2"]}}
    ]
    }}
]

Important rules:
- DO NOT modify, rewrite, or change any text from the original outline
- DO NOT add new content that wasn't in the original text
- DO NOT remove any content from the original text
- Only reorganize the existing content into the structured format
- Preserve all titles, bullet points, and text exactly as they appear
- If the text has clear sections/parts, use the part-based format
- Extract titles and points from the original text, keeping them exactly as written

Now parse the outline text above into the structured format. Return only the JSON, don't include any other text.
{get_language_instruction(language)}
""")
    
    final_prompt = files_xml + prompt
    logger.debug(f"[get_outline_parsing_prompt] Final prompt:\n{final_prompt}")
    return final_prompt


def get_page_description_prompt(project_context: 'ProjectContext', outline: list, 
                                page_outline: dict, page_index: int, 
                                part_info: str = "",
                                language: str = None) -> str:
    """
    生成单个页面描述的 prompt
    
    Args:
        project_context: 项目上下文对象，包含所有原始信息
        outline: 完整大纲
        page_outline: 当前页面的大纲
        page_index: 页面编号（从1开始）
        part_info: 可选的章节信息
        
    Returns:
        格式化后的 prompt 字符串
    """
    files_xml = _format_reference_files_xml(project_context.reference_files_content)
    # 根据项目类型选择最相关的原始输入
    if project_context.creation_type == 'idea' and project_context.idea_prompt:
        original_input = project_context.idea_prompt
    elif project_context.creation_type == 'outline' and project_context.outline_text:
        original_input = f"User provided outline:\n{project_context.outline_text}"
    elif project_context.creation_type == 'descriptions' and project_context.description_text:
        original_input = f"User provided descriptions:\n{project_context.description_text}"
    else:
        original_input = project_context.idea_prompt or ""
    
    prompt = (f"""\
We are generating content descriptions for each page of a PPT.
The user's original request is:\n{original_input}\n
We already have the complete outline:\n{outline}\n{part_info}
Now please generate the description for page {page_index}:
{page_outline}

[Important] The generated "Page Content" will be directly rendered onto the PPT page, so please ensure:
1. The content is concise, with each point controlled within 15-30 words.
2. Clear organization, using list format.
3. Avoid long sentences and complex expressions.
4. Ensure strong readability, suitable for presentation.
5. Do not include any extra explanatory text or comments.

Output format example:
Page Title: Primitive Society: Symbiosis with Nature

Page Content:
- Hunter-gatherer civilization: Small scale human activity, limited impact on environment
- Strong dependence: Life completely depended on direct supply of natural resources
- Adaptation not modification: Learned from nature, developed survival skills
- Impact characteristics: Local, short-term, low intensity, self-recovering ecology

Other page materials (add if available, including markdown image links, formulas, tables, etc.)

[About Images] If the reference files contain local file URL images starting with /files/ (e.g., /files/mineru/xxx/image.png), please output these images in markdown format, e.g., ![Image Description](/files/mineru/xxx/image.png). These images will be included in the PPT page.

{get_language_instruction(language)}
""")
    
    final_prompt = files_xml + prompt
    logger.debug(f"[get_page_description_prompt] Final prompt:\n{final_prompt}")
    return final_prompt


def get_image_generation_prompt(page_desc: str, outline_text: str, 
                                current_section: str,
                                has_material_images: bool = False,
                                extra_requirements: str = None,
                                language: str = None,
                                has_template: bool = True,
                                page_index: int = 1) -> str:
    """
    生成图片生成 prompt
    
    Args:
        page_desc: 页面描述文本
        outline_text: 大纲文本
        current_section: 当前章节
        has_material_images: 是否有素材图片
        extra_requirements: 额外的要求（可能包含风格描述）
        language: 输出语言
        has_template: 是否有模板图片（False表示无模板模式）
        
    Returns:
        格式化后的 prompt 字符串
    """
    # 如果有素材图片，在 prompt 中明确告知 AI
    material_images_note = ""
    if has_material_images:
        material_images_note = (
            "\n\nHint: In addition to the template reference image (for style reference), extra material images are provided."
            "These material images are elements available for selection. You can choose suitable images, icons, charts, or other visual elements from them"
            "and directly integrate them into the generated PPT page. Please intelligently select and combine elements from these material images based on the page content needs."
        )
    
    # 添加额外要求到提示词
    extra_req_text = ""
    if extra_requirements and extra_requirements.strip():
        extra_req_text = f"\n\nExtra Requirements (Must Follow):\n{extra_requirements}\n"

# 该处参考了@歸藏的A工具箱
    prompt = (f"""\
You are an expert UI/UX presentation designer, focused on generating well-designed PPT pages.
The current PPT page description is as follows:
<page_description>
{page_desc}
</page_description>

<reference_information>
The entire PPT outline is:
{outline_text}

Current section: {current_section}
</reference_information>


<design_guidelines>
- Require clear and sharp text, 4K resolution, 16:9 aspect ratio.
- Color scheme and design language must be strictly similar to the template image.
- Automatically design the most perfect composition based on content, rendering the text in "page description" without omission or duplication.
- Do not use markdown symbols (like # and *) unless necessary.
- Only reference the style design, do not use the text from the template.
- Use appropriately sized decorative graphics or illustrations to fill empty spaces.
</design_guidelines>
{get_ppt_language_instruction(language)}
{material_images_note}{extra_req_text}

{"**注意：当前页面为ppt的封面页，请你采用专业的封面设计美学技巧，务必凸显出页面标题，分清主次，确保一下就能抓住观众的注意力。**" if page_index == 1 else ""}
""")
    
    logger.debug(f"[get_image_generation_prompt] Final prompt:\n{prompt}")
    return prompt


def get_image_edit_prompt(edit_instruction: str, original_description: str = None) -> str:
    """
    生成图片编辑 prompt
    
    Args:
        edit_instruction: 编辑指令
        original_description: 原始页面描述（可选）
        
    Returns:
        格式化后的 prompt 字符串
    """
    if original_description:
        # Remove content after "Other page materials" to avoid influence from previous images
        if "Other page materials" in original_description:
            original_description = original_description.split("Other page materials")[0].strip()
        elif "其他页面素材" in original_description:  # Fallback for old content
            original_description = original_description.split("其他页面素材")[0].strip()
        
        prompt = (f"""\
The original description of this PPT page is:
{original_description}

Now, please modify this PPT page according to the following instruction: {edit_instruction}

Requirement: Maintain the original text content and design style, only modify according to the instruction. The provided reference image contains both new materials and user-selected regions. Please intelligently judge the user's intent based on the relationship between the original image and the reference image.
""")
    else:
        prompt = f"Modify this PPT page according to the following instruction: {edit_instruction}\nMaintain the original content structure and design style, only modify according to the instruction. The provided reference image contains both new materials and user-selected regions. Please intelligently judge the user's intent based on the relationship between the original image and the reference image."
    
    logger.debug(f"[get_image_edit_prompt] Final prompt:\n{prompt}")
    return prompt


def get_description_to_outline_prompt(project_context: 'ProjectContext', language: str = None) -> str:
    """
    从描述文本解析出大纲的 prompt
    
    Args:
        project_context: 项目上下文对象，包含所有原始信息
        
    Returns:
        格式化后的 prompt 字符串
    """
    files_xml = _format_reference_files_xml(project_context.reference_files_content)
    description_text = project_context.description_text or ""
    
    prompt = (f"""\
You are a helpful assistant that analyzes a user-provided PPT description text and extracts the outline structure from it.

The user has provided the following description text:

{description_text}

Your task is to analyze this text and extract the outline structure (titles and key points) for each page.
You should identify:
1. How many pages are described
2. The title for each page
3. The key points or content structure for each page

You can organize the content in two ways:

1. Simple format (for short PPTs without major sections):
[{{"title": "title1", "points": ["point1", "point2"]}}, {{"title": "title2", "points": ["point1", "point2"]}}]

2. Part-based format (for longer PPTs with major sections):
[
    {{
    "part": "Part 1: Introduction",
    "pages": [
        {{"title": "Welcome", "points": ["point1", "point2"]}},
        {{"title": "Overview", "points": ["point1", "point2"]}}
    ]
    }},
    {{
    "part": "Part 2: Main Content",
    "pages": [
        {{"title": "Topic 1", "points": ["point1", "point2"]}},
        {{"title": "Topic 2", "points": ["point1", "point2"]}}
    ]
    }},
    ...(as many parts as needed)
]

Important rules:
- Extract the outline structure from the description text
- Identify page titles and key points
- If the text has clear sections/parts, use the part-based format
- Preserve the logical structure and organization from the original text
- The points should be concise summaries of the main content for each page

Now extract the outline structure from the description text above. Return only the JSON, don't include any other text.
{get_language_instruction(language)}
""")
    
    final_prompt = files_xml + prompt
    logger.debug(f"[get_description_to_outline_prompt] Final prompt:\n{final_prompt}")
    return final_prompt


def get_description_split_prompt(project_context: 'ProjectContext', 
                                 outline: List[Dict], 
                                 language: str = None) -> str:
    """
    从描述文本切分出每页描述的 prompt
    
    Args:
        project_context: 项目上下文对象，包含所有原始信息
        outline: 已解析出的大纲结构
        
    Returns:
        格式化后的 prompt 字符串
    """
    outline_json = json.dumps(outline, ensure_ascii=False, indent=2)
    description_text = project_context.description_text or ""
    
    prompt = (f"""\
You are a helpful assistant that splits a complete PPT description text into individual page descriptions.

The user has provided a complete description text:

{description_text}

We have already extracted the outline structure:

{outline_json}

Your task is to split the description text into individual page descriptions based on the outline structure.
For each page in the outline, extract the corresponding description from the original text.

Return a JSON array where each element corresponds to a page in the outline (in the same order).
Each element should be a string containing the page description in the following format:

Page Title: [Page Title]

Page Content:
- [Point 1]
- [Point 2]
...

Example output format:
[
    "Page Title: The Birth of AI\\nPage Content:\\n- In 1950, Turing proposed the 'Turing Test'...",
    "Page Title: History of AI\\nPage Content:\\n- 1950s: Symbolism...",
    ...
]

Important rules:
- Split the description text according to the outline structure
- Each page description should match the corresponding page in the outline
- Preserve all important content from the original text
- Keep the format consistent with the example above
- If a page in the outline doesn't have a clear description in the text, create a reasonable description based on the outline

Now split the description text into individual page descriptions. Return only the JSON array, don't include any other text.
{get_language_instruction(language)}
""")
    
    logger.debug(f"[get_description_split_prompt] Final prompt:\n{prompt}")
    return prompt


def get_outline_refinement_prompt(current_outline: List[Dict], user_requirement: str,
                                   project_context: 'ProjectContext',
                                   previous_requirements: Optional[List[str]] = None,
                                   language: str = None) -> str:
    """
    根据用户要求修改已有大纲的 prompt
    
    Args:
        current_outline: 当前的大纲结构
        user_requirement: 用户的新要求
        project_context: 项目上下文对象，包含所有原始信息
        previous_requirements: 之前的修改要求列表（可选）
        
    Returns:
        格式化后的 prompt 字符串
    """
    files_xml = _format_reference_files_xml(project_context.reference_files_content)
    
    # 处理空大纲的情况
    if not current_outline or len(current_outline) == 0:
        outline_text = "(No content currently)"
    else:
        outline_text = json.dumps(current_outline, ensure_ascii=False, indent=2)
    
    # 构建之前的修改历史记录
    previous_req_text = ""
    if previous_requirements and len(previous_requirements) > 0:
        prev_list = "\n".join([f"- {req}" for req in previous_requirements])
        previous_req_text = f"\n\nPrevious user modification requests:\n{prev_list}\n"
    
    # 构建原始输入信息（根据项目类型显示不同的原始内容）
    original_input_text = "\nOriginal Input Info:\n"
    if project_context.creation_type == 'idea' and project_context.idea_prompt:
        original_input_text += f"- PPT Idea: {project_context.idea_prompt}\n"
    elif project_context.creation_type == 'outline' and project_context.outline_text:
        original_input_text += f"- User provided outline text:\n{project_context.outline_text}\n"
    elif project_context.creation_type == 'descriptions' and project_context.description_text:
        original_input_text += f"- User provided page description text:\n{project_context.description_text}\n"
    elif project_context.idea_prompt:
        original_input_text += f"- User Input: {project_context.idea_prompt}\n"
    
    prompt = (f"""\
You are a helpful assistant that modifies PPT outlines based on user requirements.
{original_input_text}
The current PPT outline structure is as follows:

{outline_text}
{previous_req_text}
**User's new requirement: {user_requirement}**

Please modify and adjust the outline based on the user's requirement. You can:
- Add, delete, or rearrange pages
- Modify page titles and points
- Adjust page organization structure
- Add or delete sections (parts)
- Merge or split pages
- Make any reasonable adjustments based on user requirements
- If there is currently no content, create a new outline based on the user requirement and original input

Output format options:

1. Simple format (for short PPTs without major sections):
[{{"title": "title1", "points": ["point1", "point2"]}}, {{"title": "title2", "points": ["point1", "point2"]}}]

2. Part-based format (for longer PPTs with major sections):
[
    {{
    "part": "Part 1: Introduction",
    "pages": [
        {{"title": "Welcome", "points": ["point1", "point2"]}},
        {{"title": "Overview", "points": ["point1", "point2"]}}
    ]
    }},
    {{
    "part": "Part 2: Main Content",
    "pages": [
        {{"title": "Topic 1", "points": ["point1", "point2"]}},
        {{"title": "Topic 2", "points": ["point1", "point2"]}}
    ]
    }}
]

Choose the format that best fits the content. Use parts when the PPT has clear major sections.

Now please modify the outline based on user requirements. Return only the JSON outline, no other text.
{get_language_instruction(language)}
""")
    
    final_prompt = files_xml + prompt
    logger.debug(f"[get_outline_refinement_prompt] Final prompt:\n{final_prompt}")
    return final_prompt


def get_descriptions_refinement_prompt(current_descriptions: List[Dict], user_requirement: str,
                                       project_context: 'ProjectContext',
                                       outline: List[Dict] = None,
                                       previous_requirements: Optional[List[str]] = None,
                                       language: str = None) -> str:
    """
    根据用户要求修改已有页面描述的 prompt
    
    Args:
        current_descriptions: 当前的页面描述列表，每个元素包含 {index, title, description_content}
        user_requirement: 用户的新要求
        project_context: 项目上下文对象，包含所有原始信息
        outline: 完整的大纲结构（可选）
        previous_requirements: 之前的修改要求列表（可选）
        
    Returns:
        格式化后的 prompt 字符串
    """
    files_xml = _format_reference_files_xml(project_context.reference_files_content)
    
    # 构建之前的修改历史记录
    previous_req_text = ""
    if previous_requirements and len(previous_requirements) > 0:
        prev_list = "\n".join([f"- {req}" for req in previous_requirements])
        previous_req_text = f"\n\nPrevious user modification requests:\n{prev_list}\n"
    
    # 构建原始输入信息
    original_input_text = "\nOriginal Input Info:\n"
    if project_context.creation_type == 'idea' and project_context.idea_prompt:
        original_input_text += f"- PPT Idea: {project_context.idea_prompt}\n"
    elif project_context.creation_type == 'outline' and project_context.outline_text:
        original_input_text += f"- User provided outline text:\n{project_context.outline_text}\n"
    elif project_context.creation_type == 'descriptions' and project_context.description_text:
        original_input_text += f"- User provided page description text:\n{project_context.description_text}\n"
    elif project_context.idea_prompt:
        original_input_text += f"- User Input: {project_context.idea_prompt}\n"
    
    # 构建大纲文本
    outline_text = ""
    if outline:
        outline_json = json.dumps(outline, ensure_ascii=False, indent=2)
        outline_text = f"\n\nComplete PPT Outline:\n{outline_json}\n"
    
    # 构建所有页面描述的汇总
    all_descriptions_text = "Current descriptions of all pages:\n\n"
    has_any_description = False
    for desc in current_descriptions:
        page_num = desc.get('index', 0) + 1
        title = desc.get('title', 'Untitled')
        content = desc.get('description_content', '')
        if isinstance(content, dict):
            content = content.get('text', '')
        
        if content:
            has_any_description = True
            all_descriptions_text += f"--- Page {page_num}: {title} ---\n{content}\n\n"
        else:
            all_descriptions_text += f"--- Page {page_num}: {title} ---\n(No content currently)\n\n"
    
    if not has_any_description:
        all_descriptions_text = "Current descriptions of all pages:\n\n(No content currently, need to generate new descriptions based on outline)\n\n"
    
    prompt = (f"""\
You are a helpful assistant that modifies PPT page descriptions based on user requirements.
{original_input_text}{outline_text}
{all_descriptions_text}
{previous_req_text}
**User's new requirement: {user_requirement}**

Please modify and adjust all page descriptions based on the user's requirement. You can:
- Modify page titles and content
- Adjust the detail level of page text
- Add or delete points
- Adjust structure and expression of descriptions
- Ensure all page descriptions meet user requirements
- If there is currently no content, create new descriptions based on the outline and user requirements

Please generate modified descriptions for each page in the following format:

Page Title: [Page Title]

Page Content:
- [Point 1]
- [Point 2]
...
Other page materials (add if available, including markdown image links etc.)

Hint: If the reference files contain local file URL images starting with /files/ (e.g., /files/mineru/xxx/image.png), please output these images in markdown format, e.g., ![Image Description](/files/mineru/xxx/image.png), instead of plain text.

Please return a JSON array, where each element is a string corresponding to the modified description of each page (in page order).

Example output format:
[
    "Page Title: The Birth of AI\\nPage Content:\\n- In 1950, Turing proposed the 'Turing Test'...",
    "Page Title: History of AI\\nPage Content:\\n- 1950s: Symbolism...",
    ...
]

Now please modify all page descriptions based on user requirements. Return only the JSON array, no other text.
{get_language_instruction(language)}
""")
    
    final_prompt = files_xml + prompt
    logger.debug(f"[get_descriptions_refinement_prompt] Final prompt:\n{final_prompt}")
    return final_prompt


def get_clean_background_prompt() -> str:
    """
    生成纯背景图的 prompt（去除文字和插画）
    用于从完整的PPT页面中提取纯背景
    """
    prompt = """\
你是一位专业的图片前景擦除专家。你的任务是从原始图片中移除文字和配图，输出一张无任何文字内容、干净纯净的背景模板图。
<requirements>
- 彻底移除页面中的所有文字、插画、图表。必须确保所有文字都被完全去除。
- 保持原背景设计的完整性（包括渐变、纹理、图案、线条、色块等）。保留原图的文本框色块。
- 对于被前景元素遮挡的背景区域，要智能填补，使背景保持无缝和完整。
- 输出图片的尺寸、风格、配色必须和原图完全一致。
- 请勿新增任何元素。
</requirements>

注意，**所有**文字和图表都应该被彻底移除，**不能遗留任何一个。**
"""
    logger.debug(f"[get_clean_background_prompt] Final prompt:\n{prompt}")
    return prompt

// Preset PPT Style Configuration

export interface PresetStyle {
  id: string;
  name: string;
  description: string; // Updated to detailed AI text-to-image prompts
  previewImage?: string; // Optional path for preview images
}

export const PRESET_STYLES: PresetStyle[] = [
  {
    id: 'business-simple',
    name: 'Corporate Minimalist',
    description: `Visual Description: The global visual language should reflect the professionalism and stability of top-tier international consulting firms (e.g., McKinsey or BCG). The style pursues extreme flat design and a sense of order, rejecting redundant decoration and emphasizing clear information delivery. Lighting should be uniform studio diffuse light, without dramatic shadows, ensuring a clean and transparent frame.

Colors & Materials: The background color must be locked to a deep, authoritative "Navy Blue" (#0B1F3B). Foreground elements use pure white (#FFFFFF) with subtle "Sky Blue" (#38BDF8) accents. Materials should avoid complex textures, using matte paper textures or smooth vector blocks.

Content & Layout: The layout follows a strict modular grid system. Generate clear geometric partitions using thin lines or faint "Light Gray" (#E5E7EB) blocks to divide content areas. Use bold, strong sans-serif fonts (e.g., Helvetica or Roboto) for titles, keeping body text slender and clear. Charts should be flat 2D vector graphics, such as simple bar or pie charts with restrained color palettes.

Rendering Requirements: Vector illustration style, ultra-high definition, sharp edges for text and graphics without aliasing, showcasing rigorous business aesthetics suitable for Fortune 500 corporate reports.`,
    previewImage: '/preset-previews/business-simple.webp',
  },
  {
    id: 'tech-modern',
    name: 'Modern Tech',
    description: `Visual Description: The visual language merges Cyberpunk vibes with the futuristic feel of modern SaaS products. The atmosphere is mysterious, deep, and dynamic, resembling a high-tech data center or virtual space. Lighting uses self-illuminating effects in a dark environment, simulating neon tubes and laser glows.

Colors & Materials: The background uses a deep "Midnight Black" (#0B0F19) to contrast foreground brightness. The main palette features high-saturation "Electric Blue" (#00A3FF) and "Cyber Purple" (#7C3AED) in linear gradients to create a sense of flowing energy. Materials involve semi-transparent glass, glowing grid lines, and metallic geometric bodies.

Content & Layout: The frame should include floating 3D geometric elements (e.g., cubes, tetrahedrons, or chip structures) with wireframe rendering effects. The layout tends toward asymmetrical dynamic balance, using tech-style monospaced fonts or modern sans-serifs. Backgrounds can subtly feature circuit board textures, binary code streams, or dot-matrix maps.

Rendering Requirements: Octane Render style, emphasizing ray tracing, bloom effects, and depth-of-field control, presenting fine particle effects and a high-tech visual impact.`,
    previewImage: '/preset-previews/tech-modern.webp',
  },
  {
    id: 'academic-formal',
    name: 'Rigorous Academic',
    description: `Visual Description: The visual language mimics high-quality print publications or classic thesis layouts, conveying rationality, objectivity, and intellectual weight. The atmosphere is quiet and restrained. The frame must be full-screen; strictly no book binding lines, paper edges, curled corners, shadows, or borders. The background should be presented as a 2D plane rather than 3D.

Colors & Materials: Background is strictly limited to "Off-white" (#F8F7F2), simulating high-end Daolin paper. Foreground uses pure black (#000000), "Charcoal" (#1F2937), and an accent color of "Deep Red" (#7F1D1D) or "Deep Blue" (#1E3A8A) (accents not exceeding 5%). The texture is entirely high-quality paper print with fine grain.

Content & Layout: Layout must follow classic typography principles with wide margins. Use serif fonts (similar to Times New Roman or Garamond) for tradition and formality. Visual elements consist of fine black line frames (#000000), standard academic table styles, and black-and-white line art illustrations. Use rigorous alignment in split-column or top-bottom structures.

Rendering Requirements: Ultra-high-resolution scan style, emphasizing font anti-aliasing and line sharpness. The image should look like an inner page of a hardcover academic journal. No borders or shadow lines should exist.`,
    previewImage: '/preset-previews/academic-formal.webp',
  },
  {
    id: 'creative-fun',
    name: 'Creative & Playful',
    description: `Visual Description: The visual language feels like a vibrant startup pitch deck or an educational app interface. The atmosphere is relaxed, joyful, and imaginative, breaking conventional constraints. Lighting is bright and sunny with no shadows, presenting a completely flat look.

Colors & Materials: Background uses high-brightness "Warm Yellow" (#FFD54A). The palette is bold, mixing "Vibrant Orange" (#FF6A00), "Grass Green" (#22C55E), and "Sky Blue" (#38BDF8) for a Memphis-style color clash. Materials simulate hand-drawn doodles, paper cutouts, or rough-edged vector illustrations.

Content & Layout: Includes hand-drawn elements like doodle arrows, stars, wavy lines, and irregular organic shapes. Layout allows text to tilt, overlap, or jump, breaking rigid grids. Fonts are rounded, cute, or handwritten. Corner decorations can include personified objects or exaggerated speech bubbles.

Rendering Requirements: Dribbble-trending illustration style, vivid flat colors, smooth elastic lines, providing a happy, friendly, and approachable visual feel.`,
    previewImage: '/preset-previews/creative-fun.webp',
  },
  {
    id: 'minimalist-clean',
    name: 'Clean Minimalist',
    description: `Visual Description: Inspired by Scandinavian Design and Kinfolk magazine aesthetics. The atmosphere is ethereal and quiet, emphasizing "Less is More." Lighting uses soft diffused skylight with faint, blurred-edge shadows to create a sense of airiness.

Colors & Materials: Background is an ultra-light "Haze Gray" (#F5F5F7). Foreground uses "Mid Gray" (#6B7280) and low-saturation Morandi colors like "Gray Blue" (#7A8FA6) as tiny accents. Materials reflect a fine matte texture with occasional micro-textures of plaster.

Content & Layout: Core composition is "Negative Space," which should occupy over 70% of the frame. Layout is extremely restrained with small font sizes, wide line spacing, and slender, elegant sans-serif fonts. Visual anchors are simple icons made of geometric lines, pursuing absolute balance.

Rendering Requirements: Minimalist photography style, High Dynamic Range (HDR), extremely clean with no noise, presenting a gallery-like artistic display.`,
    previewImage: '/preset-previews/minimalist-clean.webp',
  },
  {
    id: 'luxury-premium',
    name: 'Premium Luxury',
    description: `Visual Description: Merges the brand image of high-end watch advertisements or five-star hotels. The atmosphere is mysterious, noble, and unique. Lighting uses dramatic Rembrandt lighting or spotlight effects, highlighting key elements while others fade into darkness.

Colors & Materials: Background is strictly "Obsidain Black" (#0B0B0F). Foreground is primarily "Champagne Gold" (#F7E7CE). Materials must convey an expensive feel: matte black velvet for the background and brushed metal textures for foreground decorations.

Content & Layout: Layout uses classic centered or symmetrical alignment for a sense of ceremony. Elegant Serif fonts are a must, with widened letter spacing for prestige. Includes fine gold border lines and Art Deco patterns. 3D objects should have a jewelry-like polished texture.

Rendering Requirements: Cinematic realistic rendering, emphasizing Physical Based Rendering (PBR) properties—specifically metallic specular reflections and velvet diffuse details.`,
    previewImage: '/preset-previews/luxury-premium.webp',
  },
  {
    id: 'nature-fresh',
    name: 'Fresh Nature',
    description: `Visual Description: Evokes nature, environmentalism, and healthy living, similar to Whole Foods or Aesop's branding. The atmosphere is healing, breathable, and organic. Lighting simulates dappled morning sunlight through leaves (Tyndall effect), warm and soft.

Colors & Materials: Background is a soft "Beige" (#EAD9C6). Palette is derived from nature, focusing on "Forest Green" (#14532D) and "Earth Brown" (#7A4E2D). Materials emphasize natural textures like recycled paper grain and leaf veins.

Content & Layout: Integrates real natural elements, mainly stretching green leaves as background decor or foreground framing. Uses rounded, friendly fonts. Layout is slightly loose to mimic natural growth forms. Shadows are soft and natural.

Rendering Requirements: Macro photography combined with 3D rendering, emphasizing plant subsurface scattering (SSS) and fine natural textures. The frame is fresh and elegant.`,
    previewImage: '/preset-previews/nature-fresh.webp',
  },
  {
    id: 'gradient-vibrant',
    name: 'Vibrant Gradient',
    description: `Visual Description: Benchmarked against tech unicorns like Stripe or Linear, featuring an aurora-like flowing beauty. The atmosphere is dreamy, transparent, and "breathing," avoiding harsh clashes and emphasizing elegant color blending.

Colors & Materials: The background is the foreground, using full-screen mesh/diffusion gradients. The palette uses a "Holographic" scheme: "Royal Blue" (#2563EB) as a base, smoothly transitioning to "Violet" (#7C3AED) and "Magenta" (#DB2777). Textures are locked to "Frosted Glass," making colors appear through a matte screen.

Content & Layout: The core consists of slow-flowing organic wave shapes. Typography uses bold Sans-serif in pure white (#FFFFFF) for absolute clarity. Elements use "Glassmorphism" with high-transparency white cards, fine white strokes, and background blur.

Rendering Requirements: C4D fluid simulation rendering, emphasizing silk-like smooth luster and slight grain for texture. Vibrant yet non-piercing colors.`,
    previewImage: '/preset-previews/gradient-vibrant.webp',
  },
];
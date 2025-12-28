import type { Page } from '@/types';

/**
 * Determine if page description is in generating state
 * Only checks states related to description generation:
 * 1. Description generation task (isGenerating)
 * 2. Global state during AI modification (isAiRefining)
 * 
 * Note: Does not check page.status === 'GENERATING' because that status is also set during image generation
 */
export const useDescriptionGeneratingState = (
  isGenerating: boolean,
  isAiRefining: boolean
): boolean => {
  return isGenerating || isAiRefining;
};

/**
 * Determine if page image is in generating state
 * Checks states related to image generation:
 * 1. Image generation task (isGenerating)
 * 2. Page's GENERATING status (set during image generation process)
 */
export const useImageGeneratingState = (
  page: Page,
  isGenerating: boolean
): boolean => {
  return isGenerating || page.status === 'GENERATING';
};

/**
 * @deprecated Use useDescriptionGeneratingState or useImageGeneratingState instead
 * Original generic version: combines all generating states
 * Problem: Cannot distinguish between description generation and image generation,
 * causing image generation status to show on description pages
 */
export const useGeneratingState = (
  page: Page,
  isGenerating: boolean,
  isAiRefining: boolean
): boolean => {
  return isGenerating || page.status === 'GENERATING' || isAiRefining;
};

/**
 * Simple version: only checks the page's own generating state
 */
export const usePageGeneratingState = (
  page: Page,
  isGenerating: boolean
): boolean => {
  return isGenerating || page.status === 'GENERATING';
};




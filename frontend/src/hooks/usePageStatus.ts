import type { Page, PageStatus } from '@/types';

/**
 * Page status context type
 */
export type PageStatusContext = 'description' | 'image' | 'full';

/**
 * Derived page status
 */
export interface DerivedPageStatus {
  status: PageStatus;
  label: string;
  description: string;
}

/**
 * Get the derived status of a page based on context
 * 
 * @param page - Page object
 * @param context - Context: 'description' | 'image' | 'full'
 * @returns Derived status information
 */
export const usePageStatus = (
  page: Page,
  context: PageStatusContext = 'full'
): DerivedPageStatus => {
  const hasDescription = !!page.description_content;
  const hasImage = !!page.generated_image_path;
  const pageStatus = page.status;

  switch (context) {
    case 'description':
      // Description page context: only care about whether description is generated
      if (!hasDescription) {
        return {
          status: 'DRAFT',
          label: 'No Description',
          description: 'Description not yet generated'
        };
      }
      return {
        status: 'DESCRIPTION_GENERATED',
        label: 'Description Generated',
        description: 'Description has been generated'
      };

    case 'image':
      // Image page context: care about image generation status
      if (!hasDescription) {
        return {
          status: 'DRAFT',
          label: 'No Description',
          description: 'Need to generate description first'
        };
      }
      if (!hasImage && pageStatus !== 'GENERATING') {
        return {
          status: 'DESCRIPTION_GENERATED',
          label: 'No Image',
          description: 'Description generated, waiting for image'
        };
      }
      if (pageStatus === 'GENERATING') {
        return {
          status: 'GENERATING',
          label: 'Generating',
          description: 'Generating image'
        };
      }
      if (pageStatus === 'FAILED') {
        return {
          status: 'FAILED',
          label: 'Failed',
          description: 'Image generation failed'
        };
      }
      if (hasImage) {
        return {
          status: 'COMPLETED',
          label: 'Completed',
          description: 'Image generated'
        };
      }
      // Default: return page status
      return {
        status: pageStatus,
        label: 'Unknown',
        description: 'Status unknown'
      };

    case 'full':
    default:
      // Full context: show actual page status
      return {
        status: pageStatus,
        label: getStatusLabel(pageStatus),
        description: getStatusDescription(pageStatus, hasDescription, hasImage)
      };
  }
};

/**
 * Get status label
 */
function getStatusLabel(status: PageStatus): string {
  const labels: Record<PageStatus, string> = {
    DRAFT: 'Draft',
    DESCRIPTION_GENERATED: 'Description Generated',
    GENERATING: 'Generating',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return labels[status] || 'Unknown';
}

/**
 * Get status description
 */
function getStatusDescription(
  status: PageStatus,
  _hasDescription: boolean,
  _hasImage: boolean
): string {
  if (status === 'DRAFT') return 'Draft stage';
  if (status === 'DESCRIPTION_GENERATED') return 'Description generated';
  if (status === 'GENERATING') return 'Currently generating';
  if (status === 'FAILED') return 'Generation failed';
  if (status === 'COMPLETED') return 'All completed';
  return 'Status unknown';
}


// Responsive utility styles for the entire app
// This file provides reusable responsive style objects

export const responsiveStyles = {
  // Mobile breakpoint: max-width 640px
  // Tablet breakpoint: 641px to 1024px
  // Desktop breakpoint: 1025px and above

  // Responsive layout containers
  responsiveContainer: {
    padding: 'clamp(12px, 5vw, 24px)',
    margin: '0 auto',
    maxWidth: '100%',
    '@media (min-width: 1025px)': {
      maxWidth: '1200px',
    },
  },

  // Responsive grid for cards
  responsiveGrid: (minWidth = 250) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(min(${minWidth}px, 100%), 1fr))`,
    gap: 'clamp(12px, 3vw, 24px)',
    width: '100%',
  }),

  // Responsive sidebar layout
  responsiveSidebar: {
    display: 'flex',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
    },
  },

  // Responsive text sizes
  responsiveText: {
    h1: {
      fontSize: 'clamp(24px, 8vw, 48px)',
      lineHeight: '1.2',
    },
    h2: {
      fontSize: 'clamp(20px, 5vw, 32px)',
      lineHeight: '1.3',
    },
    h3: {
      fontSize: 'clamp(16px, 4vw, 24px)',
      lineHeight: '1.4',
    },
    body: {
      fontSize: 'clamp(14px, 2vw, 16px)',
      lineHeight: '1.5',
    },
    small: {
      fontSize: 'clamp(12px, 1.5vw, 14px)',
      lineHeight: '1.5',
    },
  },

  // Responsive spacing
  spacing: {
    xs: 'clamp(4px, 1vw, 8px)',
    sm: 'clamp(8px, 2vw, 12px)',
    md: 'clamp(12px, 3vw, 16px)',
    lg: 'clamp(16px, 4vw, 24px)',
    xl: 'clamp(24px, 5vw, 32px)',
    xxl: 'clamp(32px, 8vw, 48px)',
  },

  // Mobile-first media queries helper
  mobile: '@media (max-width: 640px)',
  tablet: '@media (max-width: 1024px)',
  desktop: '@media (min-width: 1025px)',
};

// Apply responsive styles inline for React components
export const getResponsiveStyles = (baseStyles, mediaQueries = {}) => {
  const styles = { ...baseStyles };
  
  // Handle media queries if provided
  Object.keys(mediaQueries).forEach(breakpoint => {
    // For inline styles, we can't use media queries directly
    // This helper is mainly for documentation and CSS modules
    if (breakpoint === 'mobile' || breakpoint === 'tablet' || breakpoint === 'desktop') {
      // Breakpoint styles would be handled via CSS modules or styled-components
    }
  });

  return styles;
};

// Helper for responsive padding
export const responsivePadding = (mobile = '12px', tablet = '16px', desktop = '24px') => ({
  padding: desktop,
  '@media (max-width: 1024px)': {
    padding: tablet,
  },
  '@media (max-width: 640px)': {
    padding: mobile,
  },
});

// Helper for responsive gaps
export const responsiveGap = (mobile = '8px', tablet = '12px', desktop = '16px') => ({
  gap: desktop,
  '@media (max-width: 1024px)': {
    gap: tablet,
  },
  '@media (max-width: 640px)': {
    gap: mobile,
  },
});

// Default media query definitions
export const mediaQueries = {
  mobile: '(max-width: 640px)',
  mobileLarge: '(max-width: 768px)',
  tablet: '(max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  wide: '(min-width: 1440px)',
};

export default responsiveStyles;

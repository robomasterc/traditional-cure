export const TAB_CONFIG = {
  // Default maximum number of tabs allowed
  DEFAULT_MAX_TABS: 15,
  
  // Minimum and maximum allowed values for max tabs
  MIN_MAX_TABS: 5,
  MAX_MAX_TABS: 50,
  
  // Warning threshold (percentage of max tabs)
  WARNING_THRESHOLD: 0.8, // 80%
  
  // Auto-close behavior
  AUTO_CLOSE_OLDEST: true,
  
  // Tab persistence settings
  PERSIST_TABS: false, // Whether to persist tabs across sessions
  
  // Tab configuration
  TAB_SETTINGS: {
    // Default tab colors
    DEFAULT_COLOR: '#3B82F6', // Blue
    
    // Tab animation settings
    ANIMATION_DURATION: 200, // ms
    
    // Tab bar settings
    SHOW_TAB_COUNT: true,
    SHOW_CONFIG_BUTTON: true,
    SHOW_WARNING_ICONS: true,
  }
} as const;

export type TabConfig = typeof TAB_CONFIG; 
export const COLORS = {
  navy: '#0D1B3E',
  yellow: '#F5C542',
  gold: '#C8A84B',
  beige: '#EDE8DF',
  beigeDark: '#E5DFD4',
  white: '#FFFFFF',
  textMain: '#111111',
  textSub: '#888888',
  textMuted: '#BBBBBB',
  red: '#FF4455',
  bgProfile: '#F2EDE4',
};

export const FONTS = {
  regular: { fontWeight: '500' as const },
  semiBold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },
  extraBold: { fontWeight: '800' as const },
  black: { fontWeight: '900' as const },
};

export const SIZES = {
  labelXs: 9,
  labelSm: 10,
  sub: 11,
  caption: 12,
  body: 13,
  bodyLg: 14,
  title: 17,
  titleLg: 20,
  hero: 22,
  heroLg: 28,
};

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 50,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

// Activities are now loaded dynamically from API/AsyncStorage
// No hardcoded activities - managed via Admin Panel

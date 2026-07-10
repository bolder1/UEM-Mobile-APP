// Ported 1:1 from `UEM Companion.dc.html` :root / [data-theme="dark"] CSS variables,
// then split into a brand-neutral base plus a swappable brand accent layer so the
// app can offer more than one brand theme (see BRAND_PALETTES below).

export interface ColorScheme {
  primary: string;
  primaryStrong: string;
  primaryTint: string;
  bg: string;
  canvas: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;
  hairline: string;
  hairline2: string;
  navBg: string;
  text: string;
  text2: string;
  text3: string;
  muted: string;
  muted2: string;
  faint: string;
  disabled: string;
  dotInactive: string;
  dot: string;
  dotStrong: string;
  successTint: string;
  amberTint: string;
  infoTint: string;
  violetTint: string;
  dangerTint: string;
  dangerBorder: string;
  dangerText: string;
  heroBg: string;
  success: string;
  successStrong: string;
  info: string;
  violet: string;
  amber: string;
  amberStrong: string;
  danger: string;
  white: string;
}

export type BrandTheme = 'orange' | 'blue';

export const BRAND_THEME_META: Record<BrandTheme, { label: string; swatch: string }> = {
  orange: { label: 'Classic Orange', swatch: '#EB5424' },
  blue: { label: 'DLP Blue', swatch: '#0052CC' },
};

// Brand-neutral base: surfaces, text, borders, and the fixed semantic colors
// (success/danger/amber/info/violet never change with brand — only the
// primary accent family and the hero card do).
type BrandTokens = Pick<ColorScheme, 'primary' | 'primaryStrong' | 'primaryTint' | 'heroBg'>;
type BaseTokens = Omit<ColorScheme, keyof BrandTokens>;

const baseLight: BaseTokens = {
  bg: '#F6F7F8',
  canvas: '#E7E9ED',
  surface: '#FFFFFF',
  surfaceHover: '#FAFAFB',
  surfaceActive: '#EEF0F2',
  surfaceSunken: '#F1F2F4',
  border: '#ECEDEF',
  borderStrong: '#E2E4E8',
  hairline: '#F1F2F4',
  hairline2: '#F5F6F8',
  navBg: 'rgba(246,247,248,0.92)',
  text: '#17181A',
  text2: '#3A3F45',
  text3: '#5C6166',
  muted: '#8A9098',
  muted2: '#9AA0A6',
  faint: '#C9CCD1',
  disabled: '#D3D6DA',
  dotInactive: '#DADDE1',
  dot: '#E7E9EC',
  dotStrong: '#DDDFE3',
  successTint: '#E7F5EE',
  amberTint: '#FBF3E6',
  infoTint: '#E9F0FD',
  violetTint: '#F0EDFD',
  dangerTint: '#FCEEEE',
  dangerBorder: '#F2D2D2',
  dangerText: '#A13333',
  success: '#1D9E5F',
  successStrong: '#3DBB7D',
  info: '#2E6BE0',
  violet: '#7A5AF8',
  amber: '#C97F10',
  amberStrong: '#A16A0D',
  danger: '#D64545',
  white: '#FFFFFF',
};

const baseDark: BaseTokens = {
  bg: '#0F1319',
  canvas: '#070A0E',
  surface: '#161B22',
  surfaceHover: '#1D232B',
  surfaceActive: '#242B34',
  surfaceSunken: '#1E252E',
  border: '#272E38',
  borderStrong: '#333B46',
  hairline: '#232A33',
  hairline2: '#1C222A',
  navBg: 'rgba(15,19,25,0.92)',
  text: '#F1F3F6',
  text2: '#D3D8DF',
  text3: '#AAB1BB',
  muted: '#8A929C',
  muted2: '#727A85',
  faint: '#4B535D',
  disabled: '#333B46',
  dotInactive: '#39414B',
  dot: '#20272F',
  dotStrong: '#161B22',
  successTint: '#12281D',
  amberTint: '#2A2211',
  infoTint: '#132339',
  violetTint: '#1E1836',
  dangerTint: '#2E1719',
  dangerBorder: '#4A2828',
  dangerText: '#FF9B9B',
  success: '#1D9E5F',
  successStrong: '#3DBB7D',
  info: '#2E6BE0',
  violet: '#7A5AF8',
  amber: '#C97F10',
  amberStrong: '#A16A0D',
  danger: '#D64545',
  white: '#FFFFFF',
};

// The two brand themes. Blue is the app's original palette values (kept
// byte-for-byte); orange is built from the miniOrange brand orange (#EB5424)
// at matching tonal weights (tint/strong/hero) so both themes feel equally
// "finished" rather than one being the real theme and one a reskin.
const BRAND_PALETTES: Record<BrandTheme, { light: BrandTokens; dark: BrandTokens }> = {
  orange: {
    light: {
      primary: '#EB5424',
      primaryStrong: '#CF4A1F',
      primaryTint: '#FBE7DC',
      heroBg: '#17181A',
    },
    dark: {
      primary: '#FF8A5B',
      primaryStrong: '#FFAA85',
      primaryTint: '#3A2013',
      heroBg: '#3D1F0E',
    },
  },
  blue: {
    light: {
      primary: '#0052CC',
      primaryStrong: '#003D99',
      primaryTint: '#E7EEFB',
      heroBg: '#17181A',
    },
    dark: {
      primary: '#4C8DFF',
      primaryStrong: '#7DA9FF',
      primaryTint: '#15294A',
      heroBg: '#0C346B',
    },
  },
};

export function getColorScheme(brand: BrandTheme, isDark: boolean): ColorScheme {
  const base = isDark ? baseDark : baseLight;
  const tokens = BRAND_PALETTES[brand][isDark ? 'dark' : 'light'];
  return { ...base, ...tokens };
}

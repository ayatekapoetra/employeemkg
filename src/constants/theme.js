import { extendTheme } from 'native-base';
import { COLORS } from './colors';

const theme = extendTheme({
  colors: {
    primary: {
      500: COLORS.teks.light[6],
      600: COLORS.teks.dark[6],
    },
    success: {
      500: COLORS.teks.light[4],
    },
    warning: {
      500: COLORS.teks.light[3],
    },
    error: {
      500: COLORS.teks.light[5],
    },
  },
  
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },

  components: {
    Button: {
      defaultProps: {
        colorScheme: 'primary',
      },
      variants: {
        solid: ({ colorMode }) => ({
          bg: colorMode === 'dark' ? COLORS.btn.dark.active : COLORS.btn.light.active,
          _pressed: {
            bg: colorMode === 'dark' ? COLORS.btn.dark.inactive : COLORS.btn.light.inactive,
          },
        }),
        outline: ({ colorMode }) => ({
          borderColor: colorMode === 'dark' ? COLORS.teks.dark[6] : COLORS.teks.light[6],
          _text: {
            color: colorMode === 'dark' ? COLORS.teks.dark[6] : COLORS.teks.light[6],
          },
          _pressed: {
            bg: colorMode === 'dark' ? COLORS.btn.dark.inactive : COLORS.btn.light.inactive,
          },
        }),
      },
    },
    
    Input: {
      defaultProps: {
        size: 'md',
      },
      variants: {
        outline: ({ colorMode }) => ({
          borderColor: colorMode === 'dark' ? COLORS.line.dark[1] : COLORS.line.light[1],
          _focus: {
            borderColor: colorMode === 'dark' ? COLORS.teks.dark[6] : COLORS.teks.light[6],
            bg: 'transparent',
          },
        }),
      },
    },
  },

  fontConfig: {
    Quicksand: {
      300: {
        normal: 'Quicksand-Light',
      },
      400: {
        normal: 'Quicksand-Regular',
      },
      600: {
        normal: 'Quicksand-SemiBold',
      },
      700: {
        normal: 'Quicksand-Bold',
      },
    },
    Poppins: {
      300: {
        normal: 'Poppins-Light',
      },
      400: {
        normal: 'Poppins-Regular',
      },
    },
    Abel: {
      400: {
        normal: 'Abel-Regular',
      },
    },
    Lato: {
      400: {
        normal: 'Lato-Regular',
      },
    },
  },

  fonts: {
    heading: 'Quicksand',
    body: 'Quicksand',
    mono: 'Abel',
  },
});

export default theme;

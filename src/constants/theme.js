import { extendTheme } from 'native-base';
import { COLORS } from './colors';

const theme = extendTheme({
  colors: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    success: {
      500: COLORS.status.success,
    },
    warning: {
      500: COLORS.status.warning,
    },
    error: {
      500: COLORS.status.error,
    },
    info: {
      500: COLORS.status.info,
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
        solid: {
          bg: 'primary.500',
          _pressed: {
            bg: 'primary.600',
          },
        },
        outline: {
          borderColor: 'primary.500',
          _text: {
            color: 'primary.500',
          },
          _pressed: {
            bg: 'primary.50',
          },
        },
      },
    },
    
    Input: {
      defaultProps: {
        size: 'md',
      },
      variants: {
        outline: {
          borderColor: 'gray.300',
          _focus: {
            borderColor: 'primary.500',
            bg: 'transparent',
          },
        },
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

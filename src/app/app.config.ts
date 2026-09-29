import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { routes } from './app.routes';
import { SelectButtonModule } from 'primeng/selectbutton';
import { GATE_APIS_SERVICE_URL_TOKEN } from './shared/tokens/gate-apis-service-url.token';
import { GATE_FRONTEND_SERVICE_URL_TOKEN } from './shared/tokens/gate-frontend-service-url.token';
import { STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN } from './shared/tokens/staff-clearance-apis-service-url.token';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { cacheInterceptor } from './shared/interceptors/cache.interceptor';
import { jwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { accessTokenInitilizer } from './shared/initilizers/access-token.initilizer';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: palette('{blue}'),
    colorScheme: {
      light: {
        surface: palette('{yellow}'),
        primary: { color: '{primary.900}' },
        content: { color: '{zinc.800}', borderColor: '{surface.500}' },
        text: {
          mutedColor: '{zinc.300}',
        },
        formField: {
          placeholderColor: '{zinc.400}',
          borderRadius: 'var(--radius-3xl)',
        },
      },
    },
  },
  components: {
    paginator: {
      colorScheme: {
        light: {
          root: {
            background: 'transparent',
          },
        },
      },
    },
    button: {
      colorScheme: {
        light: {
          root: {
            secondary: {
              borderColor: '{surface.400}',
              hoverBorderColor: '{surface.400}',
              color: '{primary.900}',
              background: '{zinc.100}',
              hoverBackground: '{zinc.50}',
              hoverColor: '{primary.900}',
            },
          },
          outlined: {
            secondary: {
              borderColor: '{surface.400}',
              color: '{primary.900}',
              hoverBackground: '{surface.400}',
            },
          },
        },
      },
    },

    tabs: {
      tab: {
        activeBackground: '{zinc.300}',
        activeColor: '{surface.600}',
        color: '{primary.900}',
        hoverColor: '{primary.900}',
      },
      activeBar: {
        background: '{primary.900}',
      },
    },

    inputtext: {
      colorScheme: {
        light: {
          root: {
            focusRing: {
              width: '2px',
              style: 'solid',
              color: '{primary.200}',
              offset: '1px',
            },
          },
        },
      },
    },
    card: {
      root: {
        borderRadius: 'var(--radius-3xl)',
      },
    },
    dialog: {
      colorScheme: {
        light: {
          root: { color: '{zinc.800}' },
        },
      },
      root: {
        borderRadius: 'var(--radius-2xl)',
      },
      content: {
        padding: '0',
      },
    },
    tooltip: {
      colorScheme: {
        light: {
          root: {
            background: '{primary.900}',
            color: '{surface.100}',
          },
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    MessageService,
    ConfirmationService,
    DialogService,
    SelectButtonModule,
    provideHttpClient(withInterceptors([jwtInterceptor, cacheInterceptor])),
    accessTokenInitilizer,
    {
      provide: GATE_APIS_SERVICE_URL_TOKEN,
      useValue: 'http://172.25.3.20/wpu-gate/apis',
      // useValue: 'http://localhost:3001/wpu-gate/apis',
    },
    {
      provide: GATE_FRONTEND_SERVICE_URL_TOKEN,
      useValue: 'http://172.25.3.20/wpu-gate',
      // useValue: 'http://localhost:4201/wpu-gate',
    },
    {
      provide: STAFF_CLEARANCE_APIS_SERVICE_URL_TOKEN,
      useValue: 'http://172.25.3.20/wpu-staff-clearance/apis',
      // useValue: 'http://localhost:3000/wpu-staff-clearance/apis',
    },
    providePrimeNG({
      license:
        'eyJpZCI6ImMzYzdmNzU1LWU5ZjktNDZkZC1iNmY4LWYwZDk4ZWZjMTEwYSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODU5MTc2NjgsImV4cCI6MTgxNzQ1MzY2OH0.XQiqwC6TPBDKke3vwfqXCc5a5LKCIgqTiNDcITU_xIWArREJSNgUI9rwvimAvO6ahYC9GXGLJ1zaudPvJRV6BA',
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
  ],
};

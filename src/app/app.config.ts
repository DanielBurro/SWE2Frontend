import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { de_DE, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import de from '@angular/common/locales/de';
import { routes } from './app.routes';

import { provideNzIconsPatch } from 'ng-zorro-antd/icon';
import * as AllIcons from '@ant-design/icons-angular/icons';

const antDesignIcons = Object.values(AllIcons) as any[];

registerLocaleData(de);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideNzI18n(de_DE),
    provideNzIconsPatch(antDesignIcons),
  ],
};

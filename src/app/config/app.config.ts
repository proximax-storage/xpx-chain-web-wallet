import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    home: 'home',
    login: 'login',
<<<<<<< HEAD
    createWallet: 'create-wallet',
=======
    dashboard: 'dashboard',
>>>>>>> 05a2c608993556ef1243d6b17c93516a6104f377
    notFound: 'not-found'
  },
};

export interface Config {
  routes: {
    home: string;
    login: string;
<<<<<<< HEAD
    createWallet: string;
=======
    dashboard: string;
>>>>>>> 05a2c608993556ef1243d6b17c93516a6104f377
    notFound: string;
  };
}

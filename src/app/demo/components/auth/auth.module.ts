import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { AuthService } from '../../services/auth.service';

@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule,
        SocialLoginModule
    ],
    exports: [
        SocialLoginModule // Export it for other modules
    ],
    providers: [
            AuthService ,
            {
                provide: 'SocialAuthServiceConfig',
                useValue: {
                  autoLogin: false,
                  providers: [
                    {
                      id: GoogleLoginProvider.PROVIDER_ID,
                      provider: new GoogleLoginProvider('421274310229-bbgvpfgp8qt47571dast98f1kdvpdabp.apps.googleusercontent.com')
                    }
                  ],
                } as SocialAuthServiceConfig,
              }
          ],
    
})
export class AuthModule { }

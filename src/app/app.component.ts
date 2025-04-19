/*
import { Component } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    menuMode = 'static';

    constructor(private primengConfig: PrimeNGConfig) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        document.documentElement.style.fontSize = '14px';
    }
}
*/


import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { LayoutService } from './layout/service/app.layout.service';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig, private layoutService: LayoutService, private authService: AuthService) { }
    ngOnInit(): void {
            this.authService.setToken(
              'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6IltdIiwidXNlcmlkIjoiMyIsInN1YiI6IlRhc25pbSIsImlhdCI6MTc0NTA4MDY4NCwiZXhwIjoxNzQ1MTY3MDg0fQ.F9CjZCsPfnPwaXBa0yEUIpfRGZoTbFt_LsFuxfBPxDJn3eSfskioxtgIKqxgIz-XpJD0f4m8I2U-9HFrvsI_fA'
            );
          
        this.primengConfig.ripple = true;       //enables core ripple functionality
		document.documentElement.style.fontSize = '14px';
		
        //optional configuration with the default configuration
        this.layoutService.config = {
            ripple: false,                      //toggles ripple on and off
            inputStyle: 'outlined',             //default style for input elements
            menuMode: 'static',                 //layout mode of the menu, valid values are "static" and "overlay"
            colorScheme: 'light',               //color scheme of the template, valid values are "light" and "dark"
            //theme: 'lara-light-indigo',         //default component theme for PrimeNG
			theme: 'mdc-light-deeppurple',         //default component theme for PrimeNG
			
            scale: 14                           //size of the body font size to scale the whole application
        };
    }

}

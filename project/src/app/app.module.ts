import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {HttpClientModule} from '@angular/common/http';

import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';
import { HeroService } from './hero.service';
import { AboutusComponent } from './aboutus/aboutus.component';
import { ContactusComponent } from './contactus/contactus.component';
import { HeroListComponent } from './hero-list/hero-list.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { FormTestComponent } from './form-test/form-test.component';
import { UserListComponent } from './user-list/user-list.component';
// import { UserListComponent } from './user-list/user-list.component';


const appRoutes: Routes = [
  { path: 'aboutus', component: AboutusComponent },
  { path: 'contactus', component: ContactusComponent },
  { path: 'hero-list', component: HeroListComponent },
  { path: 'users', component: FormTestComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    AboutusComponent,
    ContactusComponent,
    HeroListComponent,
    HeroDetailComponent,
    FormTestComponent,
    UserListComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [HeroService],
  bootstrap: [AppComponent]
})
export class AppModule { } 

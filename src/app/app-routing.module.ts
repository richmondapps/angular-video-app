import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ClipComponent } from './clip/clip.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegisterComponent } from './user/register/register.component';
import { PasswordlessRegisterComponent } from './user/passwordless-register/passwordless-register.component';
import { PasswordlessSigninComponent } from './user/passwordless-signin/passwordless-signin.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'clip/:id',
    component: ClipComponent,
  },
  {
    path: '',
    component: RegisterComponent,
  },
  {
    path: 'passwordless-register',
    component: PasswordlessRegisterComponent,
  },
  {
    path: 'passwordless-signin',
    component: PasswordlessSigninComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageListComponent } from './image-list/image-list.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ImageEditComponent } from './image-edit/image-edit.component';
import { ImageDeleteComponent } from './image-delete/image-delete.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'images',
    component: ImageListComponent,
    data: {
      authOnly: true
    }
  },
  {
    path: 'image-upload',
    component: ImageUploadComponent,
    data: {
      authOnly: true
    }
  }
];

@NgModule({
  declarations: [
    ImageListComponent,
    ImageUploadComponent,
    ImageEditComponent,
    ImageDeleteComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ImagesModule { }

import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CreateService } from 'src/app/services/create.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-image-edit',
  templateUrl: './image-edit.component.html',
  styleUrls: ['./image-edit.component.css']
})
export class ImageEditComponent implements OnInit, OnDestroy, OnChanges{
  @Input() activeClip: any | null = null;
  inSubmission: boolean = false;
  showAlert: boolean = false;
  alertMsg = 'Updating title';
  alertColor = 'blue';
  
  clipID = new FormControl('', {
    nonNullable: true
  })
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  });
  
    constructor(
      private modal: ModalService,
      private createService: CreateService
    ){}
  
    ngOnInit(): void {
      this.modal.register('editClip')
      console.log('ACTIVE CLIP', this.activeClip)
    }
  
    ngOnDestroy(){
      // this.modal.unregister('editClip')
    }
  
  
    ngOnChanges(){
      if(!this.activeClip){
        return
      }
      console.log('ACTIVE CLIP', this.activeClip)
  
      this.clipID.setValue(this.activeClip.docId)
      this.title.setValue(this.activeClip.fileTitle)
    }
  
    updateFn(){
      this.showAlert = true
      this.inSubmission = true
      this.alertMsg = 'Updating title';
      this.alertColor = 'blue';
  
  
       const formData = {
        fileTitle: this.title.value
       }
  
       try {
         this.createService.createRecordFn('icons', this.activeClip.docId, formData)
         this.alertMsg = 'Update complete';
         this.alertColor = 'green';
       } catch (error) {
        this.inSubmission = false;
        this.alertMsg = 'Soemthing went wrong, please try again.';
        this.alertColor = 'red';
        return
       }
    
  
    }
  }
  
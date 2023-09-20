import { Component, Input } from '@angular/core';
import { DeleteService } from 'src/app/services/delete.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent {
  @Input() deleteClip: any | null = null;
  inSubmission: boolean = false;
  showAlert: boolean = true;
  alertMsg = 'Once confirmed, this data will be permanently deleted.';
  alertColor = 'red';

  constructor(
    private modal: ModalService,
    public deleteService: DeleteService,
  ){}

  ngOnInit(): void {
    this.modal.register('deleteClip')
    console.log('ACTIVE CLIP', this.deleteClip)
  }

  async deleteFn(){

    if(!this.deleteClip){
      return
    }
    this.showAlert = true;
    this.alertMsg = 'Deleting...';
    this.alertColor = 'red';

    try {
       await  this.deleteService.deleteStorageFilesAndFirestoreRefFn(this.deleteClip.storagePath, this.deleteClip.screenshotStoragePath, 'memberFiles', this.deleteClip.docId)

       this.showAlert = true;
       this.alertMsg = 'Record Deleted';
       this.alertColor = 'green';

    } catch (error) {
      this.showAlert = true;
      this.alertMsg = 'The data could not be deleted.';
      this.alertColor = 'red';
    }
 
  }



}

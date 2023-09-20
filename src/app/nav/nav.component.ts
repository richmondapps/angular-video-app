import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

  constructor(
    private auth: Auth,
    public modal: ModalService,
    public authService: AuthService
  ){
    console.log(this.modal.isModalOpen)
  }

  openModal(event: Event){
    event.preventDefault();

    console.log('EVENT', event)

    this.modal.toggleModal('auth')
  }


}

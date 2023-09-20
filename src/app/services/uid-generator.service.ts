import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UidGeneratorService {
  static newId(): string {
    // Alphanumeric characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // assert(autoId.length === 20, 'Invalid auto ID: ' + autoId);
    return autoId;
  }
}

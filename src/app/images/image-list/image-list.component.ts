import { Component, OnInit } from '@angular/core';
import { ReadService } from 'src/app/services/read.service';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.css'],
})
export class ImageListComponent implements OnInit {
  iconList!: any[];
  constructor(private readService: ReadService) {}

  ngOnInit(): void {
    this.fetchAllIconsFn();
  }

  async fetchAllIconsFn() {
    const d = await this.readService.returnPromiseOrderByFn(
      'softwareImages',
      'fileName',
      'asc',
    );
    const i: any[] = [];
    d.map((e) => {
      i.push(e);
    });
    this.iconList = i;
  }
}

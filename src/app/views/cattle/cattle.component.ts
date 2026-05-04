import { Component, OnInit } from '@angular/core';
import { Cattle } from 'src/app/models/cattle.model';
import { CattleService } from 'src/app/services/cattle.service';

@Component({
  selector: 'app-cattle',
  templateUrl: './cattle.component.html',
  styleUrls: ['./cattle.component.css']
})
export class CattleComponent implements OnInit {
  cattle: Cattle[] = [];

  constructor(private readonly cattleService: CattleService) {}

  ngOnInit(): void {
    this.cattleService.getCattle().subscribe({
      next: (cattle) => {
        this.cattle = cattle;
      },
      error: () => {
        this.cattle = [];
      }
    });
  }
}

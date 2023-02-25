import { Component, OnInit } from '@angular/core';
import { General } from 'src/app/models/general';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})
export class GeneralComponent implements OnInit {

  generals: General[];

  constructor(
    private generalService: GeneralService
  ) { }

  ngOnInit(): void {
    this.generalService.getGenerals().subscribe(generals=>{
      this.generals = generals;
    })
  }

}

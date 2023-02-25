import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  openSidebar = false;
  @Output() toggleSidebarToParent = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }
  
  toggleSidebar() {
    this.openSidebar = !this.openSidebar;
    this.toggleSidebarToParent.emit(this.openSidebar);
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CodeSenderModalComponent } from 'src/app/modals/code-sender-modal/code-sender-modal.component';
import { AuthenticationServiceService } from 'src/app/services/authentication-service.service';
import {Location} from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user_name:string;
  password:string;
  see_password: boolean = false;
  validation= {
    user_name: true,
    password: true,
  }
  errorValidationMessage= {
    user_name: "",
    password: "",
  }

  constructor(
    public modalService: NgbModal,
    private authenticationService: AuthenticationServiceService,
    private _location: Location,
    private router:Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  ValidateData(action:string){
    if(this.user_name === "" || (action=="register" && this.user_name == undefined)){this.errorValidationMessage.user_name="Username is required"; this.validation.user_name = false}else{this.validation.user_name =true}
    if(this.password === "" || (action=="register" && this.password == undefined)){this.errorValidationMessage.password="Password is required"; this.validation.password = false}else{this.validation.password =true}

    const response = this.validation.user_name && this.validation.password;
    return response;
  }

  Login(){
    if(this.ValidateData('register')){
      const encrypted_passsword = btoa(this.toBinary(this.password));
      const user_data ={
        user_name: this.user_name,
        password: encrypted_passsword
      }
      this.authenticationService.Login(user_data).subscribe((result) => {
        if(result.isOperational===true){
          localStorage.setItem('user_name',result.usuario_registrado.user_name);
          localStorage.setItem('user_role',result.usuario_registrado.role);
          localStorage.setItem('user_token',result.sesion.user_token);
          this.router.navigateByUrl(`/home`).then(() => {
            window.location.reload();
          });
        }
        else
        {
          if(result.description === 'Wrong user'){ this.validation.user_name = false;this.errorValidationMessage.user_name = result.description;}else{this.validation.password = false;this.errorValidationMessage.password = result.description;}
        }
      })
    }
  }

  SeePassword(){
    this.see_password = !this.see_password;
  }

  OpenCodeSenderModal(){
    this.modalService.open(CodeSenderModalComponent);
  }

  toBinary(string:any) {
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = string.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
  }
  
  fromBinary(binary:any) {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
  }

  Cancel(){
    this._location.back();
  }

}

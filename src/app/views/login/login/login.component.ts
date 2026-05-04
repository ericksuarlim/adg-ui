import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CodeSenderModalComponent } from 'src/app/modals/code-sender-modal/code-sender-modal.component';
import { AuthenticationServiceService } from 'src/app/services/authentication-service.service';
import {Location} from '@angular/common';
import { LoginRequest } from 'src/app/models/auth.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user_name = '';
  password = '';
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
    private readonly authenticationService: AuthenticationServiceService,
    private readonly _location: Location,
    private readonly router:Router
  ) { }

  ValidateData(action:string){
    if(this.user_name === "" || (action=="register" && this.user_name == undefined)){this.errorValidationMessage.user_name="Username is required"; this.validation.user_name = false}else{this.validation.user_name =true}
    if(this.password === "" || (action=="register" && this.password == undefined)){this.errorValidationMessage.password="Password is required"; this.validation.password = false}else{this.validation.password =true}

    const response = this.validation.user_name && this.validation.password;
    return response;
  }

  Login() {
    if (this.ValidateData('register')) {
      const userData: LoginRequest = {
        user_name: this.user_name,
        password: this.password
      };

      this.authenticationService.login(userData).subscribe((result) => {
        if (result.success) {
          this.router.navigateByUrl('/home');
          return;
        }

        const errorMessage = result.error ?? 'Credenciales invalidas';
        if (errorMessage.includes('Wrong user')) {
          this.validation.user_name = false;
          this.errorValidationMessage.user_name = errorMessage;
        } else {
          this.validation.password = false;
          this.errorValidationMessage.password = errorMessage;
        }
      });
    }
  }

  SeePassword(){
    this.see_password = !this.see_password;
  }

  OpenCodeSenderModal(){
    this.modalService.open(CodeSenderModalComponent);
  }

  Cancel(){
    this._location.back();
  }

}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CodeSenderModalComponent } from 'src/app/shared/components/modals/code-sender-modal/code-sender-modal.component';
import { AuthenticationServiceService } from 'src/app/core/services/authentication-service.service';
import {Location} from '@angular/common';
import { LoginRequest } from 'src/app/shared/models/auth.model';
import { I18nService } from 'src/app/core/services/i18n.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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
    user_name: '',
    password: '',
  }
  private readonly passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;

  constructor(
    public modalService: NgbModal,
    private readonly authenticationService: AuthenticationServiceService,
    private readonly i18nService: I18nService,
    private readonly _location: Location,
    private readonly router:Router
  ) { }

  ValidateData(action:string){
    if(this.user_name === '' || (action=='register' && this.user_name == undefined)){this.errorValidationMessage.user_name=this.i18nService.translate('login.usernameRequired'); this.validation.user_name = false}else{this.validation.user_name =true}
    if(this.password === '' || (action=='register' && this.password == undefined)){
      this.errorValidationMessage.password=this.i18nService.translate('login.passwordRequired');
      this.validation.password = false;
    } else if (!this.passwordPolicyRegex.test(this.password)) {
      this.errorValidationMessage.password = this.i18nService.translate('login.passwordPolicy');
      this.validation.password = false;
    } else {this.validation.password =true}

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

        const errorMessage = result.error ?? this.i18nService.translate('login.invalidCredentials');
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

import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {


  constructor(private authSrv: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
      console.log(form.value);
      try {
          this.authSrv.signUp(form.value).subscribe();
          this.router.navigate(['/accedi']);
      } catch (error) {
          console.error(error);
      }
  }
}

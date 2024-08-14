import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  itemForm: FormGroup;
  formModel: any = {};
  showError: boolean = false;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    public router: Router,
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.itemForm = this.formBuilder.group({
      username: [this.formModel.username, [Validators.required]],
      password: [this.formModel.password, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.initializeDarkMode();
  }

  onLogin() {
    if (this.itemForm.valid) {
      this.showError = false;
      this.loading = true;

      this.httpService.Login(this.itemForm.value).subscribe(
        (data: any) => {
          if (data.userNo != 0) {
            this.authService.SetRole(data.role);
            this.authService.saveToken(data.token);
            this.itemForm.reset();

            this.router.navigateByUrl('/dashboard').then(() => {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            });
          } else {
            this.showError = true;
            this.errorMessage = "Wrong Username or Password";
          }
          this.loading = false;
        },
        (error) => {
          this.showError = true;
          if (error.status === 0) {
            this.errorMessage = "Network error. Please check your connection.";
          } else if (error.status === 401) {
            this.errorMessage = "Unauthorized. Please check your credentials.";
          } else {
            this.errorMessage = "An error occurred while logging in. Please try again later.";
          }
          this.loading = false;
          console.error('Login error:', error);
        }
      );
    } else {
      this.itemForm.markAllAsTouched();
    }
  }

  registration() {
    this.router.navigateByUrl('/registration');
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
  }

  initializeDarkMode() {
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'enabled' || (darkModePreference === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
    }
  }
}

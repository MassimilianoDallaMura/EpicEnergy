import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthData } from 'src/app/interface/auth-data.interface';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user!: AuthData | null;

  

  constructor(private authSrv: AuthService) {}

  ngOnInit(): void {
      this.authSrv.user$.subscribe((user) => {       // riceve lo user
          this.user = user;  //sa se c'è l'utente
      });
      
        
      }

  }
    
  

  

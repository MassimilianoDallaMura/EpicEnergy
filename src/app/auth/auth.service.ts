import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Register } from '../interface/register.interface';
import { environment } from 'src/environments/environment.development';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // tap non fa nulla all'oggetto che lo riceve. lo restituisce e basta
import { Router } from '@angular/router';
import { AuthData } from '../interface/auth-data.interface';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Login } from '../interface/login.interface';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiURL = `${environment.apiURL}/auth`; // chiamata all'url
  jwtHelper = new JwtHelperService();
  timeOut: any;
private token: string | null = null;

 private authSub = new BehaviorSubject<AuthData | null>(null); //beha sub è privato perché non deve uscire per non essere cambiato da altri component
 user$ = this.authSub.asObservable(); // per far uscire il valore del beha sub si usa user$

  constructor(private http: HttpClient, private router: Router) {}


  login(user: Login): Observable<string> {
    return this.http.post<string>(`${this.apiURL}/login`, user).pipe(
        tap((token: string) => {
            const authData: AuthData = {
                accessToken: token,
                user: {
                    name: '',
                    id: '',
                    email: user.email
                }
            };
            
            this.token = token;
            this.authSub.next(authData);
        
            localStorage.setItem('user', JSON.stringify(authData));
        }),
        catchError(this.errors)
    );
  }

  signUp(user: Register): Observable<string> {
    return this.http
      .post<string>(`${this.apiURL}/register`, user) //  metodo che scriverà l'utente dentro il json. parte 1 del flusso di registrazione. register è l'endpoint (json documentation vuole così)
      .pipe(catchError(this.errors)); //durante la fase di registrazione verifichiamo se ci sono errori
  }

  logout() {
    // this.authSub.next(null);  // svuota il beha sub
    localStorage.removeItem('user');  // cancella il local storage
    this.router.navigate(['/login']); // rimanda alla pg di login
  }

  restore() {       // fa sì che se nel local storage c
    const userJson = localStorage.getItem('user');
    if (!userJson) {      // non c'è l'utente, fa partire dall'inizio
      return;
    }
    const user: AuthData = JSON.parse(userJson);      //se è presente riapre il login
    this.authSub.next(user);
    this.autoLogout(user);  // questo metodo restore lo devo chiamare in tutti i componenti ng oninit di tutti i componenti che possono essere visuallizzati quando c'è login
  }

  autoLogout(user: AuthData) {
    const dateExpiration = this.jwtHelper.getTokenExpirationDate(
      user.accessToken
    ) as Date;
    const millisecondsExp = dateExpiration.getTime() - new Date().getTime();
    this.timeOut = setTimeout(() => {
      this.logout();
    }, millisecondsExp);      //  devo chiamare in login e in restore
  }

  private errors(err: any) {
    console.log(err.error);
    switch (err.error) {
      case 'Email already exists':
        return throwError('utente già presente');
        break;

      case 'Incorrect password':
        return throwError('password errata');
        break;

      case 'Cannot find user':
        return throwError('Utente non trovato');
        break;

      default:
        return throwError('Errore nella chiamata');
        break;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { MusicService } from './services/music.service';
import { ErrorService } from './services/error.service';
import { AssetService } from './services/asset.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, NotificationsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  showLoginModal = false;
  showRegisterModal = false;
  
  loginData = {
    email: '',
    password: ''
  };
  
  registerData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(
    public authService: AuthService,
    public musicService: MusicService,
    public assetService: AssetService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  login(): void {
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        this.showLoginModal = false;
        this.loginData = { email: '', password: '' };
        this.errorService.showSuccess('Connexion réussie !');
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.errorService.showError('Erreur de connexion. Vérifiez vos identifiants.');
      }
    });
  }

  register(): void {
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);
        this.showRegisterModal = false;
        this.registerData = { username: '', email: '', password: '' };
        this.errorService.showSuccess('Inscription réussie !');
      },
      error: (error) => {
        console.error('Erreur d\'inscription:', error);
        this.errorService.showError('Erreur d\'inscription. Vérifiez vos informations.');
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Déconnexion réussie');
        this.musicService.stop();
        this.errorService.showInfo('Déconnexion réussie');
      },
      error: (error) => {
        console.error('Erreur de déconnexion:', error);
        // En cas d'erreur, nettoyer localement mais ne pas afficher "forcée"
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.authService.getCurrentUserValue();
        this.musicService.stop();
        this.errorService.showInfo('Déconnexion réussie');
      }
    });
  }

  onSeek(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = parseFloat(target.value);
    this.musicService.seek(time);
  }

  onVolumeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const volume = parseFloat(target.value);
    this.musicService.setVolume(volume);
  }
}

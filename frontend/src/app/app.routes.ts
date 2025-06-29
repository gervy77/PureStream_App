import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { PlaylistsComponent } from './components/playlists/playlists.component';
import { LibraryComponent } from './components/library/library.component';
import { UploadComponent } from './components/upload/upload.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'playlists', component: PlaylistsComponent },
  { path: 'upload', component: UploadComponent }
];

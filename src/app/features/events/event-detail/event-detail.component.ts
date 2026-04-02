import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, HeaderComponent],
  template: `
    <app-header />
    <div style="padding:3rem 2rem;color:#e8e4dc;font-family:'DM Sans',sans-serif;">
      <a routerLink="/" style="color:#c9a96e;text-decoration:none;">← Zurück</a>
      <h1 style="font-family:'Playfair Display',serif;margin-top:1.5rem;">Event Detail</h1>
      <p style="color:rgba(232,228,220,0.5);margin-top:0.5rem;">Wird noch implementiert.</p>
    </div>
  `,
})
export class EventDetailComponent {}
import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  public siderCollapsed = signal(false);

  // Subjects for communication between global Sider and page components
  private settingsRequestSource = new Subject<void>();
  private templatesRequestSource = new Subject<void>();

  settingsRequested$ = this.settingsRequestSource.asObservable();
  templatesRequested$ = this.templatesRequestSource.asObservable();

  requestSettings() {
    this.settingsRequestSource.next();
  }

  requestTemplates() {
    this.templatesRequestSource.next();
  }
}

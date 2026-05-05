// search.service.ts

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  query = signal<string>('');
  isSearching = signal<boolean>(false);
}
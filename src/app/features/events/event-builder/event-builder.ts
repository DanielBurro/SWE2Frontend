import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
// NG-ZORRO Imports
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

interface BuilderElement {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-event-builder',
  standalone: true,
  templateUrl: './event-builder.html',
  styleUrls: ['./event-builder.scss'],
  // Da wir das Dropdown manuell bauen, brauchen wir nur Icon und Layout
  imports: [CommonModule, NzIconModule, NzLayoutModule],
})
export class EventBuilder implements AfterViewInit, OnDestroy {
  // WICHTIG: { read: ElementRef }, damit wir die Breite von nz-header messen können
  @ViewChild('headerContainer', { read: ElementRef }) headerContainer!: ElementRef;
  @ViewChild('pillElement') pillElement!: ElementRef;

  // Datenquelle für alle verfügbaren Elemente
  readonly allElements: BuilderElement[] = [
    { id: 'text', label: 'Text', icon: 'align-left' },
    { id: 'image', label: 'Image', icon: 'picture' },
    { id: 'heading', label: 'Heading', icon: 'font-size' },
    { id: 'list', label: 'List', icon: 'unordered-list' },
    { id: 'quote', label: 'Quote', icon: 'message' },
    { id: 'divider', label: 'Divider', icon: 'border-bottom' },
    { id: 'location', label: 'Location', icon: 'environment' },
    { id: 'music', label: 'Music', icon: 'customer-service' },
    { id: 'video', label: 'Video', icon: 'video-camera' },
    { id: 'table', label: 'Table', icon: 'table' },
  ];

  visibleItems: BuilderElement[] = [];
  overflowItems: BuilderElement[] = [];
  isMenuOpen = false;

  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    // Initialer Check: Kurzer Delay, damit der Browser das CSS fertig gerendert hat
    setTimeout(() => this.calculateLayout(), 150);

    // ResizeObserver initialisieren
    this.resizeObserver = new ResizeObserver(() => {
      // ngZone.run stellt sicher, dass Angular die Änderungen im UI mitbekommt
      this.ngZone.run(() => this.calculateLayout());
    });

    if (this.headerContainer) {
      this.resizeObserver.observe(this.headerContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /**
   * Berechnet dynamisch, wie viele Items in den Header passen
   */
  calculateLayout(): void {
    if (!this.headerContainer || !this.pillElement) return;

    const containerWidth = this.headerContainer.nativeElement.offsetWidth;
    const pillWidth = this.pillElement.nativeElement.offsetWidth + 24; // Breite + Gap
    const moreBtnWidth = 60; // Breite des "+" Buttons

    const availableWidth = containerWidth - pillWidth - moreBtnWidth;
    const itemWidth = 115; // Schätzwert pro Button inkl. Gap

    // Anzahl berechnen (min 0, max alle Elemente)
    let maxVisible = Math.floor(availableWidth / itemWidth);
    maxVisible = Math.max(0, Math.min(maxVisible, this.allElements.length));

    // Nur updaten, wenn sich die Verteilung geändert hat
    if (this.visibleItems.length !== maxVisible) {
      this.visibleItems = this.allElements.slice(0, maxVisible);
      this.overflowItems = this.allElements.slice(maxVisible);

      // Menü schließen, falls es durch Resize keine Items mehr im Überlauf gibt
      if (this.overflowItems.length === 0) {
        this.isMenuOpen = false;
      }

      // UI-Update anstoßen
      this.cdr.detectChanges();
    }
  }

  /**
   * Öffnet/Schließt das Custom-Grid-Menü
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.detectChanges();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-heading-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <textarea
      #headingArea
      [(ngModel)]="text"
      (ngModelChange)="onTextChange($event)"
      (input)="adjustHeight(headingArea)"
      [placeholder]="placeholder"
      class="heading-input"
      [class]="'level-' + level"
      rows="1"
    ></textarea>
  `,
  styles: [`
    .heading-input {
      width: 100%;
      border: none;
      background: transparent;
      outline: none;
      resize: none;
      font-weight: 700;
      color: #e8e4dc;
      padding: 0;
      line-height: 1.2;
      overflow: hidden;

      &.level-1 { font-size: 2.5rem; }
      &.level-2 { font-size: 2rem; }
      &.level-3 { font-size: 1.5rem; }

      &::placeholder {
        color: rgba(232, 228, 220, 0.2);
      }
    }
  `]
})
export class HeadingCard {
  @Input() text: string = '';
  @Input() level: number = 2;
  @Input() placeholder: string = 'Überschrift';
  @Output() textChange = new EventEmitter<string>();

  adjustHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  onTextChange(newValue: string) {
    this.textChange.emit(newValue);
  }
}

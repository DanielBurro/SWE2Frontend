import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-card',
  imports: [FormsModule],
  templateUrl: './text-card.html',
  styleUrl: './text-card.scss',
})
export class TextCard {
  @Input() text: string = '';
  @Output() textChange = new EventEmitter<string>();

  onTextChange(newValue: string) {
    this.textChange.emit(newValue);
  }
}

import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dias-cell-renderer',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './dias-cell-renderer.component.html',
  styleUrl: './dias-cell-renderer.component.css'
})
export class DiasCellRendererComponent {
  @Input() diasModal: string = '';
  @Input() isModal: boolean = false;
  @Output() selectedDays = new EventEmitter<any>();
  public dias: number[] = [];
  public diasMap = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  agInit(params: any): void {
    console.log("🚀 ~ DiasCellRendererComponent ~ agInit ~ this.dias:", params.data.active_days)
    this.dias = this.daysToArray(params.data.active_days);
  }

  ngOnInit(): void {
    if (this.isModal) {
      this.dias = this.daysToArray(this.diasModal); 
    }
  }

  daysToArray(diasStr: string): number[] {
    // console.log("🚀 ~ DiasCellRendererComponent ~ daysToArray ~", diasStr.split('').map(char => parseInt(char, 10)))
    return diasStr.split('').map(char => parseInt(char, 10));
  }

  toggleDia(index: number) {
    this.dias[index] = this.dias[index] === 1 ? 0 : 1;
    this.emitSelectedDays();
  }

  emitSelectedDays() {
    const diasString = this.dias.join('');
    this.selectedDays.emit(diasString);
  }
}

import { NgClass, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dias-cell-renderer',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './dias-cell-renderer.component.html',
  styleUrl: './dias-cell-renderer.component.css'
})
export class DiasCellRendererComponent {
  @Input() diasModal: number[] = [];
  public dias: number[] = [];
  public diasMap = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  agInit(params: any): void {
    this.dias = params.data.dias;
  }
  
  ngOnInit(): void {
    if (this.diasModal.length > 0) {
      this.dias = this.diasModal;
    }
  }
  toggleDia(index: number) {
    this.dias[index] = this.dias[index] === 1 ? 0 : 1;
  }
}

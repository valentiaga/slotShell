import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { PremiosService } from '../../services/premios/premios.service';
import { Premio } from '../../interfaces/premio';
import {
  CellValueChangedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  GetRowIdFunc,
  GetRowIdParams
} from 'ag-grid-community';
import { HttpClientModule } from '@angular/common/http';
import { DiasCellRendererComponent } from '../../components/dias-cell-renderer/dias-cell-renderer.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    AgGridModule,
    RouterModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ModalComponent
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent {
  constructor(public premiosService: PremiosService) {}
  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 50, 100];
  idEmpresa = 1;
  displayFilterRow = false;

  // contentModal: ModalContent = MODAL_ESTRUCTURA.INSUMO;

  showModal: boolean = false;
  showProcesarModal: boolean = false;
  showFormulaModal: boolean = false;

  themeClass = 'ag-theme-quartz-dark';
  private gridApi: GridApi<any> | undefined;
  rowData: Premio[] = [
    {
      id_premio: 1,
      identificacion: 'Premio A',
      display: '10k',
      is_activo: true,
      hora_inicio: '08:00',
      hora_fin: '10:00',
      dias: [1, 1, 1, 1, 0, 0, 0],
    },
    {
      id_premio: 2,
      identificacion: 'Premio B',
      display: '20k',
      is_activo: false,
      hora_inicio: '09:00',
      hora_fin: '11:00',
      dias: [0, 1, 1, 0, 1, 0, 0],
    },
    {
      id_premio: 3,
      identificacion: 'Premio C',
      is_activo: true,
      display: '100k',
      hora_inicio: '10:00',
      hora_fin: '12:00',
      dias: [1, 1, 1, 1, 1, 1, 1],
    },
  ];

  colDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id_premio',
      flex: 1,
      minWidth: 150,
      editable: true,
      filter: "agNumberColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      headerName: 'Nombre',
      field: 'identificacion',
      flex: 1,
      minWidth: 150,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      headerName: 'Display',
      field: 'display',
      flex: 1,
      minWidth: 150,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      headerName: 'Activo?',
      field: 'is_activo',
      flex: 1,
      minWidth: 150,
      editable: false,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
      cellRenderer: (params: ICellRendererParams) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = params.value;
        checkbox.disabled = false;
        return checkbox;
      },
    },
    {
      headerName: 'Días',
      field: 'dias',
      flex: 1,
      minWidth: 250,
      cellRenderer: DiasCellRendererComponent,
      editable: false,
    },
    {
      headerName: 'Hora inicio',
      field: 'hora_inicio',
      flex: 1,
      minWidth: 250,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      headerName: 'Hora fin',
      field: 'hora_fin',
      flex: 1,
      minWidth: 250,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      width: 60,
      cellRenderer: (params: ICellRendererParams) => {
        const rowId = params.data.id_premio;
        const button = document.createElement('button');
        button.innerHTML = `<img src="/assets/svg/delete.svg" alt="Delete" style="width: 24px; height: 24px;">`;
        button.addEventListener('click', () => {
          this.deleteRow(rowId);
        });
        return button;
      },
      filter: false,
      sortable: false,
      editable: false,
    },
  ];

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.id_premio.toString();
  };

  showFloatingFilters() {
    // this.displayFilterRow = !this.displayFilterRow;

    // if (!this.displayFilterRow) {
    //     this.gridApi?.setFilterModel({});
    // }

    // this.colDefs.forEach(colDef => {
    //   colDef.floatingFilter = this.displayFilterRow;
    // });

    // this.gridApi?.setGridOption('columnDefs', this.colDefs);
    // this.gridApi?.refreshHeader();
  }

  handleFormSubmit(formData: any) {
    console.log('Recibo los datos! ', formData);
    this.agregarPremio(formData);
    this.closeModal();
  }

  agregarPremio(data: Premio): void {
    // this.premiosService.postPremio(this.idEmpresa, data).subscribe({
    //   next: (respuesta) => {
    //     this.premiosService.clearCache();
    //     console.log('Agregado con exito!', respuesta)
    //     this.loadData();
    //   },
    //   error: (error) => {
    //     console.error('Error al agregar el insumo:', error);
    //   }
    // });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.loadData();
  }

  loadData() {
    // this.rowData = this.mockRowData()
    // this.premiosService.getPremios(this.idEmpresa).subscribe({
    //   next: (data) => {
    //     this.gridApi?.setGridOption('rowData', data.body);
    //   },
    //   error: (error) => {
    //     console.error('Error al obtener datos:', error);
    //   },
    //   complete: () => {
    //     console.log('Datos cargados exitosamente');
    //   }
    // });
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    //tambien necesitamos servicio
  }

  deleteRow = (rowId: number) => {
    if (this.gridApi) {
      let alertRow = this.gridApi.getRowNode(rowId.toString());

      if (alertRow) {
        this.premiosService.deleteRow(this.idEmpresa, rowId).subscribe(
          (response) => {
            this.loadData();
          },
          (error) => {
            console.error('Error al eliminar el premio:', error);
          }
        );
      } else {
        console.warn(`No se encontró ninguna fila con id ${rowId}`);
      }
    }
  }

  closeModal() {
    this.showModal = false;
    this.showProcesarModal = false;
  }

  closeModalFormula() {
    this.showFormulaModal = false;
  }
}

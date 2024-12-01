import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { CounterService } from '../../services/counter/counter.service';
import { environments } from '../../../assets/environment';

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
  styleUrl: './admin-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPageComponent implements OnInit{
  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 50, 100];
  displayFilterRow = false;
  showModal: boolean = false;
  showProcesarModal: boolean = false;
  showFormulaModal: boolean = false;
  themeClass = 'ag-theme-quartz-dark';
  private gridApi: GridApi<any> | undefined;
  rowData: Premio[] = [];
  counterSignal = this.counterService.getCounter();  // Get the signal


  colDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id_prize',
      flex: 1,
      minWidth: 80,
      editable: false,
      filter: "agNumberColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      headerName: 'Nombre',
      field: 'title',
      flex: 1,
      minWidth: 150,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      headerName: 'Monto',
      field: 'amount',
      flex: 1,
      minWidth: 150,
      editable: true,
      filter: "agNumberColumnFilter",
      floatingFilter: this.displayFilterRow,
      cellRenderer: (params: any) => `$ ${params.value}`    
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
      headerName: 'Contador',
      field: 'spins',
      flex: 1,
      minWidth: 150,
      editable: true,
      filter: "agNumberColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      headerName: 'Activo?',
      field: 'is_active',
      flex: 1,
      minWidth: 150,
      editable: false,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
      cellRenderer: (params: ICellRendererParams) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = params.value;
      
        checkbox.addEventListener('change', () => {
          const newValue = checkbox.checked;
          if (params.colDef?.field) {
            params.data[params.colDef.field] = newValue;
            params.api.refreshCells({ rowNodes: [params.node], force: true });
      
            this.onCellValueChanged({
              data: params.data,
              colDef: params.colDef,
              rowIndex: params.data.id_prize,
              oldValue: params.value,
              newValue: newValue,
            } as CellValueChangedEvent);
          }
        });
      
        return checkbox;
      },
    },
    {
      headerName: 'Días',
      field: 'active_days',
      flex: 1,
      minWidth: 300,
      cellRenderer: DiasCellRendererComponent,
      editable: false,
      cellRendererParams: {
        onDaysChanged: (newDays: string, params: any) => {
          params.node.setDataValue('active_days', newDays);
          
          this.onCellValueChanged({
            data: { ...params.data, active_days: newDays },
            colDef: params.colDef,
            rowIndex: params.rowIndex,
          } as CellValueChangedEvent);
        },
      },
    },
    {
      headerName: 'Hora inicio',
      field: 'start_time',
      flex: 1,
      minWidth: 250,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      headerName: 'Hora fin',
      field: 'end_time',
      flex: 1,
      minWidth: 250,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
    },
    {
      width: 60,
      cellRenderer: (params: ICellRendererParams) => {
        const rowId = params.data.id_prize;
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

  constructor(
    public premiosService: PremiosService,
    public counterService: CounterService,
    private router: Router
  ) {}

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.id_prize.toString();
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
    this.premiosService.postPremio(data).subscribe({
      next: (respuesta) => {
        this.premiosService.clearCache();
        console.log('Agregado con exito!', respuesta)
        this.loadData();
      },
      error: (error) => {
        console.error('Error al agregar el premio:', error);
      }
    });
  }

  ngOnInit() {
    this.counterService.getCounter();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.loadData();
  }

  loadData() {
    this.premiosService.getPremios().subscribe({
      next: (data) => {
        this.gridApi?.setGridOption('rowData', data.body);
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
      },
      complete: () => {
        console.log('Datos cargados exitosamente');
      }
    });
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    if (event.oldValue === event.newValue) {
      return;
    }
    
    this.premiosService.putPrize(event.data).subscribe({
      next: () => {
        this.premiosService.clearCache();
        this.loadData();
      },
      error: (error) => {
        console.error('Error al agregar el premio:', error);
      }
    });
  }

  deleteRow = (rowId: number) => {
    if (this.gridApi) {
      let alertRow = this.gridApi.getRowNode(rowId.toString());

      if (alertRow) {
        this.premiosService.deleteRow(rowId).subscribe({
          next: (respuesta) => {
            this.premiosService.clearCache();
            console.log('Eliminado con exito!', respuesta)
            this.loadData();
          },
          error: (error) => {
            console.error('Error al eliminar el premio:', error);
          }
        });
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

  redirect() {
    const idAuth = localStorage.getItem('idAuth');
    
    if (idAuth) {
      switch (idAuth) {
        case '1':
          this.router.navigate(['/garay']);
          break;
        case '2':
          this.router.navigate(['/matheu']);
          break;
        case '3':
          this.router.navigate(['/roca']);
          break;
        default:
          console.warn('idAuth no válido');
          break;
      }
    } else {
      console.warn('idAuth no encontrado en localStorage');
    }
  }  
}

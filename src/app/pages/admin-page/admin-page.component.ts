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
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ToastService } from '../../services/toast/toast.service';
import { IsActiveCellRendererComponent } from '../../components/is-active-cell-renderer/is-active-cell-renderer.component';
import { DeleteButtonCellRendererComponent } from '../../components/delete-button-cell-renderer/delete-button-cell-renderer.component';

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
    ModalComponent,
    NgxUiLoaderModule
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
  themeClass = 'ag-theme-quartz-dark';
  private gridApi: GridApi<any> | undefined;
  rowData: Premio[] = [];
  counterSignal = this.counterService.getCounter();

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
      cellRenderer: IsActiveCellRendererComponent,
      cellRendererParams: {
        context: { componentParent: this },
      }
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
      headerName: 'Acciones',
      width: 60,
      cellRenderer: DeleteButtonCellRendererComponent,
      cellRendererParams: {
        onDelete: (rowId: number) => {
          this.deleteRow(rowId);
        },
      },
      filter: false,
      sortable: false,
      editable: false,
    }
  ];

  constructor(
    public premiosService: PremiosService,
    public counterService: CounterService,
    private router: Router,
    private toastService: ToastService
  ) {}

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.id_prize.toString();
  };

  handleFormSubmit(formData: any) {
    console.log('Recibo los datos! ', formData);
    this.agregarPremio(formData);
    this.closeModal();
  }

  agregarPremio(data: Premio): void {
    this.premiosService.postPremio(data).subscribe({
      next: () => {
        this.toastService.showToast('success', 'Premio agregado con éxito.');
        this.premiosService.clearCache();
        this.loadData();
      },
      error: () => {
        this.toastService.showToast('error', 'Ocurrió un error al agregar el premio.');
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
        this.rowData = data.body;
        this.gridApi?.setGridOption('rowData', data.body);
      },
      error: (error) => {
        this.toastService.showToast('error', 'Ocurrió un error al obtener los premios.');
        console.error('Error al obtener datos:', error);
      }
    });
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    if (event.oldValue === event.newValue) {
      return;
    }
    
    this.premiosService.putPrize(event.data).subscribe({
      next: () => {
        this.toastService.showToast('success', 'Premio actualizado con éxito.');
        this.premiosService.clearCache();
        this.loadData();
      },
      error: (error) => {
        this.toastService.showToast('error', 'Ocurrió un error al modificar el premio.');
        console.error('Error al modificar el premio:', error);
      }
    });
  }

  deleteRow = (rowId: number) => {
    if (this.gridApi) {
      const rowNode = this.gridApi.getRowNode(rowId.toString());

      if (rowNode) {
        
        this.premiosService.deleteRow(rowId).subscribe({
          next: () => {
            this.gridApi?.applyTransaction({ remove: [rowNode.data] });
            this.premiosService.clearCache();
            this.toastService.showToast('success', 'Premio eliminado con éxito.');
          },
          error: (error) => {
            this.toastService.showToast('error', 'Ocurrió un error al eliminar el premio.');
            console.error('Error al eliminar el premio:', error);
          }
        });
      } else {
        console.warn(`No se encontró ninguna fila con id ${rowId}`);
      }
    }
  };  

  closeModal() {
    this.showModal = false;
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

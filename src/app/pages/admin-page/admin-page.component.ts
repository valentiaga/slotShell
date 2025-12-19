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
export class AdminPageComponent implements OnInit {
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
      headerName: 'Monto/Premio',
      field: 'amount',
      flex: 1,
      minWidth: 150,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: this.displayFilterRow,
      cellRenderer: (params: any) => {
        // Si tiene amount, mostrar como monto monetario
        if (params.data.amount !== null && params.data.amount !== undefined) {
          return `${params.data.amount}`;
        }
        // Si no tiene amount pero tiene description, mostrar la descripción
        if (params.data.description) {
          return params.data.description;
        }
        return 'N/A';
      },
      valueGetter: (params: any) => {
        if (params.data.amount !== null && params.data.amount !== undefined) {
          return params.data.amount;
        }
        if (params.data.description) {
          return params.data.description;
        }
        return '';
      }
    },
    {
      headerName: 'Display',
      field: 'display',
      flex: 1,
      minWidth: 150,
      editable: (params) => {
        const regex = /\bprizes\/\b/;
        return !regex.test(params.data.display);

      },
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
    public readonly premiosService: PremiosService,
    public readonly counterService: CounterService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {}

  /**
   * Obtiene el ID único de cada fila para ag-Grid
   * @param params - Parámetros de la fila
   * @returns ID de la fila como string
   */
  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.id_prize.toString();
  };

  /**
   * Maneja el envío del formulario del modal
   * @param formData - Datos del formulario
   */
  handleFormSubmit(formData: any): void {
    this.addPrize(formData);
    this.closeModal();
  }

  /**
   * Agrega un nuevo premio
   * @param data - Datos del premio a agregar
   */
  private addPrize(data: Premio): void {
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

  /**
   * Inicializa el componente obteniendo el contador
   */
  ngOnInit(): void {
    this.counterService.getCounter();
  }

  /**
   * Maneja el evento cuando la grilla está lista
   * @param params - Parámetros del evento GridReady
   */
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.loadData();
  }

  /**
   * Carga los datos de premios en la grilla
   */
  loadData(): void {
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

  /**
   * Maneja el cambio de valor en una celda de la grilla
   * @param event - Evento de cambio de valor de celda
   */
  onCellValueChanged(event: CellValueChangedEvent): void {
    if (this.hasValueChanged(event)) {
      const dataToSend = this.prepareDataForUpdate(event);
      this.updatePrize(dataToSend);
    }
  }

  /**
   * Verifica si el valor de la celda realmente cambió
   * @param event - Evento de cambio de valor
   * @returns true si el valor cambió
   */
  private hasValueChanged(event: CellValueChangedEvent): boolean {
    return event.oldValue !== event.newValue;
  }

  /**
   * Prepara los datos para actualizar según el campo modificado
   * @param event - Evento de cambio de valor
   * @returns Datos preparados para enviar
   */
  private prepareDataForUpdate(event: CellValueChangedEvent): any {
    const dataToSend = { ...event.data };
    
    if (event.colDef.field === 'amount') {
      this.handleAmountFieldChange(dataToSend, event.newValue);
    }
    
    return dataToSend;
  }

  /**
   * Maneja el cambio en el campo de monto/premio
   * @param dataToSend - Datos a enviar
   * @param newValue - Nuevo valor del campo
   */
  private handleAmountFieldChange(dataToSend: any, newValue: any): void {
    if (this.isNumericValue(newValue)) {
      dataToSend.amount = parseFloat(newValue.toString().trim());
      dataToSend.description = null;
    } else {
      dataToSend.amount = null;
      dataToSend.description = newValue;
    }
  }

  /**
   * Verifica si un valor es numérico puro
   * @param value - Valor a verificar
   * @returns true si es un número válido
   */
  private isNumericValue(value: any): boolean {
    const trimmedValue = value.toString().trim();
    const numericValue = parseFloat(trimmedValue);
    
    return !isNaN(numericValue) && 
           isFinite(numericValue) && 
           numericValue.toString() === trimmedValue;
  }

  /**
   * Actualiza un premio en el servidor
   * @param data - Datos del premio a actualizar
   */
  private updatePrize(data: any): void {
    this.premiosService.putPrize(data).subscribe({
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


  /**
   * Elimina una fila de la grilla
   * @param rowId - ID de la fila a eliminar
   */
  deleteRow = (rowId: number): void => {
    if (!this.gridApi) {
      return;
    }

    const rowNode = this.gridApi.getRowNode(rowId.toString());

    if (rowNode) {
      this.deletePrizeFromServer(rowId, rowNode);
    } else {
      console.warn(`No se encontró ninguna fila con id ${rowId}`);
    }
  };

  /**
   * Elimina un premio del servidor y actualiza la grilla
   * @param rowId - ID del premio a eliminar
   * @param rowNode - Nodo de la fila en la grilla
   */
  private deletePrizeFromServer(rowId: number, rowNode: any): void {
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
  }  

  /**
   * Cierra el modal de agregar/editar premio
   */
  closeModal(): void {
    this.showModal = false;
  }

  /**
   * Redirige a la página de la estación correspondiente
   */
  redirect(): void {
    const idAuth = localStorage.getItem('idAuth');
    
    if (!idAuth) {
      console.warn('idAuth no encontrado en localStorage');
      return;
    }

    const route = this.getRouteByStationId(idAuth);
    
    if (route) {
      this.router.navigate([route]);
    } else {
      console.warn('idAuth no válido');
    }
  }

  /**
   * Obtiene la ruta correspondiente al ID de estación
   * @param stationId - ID de la estación
   * @returns Ruta de navegación o null
   */
  private getRouteByStationId(stationId: string): string | null {
    const routes: { [key: string]: string } = {
      '1': '/garay',
      '2': '/matheu',
      '3': '/roca'
    };
    
    return routes[stationId] || null;
  }
}

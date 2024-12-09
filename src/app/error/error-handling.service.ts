import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorComponent } from './error/error.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  showError(message: string): void {
    this.snackBar.openFromComponent(ErrorComponent, {
      data: message,
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
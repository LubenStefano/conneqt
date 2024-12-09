import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule], // Import necessary modules
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'] // Corrected from styleUrl to styleUrls
})
export class ErrorComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
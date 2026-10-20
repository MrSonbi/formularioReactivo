import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonInput, IonButton, IonSpinner, AlertController, IonToggle } from '@ionic/angular';
import { jsPDF } from 'jspdf';

// Validador: no permite fechas anteriores a hoy
function fechaNoAnterior(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const hoy = new Date().toISOString().split('T')[0];
  return control.value < hoy ? { fechaPasada: true } : null;
}

@Component({
  selector: 'app-home',
  templateUrl: 'RegistroPage.page.html',
  styleUrls: ['RegistroPage.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, ReactiveFormsModule, IonList, IonItem, IonInput, IonButton, IonSpinner, IonToggle],
})
export class RegistroPage {
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);

  public isSubmitting = signal<boolean>(false);
  public datosEnviados = signal<any>(null);
  public hoy = new Date().toISOString().split('T')[0];

  // Definición del formulario reactivo fuertemente tipado
  // Uso de Signals (visto en sesiones anteriores) para gestionar el estado de envío
  public registroForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]],
    // Patrón: mínimo 8 caracteres, al menos una letra y un número.
    calendario: ['', [Validators.required, fechaNoAnterior]],
  });

  // Getter de conveniencia para acceder a los controles en la vista
  get f() { return this.registroForm.controls; }

  public toggleDark(event: CustomEvent) {
    document.documentElement.classList.toggle('ion-palette-dark', event.detail.checked);
  }

  public async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched(); // Fuerza la visualización de errores
      return;
    }
    this.isSubmitting.set(true);
    try {
      const payload = { ...this.registroForm.value, password: btoa(this.registroForm.value.password) };
      console.log('Payload a enviar a la API REST:', payload);
      // Simulación de llamada asíncrona a un backend HTTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Aquí se implementaría: this.httpClient.post('url', formData).subscribe(...)
      this.datosEnviados.set(payload);
      this.registroForm.reset();
      const alert = await this.alertCtrl.create({
        header: '¡Formulario enviado con éxito!',
        message: '(El formulario se ha enviado correctamente)',
        buttons: ['Aceptar'],
      });
      await alert.present();
    } catch (error) {
      console.error('Error al persistir los datos', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
  public descargarPdf(): void {
    const d = this.datosEnviados();
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Datos del formulario', 20, 20);
    doc.setFontSize(12);
    doc.text(`Nombre: ${d.nombre}`, 20, 35);
    doc.text(`Email: ${d.email}`, 20, 45);
    doc.text(`Fecha: ${d.calendario}`, 20, 55);
    doc.save('formulario.pdf');
  }
}

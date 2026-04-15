import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
   imports: [IonicModule],
})
export class AppComponent {
  constructor(
    private platform: Platform
  ) {
    this.platform.ready().then(() => { this.configureStatusBar(); });
  }

  //Agregar statusBar
  async configureStatusBar() {
    if(!Capacitor.isNativePlatform() ) return

    try {
      await StatusBar.setStyle({ style: Style.Dark }); 
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    
    } catch (error) {
      console.error('Error configurando StatusBar:', error)
    }
    
  }

}
import { ChangeDetectorRef, Component, ElementRef, HostListener } from '@angular/core';
import { Amostra } from './models/amostra';
import { signosCombinacoes } from './data/textos';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'zodiac-signatistic';
  amostra:Amostra|null=null;
  iconGener = '';
  iconLocal = ['', '', '']
  subtitle = ['Social/Lazer', 'Conjugal', 'Pofissional', 'Espiritual'];
  filtro = false;


  constructor(
    private el:ElementRef,
    private cdr: ChangeDetectorRef
  ){}

  getFiltro(){
    this.filtro = true;
    this.iconGener = '';
    if(this.amostra?.filtragem.genero == 'males'){
      this.amostra.filtragem.genero='Masculino';
      this.iconGener = '';
    }else if(this.amostra?.filtragem.genero == 'females') {
      this.amostra.filtragem.genero='Feminino';
      this.iconGener = '';
    }
    this.amostra?.filtragem.genero == ('male') ? 'Masculino' : ('females') ? 'Feminino' : this.amostra?.filtragem.genero;
    this.cdr.detectChanges();
  }
  getText():string[]{
    (this.el.nativeElement as HTMLElement).scrollTop = 0;
    if(this.amostra && !this.filtro){ this.getFiltro(); }
    const ids = [(this.amostra as Amostra).signoUsuario.id, (this.amostra as Amostra).signoCombinacao.id].sort((a,b)=>a-b);
    const key = ids[0]+'x'+ids[1];
    return [
      signosCombinacoes[key].textSocialLeisure,
      signosCombinacoes[key].textConjugal,
      signosCombinacoes[key].textProfessional,
      signosCombinacoes[key].textSpiritual,
    ];
    
  }
}

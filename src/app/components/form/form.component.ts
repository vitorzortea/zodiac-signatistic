import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { forkJoin } from 'rxjs';
import { Lugar, Periodo } from '../../models/ibge';
import { CheckBox } from '../../models/checkbox';
import { Amostra, Signo } from '../../models/amostra';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements AfterViewInit {
  @Output() amostra = new EventEmitter<Amostra>();
  
  hoje = new Date();
  hojeString = this.hoje.toISOString().split('T')[0];
  periodo='';
  
  private signos:Signo[];
  private qualidades:string[][];
  private idQualidades:number[]=[];

  form:FormGroup<any>;
  cidade:Lugar[]=[];
  estado:Lugar[]=[];
  ageGroups:{code:string,min:number,max:number}[];
  
  constructor(
    private fb:FormBuilder,
    private crud:CrudService<any>,
    private el:ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef
  ){
    //Setar signos e qualidades
    this.signos=[
      { id:0, nome: "Áries",        inicio: new Date(0,  2, 21),   final: new Date(0,  3, 19) },
      { id:1, nome: "Touro",        inicio: new Date(0,  3, 20),   final: new Date(0,  4, 20) },
      { id:2, nome: "Gêmeos",       inicio: new Date(0,  4, 21),   final: new Date(0,  5, 20) },
      { id:3, nome: "Câncer",       inicio: new Date(0,  5, 21),   final: new Date(0,  6, 22) },
      { id:4, nome: "Leão",         inicio: new Date(0,  6, 23),   final: new Date(0,  7, 22) },
      { id:5, nome: "Virgem",       inicio: new Date(0,  7, 23),   final: new Date(0,  8, 22) },
      { id:6, nome: "Libra",        inicio: new Date(0,  8, 23),   final: new Date(0,  9, 22) },
      { id:7, nome: "Escorpião",    inicio: new Date(0,  9, 23),   final: new Date(0, 10, 21) },
      { id:8, nome: "Sagitário",    inicio: new Date(0, 10, 22),   final: new Date(0, 11, 21) },
      { id:9, nome: "Capricórnio",  inicio: new Date(0, 11, 22),   final: new Date(0, 11, 31) },
      { id:9, nome: "Capricórnio",  inicio: new Date(0,  0,  1),   final: new Date(0,  0, 19) },
      { id:10, nome: "Aquário",     inicio: new Date(0,  0, 20),   final: new Date(0,  1, 18) },
      { id:11, nome: "Peixes",      inicio: new Date(0,  1, 19),   final: new Date(0,  2, 20) },
    ];
    this.qualidades=[
      ["Coragem",         "Energia",       "Ousadia",         "Impulsividade"],
      ["Docilidade",      "Honestidade",   "Disciplina",      "Estabilidade"],
      ["Versatilidade",   "Abertura",      "Intelecto",       "Comunicação"],
      ["Emoção",          "Empatia",       "Proteção",        "Intuição"],
      ["Engenhosidade",   "Generosidade",  "Avidez",          "Liderança"],
      ["Meticulosidade",  "Análise",       "Paciência",       "Organização"],
      ["Diplomacia",      "Justiça",       "Utopia",          "Charme"],
      ["Intensidade",     "Estratégia",    "Resiliência",     "Mistério"],
      ["Aventura",        "Adaptação",     "Visão",           "Otimismo"],
      ["Coerência",       "Ambição",       "Confiabilidade",  "Pragmatismo"],
      ["Inovação",        "Cultura",       "Harmonia",        "Humanitarismo"],
      ["Solidariedade",   "Criatividade",  "Fugacidade",      "Sensibilidade"],
    ];
    this.ageGroups = [
      { code: '58[1140]', min: 0, max: 4 },
      { code: '58[1141]', min: 5, max: 9 },
      { code: '58[1142]', min: 10, max: 14 },
      { code: '58[1143]', min: 15, max: 19 },
      { code: '58[1144]', min: 20, max: 24 },
      { code: '58[1145]', min: 25, max: 29 },
      { code: '58[1146]', min: 30, max: 34 },
      { code: '58[1147]', min: 35, max: 39 },
      { code: '58[1148]', min: 40, max: 44 },
      { code: '58[1149]', min: 45, max: 49 },
      { code: '58[1150]', min: 50, max: 54 },
      { code: '58[1151]', min: 55, max: 59 },
      { code: '58[1152]', min: 60, max: 64 },
      { code: '58[1153]', min: 65, max: 69 },
      { code: '58[1154]', min: 70, max: 74 },
      { code: '58[1155]', min: 75, max: 79 },
      { code: '58[2503]', min: 80, max: Infinity }
  ];

    //Formar Formulário
    this.form = this.fb.group({
      data: [null, Validators.required],
      idade: [{value: false, disabled:true}],
      genero: ['total'],
      uf: [null],
      cidade: [{value: null, disabled:true}],
      qualidades: [this.EmbaralharQualidades() as CheckBox[], [Validators.required, qualidadesValidator()]],
    });
  }

  ngAfterViewInit(): void {
    
    //O ultimo periodo do IBGE
    this.crud.get('https://servicodados.ibge.gov.br/api/v3/agregados/6407/periodos').subscribe(
      (e:Periodo[])=>{
        this.periodo = e[e.length-1].id;
        this.signos.map(e=>{e.inicio.setFullYear(Number(this.periodo)); e.final.setFullYear(Number(this.periodo)); return e;})
      }
    );

    //Listar Estados do IBGE
    this.crud.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').subscribe((e:any[])=>{
      this.estado = [{id:0, nome:'Todo Brasil', regiao:null, sigla:''}, ...e.sort((a,b)=>(a.nome<b.nome)? -1 : 1)];
      this.cdr.detectChanges();
    });

    //Função para manipular o DOOM | Consegue fazer só com CSS, mas Angular não aprova o :has()
    Array.from(this.el.nativeElement.getElementsByTagName('input')).forEach(e=>{
      e.addEventListener('focus', ()=>{e.parentElement?.classList.add('in-focus')});
      e.addEventListener('blur', ()=>{e.parentElement?.classList.remove('in-focus')});
    })
  }
  
  EmbaralharQualidades():CheckBox[]{
    const newList = this.qualidades.map(e=>this.Embaralhar(e));
    const result = [] as CheckBox[];

    for (let i=0; i<=2; i++) {
      newList.forEach((e,j)=>{
        result.push({id:j, label:e[i], value:false} as CheckBox);
      });
    }
    return this.Embaralhar(result);
  }

  Embaralhar(array: any[]){ 
    for (let i = array.length - 1; i > 0; i--) { 
  const j = Math.floor(Math.random() * (i + 1)); 
  [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  };


  mudarEstado(){
    const uf = this.form.value.uf.split(',')[0]
    this.form.get('cidade')?.reset();
    if(uf != 0){
      this.crud.get(`https://servicodados.ibge.gov.br/api/v3/agregados/7109/localidades/N6`).subscribe((e:Lugar[])=>{
        this.cidade = [
          {id:'', regiao:null, sigla:'', nome:'Todo Estado'},
          ...e.filter((f:Lugar)=>(f.id[0]+f.id[1])==uf)
        ];
        this.form.get('cidade')?.enable()
      });
    }else{
      this.cidade = [];
      this.form.get('uf')?.reset()
      this.form.get('cidade')?.reset()
      this.form.get('cidade')?.disable()
    }
  }

  habilitarGrupodeIdade(){
    const idade = this.form.get('idade');
    const reset = ()=>{ idade?.reset(); idade?.disable(); };

    return (this.form.value.data) ? idade?.enable() : reset();
  }

  clicarQualidade(i:number){
    if(this.idQualidades.includes(i)){
      this.idQualidades = this.idQualidades.filter(e=>e!=i);
      this.form.value.qualidades[i].value = false;
      return;
    }
    this.idQualidades.push(i);
    this.form.value.qualidades[i].value = true;

    if(this.idQualidades.length > 3){
      this.form.value.qualidades[this.idQualidades[0]].value = false;
      this.idQualidades.shift();
    }
  }

  submit(){
    //Restar o apontamento do array (array não é um var, é um apontamento)
    this.form.get('qualidades')?.setValue(this.form.get('qualidades')?.value)
    this.form.markAllAsTouched();
    console.log(this.form.value);
    if(this.form.valid){
      let [{...signoUsuario}, {...signoCombinacao}] = this.getSignos();
  
      //Star filtros: Idade, Genero e Lugar
      const genero = this.getGenero();
      const grupoIdade = this.getGrupoIdade();
      let local = 'N1[all]';
      local += (this.form.value.uf) ? '|N3['+this.form.value.uf.split(',')[0]+']':'';
      local += (this.form.value.cidade) ? '|N6['+this.form.value.cidade.split(',')[0]+']':'';

      const observables = [
        //Populção IBGE
        //->Total por local
        this.crud.get(`https://servicodados.ibge.gov.br/api/v3/agregados/6786/periodos/${this.periodo}/variaveis/606?localidades=${local}`),
        //->Total por local e genero e grupo de idade
        this.crud.get(
          (!grupoIdade)
          ?`https://servicodados.ibge.gov.br/api/v3/agregados/6786/periodos/${this.periodo}/variaveis/8412?localidades=${local}&classificacao=${genero}`
          :`https://servicodados.ibge.gov.br/api/v3/agregados/6706/periodos/${this.periodo}/variaveis/8413?localidades=${local}&classificacao=${genero}|${grupoIdade.code}`
        ),
        
        //População Signo (population.io)
        this.crud.get(`https://d6wn6bmjj722w.population.io:443/1.0/population/Brazil/${signoCombinacao.inicio.toISOString().split('T')[0]}/`),
        this.crud.get(`https://d6wn6bmjj722w.population.io:443/1.0/population/Brazil/${signoCombinacao.final.toISOString().split('T')[0]}/`),
        this.crud.get(`https://d6wn6bmjj722w.population.io:443/1.0/population/Brazil/${this.periodo}-01-01/`),
        this.crud.get(`https://d6wn6bmjj722w.population.io:443/1.0/population/Brazil/${this.periodo}-12-31/`),
      ]

      //Subscrever em todos os Observes. Feito com o forkJoin para evitar erros com asinc
      forkJoin(observables).subscribe(([total, amostra, psi,psf, pti, ptf])=>{
        const porcetagemSigno = (psf.total_population.population-psi.total_population.population)*100/(ptf.total_population.population-pti.total_population.population);
        const totalAmostra = (total[0].resultados[0].series as any[]).map((e)=> parseFloat(e.serie[this.periodo])*1000);
        const porcentagemAmostra = (amostra[0].resultados[0].series as any[]).map((e)=>e.serie[this.periodo]).map(Number);
        const porcentagemfinal= porcentagemAmostra.map(e=>parseFloat(((porcetagemSigno/100)*(e/100)*100).toFixed(2)));
        const Amostrafinal= porcentagemfinal.map((e,i)=>Number(((totalAmostra[i]*e)/100).toFixed(0)));
        const nomes= ['Brasil', this.form.value.uf?.split(',')[1], this.form.value.cidade?.split(',')[1]];
        const locais = Amostrafinal.map((e,i)=>{return {nome:nomes[i], populacao:e, porcentagem:porcentagemfinal[i]}});
        this.amostra.emit({
          signoUsuario,
          signoCombinacao,
          filtragem: { idade:(grupoIdade)?grupoIdade.min+'-'+grupoIdade.max:'Todas Idades', genero:(this.form.value.genero == "total")?'Todos Genêros':this.form.value.genero},
          locais:locais
        });
        console.log(
          'Resultado: ',
          {
            signos:{
              nascimento:this.form.value.data,
              signoUsuario,
              signoCombinacao,
            },
            porcentagem:{
              porcetagemSigno,
              porcentagemAmostra,
              porcentagemfinal,
            },
            popucao:{
              totalAmostra,
              Amostrafinal
            }
          }
        );
      })
    }
  }

  getGrupoIdade():{code: string; min: number; max: number;}|null{
    if(this.form.value.idade){
      const idade = this.hoje.getFullYear() - new Date(this.form.value.data).getFullYear();
      for(const group of this.ageGroups){if(idade>=group.min && idade<=group.max){return group;}}
    }
    return null;
  }
  getGenero(){
    const generoHub:{[key:string]:string} = { 'total':'2[6794]', 'males':'2[4]', 'females':'2[5]', };
    return generoHub[this.form.value.genero];
  }
  getSignos():Signo[]{
    //SIGNO DO USUÁRIO  
    let signoPrincipal: Signo | undefined;
    const [ano, mes, dia]:number[] = this.form?.value.data.split('-').map(Number);
    for (let i = 0; i <= 12; i++) {
      const inicio = [(this.signos[i].inicio.getMonth()+1), this.signos[i].inicio.getDate()];
      const final = [(this.signos[i].final.getMonth()+1), this.signos[i].final.getDate()];

      if((mes>inicio[0] || mes==inicio[0]&&dia>=inicio[1]) && (mes<final[0] || mes==final[0]&&dia<=final[1])){
        signoPrincipal = this.signos[i];
      }
    }

    //SIGNO COM AS QUALIDADES
    let signoCombinacao:Signo|undefined;
    const getId=(a:number[], b:{value:boolean, id:number}):number[]=>{
      if(b.value&&!signoCombinacao) { (a.includes(b.id))? signoCombinacao=this.signos.find(e=>e.id==b.id) : a.push(b.id); }
      return a;
    };
    const escolhas = this.form.value.qualidades.reduce(getId, [] as number[]) as number[];

    //->Duas Qualidades do mesmo signo, então signo é compativel
    if (signoCombinacao !== undefined) { return [(signoPrincipal as Signo), (signoCombinacao as Signo)]; }

    
    //Cálculo das Distâncias Circulares do Signo
    escolhas.sort((a, b) => a - b);
    const dists = escolhas.map((e, i) => (escolhas[(i != escolhas.length - 1) ? i + 1 : 0] - e + 12) % 12);
    const index = dists.reduce((a, b, i, array) => { return b > array[a] ? i : a; }, 0);
    signoCombinacao = this.signos.find(e=>e.id==escolhas[index]);
    return [(signoPrincipal as Signo), (signoCombinacao as Signo)];
  }
}



export function qualidadesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nTrue = (control.value as {id:number, label:string, value:boolean}[]).filter(e=>e.value==true).length;
    return nTrue==3 ? null : { min: true };
  };
}
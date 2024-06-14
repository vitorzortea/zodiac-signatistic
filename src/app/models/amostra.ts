export type Amostra = {
    signoUsuario: Signo,
    signoCombinacao: Signo,
    filtragem:{idade:string, genero:string},
    locais:{nome:string, populacao:number, porcentagem:number}[]
}

export type Signo = {id:number, nome:string,inicio:Date;final:Date}
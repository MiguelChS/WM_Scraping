/**
 * Created by miguel on 2/6/17.
 */
class definirGenero {

    limpiarGenero(name){
        name = name.replace(new RegExp("[á]",'g'),"a");
        name = name.replace(new RegExp("[é]",'g'),"e");
        name = name.replace(new RegExp("[í]",'g'),"i");
        name = name.replace(new RegExp("[ó]",'g'),"o");
        name = name.replace(new RegExp("[ú]",'g'),"u");
        return name;
    }

    getGenero(name,ArrayGeneros){
        name = this.limpiarGenero(name);
        for(let i = 0; i < ArrayGeneros.length;i++){
            let nameAux = ArrayGeneros[i].nombre.toUpperCase();
            nameAux = ArrayGeneros[i].tipoName == 2 ? nameAux.replace(new RegExp(" ","g"),"\\s") : nameAux;
            let regex = new RegExp(`\\s${nameAux}\\s`);
            if(regex.test(` ${name.toUpperCase()} `)){
                return ArrayGeneros[i].genero;
            }
        }
        return null;
    }
}

module.exports = definirGenero;
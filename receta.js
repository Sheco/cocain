
class Receta {
    constructor(receta) {
        this.receta = receta;
    }

    consumir(nombre, cantidad) {
        let c = this.receta.recursos[nombre];
        if(c===undefined) {
            console.log(`No hay recurso para ${nombre}`);
            return false;
        }

        if((c.cantidad===undefined || c.cantidad>cantidad)) {
            if(c.cantidad!==undefined) 
                c.cantidad -= cantidad;
            c.consumido = c.consumido===undefined? cantidad: c.consumido+cantidad;

            return true;
        }
        console.log(`${c.cantidad}>${cantidad}`);
        console.log(`No se pudieron consumir ${cantidad.toFixed(2)} de ${nombre}`);
        return false;
    }

    preparar(total) {
        this.limpiar();
        console.log(`Preparando ${total} ${this.receta.nombre}`);
        for(let [nombre, cantidad] of Object.entries(this.receta.componentes.generales)) {
            if(!this.consumir(nombre, cantidad))
                return false;
        }

        for(let [nombre, cantidad] of Object.entries(this.receta.componentes.unidad)) {
            if(!this.consumir(nombre, cantidad*total))
                return false;
        }
        return true;
    }

    limpiar() {
        for(let [nombre, vars] of Object.entries(this.receta.recursos)) {
            vars.consumido = 0;
        }
    }

    reporte() {
        console.log('\nReporte...');
        let total = 0;
        for(let [nombre, vars] of Object.entries(this.receta.recursos)) {
            let src = require('./db/ingredientes/'+nombre);
            let costo = 0 ;
            
            if(!vars.costoFijoPagado)  {
                costo = src.costoFijo(vars);
                if(costo>0) {
                    vars.costoFijoPagado = true;
                }
            }

            costo += src.costoUnidad(vars)*vars.consumido;
            total += costo;

            console.log(`${nombre}: se usaron ${vars.consumido.toFixed(2)} ${src.unidad}: $${costo.toFixed(2)}`)

            
            if(vars.cantidad>0) {
                console.log(`* ${nombre} tiene una merma de ${vars.cantidad.toFixed(2)} ${src.unidad}`);
            }
        }
        console.log(`\nTotal: $${total.toFixed(2)}`);
        console.log('');
    }
}

module.exports = Receta;

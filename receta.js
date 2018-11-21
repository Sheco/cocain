
class Receta {
    constructor(nombre) {
        this.nombre = nombre;
        this.receta = require('./db/'+nombre);
        for(let [nombre, datos] of Object.entries(this.receta.recursos)) {
            try {
                let datos_db = require('./db/ingredientes/'+nombre);
                this.receta.recursos[nombre] = Object.assign(datos, datos_db);
            } catch(e) {
            }
        }
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
        console.log(`Preparando ${total} ${this.nombre}`);
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
            let costo = 0 ;
            
            if(!vars.costoFijoPagado)  {
                costo = (vars.costoFijo instanceof Function? 
                    vars.costoFijo(): 
                    vars.costoFijo
                ) || 0;
                if(costo>0) {
                    // marcar como pagado
                    vars.costoFijoPagado = true;
                }
            }
            costo += (vars.costoUnidad instanceof Function? 
                vars.costoUnidad(): 
                vars.costoUnidad*vars.consumido
            ) || 0;

            total+=costo;
            console.log(`${nombre}: se usaron ${vars.consumido.toFixed(2)} ${vars.unidad}: $${costo.toFixed(2)}`)

            
            if(vars.cantidad>0) {
                console.log(`* ${nombre} tiene una merma de ${vars.cantidad} ${vars.unidad}`);
            }
        }
        console.log(`\nTotal: $${total.toFixed(2)}`);
        console.log('');
    }
}

module.exports = Receta;

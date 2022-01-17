sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (d) {
            const date = new Date(d);
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd/MM/yyyy" });

            return oDateFormat.format(date);
        },
        formatDateTime: function (d) {
            const date = new Date(d);
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd/MM/yyyy HH:mm:ss" });

            return oDateFormat.format(date);
        },
        calcularHoras: function (fecha1, hora1, fecha2, hora2) {
            return this.calcularHoras(fecha1, hora1, fecha2, hora2);
        },
        calcularMinutos: function (fecha1, hora1, fecha2, hora2) {
            return (this.calcularHoras(fecha1, hora1, fecha2, hora2) * 24).toFixed(2);
        },
        generateCommand: function (param, value1, value2) {
            const isRange = value1 && value2;
            const valueSelected = !isRange ? value1 ? value1 : value2 : null;
            const valuesType = typeof value1;
            const operator = isRange ? `BETWEEN '${value1}' AND '${value2}'` : `EQ '${valueSelected}'`;

            return `(${param} ${operator})`;
        },
        formatBodegNumber: function (bodeg) {
            const num1 = parseInt(bodeg.CDBOD);
            const num2 = parseInt(bodeg.CAPES);

            return `${num1}(${num2})`;
        },
        formatDate: function (date) {

            var fecha=null;
            if(date){
            fecha= date.split("T")[0];
            fecha=fecha.split("-").reverse().join("/");          
            }

            return fecha;
        },
        formatHour: function (hour) {
            var hora=null;
            if(hour){
                hora= hour.split("T")[1];
                hora= hora.split(":")[0]+":"+hora.split(":")[1];     

            }
            return hora;
        }
    };
});

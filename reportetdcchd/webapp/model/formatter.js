sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (d) {
            const date = new Date(d);
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd/MM/yyyy" });

            return oDateFormat.format(date);
        },
        generateCommand: function (param, value1, value2) {
            const isRange = value1 && value2;
            const valueSelected = !isRange ? value1 ? value1 : value2 : null;
            const valuesType = typeof value1;
            const operator = isRange ? `BETWEEN '${value1}' AND '${value2}'` : `EQ '${valueSelected}'`;

            return `(${param} ${operator})`;
        }
    };
});
console.log("archivo util");

const funcionCabeceras = (objs) => {
    const cabs = new Array();
    for (let i = 0; i < objs.length; i++) {
        const obj = objs[i];
        for (const key in obj) {
            const attrName = key;
            const attrValue = obj[key];
            //Ocultamos el atributo URL, para no ser mostrado en la vista EJS
            if (attrName === "url" ) {
            } else {
                cabs.push(attrName);
            }
        }
    }
    return cabs;
};


module.exports = {
    funcionCabeceras,
};

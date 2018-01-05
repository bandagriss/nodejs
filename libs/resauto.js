var resauto =
    {
        tables: [],
        addModels: function (arrayModels) {
            this.tables = arrayModels;
        }
    };
resauto.setSequelize = function (sec) {
    resauto.Sequelize = sec;
};
resauto.buscarLLavePrimaria = function (modelTabla, callbackRes) {
    modelTabla.describe().then(function (schema) {
        return Object.keys(schema).filter(function (field) {
            return schema[field].primaryKey;
        });
    }).tap(function (data) {
        //        console.log("PrimaryKey",data[0]);
        callbackRes(data[0]);
    });
};

resauto.findModel = function (modelName, method) {
    var tableItem = resauto.tables.find(function (item) {
        return item.model.name === modelName;
    });
    if (tableItem !== undefined) {
        if (tableItem.accept_request.indexOf(method) !== -1)
            return tableItem;
        throw "Tipo de peticion [" + method + "] no permitido para el modelo [" + modelName + "]";
    }
    else
        throw "No se encontro o no tiene acceso al modelo [" + modelName + "]";
};

resauto.generateInclude = function (strParentModel, includeString, filter, method, order, tipoOrden, arrayOrders) {
    //localhost:4000/api/planilla_detalle?include=[trabajador[persona,sucursal],persona[tienda]]    

    // ?include=[trabajador[persona]]
    // Dividimos los include en un array
    var arrayIncludes = [];
    var arrayStringIncludes = resauto.dividirIncludes(includeString);
    resauto.agregarIncludes("", arrayIncludes, arrayStringIncludes, filter, method, order, tipoOrden, arrayOrders);
    return arrayIncludes;
};

resauto.PATERN_NAME_MODEL = /^[a-zA-Z_$]+$/;
/**
 * Generacion del filtro para un 
 * @param {type} nameModel
 * @param {type} filter
 * @returns {undefined|Array|nm$_resauto.resauto.generarFiltro.orsQuery|resauto.generarFiltro.orsQuery}
 */
resauto.generarFiltro = function (nameModel, filter, method) {
    //  Para los modelos con busqueda
    var modelTable = resauto.findModel(nameModel, method).model;
    var orsQuery = [];
    if (filter !== null && modelTable.filterTo) {
        var columns = modelTable.filterTo();
        columns.forEach(function (columna) {
            var whereQ = {};
            if (columna.type && columna.type === 'fk') { // Para llaves Foráneas
                whereQ[columna.field] = filter;
            } else {
                if (filter.indexOf(",") === -1) {
                    whereQ[columna] = {
                        $iLike: "%" + filter + "%"
                    };
                }
                else {
                    var arr = filter.split(",");
                    whereQ.$or = [];
                    for (var i in arr) {
                        var a = {};
                        a[columna] = {
                            $iLike: "%" + arr[i] + "%"
                        };
                        whereQ.$or.push(a);
                    }
                }
            }
            orsQuery.push(whereQ);
        });
        return orsQuery;
        //      whereQuery.where["$or"]= orsQuery;
    }
    return undefined;
},

    resauto.dividirIncludes = function (includeString) {
        // [sucursal[trabajador],modalidad[empresa,trabajador]]
        var array = new Array();
        // Limpiando corchetes laterales
        if (includeString[0] === '[' && includeString[includeString.length - 1] === ']') {
            includeString = includeString.substr(1, includeString.length - 2);
        }
        if (includeString.length === 0)
            return array;
        var modelo = "";
        var corchetes = 0;
        for (var index = 0; index < includeString.length; index++) {
            var car = includeString.charAt(index);
            if ((car + "").match(resauto.PATERN_NAME_MODEL) !== null) // Es letra
            {
                modelo += car;
            }
            else if (car === '[') {
                corchetes++;
                modelo += car;
            }
            else if (car === ']') {
                corchetes--;
                modelo += car;
            }
            else if (car === ',') {
                if (corchetes === 0) {
                    array.push(modelo);
                    modelo = "";
                }
                else
                    modelo += car;
            }
        }
        array.push(modelo);
        return array;
    };

resauto.agregarIncludes = function (strParentModel, arrayRootIncludes, arrayIncludeString, filter, method, order, tipoOrden, arrayOrders) {
    // Iteramos todos los modelos 
    for (var index in arrayIncludeString) {
        var includeOrModel = arrayIncludeString[index];
        var arraySubModels = new Array();
        var nameModel;
        // Verificamos si tiene mas includes o es solo el nombre de un modelo 
        if (includeOrModel.indexOf('[') !== -1) // Es un modelo con includes
        {
            // Primero obtenemos el nombre del modelo
            var posIniCor = includeOrModel.indexOf('[');
            var subArrayIncludes = includeOrModel.substring(posIniCor, includeOrModel.length);
            nameModel = includeOrModel.substring(0, posIniCor);
            var arrayDivididos = resauto.dividirIncludes(subArrayIncludes);

            resauto.agregarIncludes(
                strParentModel.length > 0 ? strParentModel + "." + nameModel : nameModel
                , arraySubModels
                , arrayDivididos
                , filter, method, order, tipoOrden, arrayOrders);
        }
        else {
            nameModel = includeOrModel;
        }
        var model =
            {
                model: resauto.findModel(nameModel, method).model,
                include: arraySubModels
            };

        if (order !== null && Object.keys(model.model.rawAttributes).indexOf(order) !== -1) {
            //                console.log("Atributos",arrayAtributos,"NameModel",nameModel,"Order",order,"TipoOrder",tipoOrden,"ArrayOrder",arrayOrder);
            arrayOrders.push([resauto.Sequelize.literal(
                "\"" + ((strParentModel.length > 0 ? strParentModel + "." + nameModel : nameModel) + "." + order) + "\""
            ), tipoOrden]);
        }

        if (filter !== null) {
            var filterQuery = resauto.generarFiltro(nameModel, filter, method);
            if (filterQuery)
                model.where = { $or: filterQuery };
        }
        arrayRootIncludes.push(model);
    }


    //        var filterQuery = resauto.generarFiltro(nameModel,filter);
    //        if(filterQuery)
    //            subModel.where={'$or':filterQuery};
    return true;
},
    resauto.public = function (req, res) {
        //    console.log("QUERY",req);
        var tableName = req.params[0];
        var modelTable;
        var method = req.method;
        if (method === "OPTIONS") {
            res.status(204).send();
            return;
        }

        try {
            modelTable = resauto.findModel(tableName, method).model;

            var idTable = req.params.id_tabla;
            var query = req.query;
            var includeTables = null;
            var filter = null;
            var order = null;
            var tipoOrden = "ASC";
            var arrayOrders = new Array();
            if (query.include !== undefined) {
                includeTables = query.include;
                delete query.include;
            }

            var limit, page;

            if (query.limit !== undefined) {
                limit = query.limit;
                delete query.limit;
            }

            if (query.order !== undefined) {
                order = query.order;
                if (order !== null && order.length > 0) {

                    if (order.charAt(0) === '-') {
                        tipoOrden = "DESC";
                        order = order.substring(1);
                    }
                }

                delete query.order;
            }
            if (query.page !== undefined) {
                page = query.page;
                delete query.page;
            }
            if (query.filter !== undefined) {
                filter = query.filter;
                delete query.filter;
            }

            //    var countQuerys = Object.keys(query).length;
            //    console.log("Cantidad de parametros",countQuerys);

            // Verificando si es query
            var isId = null;

            if (idTable !== undefined) {
                isId = /^\+?\d+$/.test(idTable);
            }

            // Verificamos el metodo de peticion
            switch (req.method) {
                case "GET":
                    if (idTable === undefined) // Listar todos los registros
                    {
                        // Consultanto si tiene filtro para busquedas
                        var whereQuery = {
                            where: query
                        };
                        if (filter !== null) {
                            var filterQuery = resauto.generarFiltro(tableName, filter, method);
                            if (filterQuery)
                                whereQuery.where['$or'] = filterQuery;
                        }
                        // Verificando si tiene includes
                        if (includeTables !== null) {
                            whereQuery.include = resauto.generateInclude(tableName, includeTables, filter, method, order, tipoOrden, arrayOrders);
                        }
                        if (limit) {
                            whereQuery.limit = limit;
                            //                            limit: 10, 
                            //                            offset: 0, 
                        }

                        // Coprobando si tiene ordenacion por campos
                        if (order !== null) {
                            if (Object.keys(modelTable.rawAttributes).indexOf(order) !== -1)
                                arrayOrders.unshift([order, tipoOrden]);
                        }
                        if (arrayOrders.length > 0) {
                            whereQuery.order = arrayOrders;
                        }
                        //                    order: ['updatedAt', 'DESC']
                        // Comprobando si tiene paginacion
                        if (page) {
                            if (!limit) {
                                res.status(401).send(
                                    {
                                        finalizado: false,
                                        mensaje: "Para usar el paginador, debe agregar [limit] en su consulta"
                                    });
                                return;
                            }
                            whereQuery.offset = (page - 1) * limit;
                        }

                        // Ejecutando consulta
                        modelTable.findAndCountAll(
                            whereQuery
                        ).then(function (resultsData) {
                            // Verificamos si tiene querys 
                            res.status(200).send(
                                {
                                    finalizado: true,
                                    datos:
                                    {
                                        count: resultsData.count,
                                        results: resultsData.rows
                                    },
                                    mensaje: "Peticion completada exitosamente"
                                });
                        }).catch(function (error) {
                            console.log(error);
                            res.status(401).send(
                                {
                                    finalizado: false,
                                    mensaje: "Error al obtener datos",
                                    datos: error
                                });
                        });
                    }
                    else {
                        resauto.buscarLLavePrimaria(modelTable, function (primaryKeyName) {
                            var condicion = {};
                            condicion[primaryKeyName] = parseInt(idTable);

                            var whereQuery = {
                                where: condicion
                            };
                            if (includeTables !== null) {
                                whereQuery.include = resauto.generateInclude("", includeTables, filter, method);
                            }

                            modelTable.findOne(
                                whereQuery
                            ).then(function (resultsData) {
                                if (resultsData === null) {
                                    res.status(401).send(
                                        {
                                            finalizado: false,
                                            mensaje: "El registro no existe",
                                            datos: "No se pudo encontrar ni un registro con id [" + idTable + "] en la tabla [" + tableName + "]"
                                        });
                                    return;
                                }
                                // Verificamos si tiene querys 
                                res.status(200).send(
                                    {
                                        finalizado: true,
                                        datos:
                                        {
                                            count: resultsData.count,
                                            results: resultsData
                                        },
                                        mensaje: "Peticion completada exitosamente"
                                    });
                            }).catch(function (error) {
                                res.status(401).send(
                                    {
                                        finalizado: false,
                                        mensaje: "Error al obtener datos",
                                        datos: error
                                    });
                            });
                        });
                    }
                    break;
                case "POST":
                    if (idTable === undefined) {
                        modelTable.create(req.body).then(function (rowInserted) {
                            res.json(
                                {
                                    finalizado: true,
                                    datos: rowInserted,
                                    mensaje: "Peticion completada exitosamente"
                                });
                        }).catch(function (error) {
                            res.status(401).send(
                                {
                                    finalizado: false,
                                    mensaje: "Error al obtener datos",
                                    datos: error
                                });
                        });
                    }
                    else {
                        res.status(401).send(
                            {
                                finalizado: false,
                                mensaje: "Formato de peticion incorrecta"
                            });
                    }
                    break;
                case "PUT":
                    if (idTable !== undefined) {
                        resauto.buscarLLavePrimaria(modelTable, function (primaryKeyName) {
                            var condicion = {};
                            condicion[primaryKeyName] = parseInt(idTable);

                            modelTable.update(req.body,
                                {
                                    where: condicion
                                })
                                .then(function (result) {
                                    res.json(
                                        {
                                            finalizado: true,
                                            datos: result,
                                            mensaje: "Actualizacion correcta"
                                        });
                                }
                                , function (rejectedPromiseError) {
                                    res.status(401).send(
                                        {
                                            finalizado: false,
                                            mensaje: "Error en la actualizacion",
                                            datos: rejectedPromiseError
                                        });
                                });
                        });
                    }
                    else {
                        res.status(401).send(
                            {
                                finalizado: false,
                                mensaje: "La actualizacion solo es permitida cuando envia el ID de la tabla"
                            });
                    }
                    break;
                case "DELETE":
                    if (idTable !== undefined) {
                        resauto.buscarLLavePrimaria(modelTable,

                            function (primaryKeyName) {
                                var condicion = {};
                                condicion[primaryKeyName] = parseInt(idTable);

                                var whereQuery = {
                                    where: condicion
                                };

                                modelTable.destroy(whereQuery).then(function (rowDeleted) {
                                    if (rowDeleted === 1) {
                                        res.status(200).send(
                                            {
                                                finalizado: true,
                                                mensaje: "Registro eliminado correctamente"
                                            });
                                    }
                                    else {
                                        res.status(401).send(
                                            {
                                                finalizado: false,
                                                mensaje: "No se encontro el registro a eliminar"
                                            });
                                    }
                                }).catch(function (err) {
                                    res.status(401).send(
                                        {
                                            finalizado: false,
                                            mensaje: "Error al eliminar el registro"
                                        });
                                });
                            });
                    }
                    else {
                        res.status(401).send(
                            {
                                finalizado: false,
                                mensaje: "No se permite la eliminacion sin especificar un id de un registro o una condicion"
                            });
                    }
                    break;
                case "OPTIONS":
                    break;
                default:
                    res.status(401).send(
                        {
                            finalizado: false,
                            mensaje: "Peticion Http no soportado"
                        });
                    break;
            }
        }
        catch (e) {
            console.log(e);
            res.status(403).send(
                {
                    finalizado: false,
                    mensaje: "Acceso no permitido",
                    datos: e
                });
        }
    };
module.exports = resauto;

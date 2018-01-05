import logger from "./logger.js";
console.log("configuracion de test activada");
//Archivo de configuracion para conexion a la base de datos
module.exports = {
    database: "sisDpa_Desarollo",
    username: "postgres",
    password: "123456",
    params: {
        dialect: "postgres",
        port: 5432,
        host: "192.168.27.63",
        logging: (sql) => {
            logger.info(`[${new Date()}] ${sql}`);
        },
        define: {
            underscored: true,
        },
    },
    //configuracion con jwt poner una palabra secreta segura
    jwtSecret: "JuPa1986",
    jwtSession: { session: false },
};

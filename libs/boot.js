module.exports = app => {
    if (process.env.NODE_ENV !== "test") {
        app.db.sequelize.sync().done(() => {
            app.listen(app.get("port"), () => {
                console.log(`
         __
       >(\' )
         )/
        /(
       /  \`----/
jupa   \\  ~=- /
     ~^~^~^~^~^~^~^

	`);
                console.log(`Frame levantado y funcionando en el puerto  ${app.get('port')} `);
            });
        });
    }
};

console.log("ejecucion test DPA");
describe("Ruta: ejemplo de consumo DPA normal", () => {

    describe("GET /", () => {
        it("retorna si el servicio esta online", done => {
            request.get("/api/v1/dpas/010302")
                .expect(200)
                .end((err, res) => {
                    const expected = [[{ "oficiales": [{ "departamento": "Chuquisaca", "provincia": "Zudañez", "municipio": "Presto", "id_dpa": 129, "Capital": "Presto", "seccion": "Primera", "codigo": "010302", "ley": "ML", "fecha": "28/10/1926", "fuente": null }] }, { "referenciales": [] }]];
                    expect(res.body).to.eql(expected);
                    done(err);
                });
        });
        it("retorna si el servicio esta online", done => {
            request.get("/api/v1/dpas/019999")
                .expect(404)
                .end((err, res) => {
                    const expected = { status: "No hay resultados" };
                    expect(res.body).to.eql(expected);
                    done(err);
                });
        });
        it("retorna si el servicio esta online", done => {
            request.get("/api/v1/dpas/asdfasdfasd")
                .expect(404)
                .end((err, res) => {
                    const expected = { status: "el codigo debe ser numerico" };
                    expect(res.body).to.eql(expected);
                    done(err);
                });
        });

    });

});

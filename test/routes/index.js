describe("Ruta: Index", () => {
    describe("GET /", () => {
        it ("retorna si el servicio esta online", done => {
            request.get("/")
              .expect(200)
              .end((err,res ) => {
                  const expected={status:"Servicio funcionando Correctamente"};
                  expect(res.body).to.eql(expected);
                  done(err);
              });
        });
    });
    
});
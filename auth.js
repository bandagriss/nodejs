import passport2 from "passport";
import {Strategy, ExtractJwt} from "passport-jwt";
module.exports = app => {
    const Funcionarios= app.db.models.Funcionarios;
    const  cfg = app.libs.config;
    const params={
        secretOrKey:cfg.jwtSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
    };
    const strategy= new Strategy(params, (payload,done) => {
        
        
        //console.log("ejemplo ejemplo ejemplo"+payload.uid)
        console.log("****************************---------------");
        console.log(payload);
        Funcionarios.findByUid(payload.id)        
          .then(funcionario => {             
              
              if(funcionario){
                  
                  return done(null,{
                     id:funcionario.uid,
                  });
              }
              /*return done(null,{
                     id:"jpoma"
                  });*/
              return done(null,false);
          })
          .catch(error => {console.log("--------------------------------------------------------"); console.log(error);  
          done(error,null);
        });
    });
    passport2.use(strategy);
    return{
        initialize: () =>  passport2.initialize() ,
        authenticate: () => passport2.authenticate("jwt", cfg.jwtSession),
    };    
};
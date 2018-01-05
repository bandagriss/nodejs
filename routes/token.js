import jwt from "jwt-simple";
import LdapStrategy from "passport-ldapauth";
import passport from "passport";

module.exports = app => {
    /**
* @api {post} / Retorna un token , con cierto cifrado par ala autenticación de peticiones
* @apiGroup Seguridad
* @apiSuccess {String} retorna un jwt 
* @apiSuccessExample {json} Success
*
HTTP/1.1 200 OK
*
{  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.Eei3aLL2teePf7aCxTJFUd3sMGpzyqjgqsxx2cgZFIU"  }
*/

    const cfg = app.libs.config;
    const Funcionarios = app.db.models.Funcionarios;
    //configuracion para authenticacion por base de datos 
    //TODO: Realizar varios archivos de autencicacion  para diferentes tecnoclogias OAUTH , OAUT2 que estee encapsulado en este archivo 
    /*const Funcionarios=app.db.models.Funcionarios;
    app.post("/token", (req, res)=>{
       
        console.log(req.body);
        if(req.body.email &&  req.body.contrasenia){
            
            const email= req.body.email;
            const contrasenia = req.body.contrasenia;
            Funcionarios.findOne({where:{email:email}  })
            .then(funcionario=>{
               
                if(Funcionarios.isContrasenia(funcionario.contrasenia, contrasenia)){
                    
                    const payload={id: funcionario.id};
                    res.json({
                        token: jwt.encode(payload,cfg.jwtSecret)
                    });
                    //res.sendStatus(200);
                }else{
                    res.sendStatus(500);
                }
            })
            .catch(error=> {
                console.log("+++++++++++++++++++++++++++++++++++++++");
                console.log(error); 
                res.sendStatus(500);
            });            
        } else {
            res.sendStatus(404);
        }
    });*/
    //
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("====================ldap_atuh================================");
    const OPTS = {
        server: {
            url: 'ldaps://ldap.agetic.gob.bo:636',
            bindDn: 'uid=jpoma,ou=usuarios,dc=agetic,dc=gob,dc=bo',
            bindCredentials: 'cambiarlosdatos',
            searchBase: 'ou=usuarios,dc=agetic,dc=gob,dc=bo',
            searchFilter: '(uid={{username}})',
        },
    };
    passport.use(new LdapStrategy(OPTS, (payload, done) => {
        console.log("_____________________________________$$$$$$$$$$$$$$$$$$$____________________________");
        console.log(payload);
        return done(null, {
            nombre: payload.givenName,
            apellido: payload.sn,
            email: payload.mail,
            uid: payload.uid,
            cargo: payload.title,
        });
    }));
    passport.initialize();

    app.post('/token', passport.authenticate("ldapauth", cfg.jwtSession), (req, res) => {
        console.log("____________%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%___________________________________");
        console.log(req.user);

        const payload = { id: req.user.uid };

        Funcionarios.findByUid(req.user.uid)
            .then(funcionario => {
                if (!funcionario) {
                    console.log("->inicia consulta");
                    Funcionarios.findByUid(payload.id)
                        .then(funcionario => {
                            console.log("->concluye consulta");
                            if (!funcionario) {

                                Funcionarios.create({
                                    uid: req.user.uid,
                                    nombres: req.user.nombre,
                                    apellidos: req.user.apellido,
                                    cargo: req.user.cargo,
                                    contrasenia: "enLDAPnoSeNecesita",
                                    email: req.user.email,
                                })
                                    .then(result => {
                                        console.log("usuario creado");
                                        res.json({ funcionario: result, token: jwt.encode(payload, cfg.jwtSecret) });
                                    })
                                    .catch(error => {
                                        console.log("error al crear usuario:");
                                        console.log(error);
                                    });
                            }
                        });
                }
                else {
                    res.json({ 
                        funcionario, 
                        token: jwt.encode(payload, cfg.jwtSecret), 
                    });
                }
            })
            .catch(error => {
                console.log("+++++++++++++++++++++++++++++++++++++++");
                console.log(error);
                res.sendStatus(500);
            });
    });
};
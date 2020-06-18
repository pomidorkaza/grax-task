const express = require('express');

const app = express();
var bodyParser = require('body-parser');

var cors = require('cors');
const urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(urlencodedParser);
const Sequelize = require("sequelize");
const sequelize = new Sequelize("covid_db", "root", "", {
  dialect: "mysql",
  host: "localhost"
});


const Patient = sequelize.define('patient',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,

    },
    name:{
        type: Sequelize.STRING,
        defaultValue:"Sam"
    },
    has_tested:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    has_hospitilized:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});


const Address = sequelize.define('adress',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,

    },
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    data_from:{
        type: Sequelize.DATE
    },
    data_to:{
        type: Sequelize.DATE
    }
});

Patient.hasMany(Address,{ onDelete: "cascade" });





app.post('/add',  (req,res)=>{

     
       
     Patient.create({
        name: req.body.name,
        has_hospitilized: req.body.has_hospitilized,
        has_tested: req.body.has_tested
    }).then(result=>{
        let newPatient = result;
        let created_patiend_id =  newPatient.id;
        let all_addresses = req.body.addresses.split(',');
        let total_adresses =[];
        
        Patient.findByPk(created_patiend_id)
        .then((patient)=>{
            if(!patient) {
                return res.json({
                    error: true,
                    message:"не удалось создать адреса"
                });
            }
          let good = 0;
                for(let i=0;i<all_addresses.length;i++){
                    
                    Address.create({
                        name:all_addresses[i],
                        patientId: created_patiend_id
                    }).then( (result2)=>{
                        if(!result2) {

                        }
                         
                    total_adresses.push(result2);
                    if(i == all_addresses.length-1){
                        if(newPatient instanceof Patient){
                            return res.json({
                                error: false,
                                body:{ patient:newPatient,
                                        test: all_addresses,
                                        adresses:total_adresses
                                },
                    
                            });
                    
                        }
                        else {
                            res.json({
                                error: true,
                                message: "Не удалось создать пациента "
                            })
                        }
                    }
                    });
                
            }
    
            
            
            
        });
        } );
    
      

});

app.post('/update',async (req,res)=>{
    

    let updated_patient = await Patient.findOne({
        where: {
            id: req.body.id
        }
    });
    if(updated_patient instanceof Patient){
        updated_patient.name =req.body.name;
        
        updated_patient.has_tested =req.body.has_tested;
        updated_patient.has_hospitilized =req.body.has_hospitilized;
        
        updated_patient.save();
    return res.json({
        error:false,   
        body:req.body})
    }
    return res.json({
        error: true,
        message:"Не удалось обновить запись"
    });
});

app.get('/all',async (req,res)=>{
    let all_patients = await Patient.findAll({raw: true});
    if(all_patients.length>0)
    return res.json({ error:false, 
        body:all_patients});
    return res.json({
        error: true,
        message: "не найдено записей"
    }) 
});


app.get('/patients_addresses',async(req,res)=>{
    let all_addreses = await Address.findAll({where:{
        patientId: parseInt( req.query.id)
    }});
    if(all_addreses.length){
        return res.json({error: false,body:all_addreses});

    }
    return res.json({
        error: true,
        message: "Нет ни одного адреса"
    })
});

app.post('/edit_address',async (req,res)=>{
    let updated_address = await Address.findOne({
        where: {
            id: req.body.id
        }
    });
    if(updated_address instanceof Address){
        updated_address.name =req.body.name;
        
        updated_address.data_from =req.body.data_from;
        updated_address.data_to =req.body.data_to;
        
        updated_address.save();
    return res.json({
        error:false,   
        
        
        body:req.body})
    }
    return res.json({
        error: true,
        message:"Не удалось обновить запись"
    });
});



app.post('/add_address/:patientId',async(req,res)=>{

    // let newAddress = req.params.patientId;
    let address = await Address.create({
        name: req.body.name,
        data_from:req.body.data_from,
        data_to:req.body.data_to,
        patientId:parseInt(req.params.patientId)
    })
    return res.json({
        error: false,
        body:address
    })
});
sequelize.sync().then(result=>{
    console.log(result);
  })
  .catch(err=> console.log(err));

app.post('/delete_address/:address_id',async(req,res)=>{
    let deleted_address = await Address.findByPk(parseInt(req.params.address_id));
        await deleted_address.destroy();
        return res.json({
            error: false,
            body: deleted_address
        })
});

app.post('/delete_patient/:deleted_id',async(req,res)=>{
    let deleted_patient = await Patient.findByPk(parseInt(req.params.deleted_id));
        await deleted_patient.destroy();
        return res.json({
            error: false,
            body: deleted_patient
        })
})
app.listen(5000,()=>console.log('listening port 5000'))
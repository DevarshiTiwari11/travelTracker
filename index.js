import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'MAHAdev1106!',
  port: 5432,
});

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
  await db.connect();
  const result = await db.query("select * from visited_countries");
  let county = [];
  console.log(result);

  let countries = result.rows;
  console.log("print in countries", countries); // if you mention "print" + countries then it will print [object object] to skip this use , 

  let resultAarray = [];
  let returnCountry = result.rows.forEach(element => {
    resultAarray.push(element.country_code);
    console.log("result is here ", resultAarray);

  });
  console.log("your final array is ", resultAarray);

  res.render("index", {
    countries: resultAarray,
    total: resultAarray.length
  })

});

app.post("/add" , async (req , res)=>{
  // lets store the data added over the map first 
  let resultReturn = req.body.country;
  console.log(typeof resultReturn);

  // Now lets connect to DB and check the result in query 
  await db.connect();
  
  try {
    const resDB = await db.query("select * from countries where country_name = $1",[resultReturn]);
    console.log("your DB result is", resDB);

    const toUpdate =  resDB.rows ;
    
    // now enter the data inside a old DB via which these values are getting populated over UI 
    // let toUpdate = JSON.stringify(resDB.rows.country_code);
    await db.end();
    console.log(toUpdate);
    console.log(typeof toUpdate);
    
    
    await db.connect();

    let outputInsert ;
    toUpdate.forEach(obj=>{
      outputInsert = obj.country_code;  
    });

    console.log("success",outputInsert);

    const updateDB = await db.query("INSERT INTO visited_countries(country_code) VALUES($1)",[outputInsert]); 
    
    // use .trim as it is taking white space am not sure why need to check lets see 
    
    res.redirect("/");
    
    await db.end();
    
  } catch (err) {
    console.error("your error is ", err);
  }
} );



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

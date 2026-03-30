import mySQL from "npm:mysql2"
import "https://deno.land/std@0.224.0/dotenv/load.ts";

export const connection = mySQL.createConnection({
  host:"localhost",
  user: "web",
  password: "AGoodPassword",
  database: "Portfolio", 



})

connection.connect((_err)=>{
  if (_err)(console.error(_err))
})
export interface MySQLObject {
    setConnection(connection: mySQL.Connection): void;
}
















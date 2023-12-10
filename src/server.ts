import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config();
import { app } from './app';
import { AppDataSource } from "./data-source";



app.listen(process.env['PORT'], () => {

  AppDataSource.initialize().then(() => {console.log("database connected")}).catch((error) => console.log(error));

  console.log(`App is running on http://localhost:${process.env['PORT']}`)
});
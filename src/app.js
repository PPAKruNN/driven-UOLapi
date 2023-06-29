import Express from 'express';
import 'dotenv/config'
import { MongoClient } from 'mongodb';

const app = Express();
const mClient = new MongoClient(process.env.DATABASE_URL);
const db = mClient.db();

app.get("/participants", (req, res) => {

})

app.post("/participants", (req, res) => {
    
})

app.get("/messages", (req, res) => {
    
})

app.post("/messages", (req, res) => {
    
})

app.post("/status", (req, res) => {
    
})

app.delete("/messages/:ID", (req, res) => {
    
})

app.put("/messages/:ID", (req, res) => {
    
})
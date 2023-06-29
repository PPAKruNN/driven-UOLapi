import Express from 'express';
import 'dotenv/config'
import { MongoClient } from 'mongodb';
import dayjs from 'dayjs';

const app = Express();
app.use(Express.json());
app.listen(5000);

const mClient = new MongoClient(process.env.DATABASE_URL);
await mClient.connect();  // No error-treatment cuz i want the process to crash if this goes wrong!.
const db = mClient.db();

console.log("Servidor iniciado na porta 5000");

//
// Endpoints section
//

app.get("/participants", (req, res) => {

})

app.post("/participants", async (req, res) => {
    const { name } = req.body;
    // validations

    try {
        const participantsArray = await db.collection("participants").find({"name": name}).toArray();
        if(participantsArray.length !== 0) return res.sendStatus(409);

        db.collection("participants").insertOne({
            name,
            lastStatus: Date.now()
        });

        db.collection("messages").insertOne({
            from: name,
            to: "Todos",
            text: "entra na sala...",
            type: "status",
            time: dayjs().format("HH:mm:ss"),
        })

        return res.sendStatus(201);

    } catch (error) {
        res.sendStatus(500);
        console.log(error.message);
    }
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
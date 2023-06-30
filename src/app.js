import Express from 'express';
import 'dotenv/config'
import { MongoClient } from 'mongodb';
import dayjs from 'dayjs';
import joi from 'joi';

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
    db.collection("participants").find().toArray()
        .then( curr => res.send(curr))
        .catch( err => res.sendStatus(500));
})

app.post("/participants", async (req, res) => {
    const { name } = req.body;

    const userSchema = joi.object({
        name: joi.string().trim().required(),
    })

    const validate = userSchema.validate( { name: name } );
    if(validate.error) return res.send(422);

    try {
        const participants = await db.collection("participants").find({"name": name});
        if(participants) {
            const participantsArray = await participants.toArray();
            if(participantsArray.length !== 0) return res.sendStatus(409);
        }

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
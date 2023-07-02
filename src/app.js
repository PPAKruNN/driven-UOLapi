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

    const validate = userSchema.validate({ name: name });
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

app.get("/messages", async (req, res) => {
    const { user } = req.headers;
    const { limit } = req.query;

    // Driven nao pediu pra verificar o header??????

    if(limit && parseInt(limit) <= 0) return res.sendStatus(422);

    const messageSearch = await db.collection("messages").find({ 
        $or: [
            {type: "message"}, 
            {to: "Todos"},
            {from: user},
            {to: user}
        ] 
    }).limit(limit ?? 0).toArray();
    //limit ?? 0 eh pra ignorar o limite caso seja undefined, mas usar o limite se ele existir.

    if(!messageSearch) return res.sendStatus(404);
    return res.send(messageSearch);
})

app.post("/messages", async (req, res) => {
    
    const { to, text, type } = req.body;  
    const { user } = req.headers;

    const messageSchema = joi.object({
        to: joi.string().trim().required(),
        text: joi.string().trim().required(),
        type: joi.string().allow("message", "private_message").required(),
        from: joi.string().trim().required(),
        time: joi.any()
    });
    
    const data = {
        to, text, type, from: user, time: dayjs().format("HH:mm:ss")
    }
    
    const validate = messageSchema.validate(data);
    if(validate.error) return res.sendStatus(422);
    
    const userSearch = await db.collection("participants").findOne({ name: data.from })
    if(!userSearch) return res.sendStatus(422);
    
    // Everything ok, adding message!
    db.collection("messages").insertOne(data);
    return res.sendStatus(201);

})

app.post("/status", (req, res) => {
    const { user } = req.headers;
    if(!user) return res.sendStatus(404);

    const userSearch = db.collection("participants").find({name: user});
    if(!userSearch) return res.sendStatus(404);
    
    const updateResponse = db.collection("participants").updateOne(
        {name: user},
        {$set: {lastStatus: Date.now()}
    });
    if(!updateResponse) return res.sendStatus(404);
    return res.sendStatus(200);
})

app.delete("/messages/:ID", (req, res) => {
    
})

app.put("/messages/:ID", (req, res) => {
    
})
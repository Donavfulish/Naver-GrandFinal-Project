import express from "express"
import cors from "cors"

const app = express();
const PORT = 8080;

app.use(cors());
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: 'connetion success'
    })
})

app.listen(8080, () => {
    console.log(`server is running on PORT ${PORT}`)
})
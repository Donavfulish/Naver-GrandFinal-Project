import express from "express"
import cors from "cors"
import prisma, { disconnectPrisma } from "./src/db/prisma.js"

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: 'connection success'
    })
})

// Database health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            success: true,
            message: 'Database connection healthy',
            database: 'connected'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        })
    }
})

const server = app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(async () => {
        console.log('HTTP server closed')
        await disconnectPrisma()
        process.exit(0)
    })
})

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server')
    server.close(async () => {
        console.log('HTTP server closed')
        await disconnectPrisma()
        process.exit(0)
    })
})
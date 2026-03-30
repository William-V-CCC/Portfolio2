import express from "npm:express"
import { setupSwagger } from "./Routes/swaggerSetup.routes.ts"
import projectsRouter from "./controller/projects.router.ts"

import Cors from "npm:cors"

const app = express()
app.use(Cors())
app.use(express.json())
setupSwagger(app)

app.use("/api/projects", projectsRouter)


const PORT = 4050
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))

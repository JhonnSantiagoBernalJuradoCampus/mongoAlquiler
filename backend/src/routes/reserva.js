import { Router } from "express";
import { connectionDB } from "../../db/conexion.js";

const router = Router();

router.get("/pendiente", async (req,res)=>{
    try {
        const db = await connectionDB();
        const reserva = db.collection("reservas");

        const reservas = await reserva.aggregate([
            {
                $match: {
                    "Estado": "Pendiente"
                }
            },
            {
                $lookup: {
                    from: "clientes",
                    localField: "cliente_id",
                    foreignField: "ID_Cliente",
                    as: "Cliente"
                }
            },
            {
                $lookup: {
                    from: "automoviles",
                    localField: "automovil_id",
                    foreignField: "ID_Automovil",
                    as: "Automovil"
                }
            }
        ]).toArray();
        res.send(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error en el servidor");
    }
});

export default router;
import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import {validate} from "class-validator";
import {DTO} from "./token.js"
import { Router } from 'express';
import express from 'express';
import AlquilerDto from '../../storage/alquiler.js';

const middlewareVerify = Router();
const DTOData = Router();
const proxyAlquiler = express();

proxyAlquiler.use(async (req,res,next)=>{
    try {
        const data = plainToClass(AlquilerDto, req.body, {excludeExtraneousValues: true});
        const validationErrors = await validate(data);
        if (validationErrors.length > 0){
            const errors = validationErrors.map((err)=> Object.values(err.constraints));
            res.status(400).send({message: "Validation error", errors});
        } else {
            req.body = JSON.parse(JSON.stringify(data));
            next();
        }
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

middlewareVerify.use((req,res,next)=>{
    if (!req.rateLimit) return
    let {payload} = req.data
    const { iat, exp, ...newPayLoad} = payload;
    payload = newPayLoad;

    // Convertir las fechas en objetos Date
    const payloadDateObjects = {...payload};

    // Crear un clon del DTO original con las fechas convertidas
    const Clone = {...payload};
    console.log(payload);
    console.log(Clone);

    // Comparar si son iguales 
    const Verify = JSON.stringify(Clone).replace(/\s+/g, '') === JSON.stringify(payloadDateObjects).replace(/\s+/g, '');

    req.data = undefined;

    if(!Verify){
        console.log("No autorizado");
        res.status(406).send({ status: 406, message: "No Autorizado" });
    } else {
        console.log("Autorizado");
        next();
    }
})

DTOData.use( async(req,res,next) => {
    try {
        let data = plainToClass(DTO("alquiler").class, req.body);
        await validate(data);
        req.body = JSON.parse(JSON.stringify(data));
        req.data = undefined;
        next();
    } catch (err) {
        res.status(err.status).send(err)
    }
});

export {
    middlewareVerify,
    DTOData,
    proxyAlquiler
};
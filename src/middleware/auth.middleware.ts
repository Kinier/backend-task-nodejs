import { NextFunction, Request, Response } from "express"

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.user) next()
    else res.send({status: "not authenticated"})
}
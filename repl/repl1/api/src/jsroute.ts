import express, { Express, Request, Response } from 'express';
const router = express.Router();

router.post("/eval", 
  (req, res, next) => {
    let exp  = (req.body as string);
    try {
      console.log("Evaluating ..  " + exp )
      let k = eval(exp);
      res.json({data : k.toString()});
    } catch(err) {
      console.log("Eval Failure")
      res.json((err as Error).message);
    }
  }
)

module.exports = router
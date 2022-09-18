import express, { Express, Request, Response } from 'express';
const router = express.Router();

router.post("/eval", 
  (req, res, next) => {
    let exp  = (req.body.exp);
    try {
      console.log("Evaluating ..  " + exp )
      let k = eval(exp);
      res.status(200).json({result : k.toString()});
    } catch(err) {
      console.log("Eval Failure")
      res.status(200).json({result : (err as Error).message});
    }
  }
)

module.exports = router
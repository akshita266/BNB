// creating own custom function to handle error
 module.exports = (fn)=>{
    return (req, res, next)=>{
        fn(req, res, next).catch(next);
    }
}
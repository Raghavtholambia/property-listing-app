const express=require('express')
const session =require('express-session')
const flash=require('connect-flash')

app=express();
app.use(session({
    secret:"onepiece",
    resave:false,
    saveUninitialized:true
}))
app.use(flash())

// app.get("/count",(req,res)=>{  
//     if(req.session.count)
//         req.session.count++;
//     else
//     req.session.count=1;
//     res.send(`count: ${req.session.count}`);
// })

app.get("/register",(req,res)=>{
    let {name="annonymous"}=req.query;
    req.session.name=name;
    // flash: flash is use to throw a mess to the client only one time after the vanish
    req.flash("success","user register successfully")
    res.redirect("/hello")
})
app.get("/hello",(req,res)=>{
    console.log(req.flash("success"))
    res.send(`hello,${req.session.name}`)
})


app.listen(3000);
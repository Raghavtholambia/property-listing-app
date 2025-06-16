const express=require('express')
const cookieParser=require('cookie-parser')
const tr = require('faker/lib/locales/tr')
const app=express()
app.use(cookieParser("secret"))

app.get("/",(req,res)=>{
    res.send("hello raghav")
})

app.get("/setCookies",(req,res)=>{
    res.cookie("theme","black")
    res.send("some cookies are offered by the server")
})
app.get("/theme",(req,res)=>{
    let {theme="white"}=req.cookies
    res.send(`theme is: ${theme}`)
})

// signedCookie: it provide a secreat code at the place of the real value provided by the server so it prevent by the tempring
// app.use(cookieParser("secreatcode")) use secretcode for the sign cookie

app.get("/signedcookie",(req,res)=>{
     res.cookie("made-in","India",{signed:true})
     res.send("cookie signed")
    })
    app.get("/varified",(req,res)=>{
        console.log(req.signedCookies);   
        res.send("varified")
})


app.listen(3000)
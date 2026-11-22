import { Hono } from "hono";
type Env={Bindings:{APP_ENV?:string}};
const app=new Hono<Env>();
app.get("/health",(c)=>c.json({status:"ok",service:"warung-pintar-api",environment:c.env.APP_ENV??"development",timestamp:new Date().toISOString()}));
app.get("/api/health",(c)=>c.redirect("/health",308));
app.notFound((c)=>c.json({error:"NOT_FOUND",message:"Route tidak ditemukan."},404));
app.onError((error,c)=>{console.error("Unhandled API error",error);return c.json({error:"INTERNAL_SERVER_ERROR",message:"Terjadi kesalahan pada server."},500)});
export default app;
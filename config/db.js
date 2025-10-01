import mongoose from 'mongoose';

const conectarDB = async () => {
    try{
        const conection = await mongoose.connect(process.env.MONGO_URI);

        let url = `${conection.connection.host}:${conection.connection.port}`;
        console.log(`MongoDB Conectado en: ${url}`)
    }catch(error){
        console.warn(`error: ${error}`);
        process.exit(1); //para forzar a que el proceso termine
    }
}
export default conectarDB;
import multer from 'multer';
import path from 'path';
import { generarId } from '../helpers/generarId.js'

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        
        cb(null,'./public/uploads/');
    },
    filename: function(req,file,cb){
        //extname -> extencion de archivo
        cb(null,generarId()+path.extname(file.originalname))
    }
})


const upload = multer({
    storage:storage,
    fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG, GIF y WebP.'), false);
    }
  },
});

export default upload;
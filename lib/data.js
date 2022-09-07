const fs = require('fs')
const path = require('path')

const lib={}

lib.baseDir = path.join(__dirname,'../.data/')

lib.write = (dir,file,data,callback)=>{
    console.log(path.join(lib.baseDir+dir,file)+'.json')
    const pathToSave = path.join(lib.baseDir+dir,file)+'.json';

    fs.open(pathToSave,'wx',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            const dataString = JSON.stringify(data)
            fs.writeFile(fileDescriptor,dataString,(err)=>{
                if(!err){
                    fs.close(fileDescriptor,(err)=>{
                        if(!err){
                            callback(false)
                        }
                        else callback('Error Closing File')
                    })
                }
                else callback('There is a error Writing in file')
            })
        }
        else callback('There is a problem Opening the File')
    })
}

lib.read = (dir,file,callback)=>{
    const readFromPath = path.join(lib.baseDir+dir,file)+'.json';

    fs.readFile(readFromPath,'utf-8',(err,data)=>{
        callback(err, data)
    })
}

lib.update = (dir,file,data,callback)=>{
    const updatePath = path.join(lib.baseDir+dir,file)+'.json';
    fs.open(updatePath,'r+',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            const dataString = JSON.stringify(data)

            fs.ftruncate(fileDescriptor,(err)=>{
                if(!err){
                    fs.writeFile(updatePath,dataString,(err)=>{
                        if(!err){
                            fs.close(fileDescriptor,(err)=>{
                                if(!err){
                                    callback(false)
                                }
                                else callback('Error Closing')
                            })
                        }
                        else 
                            callback('Error Writing File')
                        
                    })
                }
                else callback('Error Truncating')
            })
        }
        else callback('Error Opening File')
    })
}

lib.delete = (dir,file,callback)=>{
    const readFromPath = path.join(lib.baseDir+dir,file)+'.json';
    fs.unlink(readFromPath,(err)=>{
        if(!err){
            callback(false)
        }
        else callback("Error Deleting File ")
    })
}

module.exports=lib
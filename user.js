let mysql=require('mysql')
let connection=mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'train'
});
connection.connect()
// let se = 'SELECT* from train where start_point=? and end_point=? and start_time like ?"%"'
// connection.query(se,["深圳","上海","2021-03-20"], (err, data) => {
//   if (err) {
//     console.log(err)
//   }
//   else {
//     console.log(data)
//   }
// })

module.exports=connection
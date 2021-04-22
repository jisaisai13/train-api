let mysql=require('mysql')
let connection=mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'train'
});
function query(sql, callback) {
    connection.getConnection(function (err, connection) {
        connection.query(sql, function (err, rows) {
            callback(err, rows)
            connection.release() // 中断连接
        })
    })
}
exports.query = query
connection.connect()
module.exports=connection;
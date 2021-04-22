let express = require('express')
let User = require('./user')
const setting = require('./set');
const verify = require('./verify');
const { token } = require('./set');
const { json } = require('body-parser');
var router = express.Router()
router.get('/', (req, res) => {
  const aaa = {
    name: 'aa',
    id: 5
  }
  res.send(aaa)
})
function randomNum(minNum,maxNum){ 
  switch(arguments.length){ 
    case 1: 
      return parseInt(Math.random()*minNum+1,10); 
    break; 
    case 2: 
      return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
    break; 
      default: 
        return 0; 
      break; 
  } 
} 
//用户注册路径
router.post('/register', async (req, res) => {
  let sel = 'SELECT* FROM user where phone=?'
  await User.query(sel, [req.body.phone], (err, data) => {
    if (err) {
      console.log(err)
    }
    if (req.body.phone == '' || req.body.password == '') {
      res.status(200).json({
        code: -1,
        message: '手机号码或密码为空',
      })
    }
    if (!data[0]) {
      let addsel = 'INSERT INTO user(phone,password) VALUES(?,?)'
      User.query(addsel, [req.body.phone, req.body.password], (err, data) => {
        if (err) {
          res.status(500).json({
            code: 500,
            message: 'server err'
          })
          console.log(err)
        }
        else {
          res.status(200).json({
            code: 0,
            message: '注册成功'
          })
        }
      })
    }
    else {
      res.status(200).json({
        code: -1,
        message: '存在该账号',
      })

    }
  })
})
//用户登录路径
router.post('/login', async (req, res) => {
  let sel = 'SELECT* FROM user where phone=? and password=?'
  await User.query(sel, [req.body.phone, req.body.password], (err, data) => {
    if (err) {
      console.log(err)
    }
    if (!data[0]) {
      res.status(200).json({
        code: 1,
        message: '账号或者密码错误'
      })
    }
    else {
      verify.setToken(req.body.phone, req.body.password).then(async (token) => {
        return res.json({
          code: 0,
          message: '欢迎登录',
          data: data,
          token: token,
          signTime: setting.token.signTime
        })
      });

    }
  })
})
//用户个人信息查询
router.post('/select/user', async (req, res) => {
  let sel = 'SELECT* FROM user where phone = ?'
  var selectParams = [req.body.phone]
  await User.query(sel,selectParams,(err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: 'success',
        data: data,
      })
    }
  })
})
//用户个人信息修改
router.post('/user/infoUpdate', async (req, res) => {
  var updateSql = 'UPDATE user SET username=? WHERE phone = ?'
  var updadeSqlParams = [req.body.username, req.body.phone]
  await User.query(updateSql, updadeSqlParams,  (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '修改成功',
        data: data
      })
    }
  })
})
//用户密码修改
router.post('/user/passwordUpdate', async (req, res) => {
  var selectSql = 'SELECT * FROM user WHERE phone = ? and password = ? ';
  var selectParams = [req.body.phone,req.body.password ];
  await User.query(selectSql, selectParams, (err,data) => {
    if(err){
      console.log(err);
    }
    if(!data[0]){
      res.status(200).json({
        code: 1,
        message: '原密码错误,请重试'
      })
    }
    else {
      const selectSql = 'SELECT * FROM user WHERE phone = ? and password = ? ';
      const selectParams = [req.body.phone,req.body.newPassword ];
      User.query(selectSql, selectParams, (err,data) => {
        if(data[0]){
          res.status(200).json({
            code: 2,
            message: '新旧密码相同，请重新输入'
          })
        }
        else{
          var updateSql = 'UPDATE user SET password = ? WHERE phone = ?'
          var updadeSqlParams = [req.body.newPassword,req.body.phone]
          User.query(updateSql, updadeSqlParams, function (err, data) {
            if (err) {
              console.log(err)
            }
            else {
              return res.json({
                code: 0,
                message: '修改成功,请重新登录',
                data: data
              })
            }
          })
        }
      })
    }
    
  })


})
//根据注册手机号查找userid
router.post('/selectUserid/byPhone', async (req, res) => {
  var selectSql = 'select id from user WHERE phone = ?'
  var selectSqlParams = [req.body.user]
  await User.query(selectSql, selectSqlParams,  (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        data: data
      })
    }
  })
})
//选择出发地或目的地
router.get('/select/city', async (req, res) => {
  let sel = 'SELECT* FROM city'
  await User.query(sel,(err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: 'success',
        data: data,
      })
    }
  })
})
//根据出发地及目的地出发时间查询火车信息
router.post('/select/ticket', async (req, res) => {
  let sel = 'SELECT* from ticket where start_point=? and end_point=? and start_time like ?"%" order by start_time ASC'
  var selectParams = [req.body.start_point, req.body.end_point,req.body.start_time,req.body.is_student]
  await User.query(sel,selectParams,(err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log(res)
      return res.json({
        code: 0,
        message: 'success',
        data: data ,
      })
    }
  })
})
//新建passenger乘客
router.post('/add/passenger', async (req, res) => {
  let sel = 'SELECT id FROM user where phone=?'
  await User.query(sel, [req.body.user], (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      const userid = data[0].id;
      let sel = 'SELECT * FROM passenger where idnumber=?'
      User.query(sel,[req.body.idNumber],(err,data) => {
        if (!data[0]) {
          let addsel = 'INSERT INTO passenger(userid,realName,idType,idnumber,genderType,contactNumber,isStudent) VALUES(?,?,?,?,?,?,?)';
          let addSqlParams = [userid,req.body.realName,req.body.idType,req.body.idNumber,req.body.genderType,req.body.contactNumber,req.body.passengerType]
          User.query(addsel, addSqlParams, (err, data) => {
            if (err) {
              res.status(500).json({
                code: 500,
                message: '服务端出错'
              })
              console.log(err)
            }
            else {
              res.status(200).json({
                code: 0,
                message: '添加成功'
              })
            }
          })
        }
        else {
          res.status(200).json({
            code: -1,
            message: '该身份证号已注册',
          })
    
        }
      })
      
    }
  })
})
//根据注册手机号查询该账号下的passenger
router.post('/select/passenger/byUser', async (req, res) => {
  let sel = 'SELECT id FROM user where phone=?'
  await User.query(sel, [req.body.user], (err, data) => {
    if (err) {
      console.log(err)
    }
    else{
      let selectSql = 'select * from passenger where userid = ?'
      let selectSqlParams = [data[0].id]
      User.query(selectSql, selectSqlParams, (err, data) => {
        if (err) {
          console.log(err)
        }
        else {
          return res.json({
            code: 0,
            message: '查询成功',
            data: data
          })
        }
      }) 
    }
  })
})
//根据passengerId查询该passenger信息
router.post('/select/passenger/byId', async (req, res) => {
  let selectSql = 'select * from passenger where id = ?'
  let selectSqlParams = [req.body.editid]
  await User.query(selectSql, selectSqlParams, (err, data) => {
    console.log(selectSqlParams)
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '查询成功',
        data: data
      })
    }
  }) 
})
//根据passengerId修改该passenger信息
router.post('/update/passenger', async (req, res) => {
  var updateSql = 'UPDATE passenger SET contactNumber = ?,isStudent = ? where id = ? '
  var updadeSqlParams = [req.body.contactNumber,req.body.passengerType,req.body.editid]
  await User.query(updateSql, updadeSqlParams, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '修改成功',
        data: data
      })
    }
  }) 
})
//根据passengerId删除该乘客
router.post('/delete/passenger', async (req, res) => {
  var deleteSql = 'DELETE FROM passenger WHERE id = ?'
  var deleteSqlParams = [req.body.editid,]
  await User.query(deleteSql,deleteSqlParams, function (err, data) {
    console.log(deleteSqlParams)
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '删除成功',
        data: data
      })
    }
  })
})
//根据ticket_id查询车票详情
router.post('/select/ticket/byTicketId', async (req, res) => {
  var selectSql = 'select * from ticket where ticket_id = ? '
  var selectSqlParams = [req.body.ticketId]
  await User.query(selectSql, selectSqlParams,  (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '查询成功',
        data: data
      })
    }
  })

})
//根据passengers id同时查询多位passenger
router.post('/select/passenger/byIds', async (req, res) => {
  let selectSql = 'select * from passenger where id in (?)'
  let selectSqlParams = [(req.body.ids).split(',')]
  await User.query(selectSql, selectSqlParams, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '查询成功',
        data: data
      })
    }
  }) 
})
//新建订单
router.post('/add/orders', async (req, res) => {
  let sel = 'SELECT passengerArray FROM orders where ticket_id =?'
  await User.query(sel, [req.body.ticketid], (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      var passengersexit = req.body.passengerids.split(',');
      let dataArray = '';
      data.map(item=>{  dataArray = dataArray.concat(item.passengerArray).concat(',')} )
      const exit = passengersexit.some((item) => {return dataArray.indexOf(item+',') !== -1})
      console.log(exit,passengersexit,dataArray)
      if( !!exit ){
        return res.status(200).json({
          code: -1,
          message: '存在乘客已购买该列车车票',
        })
      }else{
        var position = ''
        if( req.body.ishighspeed == 1 ){
          console.log('这是高铁')
        }else{
          let carNumber = randomNum(3,8);
          let seatNumber = randomNum(1,112);
          let seatArray = []
          for(var i=0;i<passengersexit.length;i++){
            seatArray.push(seatNumber+i);
          }
          seatArray.map(item=>{  position = position.concat(carNumber+'车').concat(item+'号').concat(',')} )
          console.log('这是火车',position)
        }
      }
      const addSql = 'INSERT INTO orders (ordertime,totalprice,ticket_id,position,passengerArray,userid) VALUES(?,?,?,?,?,?)'
      const addSqlParams = [req.body.ordertime,req.body.totalPricce,req.body.ticketid,position,req.body.passengerids,req.body.userid];
      User.query(addSql,addSqlParams,(err,data) =>{
        if (err) {
          res.status(500).json({
            code: 500,
            message: '服务端出错'
          })
          console.log(err)
        }
        else {
          return res.status(200).json({
            code: 0,
            message: '添加成功',
            data: data
          })
        }
      })
    }
  })
})
//根据userid查询本账号所有订单
router.post('/select/orders/byUserid',async (req, res) =>{
  const selectSql = 'select * from orders where userid = ?';
  await User.query(selectSql, [req.body.userid],  (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '查询成功',
        data: data
      })
    }
  })
})
// 根据orderid查询订单详情
router.post('/select/order/byOrdertime', async (req, res) => {
  const selectSql = 'select * from orders where orderid = ?'
  await User.query(selectSql, [req.body.orderid],  (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '查询成功',
        data: data
      })
    }
  })
})
// //修改订单状态
// router.post('/update/orderStatus', async (req, res) =>{

// })
//根据id删除工资信息
router.post('/employee/salary/delete', async (req, res) => {
  var deleteSql = 'DELETE FROM salary WHERE id = ?'
  var deleteSqlParams = [req.body.id,]
  await User.query(deleteSql, deleteSqlParams, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      res.status(200).json({
        code: 0,
        message: '工资表删除成功',
        data: data
      })
    }
  })
})
//根据id新增工资信息
router.post('/employee/salary/add', async (req, res) => {
  var updateSql = 'INSERT INTO salary (accounts,name,month,basicSalary,senioritySalary,postSubsidy,postAllowance,monthlyBonus,endowmentInsurance,accumulationFund,medicalInsurance,unemploymentInsurance,transportationSubsidy,performanceSalary,halfAward,annualBonus) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  var updadeSqlParams = [
    req.body.accounts,
    req.body.name,
    req.body.month,
    req.body.basicSalary,
    req.body.senioritySalary,
    req.body.postSubsidy,
    req.body.postAllowance,
    req.body.monthlyBonus,
    req.body.endowmentInsurance,
    req.body.accumulationFund,
    req.body.medicalInsurance,
    req.body.unemploymentInsurance,
    req.body.transportationSubsidy,
    req.body.performanceSalary,
    req.body.halfAward,
    req.body.annualBonus]
  await User.query(updateSql, updadeSqlParams, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      res.status(200).json({
        code: 0,
        message: '工资表更新成功',
        data: data
      })
    }
  })
})
//查看所有工资信息
router.get('/employees/salary', async (req, res) => {
  let sel = 'SELECT* FROM salary'
  await User.query(sel, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      res.status(200).json({
        code: 0,
        message: '所有工资表查询成功',
        data: data
      })
    }
  })
})
//新增管理员信息
router.post('/admin/register', async (req, res) => {
  var sel = 'SELECT* FROM administrators where accounts=?'
  var addSql = 'INSERT INTO administrators (accounts,email,idcard, telephone, department,password) VALUES(?,?,?,?,?,?)'
  var addSqlParams = [req.body.accounts, req.body.email, req.body.idcard, req.body.telephone, req.body.department, req.body.password]
  await User.query(sel, req.body.accounts, (err, data) => {
    if (err) {
      console.log(err)
    }
    if (!data[0]) {
      User.query(addSql, addSqlParams, (err, data) => {
        if (err) {
          res.status(500).json({
            code: 500,
            message: 'server err'
          })
          console.log(err)
        }
        else {
          res.status(200).json({
            code: 0,
            message: '新增一级管理员信息成功',
            data: data,
          })
        }
      })
    }
    else {
      res.status(200).json({
        code: -1,
        message: '存在该账号',
      })

    }
  })
})
//获取所有管理员信息
router.get('/admin/infos', async (req, res) => {
  let sel = 'SELECT* FROM administrators'
  await User.query(sel, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      res.status(200).json({
        code: 0,
        message: '所有管理员信息查询成功',
        data: data
      })
    }
  })
})
//管理员信息更新
router.post('/admin/infoUpdate', async (req, res) => {
  var updateSql = 'UPDATE administrators SET email=?,idcard = ?,telephone=? WHERE accounts = ?'
  var updadeSqlParams = [req.body.email, req.body.idcard, req.body.telephone, req.body.accounts]
  await User.query(updateSql, updadeSqlParams, function (err, data) {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '更新成功',
        result: data
      })
    }
  })
})
//管理员所有信息更新根据id
router.post('/admin/infoUpdates', async (req, res) => {
  var updateSql = 'UPDATE administrators SET accounts=?,email=?,idcard=?, telephone=?, department=?,password=? WHERE id = ?'
  var updadeSqlParams = [req.body.accounts, req.body.email, req.body.idcard, req.body.telephone, req.body.department, req.body.password,req.body.id]
  await User.query(updateSql, updadeSqlParams, function (err, data) {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '二级管理员全部信息更新成功',
        result: data
      })
    }
  })
})
//管理员信息删除根据id
router.post('/admin/infodelete', async (req, res) => {
  var deleteSql = 'DELETE FROM administrators WHERE id = ?'
  var deleteSqlParams = [req.body.id,]
  await User.query(deleteSql,deleteSqlParams, function (err, data) {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '二级管理员信息删除成功',
        data: data
      })
    }
  })

})
//找回管理员密码
router.post('/admin/findps', async (req, res) => {
  let sel = 'SELECT* FROM administrators where telephone=?'
  await User.query(sel, [req.body.telephone], (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '密码找回成功',
        data: data,
      })
    }
  })
})
//一级管理员登录
router.post('/senior', async (req, res) => {
  let sel = 'SELECT* FROM senior where accounts=? and password=?'
  await User.query(sel, [req.body.accounts, req.body.password], (err, data) => {
    if (err) {
      console.log(err)
    }
    if (!data[0]) {
      res.status(200).json({
        code: 1,
        message: '账号或者密码错误'
      })
    }
    else {
      verify.setToken(req.body.accounts, req.body.password).then(async (token) => {
        return res.json({
          code: 0,
          message: '恭喜你，欢迎登录',
          data: data,
          token: token,
          signTime: setting.token.signTime
        })
      });

    }
  })
})
//根据工号查看一级管理信息
router.post('/seniorinfo', async (req, res) => {
  let sel = 'SELECT* FROM senior where accounts=?'
  await User.query(sel, [req.body.accounts], (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        data: data,
      })
    }
  })
})
//根据工号更新一级管理信息
router.post('/seniorinfo/update', async (req, res) => {
  let sel = 'UPDATE senior SET idcard = ?,telephone=? WHERE accounts = ?'
  await User.query(sel, [req.body.idcard, req.body.telephone, req.body.accounts], (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '更新成功',
        result: data
      })
    }
  })
})
//根据工号找回一级管理密码
router.post('/senior/findps', async (req, res) => {
  let sel = 'SELECT* FROM senior where telephone=?'
  await User.query(sel, [req.body.telephone], (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      return res.json({
        code: 0,
        message: '密码找回成功',
        data: data,
      })
    }
  })
})

// router.get('/login', async (req, res) => {
//   let data = await verify.getToken(req.headers.authorization);
//   // 有些请求是需要登录状态的 所以验证token
//   // 验证 data.state >>> true Or false
//   data.state ?
//     (res.json({
//       status: 0,
//       msg: '可以访问'
//     })) :
//     (res.json({
//       status: -2,
//       msg: '请登录'
//     }));


// });

// router.get('/api/newdata', async (req, res) => {
//     res.append("Access-Control-Allow-Origin", "*")
//     res.append("Access-Control-Allow-content-type", "*")
//     let result = await axios.get('https://i.snssdk.com/forum/ncov_data/?activeWidget=1&data_type=%5B2%2C4%2C8%5D&src_type=map')
//     //    console.log(result)
//     //    res.json({name:'deng'})
//     res.send(result.data)
// })
module.exports = router
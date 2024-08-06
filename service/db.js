import {database} from '../config/config.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(database);

async function getConnection() {
    // console.log(`连接池状态: 总连接数 ${pool.pool._allConnections.length}`);
    // console.log("获取数据库连接开始")
    const poolConnection = await pool.getConnection();
    // console.log("获取数据库连接结束")
    return poolConnection;
}

function releaseConnection(poolConnection) {
    // pool.releaseConnection(poolConnection);
    // console.log("释放数据库连接结束")
    poolConnection.release();
    // pool.releaseConnection(poolConnection)
    // console.log("释放数据库连接结束")
}

async function query(sql, params) {
    const [results, ] = await pool.execute(sql, params);
    return results;
}

export {getConnection,query,releaseConnection}

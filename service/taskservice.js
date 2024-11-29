import {getConnection, releaseConnection} from "./db.js";
import {checkHasJoinTgGroup} from "./tgbot.js";
import {checkHasJoinDcServer} from "./discordService.js";

async function queryTask(taskId){
    let connection;
    try{
        connection=await getConnection();
        let [results,]=await connection.query("select * from task_info where id=?",taskId);
        if (results.length>0){
            const step=results[0].step;
            const jobId=results[0].job_id;
            const points=results[0].points;
            return {step,jobId,points};
        }
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
    return {step:0,jobId:"",points:0};
}

async function queryTaskProgress(jobId,walletAddress){
    let connection;
    try {
        connection=await getConnection();
        let [results,]=await connection.query("select * from task_progress where wallet_address=? and job_id=?",[walletAddress,jobId]);
        let progress=[];
        let step=0;
        if (results.length>0 && results[0].progress){
            progress=JSON.parse(results[0].progress);
            step=progress.length;
            if (results[0].finished===1){
                const data={"progress":progress,"points":results[0].points,"drawChances":1}
                return data;
            }
        }
        const updateResult=await autoUpdateTask(step + 1, jobId, walletAddress);
        if(updateResult!==-1){
            progress[step]=updateResult;
            if (updateResult===1){//自动完成一步
                [results,]=await connection.query("select * from task_progress where wallet_address=? and job_id=?",[walletAddress,jobId]);
                const data={"progress":progress,"points":results[0].points,"drawChances":0};
                return data;
            }else if (updateResult===3){//已完成所有任务
                const data={"progress":progress,"points":results[0].points,"drawChances":1};
                return data;
            }
        }
        // [results,]=await connection.query("select * from user_task_points where wallet_address=?",[walletAddress]);
        // let points=0;
        // if (results.length>0){
        //     points=results[0].points;
        // }
        if (results.length>0){
            const data={"progress":progress,"points":results[0].points,"drawChances":0};
            return data;
        }
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
    return {"progress":[],"points":0,"drawChances":0};
}

async function queryDrawChances(walletAddress){
    let connection;
    try{
        connection=await getConnection();
        const [results,]=await connection.query("select COUNT(1) finishCount from users u,task_progress g where u.father_wallet_address=? and u.wallet_address=g.wallet_address and g.finished=1",[walletAddress]);
        let count=Number(results[0].finishCount);
        const drawChances = Math.floor(count / 10);
        return drawChances;
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
    return 0;
}
async function autoUpdateTask(step,jobId,walletAddress){
    let connection;
    try{
        console.log("autoUpdateTask: ",step," ",jobId," ",walletAddress);
        connection=await getConnection();
        let [results,]=await connection.query("select * from task_info where job_id=? and step=?",[jobId,step]);
        if (results.length>0){
            const type=results[0].task_type;
            const points=results[0].points;
            if (type==="connect_twitter"){
                // console.log("auto check connect_twitter");
                [results,]=await connection.query("select * from users where wallet_address=?",[walletAddress]);
                if (results.length>0 && results[0].twitter_id){
                    await finishByStep(step,jobId,walletAddress,points);
                    return 1;
                }
            }else if (type==="join_tg_group"){
                const groupId=results[0].extend_content;
                const joinResult=await checkHasJoinTgGroup(walletAddress,groupId);
                if (joinResult===1){
                    await finishByStep(step,jobId,walletAddress,points);
                }
                return joinResult;
            }else if (type==="join_dc_group"){
                const groupId=results[0].extend_content;
                const joinResult=await checkHasJoinDcServer(walletAddress,groupId);
                if (joinResult===1){
                    await finishByStep(step,jobId,walletAddress,points);
                }
                return joinResult;
            }
        }else {
            //finish all
            await connection.query("update task_progress set finished=1 where wallet_address=? and job_id=?",[walletAddress,jobId]);
            return 3;
        }
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
    return -1;
}

async function finishTask(taskId,walletAddress){
    let connection;
    try{
        connection=await getConnection();
        const taskInfo=await queryTask(taskId);
        if (taskInfo.jobId){
            const step=taskInfo.step;
            const points=taskInfo.points;
            let [results,]=await connection.query("select * from task_progress where wallet_address=? and job_id=?",[walletAddress,taskInfo.jobId]);
            if (step===1){
                if (results.length>0){
                    console.log("step has finish");
                }else {
                    const progress=[];
                    progress[step-1]=1;
                    await connection.query("insert into task_progress(wallet_address,job_id,progress,points)values(?,?,?,?)",[walletAddress,taskInfo.jobId,JSON.stringify(progress),points]);
                    // await addTaskPoints(walletAddress,taskInfo.jobId,points);
                    return true;
                }
            }else if (step>1){
                if (results.length===0){
                    console.log("please finish task step by step");
                }else {
                    const progressstr=results[0].progress;
                    const progress=JSON.parse(progressstr);
                    if (progress.length+1!==step){
                        console.log("please finish  task step by step");
                    }
                    progress[step-1]=1;
                    await connection.query("update task_progress set progress=?,points=points+? where wallet_address=? and progress=?",[JSON.stringify(progress),points,walletAddress,progressstr]);
                    // await addTaskPoints(walletAddress,taskInfo.jobId,points);
                    return true;
                }
            }
        }
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
    return false;
}

async function finishByStep(step,jobId,walletAddress,points){
    let connection;
    try{
        connection=await getConnection();
        let [results,]=await connection.query("select * from task_progress where wallet_address=? and job_id=?",[walletAddress,jobId]);
        if (step===1){
            if (results.length>0){
                console.log("step has finish");
            }else {
                const progress=[];
                progress[step-1]=1;
                await connection.query("insert into task_progress(wallet_address,job_id,progress,points)values(?,?,?,?)",[walletAddress,jobId,JSON.stringify(progress),points]);
                // await addTaskPoints(walletAddress,jobId,points);
                return true;
            }
        }else if (step>1){
            if (results.length===0){
                console.log("please finish task step by step");
            }else {
                const progressstr=results[0].progress;
                const progress=JSON.parse(progressstr);
                if (progress.length+1!==step){
                    console.log("please finish  task step by step");
                }
                progress[step-1]=1;
                console.log("update step 2:",JSON.stringify(progress));
                await connection.query("update task_progress set progress=?,points=points+? where wallet_address=? and progress=?",[JSON.stringify(progress),points,walletAddress,progressstr]);
                // await addTaskPoints(walletAddress,jobId,points);
            }
        }
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
    return false;
}

async function addTaskPoints(wallet,jobId,points){
    let connection;
    try{
        connection=await getConnection();
        let [results,]=await connection.query("select * from user_task_points where wallet_address=? and job_id=?",[wallet,jobId]);
        if (results.length>0){
            await connection.query("update user_task_points set points=points+? where wallet_address=? and job_id=?",[points,wallet,jobId]);
        }else {
            await connection.query("insert into user_task_points(wallet_address,job_id,points)values(?,?,?)",[wallet,jobId,points]);
        }
    }catch (exception){
        console.log("addTaskPoints error:",exception);
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
}

export {finishTask,queryTaskProgress,queryDrawChances}
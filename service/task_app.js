import express from 'express';
import {getConnection, releaseConnection} from "./db.js";
import {delay, isAuthenticated, sendError, sendSuccessData, sendSuccessResponse} from "./base_app.js";
import {finishTask, queryDrawChances, queryTaskProgress} from "./taskservice.js";
const task_app = express();

task_app.get('/airdrop_list', async (req,res) => {
    let connection;
    try{
        connection=await getConnection();
        let [results,]=await connection.query("select * from job_info",[]);
        const data=[];
        if (results.length>0){
            for (const result of results){
                const jobInfo={};
                jobInfo.name=result.name;
                jobInfo.jobId=result.job_id;
                jobInfo.description=result.description;
                jobInfo.startTime=result.start_time;
                jobInfo.endTime=result.end_time;
                jobInfo.claimStimeTime=result.claim_start_time;
                jobInfo.coverImage=result.cover_image;
                jobInfo.logo=result.logo;
                jobInfo.illustration=result.illustration;
                jobInfo.tags=JSON.parse(result.tags);
                jobInfo.chain=result.chain;
                jobInfo.chainLogo=result.chainLogo;
                jobInfo.introduction=result.introduction;
                data.push(jobInfo);
            }
        }
        return sendSuccessData(res,data);
    }catch (error){
        console.log("airdrop_list error:",error);
        return sendError(res);
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
});

task_app.get('/airdrop_info', async (req,res) => {
    let connection;
    try{
        connection=await getConnection();
        const jobId = req.query.jobId;
        let [results,]=await connection.query("select * from job_info where job_id=?",[jobId]);
        const jobInfo={};
        if (results.length>0){
           const result=results[0];
            jobInfo.name=result.name;
            jobInfo.jobId=result.job_id;
            jobInfo.description=result.description;
            jobInfo.startTime=result.start_time;
            jobInfo.endTime=result.end_time;
            jobInfo.claimStimeTime=result.claim_start_time;
            jobInfo.coverImage=result.cover_image;
            jobInfo.logo=result.logo;
            jobInfo.illustration=result.illustration;
            jobInfo.twitterInviteContent=result.twitter_invite_content;
            jobInfo.tgInviteContent=result.tg_invite_content;
            jobInfo.tags=JSON.parse(result.tags);
            jobInfo.social=JSON.parse(result.social);
            jobInfo.totalReward=result.totalReward;
            jobInfo.rewardTokenLogo=result.rewardTokenLogo;
            jobInfo.rewardTokenName=result.rewardTokenName;
            jobInfo.chain=result.chain;
            jobInfo.chainLogo=result.chainLogo;
        }
        return sendSuccessData(res,jobInfo);
    }catch (error){
        console.log("airdrop_list error:",error);
        return sendError(res);
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
});
task_app.get('/task_list', async (req,res) => {
    let connection;
    try{
        const jobId = req.query.jobId;
        connection=await getConnection();
        let [results,]=await connection.query("select * from task_info t where t.job_id=?  ORDER BY step",[jobId]);
        const data= [];
        if (results.length>0){
          for(const result of results){
              const detail={};
              detail.taskId=result.id;
              detail.step=result.step;
              detail.taskType=result.task_type;
              detail.content=result.content;
              detail.action=result.action;
              data.push(detail);
          }
        }
        return sendSuccessData(res,data);
    }catch (error){
        console.log("task_list error:",error);
        return sendError(res);
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
});

task_app.get('/task_info',isAuthenticated, async (req,res) => {
    const addr = req.session.wallet.addr;
    const jobId = req.query.jobId;
    const data=await queryTaskProgress(jobId,addr);
    const addChances=await queryDrawChances(addr);
    data.drawChances=data.drawChances+addChances;
    return sendSuccessData(res,data);
});

task_app.get('/check_wallet',isAuthenticated, async (req,res) => {
    const addr = req.session.wallet.addr;
    const taskId = req.query.taskId;
    const result=await finishTask(taskId,addr);
    return sendSuccessData(res,result);
});

task_app.get('/follow_twitter',isAuthenticated, async (req,res) => {
    const addr = req.session.wallet.addr;
    const taskId = req.query.taskId;
    const result=await finishTask(taskId,addr);
    await delay(5000);
    return sendSuccessData(res,result);
});

task_app.get('/share_twitter',isAuthenticated, async (req,res) => {
    const addr = req.session.wallet.addr;
    const taskId = req.query.taskId;
    const result=await finishTask(taskId,addr);
    await delay(5000);
    return sendSuccessData(res,result);
});

task_app.get('/like_comment_twitter',isAuthenticated, async (req,res) => {
    const addr = req.session.wallet.addr;
    const taskId = req.query.taskId;
    const result=await finishTask(taskId,addr);
    await delay(5000);
    return sendSuccessData(res,result);
});
export default task_app;
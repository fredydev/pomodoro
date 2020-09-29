import React from 'react';
import styled from "styled-components"
import { CircularProgressbarWithChildren, buildStyles} from 'react-circular-progressbar';
import {Motion, spring} from "react-motion";
// import ReactAudioPlayer from 'react-audio-player';
import restCall from "./alert.mp3"
import workCall from "./huee.mp3"
import 'react-circular-progressbar/dist/styles.css';
import resetButton from "./reset.svg"
import './App.css';


const DEFAULT_WORK_TIME = 1500;
const DEFAULT_REST_TIME = 300;
const WORK_TIME_LIMIT_MAX =  3600;
const PAUSE_TIME_LIMIT_MAX =  1500;

const INITIAL_STATE = {
  count: 0,
    activity: null,
    restTime: DEFAULT_REST_TIME,
    workTime: DEFAULT_WORK_TIME,
    restTimeCounting: DEFAULT_REST_TIME,
    workTimeCounting: DEFAULT_WORK_TIME,
    running: false,
    workProgress: 0,
    restProgress: 0
}

const formatTime = (time)=> {
  let min = Math.floor(time/60);
  let sec = time - min*60
  sec = (sec<10)?"0"+sec: sec
  min = (min<10)?"0"+min: min
  return min + " : "+ sec
}

class App extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        count: 0,
        activity: null,
        workTime: DEFAULT_WORK_TIME,
        restTime: DEFAULT_REST_TIME,
        workProgress: 0,
        restProgress: 0,
        running: false
      }
      this.reset = this.reset.bind(this)
    }
    componentDidMount(){
      this.setState({restTimeCounting: DEFAULT_REST_TIME, workTimeCounting: DEFAULT_WORK_TIME})
    }
    reset(){
      clearInterval(this.state.running)
      this.setState({...INITIAL_STATE,})
    }
    ctrl(value,time,type,limitMax){
        if(value==="-" && time>60){
            this.setState({[type]: time-60,[`${type}Counting`]: time-60})
        }
        if(value==="+" && time<limitMax){
          this.setState({[type]: time+60,[`${type}Counting`]: time+60})
          
        }
    }
    manage(e,type){
      console.log(type)
      const {workTime,running,restTime } = this.state
      if(!running){
        if(type==="workTime"){
          this.ctrl(e.target.value,workTime,type,WORK_TIME_LIMIT_MAX)
        }
        if(type==="restTime"){
          this.ctrl(e.target.value,restTime,type,PAUSE_TIME_LIMIT_MAX)
        }
          
      }    
    }
  
    decrease_time(time,activityType){
      let decresing_time = time-1
      this.setState({[`${activityType}Counting`]: decresing_time})
    }
    setProgressBarValue(activity,time){
      const percentage = (time*100)/this.state[`${activity}Time`];
      const progress = 100-percentage;
      this.setState({[`${activity}Progress`]: progress})
    }
    compte_rebours = () =>{
        const {workTime,activity,restTime,workTimeCounting, restTimeCounting} = this.state
        let restCall = document.getElementById("peeb1")
        // const workCall = document.getElementById("peeb2")
        if(activity==="workTime"){
          this.setState({restTimeCounting: restTime})
          if(workTimeCounting===0) this.setState({activity: "restTime"},()=>restCall.play())
          
          this.decrease_time(workTimeCounting,activity)
          this.setProgressBarValue("work",workTimeCounting)
        }
        if(activity==="restTime"){
          this.setState({ workTimeCounting: workTime})
          if(restTimeCounting===0) this.setState({activity: "workTime", },()=>restCall.play())
          this.decrease_time(restTimeCounting,activity)
          this.setProgressBarValue("rest",restTimeCounting)
        }
        
       
    }
    start = ()=>{
        const {running,activity,count} = this.state
        if(!running&&count===0){
            this.setState({activity: "workTime"})
            this.setState({running: setInterval(this.compte_rebours,1000),count: this.state.count+1})
        }
        else if(!running&&count>0){
          this.setState({running: setInterval(this.compte_rebours,1000),activity: activity})
        }
        else{
          this.setState({running: clearInterval(running)})
          this.setState({running: false})
        }
      
      
    }
    render(){
      const {workTime,restTime,restProgress,running,workProgress,activity,restTimeCounting,workTimeCounting} = this.state
      const name = activity==="workTime"?"workTime":"restTime"
      const progress = activity==="workTime"?workProgress:restProgress
      const timeTodisplay = activity==="workTime"?formatTime(workTimeCounting):activity==="restTime"?formatTime(restTimeCounting): ""
      return (
        <PomodoroWrapper>
                <div className="display">
                    <ProgressBar   name={name}  progress={progress} time={timeTodisplay} activity={activity} state={this.state}/>
                </div>
                <div className="control">
                    <Pad time={formatTime(workTime)} name={"workTime"} manage={(e)=>this.manage(e,"workTime")} activity={activity}/>
                    <div className="player">
                      <audio id="peeb1" preload="auto"src={restCall}/>
                      <audio id="peeb2" preload="auto"src={workCall}/>
                      <StartPause toggle={running} onClick={this.start}/>
                      <img alt="reset button" src={resetButton} onClick={this.reset}/>
                    </div>
                    <Pad time={formatTime(restTime)} name="restTime" manage={(e)=>this.manage(e,"restTime")} activity={activity} />
              </div>            
        </PomodoroWrapper>
      );
    }
    
  }
const Pad = ({name,time,manage}) => {
    // style={activity==="workTime"?{backgroundColor:"darkgreen"}:activity==="restTime"?{backgroundColor:"gray"}:null}
    return(
      <div className={`pad ${name}`}  >
          <h4>{name==="workTime"?"Work duration":"Rest duration"}</h4>
          <div style={{ fontSize: 10, marginTop: -5 }}>
              <strong className="time">{time}</strong>
          </div>
          <Button  value="+" onClick={manage}>+</Button>
          <Button  value="-" onClick={manage}>-</Button>
      </div>
    )
  }
  const ProgressBar = ({name,progress,time,activity,state}) => {
    return (
                <CircularProgressbarWithChildren  className="cercle" value={progress} styles={buildStyles({
                    pathColor: `${name==="restTime"?"#f00":"white"}`,
                    trailColor: "palevioletred",
                    strokeLinecap: "",
                    backgroundColor: "palevioletred"
                })}>
                  {/* {JSON.stringify(state,null,1)} */}
                  <h2>{activity==="restTime"?"Rest Time":activity==="workTime"?"Work Time":"Pomodoro"}</h2>
                  {activity&&<div style={{ fontSize: 10, marginTop: -5 }}>
                      <strong className="time">{time}</strong>
                  </div>}
                </CircularProgressbarWithChildren>
    )
  }

const PomodoroWrapper = styled.div`
    background: whitesmoke;  /* mintcream*/
    box-sizing: border-box;
    display: flex;
    height: 100vh; 
    flex-direction: column;
    justify-content: center;
    align-content: center;
    /* border: solid red; */
        .control{
            border: solid  palevioletred;;
            max-width: 100%;
            margin: 0 auto;
            display: flex;
            border-radius: 10px;
            .pad{
                color: palevioletred;
                text-align: center;
                .time{
                    border:1px solid palevioletred ;
                    
                    width:190px;
                    height:50px;
                    line-height:50px;
                    font-size:2rem;
                    font-family:"Courier New", Courier, monospace;
                    text-align:center;
                    margin:5px;
                    border-radius: 3px;
                    color: palevioletred;
                }
            }
            .player{
              border-left: solid palevioletred ;
              border-right: solid palevioletred ;
              display: flex;
              flex-direction: column;
              justify-content: space-around;
              align-items: center;
              padding-left: 20px;
              padding-right: 20px;
                  .play-pause {
                        cursor: pointer;
                        /* display: block; */
                        width: 42px;
                        height: 50px;
                        padding: 0;
                        /* margin: 30px; */
                        border: 0;
                        outline: 0;
                        background: transparent;
                        position: relative;
                        .play-pause__playhead {
                            display: block;
                            width: 0;
                            height: 0;
                            border-style: solid;
                            border-width: 25px 0 25px 42px;
                            border-color: transparent transparent transparent palevioletred;
                            transform-origin: 100% 50%;
                        }
                        .play-pause__pausehead {
                            display: flex;
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            top: 0;
                            left: 0;
                            transform: scaleX(0);
                            transform-origin: 0 50%;
                            
                            &:before,
                            &:after {
                                content: "";
                                flex: 1;
                                width: 50%;
                                height: 100%;
                                background: palevioletred;
                            }
                            
                            &:before {
                                margin-right: calc(8px / 2);
                            }
                            
                            &:after {
                                margin-left: calc(8px / 2);
                            }
                        }
                    }
                    img{
                        cursor: pointer;
                        width: 60px;
                        height: 60px;
                        /* margin: 30px; */
                        color: palevioletred;
                    }
                }
             
            }
            
        .display{
                margin: 10px;
                /* border: solid green; */
                /* display: flex; */
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: palevioletred;
                
                .cercle{
                  /* background: blue; */
                  border-radius: 50%;
                  border: 10px dashed palevioletred;
                  div,span,ul,ol,:link,&::first-child,>{
                    background: green !important;
                  }
                }
                .time{
                    border:1px solid palevioletred ;
                    width:190px;
                    height:50px;
                    line-height:50px;
                    font-size:2rem;
                    font-family:"Courier New", Courier, monospace;
                    text-align:center;
                    margin:5px;
                    border-radius: 3px;
                    color: palevioletred;
                }
        }  
    }
    
    @media (max-width: 991px) {
        .container{
            width:100%;
        }

`
  
  const Button = styled.button`
    color: whitesmoke;
    border: 0.1em dashed whitesmoke;
    background: palevioletred;
    cursor: pointer;
    font-size: 1em;
    margin: 1em;
    padding: 0.25em 1em;
    border-radius: 3px;
  `
  
  const StartPause = ({toggle,onClick}) => {
    return(
      <Motion style={{scale: spring(toggle ? 1 : 0, [300, 30])}}>
        {({scale}) =>
        <div>
          <button type="button" className="play-pause" onClick={onClick} >
            <span className="play-pause__playhead" style={{ transform: `scaleX(${1 - scale})`, WebkitTransform: `scaleX(${1 - scale})`}}/>
            <span className="play-pause__pausehead" style={{ transform: `scaleX(${scale})`, WebkitTransform: `scaleX(${scale})` }} />
          </button>
        </div>
          
        }
      </Motion>
    )
  }
  export default App;
  



  /**
  
   if(activity==="workTime"){
            // this.setState({restTimeCounting: restTime,restProgress: 0})
            if(workTimeCounting<2) this.setState({activity: "restTime",})
            let time= workTimeCounting-1
            // progress
            const percentWorKTime = (time*100)/workTime
            let progress = 100-percentWorKTime
            this.setState({workProgress: progress+2})
            // change worktime
            this.setState({workTimeCounting: time})
          
        }
        if(activity==="restTime"){
            aud.play()
            // this.setState({workTimeCounting: workTime,workProgress: 0})
            if(restTimeCounting<2) this.setState({activity: "workTime"})
            let time= restTimeCounting-1
            // progress
            const percentPauseTime = (time*100)/restTime
            let progress = 100-percentPauseTime
            this.setState({restProgress: progress+2})
            // change pausetime
            this.setState({restTimeCounting: time})
            
        }
  
  if(!this.state.running){
            this.setState({activity: "workTime"})
            this.setState({session_number:setInterval(this.compte_rebours,100), running: true})
        }
        else{
            // this.setState({activity: null})
            clearInterval(this.state.session_number)
            this.setState({running: false})
        }
   */
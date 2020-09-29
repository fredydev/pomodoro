import React from 'react';
import styled from "styled-components"
import { CircularProgressbarWithChildren, buildStyles} from 'react-circular-progressbar';
import {Motion, spring} from "react-motion";
import ReactAudioPlayer from 'react-audio-player';
import beep from "./alert.mp3"
import 'react-circular-progressbar/dist/styles.css';
import resetButton from "./reset.svg"
import './App.css';

const INITIAL_STATE = {
      activity: null,
      pauseTime: 60,
      workTime: 60,
      pauseTimeSet: 60,
      workTimeSet: 60,
      running: false,
      workProgress: 0,
      pauseProgress: 0
}
const WORK_TIME_LIMIT_MAX =  3600
const PAUSE_TIME_LIMIT_MAX =  1500

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      activity: null,
      pauseTimeSet: 60,
      workTimeSet: 60,
      workProgress: 0,
      pauseProgress: 0,
      running: false
    }
    this.reset = this.reset.bind(this)
  }
  componentDidMount(){
    this.setState({pauseTime: this.state.pauseTimeSet, workTime: this.state.workTimeSet})
  }
  reset(){
    clearInterval(this.state.running)
    this.setState({...INITIAL_STATE,})
  }
  ctrl(value,time,type,limitMax){
      if(value==="-" && time>60){
          this.setState({[type]: time-60})
      }
      if(value==="+" && time<limitMax){
        this.setState({[type]: time+60})
        
      }
  }
  manage(e,type){
    console.log(e.target.value)
    const {workTime,running,pauseTime } = this.state
    if(!running){
      if(type==="workTime"){
        this.ctrl(e.target.value,workTime,type,WORK_TIME_LIMIT_MAX)
      }
      else{
        this.ctrl(e.target.value,pauseTime,type,PAUSE_TIME_LIMIT_MAX)
      }
        
    }    
  }

  
  compte_rebours = () =>{
      const {workTime,activity,pauseTime,workTimeSet, pauseTimeSet} = this.state
      let aud = document.getElementById("peeb")
      if(activity==="workTime"){
        this.setState({pauseTime: this.state.pauseTimeSet,pauseProgress: 0})
        if(workTime<6) aud.play()
        if(workTime<2) this.setState({activity: "pauseTime",})
        let time= workTime-1
        // progress
        const percentWorKTime = (workTime*100)/workTimeSet
        let progress = 100-percentWorKTime
        this.setState({workProgress: progress+2})
        // change worktime
        this.setState({workTime: time})
        
      }
      if(activity==="pauseTime"){
        this.setState({workTime: this.state.workTimeSet,workProgress: 0})
        if(pauseTime<2) this.setState({activity: "workTime"})
        let time= pauseTime-1
         // progress
         const percentPauseTime = (pauseTime*100)/pauseTimeSet
         let progress = 100-percentPauseTime
         this.setState({pauseProgress: progress+2})
         // change pausetime
        this.setState({pauseTime: time})
        
      }
  }
  start = ()=>{
    if(!this.state.running){
      this.setState({activity: "workTime",workTimeSet: this.state.workTime,pauseTimeSet: this.state.pauseTime})
      this.setState({running:setInterval(this.compte_rebours,100)})
    }
    else{
      this.setState({activity: "none"})
      clearInterval(this.state.running)
      this.setState({running: false})
    }
    
    
  }
  render(){
    const {workTime,pauseTime,pauseProgress,running,workProgress,activity} = this.state
    const time = activity==="workTime"?workTime:pauseTime
    const name = activity==="workTime"?"workTime":"pauseTime"
    const progress = activity==="workTime"?workProgress:pauseProgress
    return (
      <PomodoroWrapper>
        <div className="container">
          <div className="control">
            <audio id="peeb" preload="auto"src={beep}/>
            <StartPause toggle={running} onClick={this.start}/>
            <img alt="reset button" src={resetButton} onClick={this.reset}/>
          </div>
          <div className="display">
            <Outgoing  time={time} name={name} manage={(e)=>this.manage(e,name)} progress={progress}  />
          </div>
        </div>
      </PomodoroWrapper>
    );
  }
  
}

const Outgoing = ({name,time,manage,progress}) => {
  const formatTime = (time)=> {
    let min = Math.floor(time/60);
    let sec = time - min*60
    sec = (sec<10)?"0"+sec: sec
    min = (min<10)?"0"+min: min
    return min + " : "+ sec
  }
  console.log(time)
  return (
    <div className={`outgoing ${name}`}>
      <div className="display-canvas">
        
        
        <CircularProgressbarWithChildren value={progress} styles={buildStyles({
          pathColor: `${name=="pauseTime"?"rgba(68,103,128)":"#f00"}`,
          trailColor: "#eee",
          strokeLinecap: "butt"

        })}>
          <h2>{name}</h2>
          <div style={{ fontSize: 10, marginTop: -5 }}>
            <strong className="time">{formatTime(time)}</strong>
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <div className="group-button">
        <Button  value="+" onClick={manage}>+</Button>
        <Button  value="-" onClick={manage}>-</Button>
      </div>
      
    </div>
  )
}
const PomodoroWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 100vh;
  justify-content: center;
  align-content: center;
  border: solid red;
  .container{
    text-align: center;
    border: solid orange;
    width: 70%;
    .control{
      border: solid  palevioletred;;
      margin: 0 auto;
      display: block;
      border-radius: 10px;
      .play-pause {
        cursor: pointer;
        display: block;
        width: 42px;
        height: 50px;
        padding: 0;
        margin: 30px;
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
        margin: 30px;
        color: palevioletred;
      }
    }
    .display{
    /* display: flex; */
      .outgoing{
        margin: 10px;
        /* border: solid green; */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: palevioletred;
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
          
        }
        .group-button{
          border: solid palevioletred;
          margin: 20px;
          border-radius: 2px;
        }
      }
    }  
  }
  @media (max-width: 991px) {
    .container{
      width:100%;
    }
        ;
  }


`

const Button = styled.button`
  color: white;
  border: 2px solid white;
  background: palevioletred;
  cursor: pointer;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border-radius: 3px;
`;

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
